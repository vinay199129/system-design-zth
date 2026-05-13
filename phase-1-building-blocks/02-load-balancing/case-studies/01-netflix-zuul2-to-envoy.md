# Case Study: Netflix — Zuul 2 and the Move Toward Envoy

> How Netflix rebuilt its edge load balancer to use non-blocking I/O and a push-based control plane, and why the same forces eventually pulled the company toward Envoy and a service mesh.

## Context

Netflix's edge handles every request from ~270 million subscribers across 190+ countries before it reaches the backend. The original Zuul 1 (open-sourced 2013) was a synchronous, thread-per-connection servlet filter chain that worked well at hundreds of millions of requests per day but choked during retry storms and slow-backend events because each blocked thread held a connection. In 2016 Netflix published "Zuul 2: The Netflix Journey to Asynchronous, Non-Blocking Systems" (Mikey Cohen et al.) describing the multi-year rewrite onto Netty. By 2018 the team also began standardizing service-to-service traffic on Envoy, completing a multi-tier load-balancing story.

## The Decision

Netflix chose to **rewrite Zuul on top of Netty** rather than scale Zuul 1 horizontally, because thread-per-connection forced their cluster to over-provision 5–10× to survive backend latency spikes. The parent module README's "L4 vs L7" trade-off applies: Zuul is an L7 reverse proxy doing routing, authentication, A/B bucketing, and retry — work that demanded HTTP-level visibility and ruled out a cheaper L4 LB. They also moved from a poll-based discovery model (Eureka pull every 30 s) to a **push-based** model so routing changes propagate within seconds. The eventual adoption of Envoy for east–west traffic reflected the same async, push-based philosophy at the mesh layer.

## How It Works

- Edge runs **Zuul 2 on Netty**: one event loop per CPU, each handling thousands of concurrent connections, ~tens of thousands of RPS per instance vs ~hundreds for Zuul 1.
- Filter chain: inbound → endpoint → outbound, each filter can be async; Groovy filters are hot-swappable in production.
- **Adaptive load balancing**: client-side LB inside Zuul tracks per-instance success rate and latency, drops outliers from the pool within seconds.
- **Concurrency limiter** (Netflix's `concurrency-limits` library) sizes the per-backend window using TCP Vegas-style RTT signals — backpressure replaces fixed-size connection pools.
- Retries are **budgeted**: a token bucket caps retries to ~10 % of the original request rate, preventing retry storms during partial outages.
- East–west traffic now flows through **Envoy** sidecars driven by a custom xDS control plane; Envoy gives HTTP/2 multiplexing, gRPC-native LB, and richer outlier detection.
- Gradual rollout: traffic shifted to Zuul 2 in single-digit percentages via Spinnaker canary analysis (Kayenta); same playbook for Envoy.
- Multi-region: each AWS region runs its own Zuul fleet; DNS-based active-active failover ties them together.

## What Surprised Engineers

The async rewrite did not deliver throughput wins immediately. Cohen's post-mortem notes that on day one, Zuul 2 was *slower* than Zuul 1 because non-blocking code paths exposed dozens of hidden synchronous calls (DNS lookups, metric registries, classloaders) that blocked the event loop and stalled thousands of concurrent requests. The team had to instrument every filter for event-loop occupancy and rewrite hot paths before the architectural win materialized. The broader lesson: a single blocking call in an async pipeline negates the whole model.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Connection counts 10–100× higher per host | One blocking call anywhere in the filter chain stalls thousands of requests |
| Push-based discovery cuts route propagation from 30 s to sub-second | Control-plane outages now have wider blast radius than a stale poll |
| Envoy unifies metrics, retries, and circuit breaking across services | Operators must learn xDS, Lua filters, and Envoy's config grammar |

## Lessons for Your Interview

- When asked about edge load balancing at hyperscale, contrast **thread-per-connection vs event-loop** and explain why the latter dominates at >10 k concurrent connections.
- Mention **retry budgets** and **adaptive concurrency limits** as concrete defenses against retry storms — interviewers love the failure-mode angle.
- Use a **two-tier LB model** in any global design: an L4/anycast tier for DDoS and TLS termination, an L7 tier (Zuul/Envoy) for routing and policy.
- Cite **push-based vs pull-based service discovery** as a real-world trade-off; pull is simpler, push is faster but couples you to the control plane.
- Use Netflix's "rewrite was slower on day 1" anecdote when discussing migration risk.

## Sources

- Netflix Tech Blog: "Zuul 2: The Netflix Journey to Asynchronous, Non-Blocking Systems" (Mikey Cohen, 2016) — https://netflixtechblog.com/zuul-2-the-netflix-journey-to-asynchronous-non-blocking-systems-45947377fb5c
- Netflix Tech Blog: "Open Sourcing Zuul 2" (2018) — https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3
- Netflix Tech Blog: "Performance Under Load" (concurrency limits, 2017)
- Envoy Proxy whitepaper, Matt Klein (2017) — https://blog.envoyproxy.io/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 8 on the unreliability of networks and retry semantics
