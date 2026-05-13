#!/usr/bin/env python3
"""Append First-time Recognition Signals sections to Phase 1-3 module READMEs.

Mirrors the dsa-zth revamp (commit 0f7ee0d). For each building block (Phase 1),
distributed concept (Phase 2), and architecture pattern (Phase 3) README, append
an H2 "First-time Recognition Signals" section followed by an "Anti-signals"
subsection. Signals are phrased in the voice of an interviewer's problem
statement ("Design X that supports Y users with Z latency...") so a learner can
map prompts to components without first knowing the answer.

Idempotent: re-running strips any previously-appended signals section before
re-writing, so the script is safe to invoke repeatedly while iterating on copy.

Usage:
    python .audit/append-signals.py
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Section content is keyed by "<phase-folder>/<module-folder>". The "answer-template"
# module under Phase 3 is intentionally skipped: it is a meta-template, not a pattern.
SECTIONS = {}

# ============================================================================
# Phase 1: Building Blocks
# ============================================================================

SECTIONS['phase-1-building-blocks/01-dns-networking'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Geographically distributed users / route each user to the nearest data center"** — GeoDNS / latency-based routing answers DNS queries differently per requester region.
- **"Fail over between regions with no client code changes"** — DNS-level failover with health checks + low TTL is the cheapest cross-region failover knob.
- **"Custom domain support for tenants / vanity URLs"** — CNAME/A record provisioning per tenant is a DNS-first design problem.
- **"Migrate traffic gradually from old infra to new"** — weighted DNS records let you shift 1% → 10% → 100% without code changes.
- **"Mitigate DDoS at the edge / global anycast"** — anycast DNS (Route 53, Cloudflare) absorbs floods far from your origin.

### Anti-signals (looks like this building block, isn't)

- **"Sub-second failover when a server dies"** — DNS TTL caching (often 30s-5min, longer at resolvers) makes DNS too slow; use a Layer-4/7 load balancer with health checks.
- **"Route each request based on URL path or HTTP header"** — that is an L7 load balancer / API gateway decision, not DNS (DNS only sees the hostname).
- **"Authenticate the caller / rate-limit per user"** — DNS does not see HTTP; reach for an API gateway or proxy.
'''

SECTIONS['phase-1-building-blocks/02-load-balancing'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Horizontally scale the web tier / N stateless app servers behind a single endpoint"** — the textbook load-balancer use case.
- **"Health-check instances and drain unhealthy ones"** — LBs (NLB/ALB/HAProxy/Envoy) do this in seconds, which DNS cannot.
- **"Sticky sessions / route the same user to the same server"** — Layer-7 LB with cookie- or header-based affinity.
- **"Terminate TLS at the edge so backends speak plain HTTP"** — TLS offload is a core LB feature.
- **"Route `/api/*` to service A and `/static/*` to service B"** — Layer-7 path-based routing.

### Anti-signals (looks like this building block, isn't)

- **"Route users to the nearest region"** — single-region LBs cannot do this; use GeoDNS or a global accelerator in front of regional LBs.
- **"Distribute work across consumer instances of a queue"** — that is consumer-group / partition assignment in the message queue, not an HTTP load balancer.
- **"Permanent A/B split for an experiment"** — better handled with a feature flag or API gateway rule than with LB weights, which are operationally awkward to change per experiment.
'''

SECTIONS['phase-1-building-blocks/03-caching'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Read-heavy workload, read:write ratio of 10:1 or higher"** — the database is about to be the bottleneck; cache the hot read path.
- **"Reduce p99 latency to < 100 ms"** with data that is reused across requests — Redis/Memcached lookups are 1-5 ms vs 10-50 ms for a hot SQL query.
- **"Trending / hot keys / celebrity post / viral content"** — a few items get most of the reads; cache them aggressively (and worry about hot-key stampede).
- **"Stale-by-N-seconds is acceptable"** — the prompt explicitly tolerates eventual freshness, opening cache-aside or TTL-based caching.
- **"Same expensive computation repeated for many users"** — feed ranking, leaderboards, search suggestions — cache the *result*, not just the inputs.

### Anti-signals (looks like this building block, isn't)

- **"Strong consistency on every read, no stale data ever"** — caching introduces a stale window; either skip it or use write-through with care, and never claim caching is "free" here.
- **"Write-heavy / unique-per-request data"** (e.g., raw analytics events) — cache hit rate will be near zero; you'd just be adding a layer.
- **"Secrets / PII that must not live in shared memory across tenants"** — caches are tempting but scoping and encryption complicate things; consider per-tenant in-process caches or skip.
'''

SECTIONS['phase-1-building-blocks/04-databases-sql'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"ACID transactions / atomic multi-row update"** (payment ledger, inventory decrement, booking confirmation) — SQL with `BEGIN/COMMIT` is the default safe answer.
- **"Complex relationships and joins"** (users → orders → line items → products) — relational modelling with foreign keys earns clarity points.
- **"Ad-hoc reporting / analytics / arbitrary `WHERE` clauses"** — SQL's query optimizer beats NoSQL when access patterns are not known up front.
- **"Strong consistency by default, can pay latency cost"** — a single-leader RDBMS is the simplest path to strong consistency.
- **"Schema is well-known and changes are reviewed"** — SQL's enforced schema catches bugs that schemaless stores let through.

### Anti-signals (looks like this building block, isn't)

- **"Schemaless documents, fields vary per record"** (user profiles with custom attributes, product catalogues across categories) — a document store fits the data shape better.
- **"Millions of writes per second on independent rows"** — single-leader SQL caps out long before this; consider sharded SQL (Vitess/Citus/Spanner) or a wide-column store.
- **"Graph traversals: friends-of-friends, shortest path between nodes"** — recursive CTEs work but a graph DB (Neo4j) is more natural at depth ≥ 3.
'''

SECTIONS['phase-1-building-blocks/05-databases-nosql'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Massive horizontal scale / petabytes / billions of rows"** that outgrows a single RDBMS — Cassandra / DynamoDB / Bigtable shard linearly.
- **"Single-record lookups by key, no joins"** (user profile by user_id, session by session_id) — a KV store is the lowest-latency answer.
- **"Flexible / evolving schema, fields differ per record"** — document stores (MongoDB, DynamoDB) absorb schema drift without migrations.
- **"Write-heavy with eventual consistency tolerated"** (IoT telemetry, social feeds, analytics events) — wide-column / LSM-tree stores excel here.
- **"Time-series data with TTL / append-only"** — InfluxDB, Cassandra with TTL, or DynamoDB with TTL are purpose-built.

### Anti-signals (looks like this building block, isn't)

- **"Multi-row ACID transaction across entities"** (transfer money, atomically deduct stock and create order) — most NoSQL gives only single-key atomicity; reach for SQL or Spanner.
- **"Ad-hoc reporting with arbitrary `GROUP BY`"** — secondary indexes in NoSQL are limited; export to a warehouse (BigQuery/Snowflake) for analytics.
- **"Strong consistency on every read by default"** — most NoSQL is eventual; explicit quorum reads (R+W>N in Dynamo-style) cost latency, so call that out.
'''

SECTIONS['phase-1-building-blocks/06-message-queues'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Decouple the producer from a slow / unreliable consumer"** (web request enqueues a job; worker processes asynchronously) — the canonical queue use case.
- **"Background work after a user action"** (send email, transcode video, resize image, run ML inference) — return 202 immediately, do the work later.
- **"Absorb traffic spikes / smooth bursts"** — the queue is a shock absorber between a bursty front end and a steady-rate backend.
- **"Retry with backoff and dead-letter on permanent failure"** — message queues give this for free.
- **"Many workers process at their own pace"** (consumer group, competing consumers) — natural fit.

### Anti-signals (looks like this building block, isn't)

- **"Need a synchronous response with low latency"** — RPC/HTTP, not a queue (queues add at least one round-trip and unbounded latency).
- **"Many consumers each receive every message / replay history"** — that is pub/sub or an event log (Kafka), not a classic work queue where each message is consumed once.
- **"Strict global ordering across millions of partitions"** — most queues only order per-partition / per-FIFO group; a single global ordering is a serious throughput cap.
'''

SECTIONS['phase-1-building-blocks/07-blob-storage-cdn'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Upload, store, and serve photos / videos / audio / PDFs / user files"** — object storage (S3, GCS, Azure Blob) is the default, not a database.
- **"Static assets: JS, CSS, fonts, images"** served to a worldwide audience — origin in S3, edge in CloudFront/Akamai/Cloudflare.
- **"Files are write-once, read-many and don't change after upload"** — exactly the shape blob stores are optimized for.
- **"Geographically distributed users / multi-region read latency must be < 50 ms"** — a CDN with origin in blob storage is the lever.
- **"Signed URLs / time-limited access to private files"** — blob stores natively support presigned URLs; doing this in a DB is awkward.

### Anti-signals (looks like this building block, isn't)

- **"Many small mutations per second to the same record"** (counter, inventory, balance) — blob stores have second-scale eventual consistency on overwrites; use a KV / SQL store.
- **"Need to query / filter / aggregate inside the files"** — blob storage is opaque per-object; index the metadata in a separate DB.
- **"Per-byte access control with row-level security"** — possible via signed URLs but heavy; structured data with row-level permissions belongs in a database.
'''

SECTIONS['phase-1-building-blocks/08-api-design'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Design the API / sketch the endpoints for X"** — the interviewer is explicitly asking for the contract.
- **"Public-facing API with third-party integrations / SDKs"** — versioning, deprecation, and idempotency keys become first-class concerns.
- **"Mobile and web clients talking to the same backend"** — REST/GraphQL design choices (over-fetching, batching, pagination) directly affect mobile bandwidth.
- **"Strict typing / generated clients across multiple services"** — gRPC + protobuf or OpenAPI-generated SDKs.
- **"Real-time bidirectional updates / chat / live cursor"** — WebSocket / Server-Sent Events, not REST.

### Anti-signals (looks like this building block, isn't)

- **"Internal service-to-service RPC behind a service mesh"** — REST is fine but gRPC is usually faster and more typed; pick consciously.
- **"Fire-and-forget commands with no synchronous response"** — a message queue is the API surface, not REST.
- **"Streaming large file uploads / downloads"** — direct-to-blob (presigned URL) is better than streaming through your API.
'''

SECTIONS['phase-1-building-blocks/09-proxies-gateways'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this building block is the right tool if you see:

- **"Single entry point in front of many backend services / microservices"** — the classic API gateway pattern (Kong, Apigee, AWS API Gateway).
- **"Authenticate and authorize every request at the edge"** — JWT / OAuth validation centralized at the gateway, not duplicated per service.
- **"Per-client rate limiting / quotas / API keys"** — gateways are the natural enforcement point.
- **"Request / response transformation, header injection, CORS"** — gateway responsibility, not service code.
- **"Centralized observability: logging, tracing, metrics for every call"** — sidecar / gateway pattern shines.

### Anti-signals (looks like this building block, isn't)

- **"Distribute traffic across N replicas of a single service"** — that is a load balancer; gateways are overkill and add a hop.
- **"Service-to-service east-west traffic with mTLS and retries"** — that is a service mesh (Istio, Linkerd), which is sibling-of, not same-as, an API gateway.
- **"Serve static images / videos / JS at the edge"** — CDN, not API gateway.
'''

# ============================================================================
# Phase 2: Distributed Concepts
# ============================================================================

SECTIONS['phase-2-distributed-concepts/01-scalability'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right framing if you see:

- **"Handle 10× / 100× more users / 1 M → 100 M DAU"** — the prompt explicitly grows scale, forcing horizontal-scale discussion.
- **"Read QPS exceeds what one DB can serve"** — replicas, caching, CQRS, fan-out cache become required vocabulary.
- **"Write QPS exceeds what one DB can serve"** — sharding, partitioning, async writes via queue become required vocabulary.
- **"Multi-region / global users / serve users on every continent with < 200 ms latency"** — geo-replication, edge caching, regional partitioning.
- **"Auto-scale up and down with daily traffic patterns"** — stateless services, queue-based decoupling, and horizontal pod autoscaling.

### Anti-signals (looks like this topic, isn't)

- **"Internal admin dashboard for 50 employees"** — vertical scaling and a single DB are fine; don't show off horizontal complexity you don't need.
- **"Latency-bound single-request workload"** (e.g., a complex DB query for one user) — that is query optimization or caching, not horizontal scaling.
- **"One-time batch job over a fixed dataset"** — Spark / MapReduce sizing is the concern, not online scalability.
'''

SECTIONS['phase-2-distributed-concepts/02-partitioning-sharding'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right tool if you see:

- **"Writes exceed what one database can absorb"** (millions of writes/sec, multi-TB working set) — sharding is the answer; replication does not scale writes.
- **"Per-user / per-tenant data with a natural shard key"** (user_id, tenant_id, conversation_id) — clean partitioning by that key avoids cross-shard joins.
- **"Add and remove nodes with minimum data movement"** — consistent hashing with virtual nodes.
- **"Time-series data with rolling windows / TTL"** — range-shard by time so old shards can be dropped wholesale.
- **"Hot key suspicion"** (celebrity, trending item, single tenant dominates traffic) — call out hot-key mitigation (split, replicate, route).

### Anti-signals (looks like this topic, isn't)

- **"Read-heavy, write-light single DB at 80% capacity"** — read replicas first; sharding is operationally heavy and premature.
- **"Need cross-shard transactions on most writes"** — sharding makes transactions painful; either reshape the schema, denormalize, or use a globally consistent DB (Spanner).
- **"Dataset is < 100 GB and fits in RAM on one node"** — sharding adds complexity with no payoff; vertical scale or read replicas.
'''

SECTIONS['phase-2-distributed-concepts/03-replication'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right tool if you see:

- **"High availability / no single point of failure / 99.99% uptime"** — at minimum, primary + standby; usually primary + multiple async replicas.
- **"Read-heavy workload with stale-read tolerance"** — read replicas peel read traffic off the primary.
- **"Disaster recovery with RPO ≤ 5 minutes, RTO ≤ 15 minutes"** — synchronous or near-synchronous cross-region replication is needed.
- **"Geo-distributed reads with low latency"** — regional read replicas serve reads close to the user; writes still go to the leader.
- **"Failover to standby on primary outage"** — replication is the substrate; the conversation is about leader election and how stale the standby is.

### Anti-signals (looks like this topic, isn't)

- **"Scale write throughput"** — replication amplifies writes (every write goes to every replica). Sharding is the answer.
- **"Need read-your-writes from any replica with no session pinning"** — async replicas can lag; without sync replication or sticky sessions, this fails.
- **"Tiny dataset, single-region, internal tool"** — replication is operational overhead; daily backups may be enough.
'''

SECTIONS['phase-2-distributed-concepts/04-consistency-models'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic deserves explicit discussion if you see:

- **The interviewer literally asks "strong or eventual consistency here?"** — you must name a model (linearizable, sequential, causal, eventual) and justify.
- **"Financial / inventory / counter must never be negative or double-counted"** — strong / linearizable on that path.
- **"User must see their own post immediately after creating it"** — read-your-writes consistency (often via session pinning to the leader).
- **"Multi-region active-active writes"** — CAP forces a choice; explain conflict resolution (LWW, CRDTs, vector clocks).
- **"Two users editing the same document concurrently"** — operational transform / CRDT, not a single consistency keyword.

### Anti-signals (looks like this topic, isn't)

- **"Stateless service, no persistence on this node"** — consistency model applies to the data store it talks to, not the service itself.
- **"Single-leader DB with no replication"** — strongly consistent by default; don't belabor consistency unless replication is introduced.
- **"User-perceived freshness within seconds is fine, and the data is read by one user at a time"** — eventual consistency is fine; stop at "we accept N-second staleness".
'''

SECTIONS['phase-2-distributed-concepts/05-rate-limiting'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right tool if you see:

- **"Protect the API from abuse / brute-force / scraping"** — per-IP or per-API-key rate limiting at the gateway.
- **"Free vs paid tiers with different request quotas"** — token-bucket or leaky-bucket per API key.
- **"Login / signup / password-reset endpoint flood"** — short, strict limits with exponential backoff.
- **"Prevent a misbehaving client from taking down the service"** — fairness limits per tenant.
- **"Public SMS / email sending endpoint with cost per request"** — quota enforcement is mandatory before the third-party bill explodes.

### Anti-signals (looks like this topic, isn't)

- **"Smooth out a traffic spike to a slow downstream service"** — a queue/buffer is the right tool; rate limiting *rejects* excess, queueing *delays* it.
- **"Internal RPC between trusted microservices with predictable load"** — concurrency limits / circuit breakers usually suffice; per-call rate limiting is overkill.
- **"Coalesce repeated writes to the same key"** — that is batching or write coalescing, not rate limiting.
'''

SECTIONS['phase-2-distributed-concepts/06-unique-id-generation'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic deserves explicit design if you see:

- **"Globally unique IDs across many shards / regions / services"** — UUIDv4, Snowflake, or KGS depending on shape.
- **"Short, URL-safe ID"** (URL shortener, paste ID, invite code) — base62-encoded counter or hash-based scheme.
- **"Roughly time-ordered IDs so we can paginate by ID"** — Snowflake-style (timestamp + machine + sequence) gives k-sorted order.
- **"Distributed system with no central ID coordinator"** — Snowflake or UUIDv7 per node.
- **"IDs are also the shard key, so they must distribute uniformly"** — hash-based IDs or random suffixes.

### Anti-signals (looks like this topic, isn't)

- **"Single SQL database"** — `BIGINT AUTO_INCREMENT` / `SERIAL` is fine; don't reach for Snowflake to look fancy.
- **"Need an unguessable security token / share link"** — `crypto.randomBytes` UUIDv4 is correct; Snowflake leaks creation time and machine ID.
- **"Need strict total ordering across the whole system"** — Snowflake gives only k-sorted-by-second; strict total order requires a coordinator or a single sequence service.
'''

SECTIONS['phase-2-distributed-concepts/07-distributed-consensus'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right tool if you see:

- **"Elect a leader / primary out of N replicas"** — Raft or Paxos under the hood, typically delegated to ZooKeeper / etcd / Consul.
- **"Replicated state machine / config store / service discovery"** — etcd, ZooKeeper, Consul are the canonical answers.
- **"Distributed lock or lease"** (one worker may execute the cron, exclusive write to a key) — backed by a consensus store.
- **"Atomic commit across multiple nodes"** — two-phase commit (and its problems) or consensus-backed transactions.
- **"Linearizable register / counter across a cluster"** — consensus is the only general answer.

### Anti-signals (looks like this topic, isn't)

- **"Just need an HA load balancer"** — managed LBs handle their own failover; don't claim you'd implement Paxos.
- **"Eventual agreement on a value is fine"** — gossip / CRDTs / anti-entropy are far cheaper than consensus.
- **"High-throughput logging or analytics"** — consensus protocols cap at low-thousands of ops/sec per group; use Kafka or a sharded store and avoid consensus on the hot path.
'''

# ============================================================================
# Phase 3: Architecture Patterns (skipping 08-answer-template — it is a meta template)
# ============================================================================

SECTIONS['phase-3-design-patterns/01-fan-out'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"News feed / timeline / activity stream / home page personalized per user"** — Twitter, Instagram, Facebook, LinkedIn all use fan-out.
- **"One write triggers updates to many subscribers / followers"** — the literal definition of fan-out.
- **"Notification system / push notifications to N devices"** — fan-out on write to per-device queues.
- **"Mix of normal users and celebrities (one user → millions of followers)"** — hybrid fan-out (push for normal, pull for celebrities) is the right answer.
- **"Read latency must be < 100 ms on a personalized feed"** — pre-computed fan-out beats live merge at read time.

### Anti-signals (looks like this pattern, isn't)

- **"One-to-one chat / direct message"** — message routing to one recipient, not fan-out to followers.
- **"Global leaderboard or trending list (same for everyone)"** — a single computed view served from cache, not per-user fan-out.
- **"Small N followers, simple merge at read time is fast enough"** — fan-out adds write amplification you don't need; pull-on-read is fine until N grows.
'''

SECTIONS['phase-3-design-patterns/02-event-sourcing-cqrs'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"Full audit log of every state change / regulatory replay"** (banking, healthcare, trading) — events are the source of truth.
- **"Time-travel: replay the system as of an arbitrary past timestamp"** — only possible if events are the persistent record.
- **"Many different read views derived from the same writes"** (search index + cache + analytics + dashboard) — CQRS separates writes from each read model.
- **"Complex domain with rich invariants"** (DDD, aggregates, e-commerce, insurance) — append-only event streams preserve intent.
- **"Cross-service workflows that must be replayable for debugging"** — event log doubles as a debug timeline.

### Anti-signals (looks like this pattern, isn't)

- **"Simple CRUD app with two read patterns"** — CRUD + an index is enough; event sourcing is operational complexity you'll regret.
- **"User must read what they just wrote immediately"** — projections are eventually consistent; read-your-writes needs special handling.
- **"Small team unfamiliar with event-driven systems"** — the learning curve and debugging cost are real; pick boring CRUD until pain forces the switch.
'''

SECTIONS['phase-3-design-patterns/03-pub-sub'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"One producer, many independent consumers, each does something different"** (order placed → email + warehouse + analytics + fraud) — pub/sub by topic.
- **"Decouple microservices: producer doesn't know who consumes"** — the consumer set can grow without redeploying the producer.
- **"Real-time updates broadcast to all interested subscribers"** (price ticks, sensor readings, chat presence) — fan-out via topic.
- **"Topic-based or pattern-based filtering"** (`orders.us.>` in NATS, MQTT wildcards) — subscriptions express interest declaratively.
- **"Event-driven SaaS / multi-tenant event delivery"** — each tenant subscribes to its own subset.

### Anti-signals (looks like this pattern, isn't)

- **"Request / reply with a synchronous response"** — RPC, not pub/sub (pub/sub is fire-and-forget by design).
- **"One consumer per message, each message processed exactly once"** — that is a work queue (SQS, RabbitMQ default), not pub/sub fan-out.
- **"Strict global ordering across all topics"** — most pub/sub systems order only per partition / per topic; global order is a serious throughput cap.
'''

SECTIONS['phase-3-design-patterns/04-circuit-breaker-retry'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"Service A depends on service B; if B slows down, A must not pile up requests"** — the textbook circuit breaker.
- **"Avoid cascading failures across microservices"** — Hystrix / resilience4j / service-mesh retries with budgets.
- **"Transient network blips should be retried, permanent errors should fail fast"** — retry-with-backoff + circuit breaker together.
- **"Third-party dependency with unpredictable latency"** (payment gateway, geocoding API) — wrap calls in a breaker.
- **"Bulkhead isolation between tenants / call types"** so a slow tenant cannot starve others — bulkhead pattern alongside breakers.

### Anti-signals (looks like this pattern, isn't)

- **"Monolith with no cross-process calls"** — circuit breakers are about cross-process resilience; for in-process calls, just use a timeout.
- **"Failure is permanent (4xx auth error, validation failure)"** — retries waste time; fail fast and surface the error.
- **"Idempotency is not guaranteed and the call has side effects"** — retries without idempotency keys cause duplicate charges, double sends, etc.; add idempotency before adding retries.
'''

SECTIONS['phase-3-design-patterns/05-saga-pattern'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"Multi-step business transaction across services"** (order → reserve inventory → charge payment → notify shipping) — saga sequences the steps.
- **"Each service owns its own DB / no distributed transaction available"** — XA / 2PC is off the table; compensation is your atomicity story.
- **"Need to undo earlier steps if a later step fails"** (refund payment if shipping cannot allocate) — compensating actions are saga's core.
- **"Long-running workflow with human approvals / delays"** (loan application, KYC) — orchestration sagas (Temporal, Camunda, Step Functions).
- **"Microservices, each with its own database, doing one logical operation"** — choreographed sagas via events, or orchestrated sagas via a workflow engine.

### Anti-signals (looks like this pattern, isn't)

- **"Single DB / single service"** — a local ACID transaction is simpler, faster, and correct; saga is overkill.
- **"All steps inside one trusted service"** — transactional outbox + retries is enough; you don't need compensations.
- **"Strict atomicity required across services"** — saga is eventually atomic. If you must roll back as if nothing happened, redesign the boundary or use a globally consistent DB.
'''

SECTIONS['phase-3-design-patterns/06-sharding-strategies'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"Choose how to partition this dataset"** (and the interviewer is fishing for a *strategy*, not just "shard it") — name range, hash, directory, consistent hashing.
- **"Avoid hot keys / hot shards"** — consistent hashing with virtual nodes; or key salting; or split-and-replicate the hot key.
- **"Add or remove nodes with minimum reshuffling"** — consistent hashing is the textbook answer.
- **"Multi-tenant SaaS: one tenant per shard, or pool small tenants"** — directory-based or hybrid sharding.
- **"Time-series: drop old data wholesale"** — range sharding by time enables cheap retention.

### Anti-signals (looks like this pattern, isn't)

- **"Tiny dataset, no growth expected"** — picking a sharding strategy is premature; revisit when growth is real.
- **"Cross-shard joins on every query"** — denormalize, change the shard key, or rethink the access pattern; sharding strategy alone won't save you.
- **"Single-region MVP with one DB"** — pick the shard key on paper but defer implementation; pre-sharding is a frequent over-engineering trap.
'''

SECTIONS['phase-3-design-patterns/07-cache-patterns'] = '''
---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern deserves explicit discussion if you see:

- **"Pick a caching strategy: cache-aside / write-through / write-behind / write-around"** — the interviewer wants a named pattern and a justification.
- **"Cache stampede / thundering herd when a hot key expires"** — single-flight lock, probabilistic early expiration, or stale-while-revalidate.
- **"Hot key overwhelms a single cache node"** — replicate the key across nodes or split the key with a random suffix.
- **"Multi-tier cache: in-process L1, Redis L2, DB origin"** — pattern is about consistency and invalidation across tiers.
- **"Invalidation: when does cached data become stale, and who tells the cache?"** — TTL, explicit invalidation, or event-driven invalidation each have a place.

### Anti-signals (looks like this pattern, isn't)

- **"Write-only workload (logs, telemetry, raw events)"** — there is nothing to cache; caching layers add no value.
- **"Each request is unique"** (per-user reports with one-off parameters) — cache hit rate near zero; cache the *building blocks* instead.
- **"Every read must be strongly consistent"** — caching introduces a stale window by definition; either skip the cache or use write-through with single-writer guarantees.
'''


def truncate_existing_appended(content: str) -> str:
    """Remove a previously appended signals section, leaving the original body."""
    marker = 'First-time Recognition Signals'
    idx = content.find(marker)
    if idx == -1:
        return content
    pre = content[:idx].rstrip()
    pre = re.sub(r'\n---\s*\n?##?\s*$', '', pre)
    pre = re.sub(r'\n---\s*$', '', pre)
    return pre.rstrip() + '\n'


def main():
    report = {}
    missing = []

    for key, section in SECTIONS.items():
        path = os.path.join(BASE, *key.split('/'), 'README.md')
        if not os.path.exists(path):
            print(f'MISSING: {path}')
            missing.append(key)
            continue
        with open(path, 'rb') as f:
            raw = f.read()
        has_bom = raw.startswith(b'\xef\xbb\xbf')
        text = raw.decode('utf-8-sig')
        if not text.strip():
            print(f'EMPTY: {path}')
            missing.append(key)
            continue
        cleaned = truncate_existing_appended(text)
        new_text = cleaned.rstrip() + '\n' + section.rstrip() + '\n'
        out_bytes = (b'\xef\xbb\xbf' if has_bom else b'') + new_text.encode('utf-8')
        with open(path, 'wb') as f:
            f.write(out_bytes)
        report[key] = 'updated'
        print(f'UPDATED: {key}')

    print()
    print(f'Total updated: {len(report)}')
    if missing:
        print('MISSING/EMPTY:')
        for m in missing:
            print(f'  - {m}')


if __name__ == '__main__':
    main()
