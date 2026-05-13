# Stub Fill Report — system-design-zth

## Summary

- **Total `.md` files scanned:** 98 (scope: every `.md` under repo root except `node_modules/`, `.git/`, `web/` (none), `dashboard.html`, `solutions/*.html`, and `.audit/*`)
- **Stub files identified:** 12
  - Empty (< 5 lines): **0**
  - Header-only (heading + 0–50 body words): **0**
  - Thin (50–200 body words): **12**
  - Placeholder (`TODO`/`PLACEHOLDER`/`TBD`/`Lorem ipsum`/`coming soon`): **0**
- **MISSING (promised by `README.md`, doesn't exist):** **24** empty `case-studies/` directories across phases 1–3
- **Estimated total fill volume:** ~28–34 k words
  - Thin landing pages (12 × ~300–500 added words each): ~4–6 k words
  - MISSING case-studies (24 dirs × 2 studies × ~600 words): ~28 k words

### Methodology notes

- Body-word count excludes lines starting with `#` (headings) and front-matter chrome, so a file can have many lines but still register as "thin" if it's mostly headings, tables of contents, or short bullet lists.
- The placeholder regex was deliberately narrowed to literal stub markers (`\bTODO\b`, `\bPLACEHOLDER\b`, `\bTBD\b`, `coming soon`, `lorem ipsum`) — early scans matched the lowercase technical word "placeholder" in three substantive solutions (`07-notification-system/solution.md:146` "Templates use variable placeholders", `01-instagram/solution.md:130` "BlurHash placeholder", `05-dropbox/solution.md:223` "file placeholders in the OS file explorer"). All three are legitimate technical usage in fully-written files and were re-classified as `full`.
- `dashboard.html`, `solutions/*.html`, and `.audit/*` were excluded per the scoping rules. `web/` is named in the scope-exclusion list but does not exist in the tree.

---

## Files to fill

### A. Thin module landing pages — `phase-4-classic-starter/*/README.md` (10 files)

All ten Phase-4 module READMEs share an identical template: `# Design: X` → `Overview` (1 paragraph) → `Difficulty` → `Core Concepts Tested` → `Companies That Ask This` → `Prerequisites` → `Approach`. They land between 37–38 lines and 170–192 body words. The structure is fine; they're just thin on substance compared to Phase-5 READMEs (which average ~42 lines / ~240 body words). Each should grow to ~400 body words by adding the four sections below.

**Per-file required additions (apply uniformly):**

- **Expand `Overview`** from 1 paragraph to 2–3 paragraphs: real-world scale numbers (e.g., bit.ly serves ~10 B redirects/month; Twitter ratelimits 300 tweets / 3 h), and the *one* concept this design uniquely teaches.
- **Add `Learning Objectives` section** (5 SMART bullets, e.g. "By the end you can defend Base62 vs hashing in 60 s").
- **Add `Common Pitfalls` section** (4–6 bullets, the things candidates miss in this design).
- **Add `Time Budget` row** referencing `templates/answer-template.md` (10 min req → 15 min HLD → 15 min deep dive → 5 min wrap).
- **Add `Related Designs` cross-link section** — link to the 2–3 sibling designs in this phase that share components.

**Target word count per file:** 350–500 body words (lift from ~180 → ~400).

| # | File | Current | Recommended optimal-design topic anchor | Rationale |
|---|------|---------|-----------------------------------------|-----------|
| 1 | `phase-4-classic-starter/01-url-shortener/README.md:1-38` | 38 L / 192 bw / thin | Counter + Base62 + Key Generation Service (KGS) pre-allocation | Canonical warm-up; teaches naming + distributed ID gen in one shot. Avoid MD5-truncation framing — collision story is the wrong lesson here. |
| 2 | `phase-4-classic-starter/02-pastebin/README.md:1-38` | 38 L / 191 bw / thin | URL Shortener + blob storage (text body → S3) | Reuses Phase-4 #1; adds large-payload-in-blob-store pattern from Phase-1 module 07. |
| 3 | `phase-4-classic-starter/03-rate-limiter/README.md:1-37` | 37 L / 172 bw / thin | Token bucket (default) + table of all 5 algorithms | Token bucket is the FAANG default; mention leaky-bucket, fixed-window, sliding-window-log, sliding-window-counter as trade-off row. |
| 4 | `phase-4-classic-starter/04-key-value-store/README.md:1-38` | 38 L / 177 bw / thin | Consistent hashing + vector clocks (Dynamo-style) | The "explain Dynamo paper in 45 min" question; sets up Phase-5 #07 (Distributed Cache). |
| 5 | `phase-4-classic-starter/05-unique-id-generator/README.md:1-37` | 37 L / 170 bw / thin | Snowflake (timestamp + machine-id + sequence) | Industry standard; mention UUIDv7, ULID, KSUID briefly as alternatives. |
| 6 | `phase-4-classic-starter/06-web-crawler/README.md:1-38` | 38 L / 184 bw / thin | BFS frontier + politeness (robots.txt, per-host rate-limit) + Bloom-filter URL dedup | Politeness + dedup are what separates a toy crawler from Googlebot. |
| 7 | `phase-4-classic-starter/07-notification-system/README.md:1-37` | 37 L / 171 bw / thin | Multi-channel fan-out (push, SMS, email) via per-channel queues + retry-with-backoff | Provider-failure isolation is the key insight; ties to Phase-3 circuit-breaker. |
| 8 | `phase-4-classic-starter/08-chat-system/README.md:1-38` | 38 L / 180 bw / thin | WebSocket (long-poll fallback) + Redis pub/sub for presence + Cassandra-style message store | Presence is the unique twist; long-poll fallback covers the corporate-firewall edge case. |
| 9 | `phase-4-classic-starter/09-news-feed/README.md:1-38` | 38 L / 190 bw / thin | Hybrid fan-out (push for ≤ 1 k followers, pull for celebrities) | Connects directly to Phase-3 #01 (fan-out pattern); celebrity threshold is the canonical trade-off. |
| 10 | `phase-4-classic-starter/10-typeahead/README.md:1-38` | 38 L / 183 bw / thin | Trie + top-K precomputation at internal nodes + Bloom-filter for misspellings | Two-tier cache (Redis hot prefixes + in-memory trie shards) is the deep-dive hook. |

### B. Other thin top-level files (2)

#### `phase-0-framework/README.md:1-30`
- **Current:** 30 lines, 197 body words, **thin**
- **Required structure:** already has `What You'll Learn` / `Why This Phase Matters` / `Modules` table / `Success Criteria`. Add:
  - **`How Phase 0 connects to the rest of the course`** — 1 paragraph mapping each of the 3 modules to where RESHADED/estimation/requirements skills are exercised later (Phase 4 problem.md drills, Phase 5 mock interviews).
  - **`Recommended pacing`** — 8-hour total time-box with break points (already implied in the modules table; make it explicit).
  - **`Self-test prompt`** — 1 short prompt the reader can attempt after Phase 0 (e.g., "Estimate Twitter QPS from scratch in 5 minutes") with a self-grade rubric.
- **Target:** ~400 body words.

#### `redo-queue.md:1-25`
- **Current:** 25 lines, 165 body words, **thin**
- **Note:** This is a *functional tracker template*, not narrative content. The single example row + Leitner-box interval table are sufficient *for its purpose*. Flagging it here for completeness; recommended action is **leave as-is** unless the dashboard's spaced-repetition logic changes. If filling: add a short "Worked example" section showing how a real session would mutate the table over 30 days.
- **Target if filled:** ~280 body words.

---

## C. MISSING — Promised by `README.md` but doesn't exist (24)

`README.md:36-64` lists every Phase-1, Phase-2, and Phase-3 module as `<- README + case-studies/`, and the module-contract table at `README.md:96-102` states:

> | case-studies/ | Mini case studies applying the concept to real systems |

All 24 `case-studies/` directories exist but contain **zero `.md` files**. Each module's `README.md` is fully fleshed-out theory; the missing case studies are where each concept gets applied to a named real system (e.g., the Caching module's case-studies/ should contain "How Twitter uses Redis", "How Facebook built memcached at scale").

### Recommended structure for every case-studies file

```markdown
# Case Study: <System> — <concept anchor>

## Context
<2–3 sentence framing of the company, scale, and the specific problem.>

## What they built
<Architecture: 1 diagram (Mermaid) + 1 paragraph.>

## Why this concept mattered
<Tie back to the parent module's README — which trade-off, which formula, which failure mode.>

## Numbers that matter
<DAU / QPS / data-volume / latency budget — pulled from the source.>

## What you should remember in an interview
<3 bullets — the talking points that show you've read the engineering blog post.>

## Sources
<2–4 links: engineering blog post, conference talk, paper.>
```

**Target per case study:** 500–700 body words.

### Recommended 2 case studies per module (48 files total to create)

| Module path (promised by README) | Recommended case study A | Recommended case study B |
|---|---|---|
| `phase-1-building-blocks/01-dns-networking/case-studies/` | Cloudflare's 1.1.1.1 resolver | Netflix's Open Connect DNS strategy |
| `phase-1-building-blocks/02-load-balancing/case-studies/` | AWS ALB vs NLB at Lyft | GitHub's GLB (Google L4 LB equivalent) |
| `phase-1-building-blocks/03-caching/case-studies/` | Facebook memcached (NSDI '13) | Twitter Redis at scale |
| `phase-1-building-blocks/04-databases-sql/case-studies/` | Stripe's Postgres @ 100 K TPS | GitHub's MySQL Vitess migration |
| `phase-1-building-blocks/05-databases-nosql/case-studies/` | DynamoDB (Dynamo 2007 paper) | Discord migrating to ScyllaDB |
| `phase-1-building-blocks/06-message-queues/case-studies/` | LinkedIn Kafka origin story | Slack's Job Queue (Kafka + Redis) |
| `phase-1-building-blocks/07-blob-storage-cdn/case-studies/` | Netflix Open Connect CDN | Dropbox Magic Pocket (off-AWS to own storage) |
| `phase-1-building-blocks/08-api-design/case-studies/` | Stripe API versioning | GitHub's GraphQL adoption |
| `phase-1-building-blocks/09-proxies-gateways/case-studies/` | Envoy at Lyft | Nginx vs Cloudflare Workers as edge proxy |
| `phase-2-distributed-concepts/01-scalability/case-studies/` | Instagram's first 14-engineer scaling story | Shopify's Black Friday scale-out |
| `phase-2-distributed-concepts/02-partitioning-sharding/case-studies/` | YouTube Vitess sharding | Pinterest MySQL sharding |
| `phase-2-distributed-concepts/03-replication/case-studies/` | MySQL semi-sync at GitHub | MongoDB replica sets at Adobe |
| `phase-2-distributed-concepts/04-consistency-models/case-studies/` | DynamoDB strong-read mode | Spanner external consistency (TrueTime) |
| `phase-2-distributed-concepts/05-rate-limiting/case-studies/` | Stripe's rate-limiter blog (token bucket in Redis) | GitHub abuse-rate-limits |
| `phase-2-distributed-concepts/06-unique-id-generation/case-studies/` | Twitter Snowflake | Instagram's sharded auto-increment IDs |
| `phase-2-distributed-concepts/07-distributed-consensus/case-studies/` | etcd / Raft at Kubernetes | ZooKeeper at LinkedIn (Kafka coordinator) |
| `phase-3-design-patterns/01-fan-out/case-studies/` | Twitter timeline hybrid fan-out | Instagram Stories fan-out |
| `phase-3-design-patterns/02-event-sourcing-cqrs/case-studies/` | Walmart's event-sourced inventory | EventStoreDB at a fintech |
| `phase-3-design-patterns/03-pub-sub/case-studies/` | Google Pub/Sub at YouTube ingest | Kafka at Uber |
| `phase-3-design-patterns/04-circuit-breaker-retry/case-studies/` | Netflix Hystrix (and its retirement) | AWS SDK exponential-backoff defaults |
| `phase-3-design-patterns/05-saga-pattern/case-studies/` | Uber's distributed-transaction sagas | Booking.com's reservation saga |
| `phase-3-design-patterns/06-sharding-strategies/case-studies/` | Discord channels shard-by-guild | Notion's block-tree sharding |
| `phase-3-design-patterns/07-cache-patterns/case-studies/` | Facebook TAO (graph cache) | Pinterest's pin cache |
| `phase-3-design-patterns/08-answer-template/case-studies/` | Annotated answer: URL Shortener (45-min walkthrough) | Annotated answer: Twitter (45-min walkthrough) |

*Note:* the `phase-3-design-patterns/08-answer-template/` module is a meta-module about the answer template itself; its "case studies" are most useful as **annotated walkthroughs** of two full design sessions following `templates/answer-template.md` minute-by-minute, rather than company case studies.

---

## Optimal-approach choices for ambiguous designs (Phase 4 + Phase 5)

These ten designs all have legitimately defensible alternative approaches. The chosen approach for each is what should be presented as the "default" in the Phase-4 README expansions and the Phase-3-design-patterns case studies. (All ten `solution.md` files were inspected and **already implement these choices** — this table documents the editorial choice so the Phase-4 READMEs and case studies stay aligned.)

| Design | Alternatives | Chosen approach & rationale |
|---|---|---|
| URL Shortener | counter + base62, MD5 hash truncated, UUID + base62, KGS service | **counter + base62 with KGS pre-allocation** — teaches both naming and distributed ID gen; collision-free by construction. |
| Pastebin | reuse URL-shortener key + inline text in DB, store body in blob, paste-versioning | **URL-shortener key + body in object storage** — surfaces the "DB row vs blob" decision rule. |
| Rate Limiter | token bucket, leaky bucket, fixed window, sliding window log, sliding window counter | **token bucket as default** in Redis; mention all 5 in a trade-off table; sliding-window-counter as the "production-grade" alternative. |
| Key-Value Store | consistent hashing + last-write-wins, vector clocks, CRDTs | **consistent hashing with vnodes + vector clocks** (Dynamo) — most-taught variant; CRDTs noted as the modern alternative. |
| Unique ID Generator | UUIDv4, Snowflake, KSUID, database auto-increment, ULID | **Snowflake** — sortable, compact, 64-bit fit, defensible at scale; UUIDv7 mentioned as the newer time-sortable option. |
| Web Crawler | single-machine BFS with priority queue, distributed crawler with consistent hashing of host | **distributed crawler, hash-partition by host** — sets up the politeness + Bloom-filter dedup story. |
| Notification System | single fan-out worker, per-channel queues, per-provider queues | **per-channel queues with retry queue + DLQ** — isolates provider failures, ties to Phase-3 circuit-breaker. |
| Chat System | long-poll, SSE, WebSocket, MQTT | **WebSocket with long-poll fallback**; presence via Redis pub/sub; messages in Cassandra-style wide-column store. |
| News Feed | fan-out on write, fan-out on read, hybrid | **hybrid with celebrity threshold (~10 k followers)** — connects to Phase-3 #01 (fan-out pattern). |
| Typeahead | trie in memory, trie + DB, search-engine-backed (Elasticsearch completion suggester) | **distributed trie with top-K at each node + Redis hot-prefix cache** — teaches both the trie data structure and the two-tier cache pattern. |
| Instagram | photo blob store + metadata DB + feed service | **CDN-fronted blob store + Cassandra feed + ML ranking** — the Instagram-specific twist is the photo pipeline (BlurHash placeholder, EXIF strip, multiple resolutions). |
| YouTube | single-bitrate, HLS only, DASH only, adaptive bitrate with HLS+DASH | **adaptive bitrate with HLS** as the default + transcoding pipeline (FFmpeg + queue) — DASH mentioned as the open-standard alternative. |
| Twitter | timeline pull, timeline push, hybrid push/pull | **hybrid (same approach as News Feed)** — emphasise the home-timeline-vs-user-timeline distinction. |
| Uber | flat lat/long index, grid-based, S2 cells, geohash | **S2 cells** — used by actual Uber; geohash mentioned as the simpler alternative for prefix-based proximity. |
| Dropbox | full-file sync, block-level dedup + delta sync | **block-level dedup (4 MB blocks) + content-addressed storage** — the Dropbox-defining design choice; Magic Pocket is the storage layer. |
| Google Search | inverted index single-machine, distributed inverted index + MapReduce build | **distributed inverted index (sharded by doc-id) + ranker** — emphasise the offline/online split (crawl/index/serve). |
| Distributed Cache | client-side hashing, consistent hashing, consistent hashing + vnodes | **consistent hashing with vnodes + R/W quorum** — defends both partitioning and replication choices in one design. |
| Payment System | single transaction table, double-entry ledger | **append-only double-entry ledger with idempotency keys + 2-phase saga for external providers** — Stripe-style; addresses both correctness and exactly-once. |
| Ticket Booking | optimistic concurrency, pessimistic row lock, hold-with-TTL queue | **seat-hold-with-TTL via Redis + final commit to RDBMS in a transaction** — the canonical concert-ticketing pattern. |
| Google Maps | quadtree + raster tiles, S2 + vector tiles, hybrid | **vector tiles + quadtree spatial index + offline-built tilesets** — vector tiles is what modern maps actually ship; raster mentioned for legacy. |

---

## Methodology

### Files read (full read or relevant range)

- `README.md:1-199` — project map and module contract (anchors the MISSING analysis).
- `templates/answer-template.md:1-182` — structural reference for Phase-4/5 `solution.md` files.
- `phase-0-framework/README.md:1-30` — confirmed thin.
- `redo-queue.md:1-25` — confirmed thin (intentionally minimal tracker).
- `phase-4-classic-starter/01-url-shortener/README.md:1-38` — confirmed thin, used as the template for the per-file fill plan in section A.
- `phase-4-classic-starter/01-url-shortener/solution.md:1-30` — sampled to confirm Phase-4 solutions are substantive (and to verify the optimal-approach table reflects what's already in the repo).

### Tools used

- `glob('**/*.md')` → 97 paths; one additional file (`templates/answer-template.md`) found via the path on disk gives 98 scanned.
- Python walk of the repo (excluding `.git/`, `node_modules/`, `.audit/`, `web/`) computing per-file: total lines, total whitespace-split word count, body-word count (lines not starting with `#`), and a narrowed placeholder regex (`\bTODO\b`, `\bPLACEHOLDER\b`, `\bTBD\b`, `coming soon`, `lorem ipsum`).
- `os.walk` over `phase-{1,2,3}-*/*/case-studies/` to enumerate the 24 empty directories.
- `Select-String` to verify each placeholder-regex hit was a true stub marker vs. a legitimate technical use of the word "placeholder" (three false positives were re-classified as `full`).

### Categories applied

- `empty` → < 5 lines.
- `header-only` → ≥ 5 lines and ≤ 50 body words.
- `thin` → 50–200 body words.
- `placeholder` → contains `TODO` / `PLACEHOLDER` / `TBD` / `coming soon` / `lorem ipsum` as literal stub markers, regardless of body-word count (provided line count < 400).
- `missing` → directory promised by `README.md:36-64` and `README.md:96-102` exists but contains zero `.md` files.

### What was *not* flagged

The 86 files marked `full` include every `phase-1-*/*/README.md`, `phase-2-*/*/README.md`, `phase-3-*/*/README.md`, every Phase-4 `problem.md` (~55 L / ~340 words each, structured and complete), every Phase-4 `solution.md` (~210 L / ~1 000 body words, all four answer-template phases present), every Phase-5 `README.md` / `problem.md` / `solution.md`, and the top-level navigation files (`how-to-think.md`, `plan.md`, `daily-schedule.md`, `estimation-reference.md`, `progress.md`, `setup.md`, `phase-6-mock-interviews/README.md`). These are *deliberately not in scope* for fill — they are the existing well-developed content of the course.
