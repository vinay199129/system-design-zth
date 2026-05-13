# System Design Primer — System Design Zero to Hero

> The single doc to read before walking into a system-design interview. It distils the framework, the back-of-envelope math, the six building blocks, the CAP / ACID / BASE vocabulary, and the eight canonical question templates so you can pattern-match in the first 30 seconds.

> Sources for the structure: [github.com/donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer); Alex Xu, *System Design Interview* vol. 1 (2020) & vol. 2 (2022); Martin Kleppmann, *Designing Data-Intensive Applications* (O'Reilly, 2017); the AWS / GCP / Azure Architecture Centers; Jeff Dean's Stanford CS295 talk "Software Engineering Advice from Building Large-Scale Distributed Systems" (2009).

---

## 1. The 4-Question Framework (RESHADED, distilled)

Every system-design round follows this rhythm. If you skip a step, the interviewer notices. The full 8-step RESHADED breakdown lives in [`how-to-think.md`](how-to-think.md); this is the compressed version you reach for under pressure.

### 1.1 Functional Requirements (5 min)

Ask: *"What should the system do from the user's perspective?"* Settle on 3-5 bullet user-facing behaviours, written on the whiteboard. Anything not on that list is explicitly out of scope.

### 1.2 Non-Functional Requirements (5 min)

Ask: *"Reads vs writes? Latency budget? Availability target? Consistency model? Geography?"* Map each answer to a number. "Fast" is not a requirement; "p99 read latency < 200 ms" is.

### 1.3 High-Level Design (15 min)

Sketch 4-7 boxes: Client → Edge (CDN / DNS) → API gateway → Business logic → Data store → Async layer → Background workers. Every arrow is one API contract. Speak each box aloud as you draw it.

### 1.4 Deep Dive (15 min)

The interviewer chooses (or you propose) **one** of: data model, sharding strategy, caching, hot-key mitigation, failure modes, consistency. Go DEEP, not wide. One deep dive done well beats four hand-waved ones.

### 1.5 Trade-offs + Wrap (5 min)

State 2-3 concrete trade-offs you made (e.g., "I chose eventual consistency in the timeline cache to keep p99 under 100 ms; this means a user can see a stale tweet for up to 5 s"). Close with: *"If we had 100× the traffic / globally distributed users / a 24-hour data-loss intolerance, here's what I'd change."*

---

## 2. Latency Numbers

The full table lives in [`estimation-reference.md`](estimation-reference.md#latency-numbers-every-engineer-should-know). The five you must recall in your sleep:

| Operation | Latency | Why it matters |
|---|---|---|
| Main memory reference | ~100 ns | Why caches exist |
| SSD random read (4 KB) | ~150 µs | 1500× slower than memory |
| Same-datacenter round-trip | ~500 µs | Cost of one RPC hop |
| Cross-region round-trip | ~150 ms | Why global writes are hard |
| Disk seek | ~10 ms | Why we avoid spinning rust on hot paths |

Memorise the *ratios* (memory : SSD : disk : cross-DC ≈ 1 : 1,500 : 100,000 : 1,500,000), not the absolute numbers.

---

## 3. The Six Core Building Blocks

Every system in the canon is a composition of these. Each links to the Phase 1 module that goes deep.

1. **Load balancer** — distributes requests. L4 (TCP) vs L7 (HTTP). Algorithms: round-robin, least-connections, consistent-hash. See [phase-1-building-blocks/02-load-balancers](phase-1-building-blocks/).
2. **Cache** — Redis / Memcached. Strategies: cache-aside, write-through, write-behind. TTL + invalidation are where bugs live. See [phase-1-building-blocks/03-caching](phase-1-building-blocks/).
3. **Database** — SQL (ACID, joins, strong schema) vs NoSQL (horizontal scale, flexible schema). Indexes are how you trade write cost for read speed; sharding is how you survive past one box.
4. **Message queue** — Kafka / SQS / RabbitMQ. Async decoupling, back-pressure, retries, DLQ, ordering vs throughput trade-off.
5. **Blob storage + CDN** — S3 + CloudFront / Cloudflare for media. Presigned URLs keep large bytes off your app tier.
6. **API gateway** — auth, rate-limit, request-shaping, and observability at the edge so individual services stay simple.

---

## 4. CAP, ACID, BASE

The vocabulary every interviewer expects you to use correctly.

- **CAP** (Brewer, 2000). During a network *partition*, you must choose:
  - **C**onsistency — every read sees the latest write, or returns an error.
  - **A**vailability — every request gets a (possibly stale) response.
  - You cannot get both during a partition. When the network is healthy, CAP says nothing.
- **ACID** — the relational-DB transaction guarantee.
  - **A**tomicity (all or nothing), **C**onsistency (invariants hold), **I**solation (concurrent txns don't see each other's half-states), **D**urability (committed data survives crashes).
- **BASE** — the NoSQL counterpart.
  - **B**asically **A**vailable, **S**oft state, **E**ventual consistency. Trade strong guarantees for horizontal scale.
- **Modern reality:** most production systems are *tunable per request*. Cassandra exposes R + W > N quorum knobs; DynamoDB lets you pick strongly-consistent reads at 2× the cost; Google Spanner provides external (linearisable) consistency globally via TrueTime. Never answer "Cassandra is AP" without adding "but the tunable quorums let me get CP-ish per query."

---

## 5. The Eight Canonical Question Templates

If you can recognise *which template the prompt belongs to* in the first 30 seconds, the next 40 minutes write themselves.

| Template | Canonical example | Primary building blocks | Single most-asked follow-up |
|---|---|---|---|
| URL shortener | bit.ly / TinyURL | KV store + cache + key-generation service | "How would you pre-allocate IDs across regions without collisions?" |
| News feed | Twitter / Instagram | Sharded DB + cache + fan-out | "How do you handle the celebrity problem (1 user with 100M followers)?" |
| Chat | WhatsApp / Slack | WebSocket + pub-sub + presence service | "How do you scale to 1M concurrent users in a single room?" |
| Rate limiter | Stripe API / Cloudflare | Redis + token-bucket / sliding window | "Per-IP or per-API-key? Token bucket vs sliding window — when which?" |
| Ride share | Uber / Lyft | S2 cells + geospatial index + matcher | "How do you match a rider to the nearest driver in 200 ms?" |
| Video streaming | YouTube / Netflix | Blob + transcode pipeline + CDN | "Adaptive bitrate vs single-rate — what do you ship and why?" |
| Search | Google / Algolia | Crawler + inverted index + ranker | "How do you rebuild the index without downtime?" |
| Payments | Stripe / Square | Idempotency key + ledger + reconciliation | "How do you guarantee exactly-once charging across retries?" |

(Each row maps to a folder under [`phase-4-classic-starter/`](phase-4-classic-starter/) or [`phase-5-classic-advanced/`](phase-5-classic-advanced/).)

---

## 6. The 30-Second Pattern Match

When you read a fresh prompt, classify in this order:

1. **Read-heavy or write-heavy?** The ratio decides whether you reach for cache + fan-out (read-heavy) or queue + batch (write-heavy).
2. **Strong or eventual consistency?** Money, inventory, seat-booking → strong. Feeds, view-counters, likes → eventual.
3. **Hot-key risk?** Celebrity user, trending product, single noisy tenant — special-case it (request coalescing, dedicated shards, or pull-based fan-out).
4. **Where do bytes accumulate?** Big bytes (video, photos, model artefacts) belong in blob + CDN; small structured bytes belong in a DB.

If you can answer these four in 30 seconds, the next 40 minutes are just filling in the boxes.

---

## 7. What to Read Next

- [`how-to-think.md`](how-to-think.md) — RESHADED framework in full, plus the **Pattern Identification Workout** (10 rapid-fire prompts with hidden answers and a self-score).
- [`phase-0-framework/how-to-approach.md`](phase-0-framework/how-to-approach.md) — the structured 45-minute walkthrough with a worked Twitter example.
- [`estimation-reference.md`](estimation-reference.md) — back-of-envelope numbers, latency table, storage / QPS / bandwidth formulas.
- [`phase-1-building-blocks/`](phase-1-building-blocks/) — start with caching (highest ROI per hour studied), then load balancers, then databases.
- [`templates/answer-template.md`](templates/answer-template.md) — the 45-minute interview playbook + self-scoring rubric.
- [`phase-6-mock-interviews/`](phase-6-mock-interviews/) — 10 mock prompts, scoring rubric, STAR behaviourals, pairing protocol.

> If you only have **one hour** before the interview: read this primer, then `how-to-think.md`, then the answer-template. Skim `estimation-reference.md` for the latency table and the QPS conversion chart.
