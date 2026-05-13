# Case Study: Facebook — Memcached at Web Scale

> How Facebook turned a single-host memory cache into a billion-keys-per-second fleet, and the specific tricks (lease tokens, gutter pool, mcrouter) that made cache-aside survive thundering herds.

## Context

By 2013 Facebook was serving ~1 billion users from a fleet of thousands of Memcached servers fronting MySQL. The NSDI '13 paper "Scaling Memcache at Facebook" (Nishtala et al.) describes a deployment handling **billions of requests per second** at peak, with each user request fanning out into hundreds of cache lookups. The pain point was not the cache itself — `memcached` is famously fast — but the **emergent failure modes** at scale: hot keys, stampedes after invalidation, replication lag versus cache consistency, and cross-region staleness. The paper is the canonical reference for production cache-aside.

## The Decision

Facebook chose the **cache-aside pattern** (called "look-aside" in the paper) and explicitly rejected write-through, because the relational schema and the cache key space did not align one-to-one. The parent module README's "cache-aside vs write-through vs write-behind" table maps directly: write-through would have required coupling the cache to MySQL's storage engine, and write-behind would have risked durability. They then layered on three inventions to fix cache-aside's weaknesses — **leases** (against stampede and stale sets), the **gutter pool** (against host failure), and **mcrouter** (against client-side fan-out cost) — keeping the simple read path while patching every operational hole.

## How It Works

- **Cache-aside** on read: client checks Memcached → on miss, reads MySQL → SETs the result with a TTL.
- **Lease tokens** prevent thundering herd: on a miss, Memcached returns a 64-bit lease that only one client holds; others wait or serve stale. This is the single-flight pattern enforced by the cache server itself.
- **Stale set protection**: if a key is invalidated while a client holds a lease, the lease is invalidated, and the late SET is dropped — preventing the classic "old value overwrites new" race.
- **Gutter pool**: a small (~1 %) standby pool absorbs traffic for any Memcached host that fails its health check, so a single dead server does not stampede MySQL. Items in the gutter have a short TTL (~10 s).
- **mcrouter**: an L7 proxy that batches/multiplexes Memcached protocol, fans out to thousands of servers per request, and handles consistent-hash routing — open-sourced 2014.
- **Regional pools** and **cold-cluster warmup**: a new datacenter brings its cache up by tailing the warm cluster's gets, not by hitting MySQL.
- **Cross-region invalidation** rides MySQL replication: invalidation packets are embedded in the binlog stream so the cache invalidation arrives no earlier than the replicated write — preventing reads of stale-cached-but-replication-lagged data.
- Scale numbers from the paper: **>1 B requests/sec**, fan-out of **24 keys per request median, 95th percentile >500**, end-to-end p95 latency in **single-digit milliseconds**.

## What Surprised Engineers

The non-obvious failure was **incast congestion**: when a single web server fans out to 500 Memcached hosts at once, all replies return within microseconds and overwhelm the receiving NIC's queue, causing TCP retransmits and tail-latency spikes. Facebook had to add sliding-window flow control inside the client (limiting in-flight requests per fan-out) to stop the cache fleet from DDoSing its own callers. This is the kind of bug that only appears at >100-key fan-outs and is invisible in microbenchmarks.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Cache-aside's simplicity preserved; no DB engine coupling | Every miss costs a round trip plus a database read |
| Leases + gutter pool tame stampedes without write-through | Memcached server gains protocol complexity (lease tokens, stale flags) |
| Memcached fleet handles >10× the QPS of MySQL behind it | Cross-region cache consistency must ride binlog — adds operational coupling |

## Lessons for Your Interview

- When asked "how do you prevent cache stampede?", name **single-flight / lease tokens** explicitly — and explain it as a *server-side* coordination primitive, not application-side locking.
- Mention the **gutter pool** as the right answer to "what happens when a cache node dies?" — failover within the cache tier prevents stampede onto the DB.
- Use **fan-out > 100** as the threshold where incast congestion becomes a real concern; suggest **request coalescing** or **batched gets** in your design.
- Cite Facebook's regional-invalidation-via-binlog trick when the interviewer asks about multi-region cache consistency.
- Use "billions of requests per second across thousands of hosts" as your scale anchor when justifying Memcached over Redis (single-threaded per-instance simplicity wins at extreme fan-out).

## Sources

- Nishtala et al., "Scaling Memcache at Facebook" — NSDI 2013 — https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala
- Facebook Engineering: "Introducing mcrouter: a memcached protocol router" (2014) — https://engineering.fb.com/2014/09/15/web/introducing-mcrouter-a-memcached-protocol-router-for-scaling-memcached-deployments/
- mcrouter on GitHub — https://github.com/facebook/mcrouter
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 5 (replication) and Chapter 7 (transactions) for the staleness/lease discussion
