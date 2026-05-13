# Design: Rate Limiter

> Design a distributed rate limiting service that throttles requests based on configurable rules.

## Overview

A rate limiter controls the number of requests a client can send within a time window. It protects services from abuse, prevents resource starvation, and ensures fair usage. This problem tests your understanding of distributed counting, time-window algorithms, and middleware architecture.

## Difficulty: Medium

## Core Concepts Tested

- Rate limiting algorithms (Token Bucket, Sliding Window, Fixed Window)
- Distributed counting with Redis
- Middleware/gateway architecture
- Race conditions in distributed counters
- HTTP 429 and retry-after semantics
- Multi-tenancy and rule configuration

## Companies That Ask This

Google, Amazon, Cloudflare, Stripe, Uber, Netflix, Shopify

## Prerequisites

- Phase 1: Caching (Redis)
- Phase 2: API Gateway Patterns
- Phase 2: Distributed Systems Basics
- Phase 3: Race Conditions and Atomicity

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: algorithm choice, distributed counting, rule configuration
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how you handle race conditions in a multi-server environment

## Learning Objectives

By the end of this design, you can:

- Defend **token bucket** over **fixed window** in 60 seconds (boundary spikes, burst tolerance, smoothness).
- Explain when **sliding window log** is the right call (low-traffic, precision matters, e.g. login attempts) and when it is overkill.
- Estimate Redis memory for **10M active keys × 4 buckets** and counter QPS in 5 minutes.
- Name the most common pitfalls — **non-atomic INCR+EXPIRE**, **per-request rule lookup**, and **rate-limiting after the expensive work**.
- Relate this design back to **Phase 1 Proxies & Gateways** (this is what lives there) and **Phase 1 Caching** (Redis is the counter store).

## Common Pitfalls

1. **Plain `INCR` + `EXPIRE` in two commands.** Two concurrent requests both miss the threshold — wrap in a Lua script for atomicity.
2. **Looking up the rate-limit rule from the DB on every request.** Adds 5+ ms to every API call — cache the rules in-process with TTL refresh.
3. **Fixed window without sliding correction.** A client can fire 2× the limit by straddling the boundary — use sliding-window-counter or token bucket.
4. **Rate-limiting *after* the work is done.** A floods you twice — at the upstream and at the worker — push the limiter to the gateway/edge.
5. **Missing `Retry-After` header on 429.** Clients hot-loop and amplify the problem — always set `Retry-After` and ideally `X-RateLimit-Remaining`.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Functional (per-user / per-IP / per-API-key, multiple tiers, 429 + Retry-After) + NFRs (p99 < 10 ms overhead, 99.99% available, fail-open vs fail-closed) |
| HLD | 15 | Boxes: client → LB → API gateway (limiter middleware) → app; Redis counter store; control-plane for rule config |
| Deep Dive | 15 | Token-bucket Lua script, distributed counter sync, fail-open semantics on Redis outage |
| Trade-offs + wrap | 5 | Accuracy vs latency (centralized Redis vs node-local with sync); fail-open vs fail-closed |

## Related Designs

- **09-proxies-gateways** (Phase 1) — this is the canonical responsibility of an API gateway.
- **04-key-value-store** — Redis Cluster *is* a distributed KV store; this design exercises it as a client.
- **Phase 5: 08-payment-system** — rate limiting on the idempotency-key endpoint prevents brute-force scraping of keys.
