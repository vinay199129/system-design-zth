# Design: URL Shortener

> Design a service like TinyURL or Bit.ly that converts long URLs into short, unique aliases.

## Overview

A URL shortener maps a long URL to a compact alias (e.g., `short.ly/abc123`) and redirects users to the original URL when they visit the short link. This is one of the most commonly asked system design questions because it covers hashing, database design, caching, and scale estimation in a compact problem space.

## Difficulty: Easy

## Core Concepts Tested

- Hashing and encoding strategies (Base62, MD5)
- Read-heavy system design (100:1 read-to-write ratio)
- Database schema design and key generation
- Caching layer for hot URLs
- 301 vs 302 redirects and their implications
- Horizontal scaling and partitioning

## Companies That Ask This

Google, Meta, Amazon, Microsoft, Bloomberg, Uber, Twitter/X, Stripe

## Prerequisites

- Phase 1: Hashing & Encoding
- Phase 1: Databases (SQL vs NoSQL)
- Phase 2: Caching Strategies
- Phase 2: Load Balancing
- Phase 3: Back-of-the-Envelope Estimation

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: key generation, database choice, read path optimization
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to collision handling and analytics tracking

## Learning Objectives

By the end of this design, you can:

- Defend a **counter + Base62 + Key Generation Service (KGS)** over **MD5/SHA1 truncation** in 60 seconds (collision risk, key length, no read-before-write).
- Explain when a **hash-of-URL** scheme is the right call (content-addressed dedup, no central counter) and when it is not (custom aliases, short keys).
- Estimate write QPS, read QPS, storage, and cache size for a **100M URLs/month, 100:1 read-skew** product in 5 minutes.
- Name the two most common pitfalls — **counting clicks on the synchronous redirect path** and **custom-alias collisions with future generated keys**.
- Relate this design back to **Phase 1 Hashing & Encoding** and **Phase 2 Caching** (the read path is the canonical 100:1 cache problem).

## Common Pitfalls

1. **Hash-truncate the long URL.** Collisions force a read-before-write on every shorten and shrink the key space — switch to KGS-pre-allocated Base62 keys.
2. **Increment click count synchronously inside the 302 handler.** Adds DB write latency to every redirect — emit a click event to Kafka/Kinesis and aggregate offline.
3. **Custom aliases share the same key namespace as generated keys.** A user-picked alias can collide with a future KGS key — reserve a separate prefix or check-and-insert atomically.
4. **Picking 301 when analytics matter.** Browsers cache permanent redirects and your click counter stops moving — use 302 for tracking-heavy products.
5. **Sharding by `hash(short_key)` and forgetting hot-key replication.** A viral URL melts one shard — replicate hot keys to all replicas or front with a CDN.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Functional (shorten / redirect / custom alias / TTL / analytics) + 3 NFRs (99.99% redirect uptime, p99 < 100 ms, 100M new URLs/month) |
| HLD | 15 | 5 boxes: LB → App server → KGS → Redis → primary DB; analytics queue on the side |
| Deep Dive | 15 | KGS internals — pre-allocated key pool, per-app local buffer, two non-overlapping ranges for HA, key recycling on expiry |
| Trade-offs + wrap | 5 | KGS vs hash-based keys; 301 vs 302 (cache-friendly vs analytics-accurate) |

## Related Designs

- **02-pastebin** — shares the Base62 / KGS pattern, but the body lives in S3 instead of being a target URL.
- **05-unique-id-generator** — an alternative to KGS when you also need globally sortable IDs (Snowflake) rather than dense short codes.
- **Phase 5: 03-twitter** — t.co is essentially this design at Twitter scale; the snowflake-style `tweet_id` doubles as the short-URL primary key.
