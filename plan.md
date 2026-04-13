# System Design Zero to Hero -- Course Blueprint

> Pattern recognition over memorization. Understand WHY systems are built a certain way, not just WHAT they look like.

## Philosophy

System design interviews test your ability to:
1. **Break down ambiguous problems** into concrete requirements
2. **Choose the right building blocks** and justify trade-offs
3. **Design at scale** -- handle millions of users, petabytes of data
4. **Communicate clearly** -- walk through your design like a senior engineer

This course teaches you a repeatable framework, not a set of memorized diagrams.

## Course Overview

| Phase | Days | Focus | Modules |
|-------|------|-------|---------|
| Phase 0 | 1-3 | Framework & Estimation | 3 |
| Phase 1 | 4-15 | Building Blocks | 9 |
| Phase 2 | 16-24 | Distributed Concepts | 7 |
| Phase 3 | 25-32 | Design Patterns | 8 |
| Phase 4 | 33-44 | Classic Designs (Starter) | 10 |
| Phase 5 | 45-54 | Classic Designs (Advanced) | 10 |
| Phase 6 | 55-60 | Mock Interviews & Review | 3 |
| **Total** | **60** | | **50** |

## Phase 0: Framework & Estimation (Days 1-3)

Before designing anything, you need a structured approach and the ability to do quick math.

### Modules

1. **How to Approach** -- The RESHADED framework for tackling any system design question
2. **Estimation Cheatsheet** -- Back-of-envelope calculations: QPS, storage, bandwidth
3. **Requirements Gathering** -- Functional vs non-functional, asking the right questions

### What You Learn

- A 45-minute structured interview framework with time allocation
- Latency numbers every engineer should know (L1 cache: 0.5ns, SSD read: 150us, etc.)
- How to estimate storage for 1 billion users
- The difference between functional requirements (what the system does) and non-functional requirements (how well it does it)

## Phase 1: Building Blocks (Days 4-15)

Every system is composed of these fundamental components. Master them individually before combining.

### Modules

| # | Module | Key Concepts | Days |
|---|--------|-------------|------|
| 01 | DNS & Networking | DNS resolution, HTTP/HTTPS, TCP/UDP, WebSockets | 4 |
| 02 | Load Balancing | L4/L7 load balancers, round-robin, consistent hashing, health checks | 5 |
| 03 | Caching | Redis, Memcached, cache-aside, write-through, write-back, LRU/LFU eviction | 6 |
| 04 | Databases -- SQL | ACID, B-tree indexing, normalization, query optimization, connection pooling | 7 |
| 05 | Databases -- NoSQL | Key-value, document, column-family, graph; CAP trade-offs | 8 |
| 06 | Message Queues | Kafka, RabbitMQ, pub/sub, event-driven architecture, exactly-once delivery | 9-10 |
| 07 | Blob Storage & CDN | S3-like storage, CDN edge caching, media delivery pipeline | 11 |
| 08 | API Design | REST, GraphQL, gRPC; versioning, pagination, rate limiting, idempotency | 12-13 |
| 09 | Proxies & Gateways | Reverse proxy, API gateway, service mesh, rate limiting at edge | 14-15 |

### Why This Matters

In an interview, when you say "we need a cache here", the interviewer will ask "what kind? what eviction policy? what happens on cache miss?" You need to know the building blocks deeply enough to justify your choices.

## Phase 2: Core Distributed Concepts (Days 16-24)

The hardest part of system design: understanding how distributed systems behave under failure.

### Modules

| # | Module | Key Concepts | Days |
|---|--------|-------------|------|
| 01 | Scalability | Horizontal vs vertical scaling, stateless services, database scaling strategies | 16 |
| 02 | Data Partitioning & Sharding | Hash-based, range-based, consistent hashing, rebalancing, hotspots | 17-18 |
| 03 | Replication | Leader-follower, multi-leader, leaderless; synchronous vs async | 19 |
| 04 | Consistency Models | CAP theorem, PACELC, strong/eventual/causal consistency | 20-21 |
| 05 | Rate Limiting | Token bucket, sliding window, fixed window; distributed rate limiting | 22 |
| 06 | Unique ID Generation | UUID, Snowflake, database auto-increment, coordination-free IDs | 23 |
| 07 | Distributed Consensus | Leader election, Raft overview, quorum reads/writes | 24 |

### The Key Insight

> Every design decision is a trade-off. CAP theorem says you can't have consistency, availability, AND partition tolerance. Your job is to explain which you choose and why.

## Phase 3: Design Patterns & Templates (Days 25-32)

Reusable architecture patterns that appear across many system designs.

### Modules

| # | Module | Key Concepts | Days |
|---|--------|-------------|------|
| 01 | Fan-out Pattern | Push vs pull, hybrid fan-out (Twitter/Facebook approach) | 25 |
| 02 | Event Sourcing & CQRS | Write vs read models, event log, materialized views | 26 |
| 03 | Pub/Sub Pattern | Topic-based messaging, event-driven microservices | 27 |
| 04 | Circuit Breaker & Retry | Exponential backoff, bulkhead, timeout, graceful degradation | 28 |
| 05 | Saga Pattern | Distributed transactions, choreography vs orchestration | 29 |
| 06 | Sharding Strategies | Lookup service, range-based, hash-based; resharding | 30 |
| 07 | Cache Patterns Deep Dive | Cache stampede, dog-piling, warming, invalidation strategies | 31 |
| 08 | System Design Answer Template | Structured 45-min answer framework with time allocation | 32 |

## Phase 4: Classic Designs -- Starter (Days 33-44)

Practice with commonly asked designs. Start with simpler systems, build confidence.

### Designs

| # | System | Difficulty | Core Concepts | Companies | Days |
|---|--------|-----------|--------------|-----------|------|
| 01 | URL Shortener (TinyURL) | Easy | Hashing, DB design, read-heavy cache | All | 33 |
| 02 | Pastebin | Easy | Blob storage, metadata DB, TTL/expiry | Google, Meta | 34 |
| 03 | Rate Limiter | Easy-Med | Distributed counting, Redis, sliding window | Stripe, Cloudflare | 35 |
| 04 | Key-Value Store | Medium | Partitioning, replication, consistency | Amazon, Google | 36-37 |
| 05 | Unique ID Generator | Easy-Med | Snowflake, coordination, clock sync | Twitter, Meta | 38 |
| 06 | Web Crawler | Medium | BFS, politeness, dedup, distributed queue | Google, Microsoft | 39 |
| 07 | Notification System | Medium | Push/pull, pub/sub, priority queues | Apple, Google | 40 |
| 08 | Chat System (WhatsApp) | Medium | WebSocket, presence, message ordering | Meta, Slack | 41 |
| 09 | News Feed (Facebook) | Medium | Fan-out, ranking, caching, real-time | Meta, Twitter | 42-43 |
| 10 | Typeahead / Autocomplete | Medium | Trie, prefix matching, ranking, caching | Google, Amazon | 44 |

## Phase 5: Classic Designs -- Advanced (Days 45-54)

Complex systems that test your ability to handle multiple interacting components.

### Designs

| # | System | Difficulty | Core Concepts | Companies | Days |
|---|--------|-----------|--------------|-----------|------|
| 01 | Instagram / Photo Sharing | Medium | CDN, image pipeline, feed ranking | Meta, Pinterest | 45 |
| 02 | YouTube / Video Streaming | Hard | Transcoding, adaptive bitrate, CDN, recommendation | Google, Netflix | 46 |
| 03 | Twitter / Social Network | Hard | Fan-out, celebrity problem, search, trending | Twitter, Meta | 47 |
| 04 | Uber / Ride Sharing | Hard | Geospatial, matching, real-time tracking, surge pricing | Uber, Lyft | 48 |
| 05 | Dropbox / File Storage | Hard | Chunking, sync, dedup, conflict resolution | Dropbox, Google | 49 |
| 06 | Google Search | Hard | Web crawling, indexing, PageRank, query serving | Google, Microsoft | 50 |
| 07 | Distributed Cache (Redis) | Hard | Partitioning, replication, eviction, cluster mode | Amazon, Google | 51 |
| 08 | Payment System (Stripe) | Hard | Idempotency, double-spend prevention, ledger, reconciliation | Stripe, PayPal | 52 |
| 09 | Ticket Booking System | Hard | Seat locking, distributed locks, eventual consistency | BookMyShow, Airbnb | 53 |
| 10 | Google Maps | Hard | Geospatial indexing, routing algorithms, tile serving, ETA | Google, Uber | 54 |

## Phase 6: Mock Interviews & Review (Days 55-60)

Practice under realistic conditions.

### Structure

| Days | Activity |
|------|----------|
| 55-56 | Full mock interviews (45 min each, use timer) |
| 57-58 | Deep dive into weak areas, re-design from Phase 4-5 |
| 59 | Behavioral prep for system design context |
| 60 | Final review, confidence assessment |

## Estimation Quick Reference

### Numbers Every Engineer Should Know

| Operation | Latency |
|-----------|---------|
| L1 cache reference | 0.5 ns |
| L2 cache reference | 7 ns |
| Main memory reference | 100 ns |
| SSD random read | 150 us |
| HDD seek | 10 ms |
| Send packet CA -> Netherlands -> CA | 150 ms |

### Scale Rules of Thumb

| Metric | Value |
|--------|-------|
| QPS for a single web server | 1,000-10,000 |
| QPS for a single database | 1,000-5,000 |
| QPS for Redis / Memcached | 100,000+ |
| 1 million requests/day | ~12 QPS |
| 1 billion requests/day | ~12,000 QPS |
| 1 KB * 1 billion = | 1 TB |
| 1 MB * 1 million = | 1 TB |

### Constraint -> Architecture Mapping

| If the system needs... | Consider... |
|----------------------|-------------|
| High read throughput | Cache (Redis), CDN, read replicas |
| High write throughput | Message queue, write-behind cache, sharding |
| Low latency | Cache, CDN, edge computing, in-memory DB |
| High availability | Replication, multi-region, graceful degradation |
| Strong consistency | Single leader, synchronous replication, consensus |
| Eventual consistency | Multi-leader, async replication, conflict resolution |
| Large file storage | Blob store (S3), chunking, CDN |
| Real-time updates | WebSocket, Server-Sent Events, long polling |
| Full-text search | Elasticsearch, inverted index |
| Geospatial queries | Geohash, QuadTree, R-tree |
