# Phase 1-3 — First-time Recognition Signals: Audit Report

All 23 module READMEs across `phase-1-building-blocks/`, `phase-2-distributed-concepts/`,
and `phase-3-design-patterns/` were appended with a new H2 section,
`## First-time Recognition Signals`, containing 5 problem-statement-level signals followed
by a `### Anti-signals (looks like this pattern, isn't)` subsection with 3 lookalike-but-
actually-not bullets. The signals are phrased from the perspective of a learner reading
a fresh interview prompt (e.g. *"Geographically distributed users / route each user to the
nearest data center"*, *"Read QPS exceeds what one DB can serve"*, *"Multi-step business
transaction across services"*) rather than from the implementation side, and they
intentionally go beyond the existing `Why This Matters` and `When to Use` sections by
naming the *exact phrasing* in the prompt that points at the component.

The module `phase-3-design-patterns/08-answer-template` was deliberately skipped — it is
a meta template (the 45-minute answer framework), not a pattern that maps to prompt
signals. The other 23 modules covered, with their headline-signals:

## Phase 1 — Building Blocks (9 modules)

- **01 DNS & Networking** — geo-distributed users, regional failover, custom domains,
  gradual traffic migration, anycast/DDoS; anti: sub-second failover (use LB), per-request
  routing (LB), authentication (gateway).
- **02 Load Balancing** — horizontal scale, health checks, sticky sessions, TLS offload,
  path-based routing; anti: cross-region routing (GeoDNS), queue consumer scaling, A/B
  experiments (feature flag).
- **03 Caching** — read-heavy 10:1, p99 < 100 ms, hot/trending keys, stale-by-N tolerated,
  repeated expensive computation; anti: strong consistency, write-heavy unique data, PII
  in shared memory.
- **04 Databases — SQL** — ACID transactions, complex joins, ad-hoc reporting, strong
  consistency, stable schema; anti: schemaless documents, millions of writes/sec, deep
  graph traversal.
- **05 Databases — NoSQL** — petabyte scale, single-key lookups, evolving schema, write-
  heavy + eventual, time-series with TTL; anti: multi-row ACID, ad-hoc analytics, default
  strong consistency.
- **06 Message Queues** — decouple producer/consumer, async background work, absorb
  spikes, retry-with-backoff, competing consumers; anti: sync low-latency response, every-
  consumer-gets-every-message, strict global ordering.
- **07 Blob Storage & CDN** — photos/videos/files, static assets, write-once read-many,
  geo-low-latency, signed URLs; anti: many small mutations, query inside files, per-byte
  RLS.
- **08 API Design** — explicit "design the API", public SDKs, mobile + web clients, typed
  contracts, real-time bidirectional; anti: internal mesh RPC (gRPC), fire-and-forget
  commands (queue), large file streaming (presigned URL).
- **09 Proxies & Gateways** — single entry point, edge auth, per-client rate limit,
  request transformation, centralized observability; anti: distribute across replicas
  (LB), east-west mTLS (service mesh), static delivery (CDN).

## Phase 2 — Distributed Concepts (7 modules)

- **01 Scalability** — 10×/100× user growth, read/write QPS beyond single DB, multi-
  region, daily autoscale; anti: internal admin tools (vertical scale), single-request
  latency, batch jobs.
- **02 Partitioning & Sharding** — writes exceed single DB, per-user/tenant shard key,
  add/remove nodes cheaply, time-series rolling, hot-key risk; anti: read-heavy + light
  writes (replicas), cross-shard transactions, < 100 GB dataset.
- **03 Replication** — 99.99% HA, read-heavy with stale tolerance, RPO/RTO targets, geo
  reads, primary failover; anti: scale writes, read-your-writes from any replica without
  pinning, internal single-region tool.
- **04 Consistency Models** — explicit "strong or eventual?", financial/inventory never
  negative, read-your-writes, multi-region active-active, concurrent edits; anti:
  stateless service, single-leader no replication, N-second staleness fine.
- **05 Rate Limiting** — API abuse/brute force, paid-tier quotas, login flood, prevent
  noisy neighbour, cost-per-request endpoints; anti: smooth spike to slow backend (queue),
  trusted internal RPC, write coalescing.
- **06 Unique ID Generation** — globally unique across shards/regions, short URL-safe IDs,
  time-ordered for pagination, no central coordinator, ID-as-shard-key; anti: single SQL
  DB (SERIAL), unguessable security token (UUIDv4), strict total ordering.
- **07 Distributed Consensus** — leader election, replicated state machine / config store,
  distributed lock/lease, atomic multi-node commit, linearizable register; anti: managed
  LB failover, eventual agreement (gossip/CRDT), high-throughput logging.

## Phase 3 — Architecture Patterns (7 of 8 modules; 08-answer-template skipped)

- **01 Fan-out** — news feed/timeline, one write → many subscribers, notifications,
  mixed-celebrity-and-normal followers, sub-100ms personalized feed; anti: 1:1 chat,
  global leaderboard, small N (pull on read is fine).
- **02 Event Sourcing & CQRS** — full audit log, time-travel replay, many derived read
  views, complex DDD domain, replayable cross-service workflows; anti: simple CRUD,
  read-your-writes immediacy, small team unfamiliar with event-driven systems.
- **03 Pub/Sub** — one producer / many independent consumers, decoupled microservices,
  real-time broadcast, topic/pattern filtering, multi-tenant event delivery; anti:
  sync request/reply (RPC), one-consumer-per-message (work queue), strict global
  ordering.
- **04 Circuit Breaker & Retry** — A depends on B and B may slow, prevent cascading
  failure, retry transient + fail fast permanent, third-party with unpredictable
  latency, bulkhead per tenant; anti: monolith no cross-process calls, permanent 4xx
  errors, non-idempotent calls without keys.
- **05 Saga Pattern** — multi-step transaction across services, each service owns its
  DB (no XA), need to undo earlier steps on failure, long-running workflow with human
  approvals, microservices per logical operation; anti: single DB / single service,
  all-in-one trusted service (transactional outbox is enough), strict ACID across
  services.
- **06 Sharding Strategies** — "choose how to partition" framing, hot-key avoidance,
  cheap add/remove of nodes, multi-tenant SaaS, time-series wholesale-drop retention;
  anti: tiny dataset / no growth, cross-shard joins on every query, single-region MVP.
- **07 Cache Patterns** — name cache-aside / write-through / write-behind / write-around,
  cache stampede on hot-key expiry, hot key on single node, multi-tier L1/L2/L3, who
  invalidates and when; anti: write-only workload, unique-per-request data, strict
  consistency on every read.

## Tricky cases I had to think about most

(a) The **Phase 1 / Phase 2 / Phase 3 sharding frontier** — caching shows up as a building
block (Phase 1 `03-caching`), as a distributed concept (Phase 2 `02-partitioning-sharding`
overlaps when caches are sharded), and as a pattern (Phase 3 `07-cache-patterns`). The
anti-signal lists for `03-caching` (building block) and `07-cache-patterns` (named
strategy choice) cross-reference each other on "Cache-aside / write-through / write-
behind / write-around — pick one and justify": the building-block README treats caching
as the *decision to add a cache layer at all*, while the pattern README treats it as
*which named strategy you commit to*.

(b) **Phase 3 fan-out vs Phase 3 pub/sub** — both spread a single event to many
recipients. The fan-out anti-signals explicitly point at pub/sub for "multiple
independent downstream services do different things with one event"; pub/sub's anti-
signals point back at fan-out for "personalized per-user precomputed view". The
discriminator promoted to a signal is *personalized destination state* (fan-out) vs
*homogeneous broadcast* (pub/sub).

(c) **Phase 1 message queues vs Phase 3 pub/sub** — both look async. The message-queue
README's anti-signals call out "every consumer receives every message → that is pub/sub
or event log, not a queue". This was the single most likely confusion for a beginner.

(d) **Sharding everywhere** — sharding appears in Phase 2 (`02-partitioning-sharding`,
the *what and why*) and Phase 3 (`06-sharding-strategies`, the *which named strategy*).
The Phase 2 signals focus on "do you need sharding at all?"; the Phase 3 signals focus on
"the interviewer is asking for a *strategy*". Anti-signals on both pages warn against
the same trap (cross-shard joins / premature sharding) but are framed from different
angles.

(e) **Phase 2 consistency models vs Phase 1 SQL/NoSQL** — both inevitably mention
consistency. The Phase 2 module's signals require the interviewer to *literally ask*
about consistency, or to introduce financial/inventory/concurrent-edit prompts that
force the choice. The Phase 1 DB modules call out consistency only as a default
property of the chosen store, avoiding duplication.

## Consistency pass

Spot-checked modules `phase-1-building-blocks/03-caching`, `phase-2-distributed-concepts/
02-partitioning-sharding`, `phase-3-design-patterns/01-fan-out`, and `phase-3-design-
patterns/05-saga-pattern` post-write — all share identical structure: a `---` separator
line, `## First-time Recognition Signals` heading, intro line ("When you read a brand-new
system design prompt..."), 5 bullets, `### Anti-signals (looks like this pattern, isn't)`
subsection, 3 bullets. Each bullet uses a **bold phrase quoted in the problem statement's
voice**, an em-dash separator, and a short reason. All 23 files end with a single
trailing newline, are encoded as UTF-8 (BOM preserved when present in the source),
and the existing module bodies (including embedded Mermaid diagrams, tables, and
interview-tip callouts) were preserved verbatim. Re-running the script is idempotent —
`truncate_existing_appended` strips a previously-appended signals section before re-
appending, so iterative copy edits do not produce duplicates.

The module **`phase-3-design-patterns/08-answer-template`** was intentionally skipped
because it is a meta template for structuring a 45-minute answer, not a pattern that
maps to recognition signals. If a future revamp wants to add "Template Trigger Signals"
(prompts where the template should be loaded), it should be a separately scoped pass.
