# Design: Unique ID Generator

> Design a distributed system that generates globally unique IDs at scale.

## Overview

In distributed systems, you cannot rely on a single auto-incrementing database counter. A unique ID generator produces IDs that are unique across all nodes without coordination. This problem tests your understanding of distributed coordination, time-based ordering, and the trade-offs between different ID generation strategies.

## Difficulty: Medium

## Core Concepts Tested

- UUID vs Snowflake vs ULID trade-offs
- Time-based ordering and clock synchronization
- Bit manipulation and encoding schemes
- Coordination-free design
- Database sharding key requirements
- Monotonicity and sortability

## Companies That Ask This

Twitter/X, Meta, Amazon, Uber, Databricks, Snowflake

## Prerequisites

- Phase 1: Binary and Bit Manipulation
- Phase 2: Distributed Systems Basics
- Phase 2: Database Sharding
- Phase 3: Clock Synchronization (NTP, Logical Clocks)

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 25 minutes with a timer
3. Focus on: ID structure, uniqueness guarantees, sortability, coordination avoidance
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to what properties your IDs need (sorted? compact? random?)

## Learning Objectives

By the end of this design, you can:

- Defend **Snowflake (timestamp + machine-id + sequence)** over **UUIDv4** in 60 seconds (sortability, compactness, B-tree friendliness, debug-ability).
- Explain when **UUIDv4 / UUIDv7** is the right choice (no central machine-id registry, security-token uses, library-only deployments).
- Estimate that one Snowflake node yields **4096 IDs/ms ≈ 4M IDs/s** and design for **10× that** with multiple workers in 5 minutes.
- Name the most common pitfalls — **clock going backward**, **machine-id reuse after VM redeploy**, and **sequence overflow**.
- Relate this design back to **Phase 2 Sharding** (Snowflake IDs are great shard keys) and **Phase 3 Logical Clocks**.

## Common Pitfalls

1. **Clock jumps backward (NTP correction).** Two requests in the same ms produce the same ID — refuse to issue until the clock catches up, or use a monotonic clock + offset.
2. **Hard-coded machine-id from config.** A redeployed VM reuses an id and silently collides — lease the machine-id from ZooKeeper/Etcd.
3. **UUIDv4 as a primary key in a B-tree.** Random inserts cause page splits and 5–10× write amp — pick time-sortable IDs (Snowflake, ULID, UUIDv7).
4. **Sequence bits overflow inside a single ms.** Cap is 4096 per ms — block-and-wait until next ms, or widen the sequence field.
5. **Single-DC bit layout extended to multi-DC.** Two DCs collide on the machine-id field — carve out 5 bits for datacenter id from day one.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Uniqueness, sortability, throughput target, ID width, coordination tolerance |
| HLD | 15 | Library-in-process vs ID-as-a-service; machine-id registry (ZK/Etcd) |
| Deep Dive | 15 | 64-bit Snowflake layout, clock-backward handling, machine-id lease |
| Trade-offs + wrap | 5 | Snowflake vs UUIDv4 vs DB sequence — name the property each wins on |

## Related Designs

- **01-url-shortener** — Snowflake is the alternative to KGS when you also want time-sortable keys (e.g. for analytics joins).
- **Phase 5: 03-twitter** — Snowflake was *invented* for `tweet_id`; same pattern reused for like_id, dm_id.
- **Phase 5: 08-payment-system** — `payment_id` benefits from time-sortability for ledger scans and shard locality.
