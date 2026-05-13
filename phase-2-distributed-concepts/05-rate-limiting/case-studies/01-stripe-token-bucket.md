# Case Study: Stripe — Token-Bucket Rate Limiting in Production

> How Stripe protects a multi-tenant payments API with a fleet of Redis-backed token-bucket rate limiters, including the specific trick of running multiple bucket types in parallel.

## Context

Stripe's API is a multi-tenant platform: thousands of merchants share the same edge fleet, and a bug in any one integration (a runaway retry loop, a misconfigured webhook handler, a batch script) can saturate shared infrastructure. By 2017 Stripe was handling sustained traffic in the **tens of thousands of requests per second** with sharp customer-specific spikes. Paul Tarjan's 2017 Stripe blog post "Scaling your API with rate limiters" became a widely cited reference. The pain point: a single buggy client must not be able to take down the API for everyone else, and a *legitimate* burst (year-end batch invoicing) must still be served.

## The Decision

Stripe chose **token-bucket rate limiting** rather than fixed-window counters or leaky-bucket variants. The parent module README's "fixed window vs sliding window vs token bucket vs leaky bucket" table maps directly: **token bucket allows controlled bursts** (the bucket can be full at any moment, letting a client send `B` requests immediately, then refill at rate `R`), which matches the bursty-but-bounded nature of API traffic. Stripe runs the buckets in **Redis** for cross-host coordination, and crucially runs **multiple bucket types in parallel** — request rate, concurrent in-flight requests, and load-shedding — so different failure modes are caught by different limiters.

## How It Works

- **Per-account token buckets** keyed in Redis: `bucket:account_123:requests` with capacity `B` and refill rate `R` per second.
- Token-bucket update is a single **Redis Lua script**: atomically read current tokens + last-refill timestamp, compute new tokens, decrement, return decision — all in one round trip.
- Stripe runs **four distinct limiter types in parallel**:
  1. **Request rate limiter** — token bucket, per-account, e.g. 100 req/s sustained with bursts of 200.
  2. **Concurrent request limiter** — caps in-flight requests per account; protects against slow-endpoint hoarding.
  3. **Fleet usage load shedder** — when the fleet is unhealthy, sheds **non-critical** traffic (e.g., analytics endpoints) first, preserving capacity for payments.
  4. **Worker utilization load shedder** — sheds **lowest-priority** requests when overall worker pool occupancy crosses a threshold.
- Limit decisions exposed to clients as **HTTP 429** with `Retry-After` header and a documented stable retry-with-exponential-backoff contract.
- Internal limits are **higher than published limits** — the published limit (e.g., 100 req/s) is the SLO; the real bucket has headroom for noise.
- Bucket state is **eventually consistent across Redis replicas** — Stripe accepts brief over-shoots during failover rather than blocking on a quorum.
- High-cardinality keys (per IP, per API key, per merchant, per endpoint) are pre-sharded across Redis instances to avoid hot keys.

## What Surprised Engineers

The non-obvious lesson from Stripe's post is that **rate limiting is not one limiter — it's a stack of four**. A single token bucket catches a runaway loop but does nothing against a client that opens 10,000 slow concurrent connections to an expensive endpoint. The concurrent-request limiter catches that. Neither catches a *legitimate* high-priority spike that happens to coincide with fleet degradation — that's what load shedding by criticality is for. The deeper insight: **rate limiting and load shedding are the same mechanism viewed at different timescales** (per-account-per-second vs per-fleet-per-now), and you need both.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Token bucket cleanly handles bursts that fixed windows over-reject | Redis becomes a critical dependency on the hot path |
| Multiple limiter types catch different failure modes | More limiters = more places for tuning errors to silently drop traffic |
| Published limits < real limits gives operational headroom | Customers can't predict the *real* limit, only the SLO — occasional surprise rejects |

## Lessons for Your Interview

- Default to **token bucket** in API design; explain "capacity = burst, refill rate = sustained" in one sentence.
- Sketch **multiple limiter types in parallel** — request rate, concurrency, fleet-level shed — to signal production maturity.
- Use **Redis + Lua atomic update** as the canonical implementation; mention this avoids the race between read and decrement.
- Always include **HTTP 429 + Retry-After + exponential backoff documented** as the client contract.
- Distinguish **per-account fairness** from **global load shedding**; both matter and they live at different layers.

## Sources

- Stripe blog: "Scaling your API with rate limiters" (Paul Tarjan, 2017) — https://stripe.com/blog/rate-limiters
- Stripe docs: rate limits and `Retry-After` semantics — https://stripe.com/docs/rate-limits
- "An algorithm for fair queuing and rate-limiting" — Demers, Keshav, Shenker (1989) — original token bucket
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 8 (timeouts, retries) and Chapter 9 (avoiding stampedes)
