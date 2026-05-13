# Module Enrichments Plan — system-design-zth

> Audit phase. Identifies per-module what to add in Round 4c.
> Enrichments below are **planned**, not yet executed. No source file is modified by this audit.

## Summary

- Modules audited: **24** Phase 1-3 + **20** Phase 4-5 design folders + **1** Phase 6 + **4** Phase 0 + **8** root/template = **57** files.
- **Most common gap (P1-P3, 23/23):** no dedicated `### Worked Example` with one numeric trace, no `### Further Reading` block, no short conversational `### Intuition` paragraph before "Why This Matters."
- **Most common strength (P1-P3, 23/23):** `First-time Recognition Signals` + `### Anti-signals` already present (prior `append-signals.py` pass). `## Trade-offs` table present in 24/24. Mermaid present in 24/24.
- **Phase 4-5 gap profile is different:** thin folder README (1.4-2.1 KB) + 6-12 KB `solution.md` with mermaid HLD, **but no** anti-signals, recognition signals, external reading, or variant prompts in any of the 20 designs.
- **7 required diagrams audited:** 3 already present (consistent-hash ring, CAP triangle, leader-follower replication), 4 must be added (3-tier web, read/write-through cache, Kafka partition + consumer group, Raft state FSM).

Per-module sections below name *what* to add (specific table columns, example data, blog citations), not just "add a table."

---

## A. Phase 1-3 patterns (24 modules)

**Common template across 23 module files** (every entry below assumes these three additions unless overridden):
- `### Intuition` — 3-5 conversational sentences before `## Why This Matters`.
- `### Worked Example: <named scenario>` — one numeric trace.
- `### Further Reading` — 3-6 curated links.

### Phase 1 — Building Blocks (9)

- **`phase-1-building-blocks/01-dns-networking/README.md`** — plan `### Worked Example: Sizing TTL for a multi-region API` (60 / 300 / 3600 s columns: cache-hit %, failover RTO, resolver load); `### Trade-off augment: DNS Routing Policies Compared` (simple / weighted / latency / geo / failover × when-to-use / propagation / cost / SPOF); `### Mermaid: recursive resolver chain` (stub → recursive → root → TLD → authoritative); Further Reading = Cloudflare Learning Center, AWS Route 53 routing-policies doc, Julia Evans DNS zines, DDIA ch.8 sidebar.
- **`phase-1-building-blocks/02-load-balancing/README.md`** — `### Worked Example: Sizing an L7 pool for 50k QPS` (5k/inst × headroom × AZ-failure = 18 nodes); `### Trade-off augment: Algorithm Comparison` (round-robin / least-conn / least-response-time / consistent-hash / p2c × fairness / hot-spot / sticky); Further Reading = HAProxy + NGINX + Envoy docs, "Power of Two Choices" paper, Google SRE ch.19.
- **`phase-1-building-blocks/03-caching/README.md`** — `### Worked Example: Stampede math` (1M QPS hot key, 60s TTL; mutex vs probabilistic early expiration peak DB load); `### Mermaid: read-through vs write-through` side-by-side (current diagram is cache-aside only — **one of the 7 required**); Further Reading = Memcached @ Facebook NSDI '13, Alex Xu vol.1 ch.5, DDIA ch.1, Discord cache blog.
- **`phase-1-building-blocks/04-databases-sql/README.md`** — `### Worked Example: Index trade-off on a 100M-row orders table` (covering-index size, write amplification, plan diff); `### Trade-off augment: Isolation Levels` (RU / RC / RR / SER / SI × anomalies × default in PG/MySQL/Oracle × lock cost); Further Reading = DDIA ch.7, *Use The Index Luke*, PostgreSQL internals, Aurora SIGMOD '17, Jepsen MySQL/PG.
- **`phase-1-building-blocks/05-databases-nosql/README.md`** — `### Worked Example: Cassandra partition design for IoT readings` (5M devices × 1/min × 1 yr, partition by `(device_id, day_bucket)` to keep ≤ 100 MB / ≤ 100k rows); `### Trade-off augment: Doc vs Wide-Column vs KV vs Graph` decision flow; Further Reading = Dynamo paper (SOSP '07), Bigtable paper (OSDI '06), DDIA ch.3, Discord Cassandra→ScyllaDB blog.
- **`phase-1-building-blocks/06-message-queues/README.md`** — `### Worked Example: Sizing Kafka partitions for 50k msg/s` (partition count from per-partition throughput ≈ 10 MB/s, RF=3, retention 7 d → TB sizing); `### Mermaid: topic → partitions → consumer-group` showing 2 CGs over the same topic + rebalance on join/leave (**one of the 7 required**); `### Trade-off augment: Delivery Guarantees` (at-most / at-least / exactly-once × broker support × consumer pattern); Further Reading = *Kafka: Definitive Guide* ch.1-3, Confluent EOS blog, Uber reliable-reprocessing blog.
- **`phase-1-building-blocks/07-blob-storage-cdn/README.md`** — `### Worked Example: Sizing CDN for a 5 Gbps origin` (95% hit-ratio target, POP count, cache-key strategy, invalidation cost); `### Trade-off augment: Storage Class Comparison` (Standard / IA / Glacier / Deep Archive × retrieval × $/GB/mo × durability); Further Reading = AWS S3 design-tenets blog, Netflix Open Connect, Cloudflare/Fastly cache-key posts.
- **`phase-1-building-blocks/08-api-design/README.md`** — `### Worked Example: Cursor vs offset pagination over 10M rows` (offset=1M tail latency vs cursor stability under inserts); `### Trade-off augment: When to Pick Each Protocol` (REST / gRPC / GraphQL / WebSocket × client mix × latency × tooling); Further Reading = Google AIP (aip.dev), Stripe API blog, Fielding REST dissertation ch.5, gRPC docs.
- **`phase-1-building-blocks/09-proxies-gateways/README.md`** — `### Worked Example: Gateway responsibility matrix` (auth / rate-limit / log / transform / fan-out × keep-at-gateway vs push-to-service); `### Trade-off augment: API Gateway vs Service Mesh vs Edge Proxy` (N-S vs E-W, latency budget, ops cost); Further Reading = Envoy design doc, Netflix Zuul 2 blog, Kong architecture, Bilgin Ibryam service-mesh post.

### Phase 2 — Distributed Concepts (7)

- **`phase-2-distributed-concepts/01-scalability/README.md`** — `### Worked Example: Stateful chat → stateless` (session into Redis, sticky-session removed, autoscaler before/after capacity); `### Trade-off augment: Scaling Lever Comparison` (vertical / horizontal / read-replicas / sharding / caching / async × cost × time × ceiling); Further Reading = DDIA ch.1, AWS Well-Architected reliability, GitHub scaling-up series.
- **`phase-2-distributed-concepts/02-partitioning-sharding/README.md`** — ✓ consistent-hash ring diagram already present (one of the 7 required). `### Worked Example: Picking a shard key for Uber rides` (`rider_id` vs `(city, day)` vs `trip_id` against celebrity / hot-city); `### Trade-off augment: add "cross-shard tx cost" + "scatter-gather query cost"` rows; Further Reading = Vitess sharding docs, DDIA ch.6, Slack reengineering-for-scale blog.
- **`phase-2-distributed-concepts/03-replication/README.md`** — ✓ leader-follower sequence diagram already present (one of the 7 required). `### Worked Example: RPO/RTO under async replication` (primary fails at T+200 ms; replica lag 500 ms → data lost; semi-sync vs fsync mitigations); `### Trade-off augment: Single-leader vs Multi-leader vs Leaderless` (conflict resolution × write availability × typical latency); Further Reading = DDIA ch.5 (canonical), Jepsen MongoDB / PG, Aurora Multi-Master blog, Stripe failover blog.
- **`phase-2-distributed-concepts/04-consistency-models/README.md`** — ✓ CAP triangle diagram already present (one of the 7 required). `### Worked Example: Read-your-writes in multi-AZ` (naive read-after-write goes stale → primary-pin OR causal token); `### Trade-off augment: Tunable Consistency` (Cassandra/Dynamo R+W>N matrix); Further Reading = DDIA ch.9, Kleppmann "Please stop calling databases CP/AP", Jepsen consistency map, Spanner TrueTime paper.
- **`phase-2-distributed-concepts/05-rate-limiting/README.md`** — `### Worked Example: Token-bucket math` (cap=100, refill=10/s, burst of 150 then 5/s steady → exact rejected requests); `### Trade-off augment: Where to Enforce` (client / edge / gateway / per-service / DB-level × leak risk × blast radius); Further Reading = Stripe rate-limit blog (canonical), Cloudflare rate-limit blog, GCRA paper, Envoy rate-limit-service.
- **`phase-2-distributed-concepts/06-unique-id-generation/README.md`** — `### Worked Example: Snowflake bit-layout walkthrough` (41-bit ts + 10-bit worker + 12-bit seq → 4096 IDs/ms/worker → 4M/s; clock-skew failure); `### Mermaid: Snowflake bit-layout` (`[sign|ts|worker|seq]` boxes); Further Reading = Twitter Snowflake blog (2010), Instagram engineering ID blog, Sonyflake/ULID/KSUID specs, UUIDv7 RFC draft.
- **`phase-2-distributed-concepts/07-distributed-consensus/README.md`** — `### Worked Example: Quorum math for N=5` (surviving 2 failures, why N=4 ≡ N=3 fault-wise, picking 3/5/7 for control plane); `### Mermaid: Raft Follower↔Candidate↔Leader state-transition` (**one of the 7 required** — current diagram is a trace, not the FSM); `### Trade-off augment: Raft vs Paxos vs ZAB` (leadership stability × replication design × ecosystem); Further Reading = Raft paper (USENIX ATC '14), thesecretlivesofdata.com/raft, Paxos Made Simple, etcd architecture, Jepsen etcd/Consul/ZK.

### Phase 3 — Design Patterns (8)

- **`phase-3-design-patterns/01-fan-out/README.md`** — `### Worked Example: Push vs pull break-even` (200 avg followers, 500 posts/s → 100k feed writes/s vs read-time merge; show hybrid threshold derivation); `### Trade-off augment: Storage Cost Model` row (Redis sorted-set per user × 800 entries × ~120 B × N users); Further Reading = Twitter fan-out blogs (2013 + 2017), High Scalability Twitter posts, Instagram feed blog.
- **`phase-3-design-patterns/02-event-sourcing-cqrs/README.md`** — `### Worked Example: Replaying 6 months of orders` (projection rebuild cost; snapshotting every 1k events trims this); `### Mermaid: Command → Event Store → Projector → Read Model`; `### Trade-off augment: Event Sourcing vs CRUD` (audit / replay / debug / schema evolution / complexity); Further Reading = Fowler bliki, Greg Young CQRS PDF, EventStore docs, MS Azure CQRS pattern.
- **`phase-3-design-patterns/03-pub-sub/README.md`** — `### Worked Example: Fan-out at 10k publishers × 100k subscribers` (broker throughput, per-topic partition count, CG rebalance cost); `### Trade-off augment: Topic vs Queue vs Stream` (semantics × retention × consumer model); Further Reading = Jay Kreps "The Log", Confluent stream-processing posts, Google Cloud Pub/Sub design, NATS JetStream.
- **`phase-3-design-patterns/04-circuit-breaker-retry/README.md`** — `### Worked Example: Retry storm math` (1k QPS, 50% downstream degradation; 3 retries no jitter → 3k amplification; exp + jitter → < 1.2k); `### Mermaid: Closed → Open → Half-Open state diagram`; `### Trade-off augment: Retry Patterns` (fixed / exp / exp+jitter / token-budgeted); Further Reading = Hystrix wiki + retirement notice, resilience4j docs, MS Azure resilience patterns, AWS "Exponential Backoff and Jitter".
- **`phase-3-design-patterns/05-saga-pattern/README.md`** — `### Worked Example: Travel booking saga` (flight → hotel → car with compensations + idempotency keys per step); `### Mermaid: Orchestrator-based saga with failure path` showing compensation chain; `### Trade-off augment: Saga vs 2PC vs Outbox` (consistency × blast radius × ops complexity); Further Reading = microservices.io Saga, MS Saga pattern, Garcia-Molina & Salem 1987 paper, Temporal/Cadence docs.
- **`phase-3-design-patterns/06-sharding-strategies/README.md`** — `### Worked Example: Re-sharding 32 → 64 shards` (hash mod: ~50% data moves; consistent hash + vnodes: ~3%; double-write window: zero downtime); `### Trade-off augment: Key Choice Anti-Patterns` (timestamp / monotonic ID / low-cardinality enum); Further Reading = Foursquare MongoDB hot-shard postmortem, Pinterest "Sharding Pinterest" blog, Discord sharding blog.
- **`phase-3-design-patterns/07-cache-patterns/README.md`** — `### Worked Example: Read-through vs cache-aside p99 tail` on cold key; `### Mermaid: side-by-side cache-aside / read-through / write-through / write-behind` mini-flows; Further Reading = AWS caching best-practices doc, Algolia "Cache Strategies", Memcached @ FB paper, Caffeine cache design.
- **`phase-3-design-patterns/08-answer-template/README.md`** *(meta template — skip "anti-signals")* — `### Worked Example: Filled template for URL Shortener` (1-2 lines per RESHADED phase, cross-link to Phase 4-01); `### Self-Scoring Rubric` (1-5 per phase, mirrors Phase 6); Further Reading = Alex Xu vol.1 ch.4, Jackson Gabbard interview notes, DesignGurus articles.

---

## B. Phase 4 starter designs (10 designs × 3 files)

> Each design has `README.md` (overview ~1.4 KB), `problem.md` (~2 KB), `solution.md` (6-9 KB). All 10 solution.md files have Mermaid HLD. **None** have anti-signals, recognition signals, or external resources.

**Per-design plan — applied to all 10:**
- `solution.md`: add `### Recognition Signals` (cross-link to P1-P3 modules), `### Anti-signals (looks like this design, isn't)` (3 lookalikes), `### Further Reading` (2-4 industry blogs/videos).
- `README.md`: add `### Variant Prompts` (3 harder follow-ups).

Design-specific deltas:

- **`01-url-shortener/`** — anti-signals: PIN generator, custom-slug-only service, OAuth state token; trade-off augment in solution: `### Counter vs Hash vs KGS` (collision risk × coordination cost × prediction risk); reading: bit.ly engineering, ByteByteGo URL-shortener video, Hashids.
- **`02-pastebin/`** — anti-signals: Gist with revisions, snippet-share with auth, code-exec sandbox; worked example in solution: `1M pastes/day × 10 KB × 5 y = 18 TB`; reading: Hastebin source, Pastebin abuse-prevention posts, AWS S3 lifecycle.
- **`03-rate-limiter/`** — anti-signals: quota service for billing, concurrency bulkhead, fairness scheduler; trade-off augment: `### Token-Bucket vs Sliding-Window vs GCRA` (memory × burst × accuracy); reading: Stripe blog, Cloudflare blog, Lyft envoy-ratelimit.
- **`04-key-value-store/`** — anti-signals: cache, document DB, ordered LSM store; `### Mermaid: Quorum read (R=2, W=2, N=3) sequence`; reading: Dynamo paper, Cassandra docs, Riak architecture, Bigtable (for contrast).
- **`05-unique-id-generator/`** — anti-signals: auth token, idempotency key, slug generator; worked example: Snowflake bit-pack (reuse from P2-06); reading: Twitter Snowflake, Sonyflake, Instagram IDs, UUIDv7 draft.
- **`06-web-crawler/`** — anti-signals: scraper for one site, RSS poller, search-indexer build-only; trade-off augment: `### BFS vs Priority-Queue Frontier` (coverage vs freshness); reading: Mercator paper, Heritrix docs, Apache Nutch, Common Crawl design.
- **`07-notification-system/`** — anti-signals: in-app feed, transactional email service, OTP/2FA delivery; trade-off augment: `### Provider Strategy` (single APNs/FCM × multi-provider failover × per-region routing); reading: Pinterest notif platform, Slack push blog, Airship engineering.
- **`08-chat-system/`** — anti-signals: email, IoT telemetry pub-sub, video-call signaling; worked example: `### presence at 100M concurrent connections` (sharded gateway map, heartbeat cadence); reading: WhatsApp blog, Slack connection-state blog, Discord realtime, Signal protocol whitepaper.
- **`09-news-feed/`** — anti-signals: chat inbox, notification center, public trending feed; trade-off augment: add quantified push/pull break-even row; reading: Instagram ranking blog, LinkedIn feed-at-scale, "Anatomy of Twitter's Timeline" InfoQ.
- **`10-typeahead/`** — anti-signals: full-text search, spellcheck-only, autocorrect; trade-off augment: `### Trie-in-RAM vs ES completion suggester vs FST` (memory × update cost × personalization); reading: Bing autosuggest blog, Elastic completion-suggester doc, Lucene FST blog.

---

## C. Phase 5 advanced designs (10 designs × 3 files)

Same per-design template as Phase 4 (signals + anti-signals + reading + variant prompts), plus a **deep worked example** per design.

- **`01-instagram/`** — anti-signals: photo-storage-only, Flickr album, Pinterest visual discovery; worked example: per-user feed cache sizing (800 × ~120 B × 500M users = 48 GB); reading: Instagram engineering "Building Instagram", Meta TAO, Sharding & IDs at Instagram.
- **`02-youtube/`** — anti-signals: Zoom conferencing, Twitch live, Plex home media; worked example: transcoding DAG CPU-hrs (1-hr × 12 renditions × 30 fps); `### Mermaid: HLS manifest delivery + edge-cache invalidation`; reading: Netflix "Encoding for the world", Cloudflare Stream, YouTube engineering.
- **`03-twitter/`** — anti-signals: Reddit threaded forums, Mastodon federated, LinkedIn graph; worked example: fan-out math for 100M-follower celebrity (Redis writes/s, hybrid threshold); reading: Twitter "Real-Time Delivery Architecture" InfoQ, "Building Timelines at Twitter" 2017, High Scalability Twitter posts.
- **`04-uber/`** — anti-signals: food delivery, dating-proximity match, package logistics; worked example: H3/QuadTree cell sizing across city density; `### Mermaid: driver-rider matching state diagram`; reading: Uber H3 blog, Uber Mezzanine match blog, Lyft geosharding.
- **`05-dropbox/`** — anti-signals: object store, VCS, S3 web app; worked example: 4-MB block dedup at 30% duplicate ratio; `### Mermaid: metadata sync vs block sync parallel pipelines`; reading: Dropbox Magic Pocket blog, Google Drive architecture, OneDrive delta-sync.
- **`06-google-search/`** — anti-signals: per-site search (Algolia), e-commerce facet search, vector-only RAG retrieval; worked example: index shard-by-term-id vs shard-by-doc-id (latency vs broadcast); reading: Brin & Page 1998 paper, "Web Search for a Planet" SOSP, Common Crawl docs, Elastic distributed-search internals.
- **`07-distributed-cache/`** — anti-signals: CDN, in-process Caffeine, KV DB with persistence; worked example: ring-node failure (data movement %, client-rehash latency spike); `### Mermaid: Client → Coordinator → Replica fan-out for read-quorum`; reading: Memcached @ FB (NSDI '13), Redis Cluster spec, Twemproxy, Twitter caching blog.
- **`08-payment-system/`** — anti-signals: in-game currency, loyalty points, vouchers; worked example: idempotency-key lifecycle (TTL, replay-safe retry, processor-side dedupe); `### Mermaid: Saga for charge → ledger → notify with compensations`; reading: Stripe "Designing robust APIs", Square distributed-tx blog, DDIA ch.7 + ch.11.
- **`09-ticket-booking/`** — anti-signals: e-commerce cart, hotel room with rate plans, calendar slot booking; worked example: seat-hold via Redis SETNX + TTL race; `### Mermaid: Hold → Confirm → Pay state machine with timeout transitions`; reading: BookMyShow blog, Ticketmaster Verified Fan, Shopify flash-sale blog.
- **`10-google-maps/`** — anti-signals: indoor mapping, AR navigation, fleet-tracking dashboard; worked example: tile pyramid storage at zoom 0-20 (4^z tiles, PNG vs vector cost); `### Mermaid: Contraction-Hierarchies routing query path`; reading: Mapbox vector-tiles blog, MS CRP paper, Uber H3, OpenStreetMap architecture.

---

## D. Phase 6 mock interviews

### `phase-6-mock-interviews/README.md`
- ✓ Structure, 7×5 rubric, follow-up taxonomy, STAR template, final-review checklist.
- ✗ **10 concrete mock prompts** in a graded table (P1 easy → P10 senior-staff) with columns: prompt, scope hint, expected components, difficulty.
- ✗ **5 written STAR behavioral prompts** (e.g., "Tell me about a time you redesigned a system under production pressure").
- ✗ **`### Time-Budget Card`** — printable 45-min phase strip (R 5 / E 5 / S 3 / H 10 / A 5 / D 12 / E 3 / D 2) + per-phase "don't do" list.
- ✗ **`### Mock-Interview Pairing Protocol`** — interviewer script, interruption etiquette, debrief template.
- ✗ **`### Further Reading`** — *Cracking the Coding Interview* SD appendix, Pramp / Interviewing.io SD sessions, Jackson Gabbard / Gaurav Sen YouTube playlists.

---

## E. Phase 0 framework

- **`phase-0-framework/README.md`** — add `### What to Read When` table mapping situation → file.
- **`phase-0-framework/how-to-approach.md`** — add `### Mermaid: canonical 3-tier web architecture` (client → LB → stateless app → DB) **before** the Twitter mermaid (**one of the 7 required**); `### Worked Example: RESHADED applied to URL Shortener in 45 min` with speech-track per phase; `### Anti-Patterns Beyond Buzzwords` (estimation units, drawing before scoping, premature optimization).
- **`phase-0-framework/estimation-cheatsheet.md`** — ✓ already has Latency Numbers table. Add `### Capacity of Cloud SKUs (2025)` (RDS / Aurora / DynamoDB / ElastiCache / MSK per-instance ceilings); `### Common Estimation Mistakes` (MB/s vs Mbps, missing peak factor, replication-factor storage multiplier).
- **`phase-0-framework/requirements-gathering.md`** — `### Negotiating Scope Down` (phrases to cut features in first 5 min); `### NFR Defaults Cheat Sheet` (when interviewer is silent: 99.9% avail, p99 < 500 ms, 100:1 R:W, eventual consistency for non-financial).

---

## F. Root docs

- **`README.md`** — complete; one-line tweak to "How Each Module Works" table once Round 4c lands (mention Intuition / Worked Example / Further Reading).
- **`how-to-think.md`** — has RESHADED + 2 mermaid (SQL/NoSQL decision tree + universal template). Add `## Pattern Identification Workout` — 10 numbered prompts each with `<details><summary>Answer</summary>…</details>` block + self-scoring guide; add `## Drawing Library` — 6 canonical sketches every candidate should reproduce in 60s (3-tier, fan-out, sharded-DB-with-replicas, consistent-hash ring, Kafka producer/consumer, leader-follower).
- **`estimation-reference.md`** — ✓ already has "Latency Numbers Every Engineer Should Know" — **do not duplicate**. Add `## Refresh: 2025 Latency Snapshot` (NVMe 10-30 µs, intra-AZ ~300 µs, inter-AZ 1-2 ms, inter-region 30-100 ms, 5G RTT, Lambda cold-start); `## Pricing Quick Reference` ($/GB/mo for S3 / Glacier / EBS gp3 / RDS, $/M-req for Lambda / DynamoDB / API Gateway).
- **`plan.md`** — course blueprint; keep cross-refs in sync with 4c (deferrable).
- **`daily-schedule.md`** — add "What 4c adds" column per day (deferrable).
- **`redo-queue.md`** — add a worked example showing how Leitner boxes evolve over a week.
- **`progress.md`** — add per-module trio of checkboxes (intuition / worked example / further reading) so learners track depth.
- **`setup.md`** — add `### Recommended Browser Extensions` (Mermaid live editor, MarkdownTOC). Low priority.
- **`templates/answer-template.md`** — ✓ has phase script, phrases table, anti-patterns. Add `## Worked Example: Filled Template for "Design a Notification System"`; `## Self-Scoring Rubric` (1-5 per phase mirrors Phase 6); `## Recognition-Signal Quick Reference` — 10-row table mapping prompt phrasing → P1-P3 module to summon (compresses the 23 `First-time Recognition Signals` blocks into one lookup).

---

## G. Required Mermaid diagrams — placement map

| Diagram | Target file | Status | Action |
|---|---|---|---|
| 3-tier web architecture | `phase-0-framework/how-to-approach.md` | ✗ missing (current first diagram is Twitter-specific) | **Add** before Twitter mermaid |
| Read-through vs write-through cache | `phase-1-building-blocks/03-caching/README.md` | ✗ missing (only cache-aside present) | **Add** side-by-side block |
| Leader-follower replication | `phase-2-distributed-concepts/03-replication/README.md` | ✓ present | Keep |
| Consistent-hashing ring | `phase-2-distributed-concepts/02-partitioning-sharding/README.md` | ✓ present | Keep |
| CAP triangle | `phase-2-distributed-concepts/04-consistency-models/README.md` | ✓ present | Keep |
| Kafka topic → partitions → consumer group | `phase-1-building-blocks/06-message-queues/README.md` | ✗ missing (current diagram is producer/queue/consumer event-flow, not partition-CG fan-out) | **Add** |
| Raft state transitions (Follower↔Candidate↔Leader) | `phase-2-distributed-concepts/07-distributed-consensus/README.md` | ✗ missing (current diagram is a trace, not the FSM) | **Add** |

**Net new mermaid blocks across the repo from this list: 4.**

---

## H. External resources — canonical mapping (for Round 4c "Further Reading" blocks)

| Topic | Canonical references to cite |
|---|---|
| Caching | Memcached @ FB NSDI '13, Redis docs, DDIA ch.1, Alex Xu vol.1 ch.5, Discord cache blog |
| SQL | DDIA ch.2 + ch.7, *Use The Index Luke*, PostgreSQL internals, Aurora SIGMOD '17, Jepsen MySQL/PG |
| NoSQL | DDIA ch.3, Dynamo paper (SOSP '07), Bigtable paper (OSDI '06), Cassandra data-modeling, Discord ScyllaDB blog |
| Replication | DDIA ch.5 (canonical), Jepsen MongoDB/PG, Aurora Multi-Master, Stripe failover blog |
| Sharding | DDIA ch.6, Vitess docs, Pinterest sharding blog, Slack reengineering, Cassandra ring docs |
| Consistency | DDIA ch.7 + ch.9, Kleppmann "Please stop calling DBs CP/AP", Jepsen consistency map, Spanner paper |
| Consensus | Raft paper (ATC '14), thesecretlivesofdata.com/raft, Paxos Made Simple, ZooKeeper paper, Jepsen etcd/Consul/ZK |
| Rate limiting | Stripe rate-limit blog (canonical), Cloudflare rate-limit blog, GCRA paper, Envoy ratelimit-service |
| Unique IDs | Twitter Snowflake (2010), Instagram engineering IDs, Sonyflake / ULID / KSUID specs, UUIDv7 draft |
| Fan-out | Twitter fan-out blogs (2013 + 2017), High Scalability Twitter posts, Instagram feed blog |
| Saga | microservices.io Saga, MS Saga pattern, Garcia-Molina & Salem 1987, Temporal/Cadence docs |
| Event sourcing | Fowler bliki, Greg Young CQRS PDF, EventStore docs, MS Azure CQRS pattern |
| Pub-sub | Jay Kreps "The Log", Confluent stream-processing, Google Pub/Sub design, NATS JetStream |
| Circuit breaker | Hystrix wiki, resilience4j docs, MS Azure resilience patterns, AWS "Exponential Backoff and Jitter" |
| Load balancing | Google SRE ch.19, "Power of Two Choices" paper, HAProxy + NGINX + Envoy docs |
| DNS | Cloudflare Learning Center, AWS Route 53 routing-policies, Julia Evans zines |
| Blob / CDN | AWS S3 design-tenets blog, Netflix Open Connect, Cloudflare/Fastly cache-key posts |
| API design | Google AIP (aip.dev), Stripe API blog, Fielding REST dissertation, gRPC docs |
| Proxies / gateways | Envoy design doc, Netflix Zuul 2 blog, Kong architecture, service-mesh primers |
| Message queues | *Kafka: Definitive Guide* ch.1-3, Confluent EOS blog, Uber reprocessing blog, RabbitMQ docs |
| Design problems (P4-P5) | Engineering blogs (Stripe, Discord, Slack, Uber, Lyft, Netflix, Pinterest, WhatsApp, Dropbox, BookMyShow, Mapbox), domain papers (Dynamo, Bigtable, Spanner, Brin & Page 1998, Magic Pocket, H3, CRP routing), ByteByteGo videos |

---

## Methodology

- Read all **24** Phase 1-3 READMEs (each 7-13 KB).
- Read 2 Phase 4 solution.md files in full + spot-checked all 10 via grep on section headings.
- Read 1 Phase 5 solution.md in full (`02-youtube`) and opening of `03-twitter` + spot-checked all 10 via grep.
- Read all 10 Phase 4 + all 10 Phase 5 folder READMEs (1.4-2.1 KB each, near-identical templates) — confirmed gap profile.
- Read all 4 Phase 0 files + Phase 6 README + 8 root/template files in full.
- Cross-checked existing coverage with grep against six headings: `## When to Use`, `## Anti-Signal*`, `## Worked Example`, `## External Resources`, `## Further Reading`, ` ```mermaid `.
- Cross-referenced with `.audit/append-signals-report.md` to confirm `First-time Recognition Signals` + `### Anti-signals` already present in 23/23 P1-P3 modules.

This report drives **Round 4c** execution — the actual section additions, diagram inserts, and external-link blocks.
