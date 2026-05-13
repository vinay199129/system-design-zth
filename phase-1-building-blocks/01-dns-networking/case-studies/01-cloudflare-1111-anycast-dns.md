# Case Study: Cloudflare 1.1.1.1 — Anycast Recursive DNS

> How a single IPv4 address answers DNS queries from every continent in under 15 ms by routing each packet to the nearest of ~300 datacenters via BGP anycast.

## Context

Cloudflare launched the `1.1.1.1` public recursive resolver on 2018-04-01 in partnership with APNIC, which owned the `1.1.1.0/24` block but had never routed it. Existing public resolvers (Google `8.8.8.8`, OpenDNS) were faster than most ISP resolvers but still added 20–60 ms in many regions. Cloudflare's pitch was a privacy-respecting resolver that would be the fastest globally by leveraging the same anycast edge network already used for HTTP. Public source: Cloudflare blog "Announcing 1.1.1.1: the fastest, privacy-first consumer DNS service" (Matthew Prince, 2018) and "How we built 1.1.1.1" (Olafur Gudmundsson, 2018).

## The Decision

Cloudflare chose **BGP anycast** rather than GeoDNS-routed unicast: announce the same `/24` from every PoP and let the internet's routing fabric pick the topologically nearest one. The parent module README's "anycast vs unicast" trade-off shows up here directly — Cloudflare accepted anycast's classic weakness (a TCP flow can re-route mid-session if BGP reconverges) because DNS is dominated by short, idempotent UDP queries where mid-flight re-routing is harmless. They paired it with DNSSEC validation, QNAME minimization (RFC 7816), and an aggressive negative-cache so most queries never leave the edge PoP.

## How It Works

- One IPv4 prefix (`1.1.1.0/24`) and one IPv6 prefix (`2606:4700:4700::/48`) announced via BGP from **300+ cities** across **100+ countries** (publicly reported on cloudflare.com/network).
- Median resolution latency reported by DNSPerf as **~11–14 ms globally**, vs ~30 ms for `8.8.8.8` and ~20 ms for Quad9 at launch.
- Each edge PoP runs the resolver (`rrdns`, written in Rust/Go) co-located with Cloudflare's HTTP cache; an in-process LRU cache absorbs ~90 % of repeat queries.
- DDoS absorption: anycast naturally **disperses volumetric floods** across all 300 PoPs. A 1 Tbps attack on `1.1.1.1` arrives as ~3 Gbps per PoP, well below the per-site capacity of 100+ Gbps.
- DNS-over-HTTPS (DoH) on `https://cloudflare-dns.com/dns-query` and DNS-over-TLS (DoT) on port 853 reuse the same anycast IPs.
- Negative caching honors the SOA `minimum` field per RFC 2308 so NXDOMAINs aren't re-asked upstream.
- Authoritative upstream queries go out over **QNAME-minimized** paths so root and TLD servers only see `com.` or `example.com.`, not the full FQDN.
- Stale-while-revalidate: serves an expired record for up to 30 s while refreshing asynchronously if the upstream is slow.

## What Surprised Engineers

The first week of operation exposed thousands of corporate networks and home routers that had hard-coded `1.1.1.1` as a placeholder/test address — the resolver received gigabits of malformed traffic from devices that thought the IP was unreachable. Cloudflare had to publish a "what to do if your router rejects 1.1.1.1" guide and absorb the junk traffic indefinitely. A second surprise was that some carrier-grade NATs and CDNs blackholed the `1.0.0.0/8` block by convention, requiring per-ISP outreach for months after launch.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Sub-15 ms global resolution without GeoDNS infrastructure | A misbehaving PoP can blackhole a region until BGP withdraws |
| DDoS volumetrically dispersed across 300 sites | Source-IP geolocation breaks (the resolver sees the user's ISP, not their country) |
| Single IP simplifies device configuration and firewall rules | Decade-old "placeholder" mis-use of `1.1.1.1` floods the resolver with garbage forever |

## Lessons for Your Interview

- When asked "how does the DNS query reach the closest server?", answer **anycast + BGP**, not "GeoDNS" — and explain that anycast picks the nearest *network* hop, not necessarily the nearest geographic one.
- Pair anycast with **stateless protocols** (UDP DNS, QUIC initial packets); avoid it as the primary load-balancing strategy for long-lived TCP.
- Cite DDoS dispersion as a *free* side-effect of anycast — interviewers like seeing the same mechanism solve two problems.
- Mention QNAME minimization and DNSSEC validation when "DNS privacy" comes up; these are concrete, low-cost wins.
- Use 300 PoPs × 11 ms median as your reference point when sizing any global edge service.

## Sources

- Cloudflare blog: "Announcing 1.1.1.1: the fastest, privacy-first consumer DNS service" (2018) — https://blog.cloudflare.com/announcing-1111/
- Cloudflare blog: "How we built 1.1.1.1" (2018) — https://blog.cloudflare.com/how-we-built-rrdns-1111/
- DNSPerf public benchmark — https://www.dnsperf.com/
- RFC 7816 (QNAME minimization), RFC 2308 (negative caching)
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 8 on network partitions and latency budgets
