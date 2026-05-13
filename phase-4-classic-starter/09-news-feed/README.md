# Design: News Feed

> Design a social media news feed like Facebook's News Feed, Twitter/X's Timeline, or Instagram's Feed.

## Overview

A news feed aggregates and displays posts from people a user follows, ranked and personalized. This is one of the most frequently asked system design questions because it touches on fan-out strategies, caching, ranking, and the classic push vs pull debate. Every large-scale social platform has solved some version of this problem.

## Difficulty: Medium

## Core Concepts Tested

- Fan-out on write vs fan-out on read
- Feed ranking and personalization
- Cache architecture for feed delivery
- Social graph traversal
- Pub/sub and message queue patterns
- Hybrid push/pull architectures

## Companies That Ask This

Meta, Twitter/X, LinkedIn, Pinterest, TikTok, Snap

## Prerequisites

- Phase 1: Databases and Indexing
- Phase 2: Caching (Multi-Layer)
- Phase 2: Message Queues and Fan-Out
- Phase 3: Social Graph Data Models
- Phase 3: Ranking and Recommendation Basics

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 35 minutes with a timer
3. Focus on: fan-out strategy, feed generation, caching, ranking
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to the celebrity/influencer problem and how it changes your approach

## Learning Objectives

By the end of this design, you can:

- Defend **hybrid fan-out (push for users ≤ 1k followers, pull for celebrities)** over **pure push** or **pure pull** in 60 seconds (write amplification vs read latency).
- Explain when **pure pull** is sufficient (low fan-out, small social graph, low read QPS).
- Estimate the **feed-cache memory** for 100M DAU × 200 cached items in 5 minutes.
- Name the most common pitfalls — **celebrity write storm**, **ranking on every read**, and **invalidation thundering herds**.
- Relate this design back to **Phase 2 Caching (multi-layer)** and **Phase 3 Pub/Sub & Fan-out**.

## Common Pitfalls

1. **Pure fan-out-on-write for celebrities.** A user with 100M followers fires 100M writes per tweet — pull-on-read above a follower threshold.
2. **No precomputed feed cache.** Every scroll runs a join against a billion-row posts table — Redis sorted set per user, materialized in advance.
3. **Ranking on every read.** ML scoring per scroll burns CPU — precompute or pre-rank top-N candidates and only re-rank the visible window.
4. **Invalidating every follower's cache on edit.** Thundering herd on the post store — soft TTL + lazy refresh, accept brief staleness.
5. **Loading the entire feed at once.** Memory spike on mobile, slow first paint — cursor-based pagination from the cache.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Post types (text/photo/video), ranking required, freshness, scroll latency p99 < 200 ms |
| HLD | 15 | Boxes: post svc → fanout svc → feed cache → ranker; pull svc for celebs; social graph svc |
| Deep Dive | 15 | Hybrid push/pull logic, celebrity threshold heuristic, cache eviction |
| Trade-offs + wrap | 5 | Push vs pull (write vs read cost); freshness vs ranking cost |

## Related Designs

- **08-chat-system** — both rely on Redis pub/sub for asynchronous delivery.
- **10-typeahead** — same precomputed-and-served pattern for low-latency reads.
- **Phase 5: 01-instagram** and **Phase 5: 03-twitter** — this design is the warm-up; those scale it to a full social product.
