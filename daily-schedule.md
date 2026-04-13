# Daily Schedule -- 60-Day Plan

> 3-4 hours per day. Adjust +-1 hour based on your schedule. Quality over speed.

## Legend

- (R) = Read / Study
- (P) = Practice / Design
- (V) = Review / Revisit

## Week 1: Framework & Foundation (Days 1-7)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 1 | P0 | Framework | (R) how-to-think.md, plan.md | 2h |
| 2 | P0 | Estimation | (R) estimation-cheatsheet.md, practice 3 estimation problems | 3h |
| 3 | P0 | Requirements | (R) requirements-gathering.md, practice on 2 example systems | 3h |
| 4 | P1 | DNS & Networking | (R) Module README, (P) trace a request from browser to server | 3h |
| 5 | P1 | Load Balancing | (R) Module README, (P) design a load balancing strategy for a web app | 3h |
| 6 | P1 | Caching | (R) Module README, (P) design cache layer for a read-heavy app | 3.5h |
| 7 | P1 | Review | (V) Re-read how-to-think.md, review Days 4-6, redo queue | 2h |

## Week 2: Building Blocks (Days 8-14)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 8 | P1 | Databases -- SQL | (R) Module README, (P) design schema for a social network | 3h |
| 9 | P1 | Databases -- NoSQL | (R) Module README, (P) compare SQL vs NoSQL for 3 use cases | 3h |
| 10 | P1 | Message Queues (Part 1) | (R) Module README, (P) design event pipeline | 3h |
| 11 | P1 | Message Queues (Part 2) + Blob/CDN | (R) Both modules, (P) design media upload pipeline | 3.5h |
| 12 | P1 | API Design | (R) Module README, (P) design REST API for a blog platform | 3h |
| 13 | P1 | API Design + Proxies | (R) Complete API + start Proxies, (P) design API gateway | 3.5h |
| 14 | P1 | Proxies & Gateways + Review | (R) Complete Proxies, (V) review all Phase 1, weekly review | 3h |

## Week 3: Distributed Concepts (Days 15-21)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 15 | P1 | Phase 1 wrap-up | (V) Re-read weak areas, complete any pending modules | 2.5h |
| 16 | P2 | Scalability | (R) Module README, (P) design scaling strategy for an e-commerce site | 3h |
| 17 | P2 | Partitioning & Sharding (Part 1) | (R) Module README, understand consistent hashing | 3h |
| 18 | P2 | Partitioning & Sharding (Part 2) | (P) Design sharding for a chat database, handle hotspots | 3h |
| 19 | P2 | Replication | (R) Module README, (P) compare leader-follower vs multi-leader | 3h |
| 20 | P2 | Consistency Models (Part 1) | (R) Module README, understand CAP theorem deeply | 3h |
| 21 | P2 | Consistency Models (Part 2) + Review | (P) Analyze consistency needs for 3 systems, (V) weekly review | 3h |

## Week 4: Distributed Concepts + Patterns (Days 22-28)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 22 | P2 | Rate Limiting | (R) Module README, (P) design distributed rate limiter | 3h |
| 23 | P2 | Unique ID Generation | (R) Module README, (P) compare UUID vs Snowflake | 2.5h |
| 24 | P2 | Distributed Consensus | (R) Module README, understand Raft basics | 3h |
| 25 | P3 | Fan-out Pattern | (R) Module README, (P) analyze Twitter fan-out strategy | 3h |
| 26 | P3 | Event Sourcing & CQRS | (R) Module README, (P) design event-sourced order system | 3h |
| 27 | P3 | Pub/Sub Pattern | (R) Module README, (P) design notification delivery pipeline | 3h |
| 28 | P3 | Circuit Breaker + Review | (R) Module README, (V) review Phase 2-3, weekly review | 3h |

## Week 5: Patterns + First Designs (Days 29-35)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 29 | P3 | Saga Pattern | (R) Module README, (P) design distributed transaction flow | 3h |
| 30 | P3 | Sharding Strategies | (R) Module README, (P) compare strategies for 3 databases | 3h |
| 31 | P3 | Cache Patterns | (R) Module README, (P) design cache warming strategy | 3h |
| 32 | P3 | Answer Template | (R) answer-template.md, (P) practice 45-min structure on paper | 3h |
| 33 | P4 | URL Shortener | (P) Full design from scratch using RESHADED framework | 3.5h |
| 34 | P4 | Pastebin | (P) Full design, compare with URL shortener trade-offs | 3h |
| 35 | P4 | Rate Limiter + Review | (P) Full design, (V) weekly review | 3.5h |

## Week 6: Starter Designs (Days 36-42)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 36 | P4 | Key-Value Store (Part 1) | (P) Design partitioning and replication strategy | 3.5h |
| 37 | P4 | Key-Value Store (Part 2) | (P) Add consistency guarantees, handle failures | 3h |
| 38 | P4 | Unique ID Generator | (P) Full design, compare approaches | 2.5h |
| 39 | P4 | Web Crawler | (P) Full design with politeness and dedup | 3.5h |
| 40 | P4 | Notification System | (P) Full design with priority and delivery guarantees | 3h |
| 41 | P4 | Chat System (WhatsApp) | (P) Full design with presence and ordering | 3.5h |
| 42 | P4 | News Feed + Review | (P) Start news feed design, (V) weekly review | 3.5h |

## Week 7: Starter to Advanced (Days 43-49)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 43 | P4 | News Feed (Complete) | (P) Complete fan-out design, analyze ranking | 3h |
| 44 | P4 | Typeahead / Autocomplete | (P) Full design with trie and caching | 3h |
| 45 | P5 | Instagram | (P) Full design: CDN, image pipeline, feed | 3.5h |
| 46 | P5 | YouTube | (P) Full design: transcoding, streaming, CDN | 4h |
| 47 | P5 | Twitter | (P) Full design: fan-out, search, trending | 3.5h |
| 48 | P5 | Uber | (P) Full design: geospatial, matching, tracking | 4h |
| 49 | P5 | Dropbox + Review | (P) Start file storage design, (V) weekly review | 3.5h |

## Week 8: Advanced Designs (Days 50-56)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 50 | P5 | Google Search | (P) Full design: crawling, indexing, serving | 4h |
| 51 | P5 | Distributed Cache | (P) Full design: partitioning, replication, eviction | 3.5h |
| 52 | P5 | Payment System | (P) Full design: idempotency, ledger, reconciliation | 4h |
| 53 | P5 | Ticket Booking | (P) Full design: seat locking, consistency | 3.5h |
| 54 | P5 | Google Maps | (P) Full design: routing, tiles, ETA | 3.5h |
| 55 | P6 | Mock Interview 1 | (P) Full 45-min mock, self-assess with rubric | 3h |
| 56 | P6 | Mock Interview 2 + Review | (P) Full 45-min mock, (V) weekly review | 3.5h |

## Week 9: Final Prep (Days 57-60)

| Day | Phase | Topics | Tasks | Time |
|-----|-------|--------|-------|------|
| 57 | P6 | Deep Dive Weak Areas | (V) Re-design 2-3 weakest systems from Phase 4-5 | 3.5h |
| 58 | P6 | Deep Dive + Follow-ups | (P) Practice: "How would you scale this 10x?", failure scenarios | 3h |
| 59 | P6 | Behavioral + Mock 3 | (P) STAR stories for system design context, final mock | 3.5h |
| 60 | P6 | Final Review | (V) Confidence assessment, review all designs, celebrate | 2h |

## Tips

- **Morning brain is best** -- do design work when fresh, review in the evening
- **Draw everything** -- use paper, whiteboard, or excalidraw.com
- **Explain out loud** -- practice explaining designs as if in an interview
- **Don't skip estimation** -- it's the backbone of every design decision
- **Re-read how-to-think.md weekly** -- the framework becomes second nature
