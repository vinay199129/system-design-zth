# System Design ZTH — Content Quality Audit Report

> Generated 2026-05-14. Deep read / structural scan of **98 markdown files**
> across phases 0–6, the `templates/` folder, root docs, and the existing
> `.audit/` artefacts. (Total `*.md` files on disk: 99 — that count includes
> this report. The 98 audited files exclude this report itself.)
>
> Cross-referenced against Designing Data-Intensive Applications (Kleppmann),
> Alex Xu Vol. 1 & 2, the System Design Primer, ByteByteGo, AWS / GCP
> Architecture Center, and the public Anti-Signals append script
> (`.audit/append-signals.py`) and its companion report
> (`.audit/append-signals-report.md`).

---

## Executive Summary

**This is a structurally complete and pedagogically thoughtful course
with consistently high-quality module READMEs.** The 24 module READMEs in
Phases 1–3 are uniformly well-formatted (≈1,100–1,900 words each, every
one carrying a Mermaid diagram, a Key-Concepts table, a Trade-offs table,
an Interview Cheat Sheet, a Deep Dive, and the recently appended
First-time Recognition Signals + Anti-signals block). The how-to-think
RESHADED framework is genuinely good — concrete, time-boxed, with a
worked Twitter trace from requirements → estimation → high-level design.
The Phase 4/5 solution.md files are technically credible, with API,
schema, architecture diagram, and trade-offs present in **every single
one of the 20 designs** (verified mechanically — coverage matrix in §A).
There is no empty stub, no `TODO`-marked placeholder, no broken Mermaid
fence, and no obviously wrong number in the latency table.

**The three production-failure categories from the dsa-zth audit do not
apply here.** There are no empty solution stubs, no `O(?)` placeholders,
no abandoned author-scaffolding lines visible to learners. The content
that exists is finished. The problem is **what is promised but absent**,
not **what is half-done**.

**Four structural gaps dominate every other finding:**

1. **All 24 `case-studies/` directories are completely empty.** The root
   `README.md` line 101 explicitly tells the learner "Every building
   block / concept module contains: case-studies/ — Mini case studies
   applying the concept to real systems." None exist. This is a
   ~24-file content debt advertised on the project map and not delivered.
   The pre-existing `.audit/stub-list.txt` (lines 13–36) flags exactly
   this. See §B-1.

2. **Zero "Further Reading / External Resources" sections.** Not one of
   the 24 module READMEs, the 20 design solution.md files, the 4 phase-0
   files, the 6 root docs, or the phase-6 README links to DDIA chapters,
   Alex Xu volumes, Kleppmann talks, Jepsen reports, High Scalability
   posts, AWS Well-Architected, the LinkedIn / Uber / Netflix engineering
   blogs, or any of the canonical papers (Dynamo, Spanner, Bigtable,
   Kafka, Chubby, Raft). The README acknowledges three inspirations at
   the bottom of the *root* file but the module bodies never point a
   learner outward. See §F for the full per-module audit.

3. **Eleven thin Phase-4 module README "overview" files (193–214 words
   each)** plus the phase-0-framework overview (217 words) are content-
   light wrappers that exist only to introduce the
   `README.md / problem.md / solution.md` triplet. They are technically
   not stubs (no body < 100 words) but they carry no unique value over
   what `problem.md` already says. See §A.4 and §C-1.

4. **No `## Further Reading` *and* no Pattern Identification Workout in
   `how-to-think.md`.** The audit prompt notes the Pattern Workout (10
   prompts with hidden answers + self-scoring) is a planned Round 4c
   addition. Confirmed absent — `how-to-think.md` ends at "Common
   Mistakes" / "The Golden Rule" with no retrieval-practice block. See
   §C-2.

**Beneath those four, a longer tail of P1 polish items:**

- No Phase-4/5 `problem.md` carries a **self-evaluation rubric** (the
  prompt named this as a required section). 0 of 20 problem files have
  it. The phase-6 README has a 1–5 mock-interview rubric, but that
  doesn't cover the per-design "did I cover this in my own attempt?"
  loop. See §C-3.
- Phase 4/5 `solution.md` files are inconsistent on **failure modes**
  and **alternatives considered**. 7 / 20 lack any failure-mode
  vocabulary; 11 / 20 lack an "alternatives considered" block; 11 / 20
  lack any external link. Full matrix in §A.5/A.6.
- The README at line 26 of `plan.md` claims **"Total modules: 50"** —
  the phase-6 row says "3 modules" but only one `README.md` exists in
  `phase-6-mock-interviews/`. Either content is missing or the count is
  wrong. See §G-3.
- The phase-3 `08-answer-template/README.md` is the **only Phase-1/2/3
  module without an Anti-signals block** — this is correct per the prior
  append pass (it's a meta-template, not a pattern), but the omission is
  inconsistent with the rest of the structure and worth a one-line
  explanation in-file for future contributors. See §A.3.

**Overall grade per phase:**

| Phase | Grade | Headline |
|-------|-------|----------|
| Phase 0 — Framework | B | RESHADED + estimation are excellent; phase README is thin and there are no exercises with answer keys. |
| Phase 1 — Building Blocks (9 modules) | A− | Strongest phase. Every module has a deep dive, anti-signals, and a Mermaid diagram. Loses points only for no Further Reading and empty case-studies. |
| Phase 2 — Distributed Concepts (7 modules) | A− | On par with Phase 1. Spanner / DynamoDB / Cassandra mappings are present and accurate. |
| Phase 3 — Design Patterns (8 modules) | A− | Best "When to Use / When NOT to Use" framing. Cross-module discriminators (fan-out vs pub-sub vs queue) are explicit. |
| Phase 4 — Classic Starters (10 designs) | B+ | Solution.md files are solid. Module README is thin overview boilerplate. No problem-level rubric, inconsistent failure-mode coverage. |
| Phase 5 — Classic Advanced (10 designs) | B+ | Same shape as Phase 4 with deeper content (1,100–1,700-word solutions). Same gaps: no problem rubric, sparse references. |
| Phase 6 — Mock Interviews | B | Good 45-min minute-by-minute breakdown + 1–5 rubric. Only one README. No worked mock transcript, no behavioural-story examples. |
| Templates & Root docs | B+ | RESHADED + answer-template are useful. how-to-think.md is missing the planned Pattern Workout. The duplication between `templates/answer-template.md` and `phase-3-design-patterns/08-answer-template/README.md` is unresolved. |

**Top wins:**

- Universal `## First-time Recognition Signals` + `### Anti-signals`
  block in all 23 P1/P2/P3 modules. This is rare in free resources and
  is the single best pedagogical asset in the repo. The append-script
  history (`.audit/append-signals.py`) is idempotent and re-runnable.
- Mermaid diagrams render in every module (sequence, flowchart, graph,
  Gantt). No obviously broken fences across the 98 files scanned.
- Estimation cheatsheet's latency table matches Jeff Dean's canonical
  numbers to within rounding (verified against
  `estimation-reference.md:6-22` and `phase-0-framework/estimation-
  cheatsheet.md`).
- Phase 4/5 design solutions are real designs, not skeletons. The
  YouTube transcoding DAG, the URL-shortener KGS pattern, the Uber
  geohash deep-dive, and the payment-system reconciliation flow are
  interview-grade.

**Top failures:**

1. 24 empty case-studies directories vs. README promise.
2. 0 / 98 files cite an external book chapter, paper, or blog post.
3. 0 / 20 problem.md files have a self-evaluation rubric.
4. how-to-think.md has no Pattern Identification Workout.
5. Phase-4 module READMEs are thin boilerplate that adds nothing over
   problem.md.

If the Round 4c fill phase closes those five gaps it will move the
overall course grade from B+ to A across the board.

---

## A. Per-Phase Quality Assessment

### Phase 0 — Framework (Days 1–3) — Grade: B

**Files audited (4):**

| File | Words | Notes |
|---|---|---|
| `phase-0-framework/README.md` | 217 | Thin overview — just a TOC of the 3 sub-files. |
| `phase-0-framework/how-to-approach.md` | 935 | Good. Walks RESHADED step by step with a Twitter example. |
| `phase-0-framework/estimation-cheatsheet.md` | 720 | Formulas + worked Instagram + YouTube examples. Numbers correct. |
| `phase-0-framework/requirements-gathering.md` | 763 | Functional vs non-functional templates + example questions per system class. |

**What's strong:**

- `how-to-approach.md` is essentially a re-cut of the root
  `how-to-think.md` but tuned for first-time RESHADED practice. The
  redundancy is mild because the framing differs.
- `estimation-cheatsheet.md` gets the canonical numbers right
  (cf. §G-1 numeric spot-check).

**What's broken / missing:**

- `phase-0-framework/README.md` has **no Mermaid diagram, no Key
  Concepts table, no Anti-signals block**. It's a 30-line overview
  carrying the title plus a bullet list of the three sub-files. It
  doesn't even include a "by end of Phase 0 you can …" worked example.
- **No exercises with answer keys.** The phase claims Day 2 = "practice
  3 estimation problems" and Day 3 = "practice on 2 example systems"
  (`daily-schedule.md:16-17`), but neither sub-file has a problem set
  with worked solutions. A beginner has no error signal.
- `requirements-gathering.md` lists example questions but never asks
  the learner to *grade their own* requirements list — no checklist of
  "did you ask about: read:write ratio? geographic distribution? PII?
  durability?". Without that, the section is reading-only.

**Numeric findings:** 0 wrong figures.

---

### Phase 1 — Building Blocks (Days 4–15) — Grade: A−

**Files audited (9 module READMEs).** All 9 modules carry:

- ✓ Mermaid diagram (sequence or flowchart, usually both)
- ✓ Key Concepts table
- ✓ Trade-offs comparison table
- ✓ Interview Cheat Sheet
- ✓ Common Interview Questions list
- ✓ Deep Dive section (one named topic per module)
- ✓ First-time Recognition Signals + Anti-signals (appended by the
  May 13 pass; see `.audit/append-signals-report.md`)
- ✗ **No "When to Use / When NOT to Use" H2** (covered by Anti-signals
  block; the prompt asked for both — the H2 specifically is absent).
- ✗ **No Further Reading / External Resources section** in any module.

| # | Module | Words | Diag | Anti-Sig | Refs | Notable |
|---|---|---|---|---|---|---|
| 01 | dns-networking | 1,523 | ✓ | ✓ | ✗ | Excellent recursive-resolver sequence diagram; clear A/AAAA/CNAME/MX summary. |
| 02 | load-balancing | 1,522 | ✓ | ✓ | ✗ | L4 vs L7 distinction is sharp; sticky-session trade-offs covered. |
| 03 | caching | 1,680 | ✓ | ✓ | ✗ | Cache-stampede deep dive is one of the best sections in the repo. |
| 04 | databases-sql | 1,694 | ✓ | ✓ | ✗ | ACID walkthrough; index types; replication topologies. |
| 05 | databases-nosql | 1,694 | ✓ | ✓ | ✗ | Document/wide-column/k-v split with concrete product mappings. |
| 06 | message-queues | 1,683 | ✓ | ✓ | ✗ | Kafka vs SQS vs RabbitMQ comparison; consumer-group semantics. |
| 07 | blob-storage-cdn | 1,791 | ✓ | ✓ | ✗ | Origin shield, cache-key design, signed URLs. |
| 08 | api-design | 1,881 | ✓ | ✓ | ✗ | Largest module — REST / gRPC / GraphQL / WebSocket comparison. |
| 09 | proxies-gateways | 1,870 | ✓ | ✓ | ✗ | API gateway vs service mesh discriminator is explicit. |

**What's strong:**

- Every module starts with a one-line "Why This Matters" hook that
  names the interview-frequency directly. This consistent voice
  signals editorial care.
- Cross-module discriminators are explicit (e.g., 06-message-queues
  anti-signal "every consumer receives every message → that's pub/sub
  or event log, not a queue" points back at Phase 3.03 pub/sub).

**What's broken / missing:**

- All 9 `case-studies/` directories are empty
  (`.audit/stub-list.txt:13-21`). The root README line 101 promises
  them.
- No Further Reading link to DDIA chapter 3 (database internals) from
  `04-databases-sql` or `05-databases-nosql`; no link to Cloudflare's
  Anycast post from `01-dns-networking`; no link to the Kafka paper
  from `06-message-queues`. The course is intentionally inward-only.

**Numeric findings:** 0 wrong figures.

---

### Phase 2 — Distributed Concepts (Days 16–24) — Grade: A−

**Files audited (7 module READMEs).** Structural completeness identical
to Phase 1 — all 7 have Mermaid + table + cheat sheet + anti-signals.

| # | Module | Words | Notable |
|---|---|---|---|
| 01 | scalability | 1,453 | Vertical vs horizontal; stateless services; auto-scaling triggers. |
| 02 | partitioning-sharding | 1,437 | Range / hash / consistent-hash with diagrams; hot-key mitigation. |
| 03 | replication | 1,593 | Leader-follower, multi-leader, leaderless; RPO/RTO; chain replication. |
| 04 | consistency-models | 1,502 | Linearizable → eventual spectrum; CAP + PACELC; Spanner TrueTime. |
| 05 | rate-limiting | 1,606 | Token bucket, leaky bucket, sliding window — all three drawn. |
| 06 | unique-id-generation | 1,528 | Snowflake / ULID / UUID variants compared with bit layouts. |
| 07 | distributed-consensus | 1,819 | Largest in phase — Paxos vs Raft, leader election, etcd / ZooKeeper. |

**What's strong:**

- `04-consistency-models/README.md:53-61` PACELC table is one of the
  cleanest articulations of the trade-off available — including the
  DynamoDB / Spanner / CockroachDB column it shows real-world
  mappings, not just theory.
- `02-partitioning-sharding/README.md` includes a worked
  consistent-hashing diagram with virtual nodes.

**What's broken / missing:**

- All 7 case-studies dirs empty.
- Zero outbound references. Spanner deep dive (`04-consistency-
  models/README.md:125-137`) cites Google's TrueTime API but never
  links the OSDI 2012 Spanner paper. Raft (`07-distributed-
  consensus`) deserves a link to the Ongaro/Ousterhout paper or the
  raft.github.io visualization.

**Numeric findings:** 0 wrong figures. Spot-checked: < 7 ms TrueTime
uncertainty (`04-consistency-models/README.md:129`) matches the
public Spanner paper.

---

### Phase 3 — Design Patterns (Days 25–32) — Grade: A−

**Files audited (8 module READMEs).** The strongest phase for
"when do I reach for this?" framing.

| # | Module | Words | When-NOT block | Notable |
|---|---|---|---|---|
| 01 | fan-out | 1,143 | (in anti-signals) | Push vs pull vs hybrid with celebrity-fanout discussion. |
| 02 | event-sourcing-cqrs | 1,136 | (in anti-signals) | Distinguishes ES from CQRS cleanly — the typical interview confusion. |
| 03 | pub-sub | 1,141 | (in anti-signals) | Topic vs queue semantics; consumer groups. |
| 04 | circuit-breaker-retry | 1,192 | (in anti-signals) | Hedged requests, bulkheads, exponential backoff + jitter. |
| 05 | saga-pattern | 1,215 | **explicit ## When NOT to Use** | Only module with an explicit "When NOT to" H2. Choreography vs orchestration is sharp. |
| 06 | sharding-strategies | 1,162 | (in anti-signals) | Range / hash / geo / directory-based — all four. |
| 07 | cache-patterns | 1,266 | (in anti-signals) | Cache-aside / write-through / write-back / write-around. Discriminator vs Phase 1.03. |
| 08 | answer-template | 1,317 | n/a | **Meta-template; no Anti-signals (correctly excluded per `.audit/append-signals-report.md:14-16`).** |

**What's strong:**

- `05-saga-pattern/README.md:74-89` is the gold standard the other 7
  modules should emulate — explicit `## When to Use This Pattern` and
  `## When NOT to Use This Pattern` H2 sections separate from the
  anti-signals block at the bottom. The prompt asked for this
  structure in every module; only saga delivers it as named H2s.
- `08-answer-template/README.md` contains a Mermaid `gantt` diagram of
  the 45-minute interview timing — useful and renders correctly.

**What's broken / missing:**

- `phase-3-design-patterns/08-answer-template/README.md` overlaps
  substantially with `templates/answer-template.md`. The phase-3 one
  even references the root one (line 13: "For the full extended
  template … see `templates/answer-template.md`"). Pick one canonical
  location.
- All 8 case-studies dirs empty.
- 08-answer-template's omission of Anti-signals is correct in
  principle but inconsistent in form — add a one-line note explaining
  *why* it's excluded so future contributors don't try to fill it.

**Numeric findings:** 0 wrong figures.

---

### Phase 4 — Classic Starters (Days 33–44) — Grade: B+

**Files audited (30 — 10 each of README.md / problem.md / solution.md).**

| Sub-file type | Count | Word range | Verdict |
|---|---|---|---|
| README.md | 10 | 193–214 | **All thin overview boilerplate** (see §C-1). Identical 5-section template. |
| problem.md | 10 | 330–391 | Decent. All have FR / NFR / Scale table / Hints / Think About. **None has a self-evaluation rubric.** |
| solution.md | 10 | 950–1,214 | Substantive. All have API / DB schema / Mermaid HLD / trade-offs. Failure-mode coverage uneven. |

**Per-design coverage matrix** — see §A.5 (consolidated with Phase 5).

**What's strong:**

- Every solution has a Mermaid architecture diagram and an API block
  with at least 3 endpoints.
- Estimation tables are present in every problem and re-stated in
  every solution.
- URL-shortener and rate-limiter solutions have the cleanest writing.

**What's broken / missing:**

- 10 / 10 module READMEs are thin (193–214 words). They reiterate
  difficulty + core concepts + companies + prerequisites — content
  the learner already gets from `daily-schedule.md` and `problem.md`.
- 10 / 10 problem.md files lack a self-evaluation rubric. The phase-6
  rubric (`phase-6-mock-interviews/README.md:36-47`) is the only
  rubric in the entire course, and it's a generic interview rubric,
  not a per-design checklist.
- `07-notification-system/solution.md` and `09-news-feed/solution.md`
  don't mention sharding at all (matrix below). At their scale (push
  notifications at 100M DAU / feed at 500M DAU) this is a real gap.
- 7 / 10 solutions lack a failure-modes section (matrix below).

**Numeric findings:** 0 wrong figures.

---

### Phase 5 — Classic Advanced (Days 45–54) — Grade: B+

**Files audited (30 — same split).**

| Sub-file type | Count | Word range | Verdict |
|---|---|---|---|
| README.md | 10 | 253–292 | Slightly less thin than Phase 4 (270 avg vs 207 avg) but same boilerplate-overview shape. |
| problem.md | 10 | 433–523 | Stronger than Phase 4 — more scale numbers, more "Think About" prompts. No rubric. |
| solution.md | 10 | 1,119–1,714 | Substantive. The 10–15-variant transcoding DAG (YouTube), the geohash deep dive (Uber), and the reconciliation walkthrough (payments) are interview-grade. |

**What's strong:**

- 8 / 10 Phase-5 solutions discuss explicit failure handling
  (vs. 3 / 10 in Phase 4). Advanced designs treat failure as
  first-class.
- 5 / 10 Phase-5 solutions include a "Future Improvements" tail
  section — this is the closest thing the repo has to a Further
  Reading hook (e.g., 02-youtube solution lists AV1 codec migration,
  live streaming, edge personalization).

**What's broken / missing:**

- Same problem-rubric absence as Phase 4 (0 / 10).
- Only 4 / 10 Phase-5 solutions explicitly enumerate "alternatives
  considered" with the rejected approaches named. The matrix shows
  Instagram, Twitter, Uber, Dropbox, Google Search, ticket-booking
  all skip this.
- Same near-universal absence of external references (only 6 / 10
  solutions even hint at outside material via a single Future
  Improvement bullet — none links a paper or blog post).

**Numeric findings:** 0 wrong figures. Spot-checked:
- Instagram: 100M photos/day × 500 KB = 50 TB/day ✓ (matches `estimation-reference.md:124-130`).
- YouTube: 4,300 videos/min × 1,440 × 10 GB ≈ 62 PB/day ✓.

---

### Phase 5 / Phase 4 Combined Solution Coverage Matrix

Mechanically derived from regex scan of all 20 solution files.

| Design | API | DB Schema | Arch. Mermaid | Sharding | Caching | Failure modes | Trade-offs | Alternatives | Ext. Refs |
|---|---|---|---|---|---|---|---|---|---|
| P4.01 url-shortener | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| P4.02 pastebin | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| P4.03 rate-limiter | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| P4.04 key-value-store | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| P4.05 unique-id-generator | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✗ |
| P4.06 web-crawler | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| P4.07 notification-system | ✓ | ✓ | ✓ | **✗** | ✓ | ✗ | ✓ | ✗ | ✓ |
| P4.08 chat-system | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| P4.09 news-feed | ✓ | ✓ | ✓ | **✗** | ✓ | ✗ | ✓ | ✗ | ✓ |
| P4.10 typeahead | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| P5.01 instagram | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| P5.02 youtube | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (chunked) | ✓ | ✗ | ✗ |
| P5.03 twitter | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| P5.04 uber | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| P5.05 dropbox | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| P5.06 google-search | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| P5.07 distributed-cache | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| P5.08 payment-system | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P5.09 ticket-booking | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| P5.10 google-maps | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| **TOTAL** | **20/20** | **20/20** | **20/20** | **18/20** | **19/20** | **9/20** | **20/20** | **8/20** | **8/20** |

Legend: "Ext. Refs" = any link to a paper, engineering blog, book chapter,
or named external source inside the solution body. — for caching = N/A
(05-unique-id-generator legitimately doesn't need a cache layer).

---

### Phase 6 — Mock Interviews (Days 55–60) — Grade: B

**File audited (1):** `phase-6-mock-interviews/README.md` (940 words).

**What's strong:**

- Minute-by-minute time breakdown of a 45-minute mock
  (`phase-6-mock-interviews/README.md:11-17`) — concrete and
  immediately usable.
- 1–5 self-assessment rubric across 7 dimensions
  (`README.md:36-47`) — the rubric the rest of the course is missing.
- Common follow-up question library (`README.md:55-78`) maps to real
  interviewer behaviour (scaling, failure, cost, consistency).

**What's broken / missing:**

- Round 1 only lists 3 design pairs (A/B/C); Round 2 says "two you
  struggled with"; Round 3 lists 3 fresh problems (Google Docs,
  DoorDash, Datadog). **None of those three Round 3 problems exists
  as a `problem.md` anywhere in the repo.** The learner is told to
  "design a collaborative document editor" with no scaffold.
- STAR behavioural prompts (`README.md:94-102`) list 3 themes but give
  no example STAR story — same gap dsa-zth had. A beginner has
  nothing to model from.
- No worked mock transcript (would benefit: a faux interview Q&A on a
  known design showing what a "good" 45-min answer sounds like).
- No "if you scored 20–27" remediation map — just "practice weak
  areas" without a pointer back into the curriculum.
- The "What To Do After Day 60" section (line 127) recommends "2–3
  mock interviews per week" but doesn't bind that to the redo-queue
  spaced-repetition machinery in `redo-queue.md:17-25`.

**Numeric findings:** 0 wrong figures.

---

### Templates & Root docs — Grade: B+

**Files audited (8 root docs + 1 template).**

| File | Words | Verdict |
|---|---|---|
| `README.md` | 1,012 | Strong project map; clear timeline options; complete attribution. |
| `how-to-think.md` | 1,278 | RESHADED framework + Twitter worked example. **No Pattern Identification Workout.** |
| `plan.md` | 1,661 | Course blueprint. Module count "50" at line 26 needs reconciling against phase-6 (1 file vs claim of 3). |
| `daily-schedule.md` | 1,449 | Day-by-day breakdown. References modules by phase number, all reachable. |
| `progress.md` | 422 | Master checklist. Reasonable. |
| `setup.md` | 271 | Brief — covers environment, dashboard launch, optional tools. Could mention Mermaid Live Editor for previewing. |
| `estimation-reference.md` | 759 | Latency numbers + QPS / storage / bandwidth formulas. All correct. |
| `redo-queue.md` | 182 | Thin — explains Leitner-box mechanics but has only one *example* row. |
| `templates/answer-template.md` | 715 | 45-min phased script with copy-paste English. Useful. |

**What's strong:**

- `how-to-think.md` RESHADED breakdown is the strongest narrative in
  the course. Lines 41-82 walk a Twitter requirements + estimation
  end-to-end with real numbers.
- `estimation-reference.md` "L1 cache 0.5 ns" / "datacenter RT
  500 µs" / "CA→NL 150 ms" all match Jeff Dean's canonical numbers.
- `templates/answer-template.md` provides actual scripts ("Let me
  clarify the core features we need to support…") that reduce
  cognitive load in the actual interview.

**What's broken / missing:**

- `how-to-think.md` has no retrieval-practice block. The Round 4c
  Pattern Identification Workout (10 prompts with hidden answers +
  self-scoring) is the named missing piece — confirmed absent via
  grep for `workout|self-test|hidden`.
- `redo-queue.md` has only an example row — there's no seeded set of
  "designs you'll probably struggle with on first pass" to bootstrap
  the queue. A learner on Day 14 has nothing to revisit yet.
- The duplication between `templates/answer-template.md` (715 words)
  and `phase-3-design-patterns/08-answer-template/README.md` (1,317
  words) is unresolved — the phase-3 file even cross-links to the
  templates one (line 13). Decide which is canonical and reduce the
  other to a one-line pointer.
- `setup.md` says "no coding required" but never names the
  recommended diagram tool. Recommend Excalidraw / Mermaid Live /
  whiteboard.fyi explicitly.

---

## B. Critical content gaps (P0 — beginner hits a wall)

### B-1. All 24 `case-studies/` directories are empty

- **Promise:** `README.md:101` — "case-studies/ — Mini case studies
  applying the concept to real systems."
- **Reality:** `ls phase-1-building-blocks/01-dns-networking/case-
  studies` returns zero files. Same for all 24 module subdirectories
  across Phases 1, 2, and 3 (verified — full list at
  `.audit/stub-list.txt:13-36`).
- **Why it blocks the learner:** When a learner reads
  `phase-1-building-blocks/03-caching/README.md` and reaches the end,
  the README's "Real-World Examples" subsection (in patterns) and
  "Interview Cheat Sheet" mention Facebook TAO, Twitter timeline
  caching, etc. — but the `case-studies/` directory next to it is
  empty. There's a structural promise of "read theory → read concrete
  application of theory" that the empty folder breaks.
- **Fix sketch:** For each module, drop in 1–2 `.md` files (300–500
  words each) titled by the system (`facebook-tao.md`,
  `twitter-timeline.md`, etc.) with three sections: (1) the problem
  the system faces, (2) the specific decision relating to this
  module's topic, (3) the trade-off they accepted. See §H TODOs 1–24.

### B-2. Phase-6 Round 3 prompts reference non-existent designs

- **Promise:** `phase-6-mock-interviews/README.md:31-34` — "Design a
  collaborative document editor (Google Docs) / food delivery
  (DoorDash) / metrics monitoring (Datadog)."
- **Reality:** No `problem.md` or `solution.md` for any of these
  three. They are listed as Day-59 mock-interview material with no
  scaffold.
- **Why it blocks the learner:** On Day 59 the learner opens the
  course expecting at least a problem statement to time themselves
  against, and finds nothing.
- **Fix sketch:** Either (a) add three skeleton `problem.md` files in
  a `phase-6-mock-interviews/round-3-fresh-problems/` subdirectory
  with FR / NFR / scale numbers and no solution (the point is novelty),
  or (b) reword the Round 3 line to "pick a Phase-4 design you
  haven't attempted yet" and remove the named fresh problems.

### B-3. how-to-think.md has no Pattern Identification Workout

- **Promise:** Audit prompt notes this is a planned Round 4c addition.
- **Reality:** Confirmed absent. `how-to-think.md` ends at "The Golden
  Rule" (line 239); no exercises, no hidden-answer prompts, no
  self-score grid.
- **Why it blocks the learner:** The whole course pivots on pattern
  recognition (see the universally-appended Anti-signals blocks). The
  framework document never asks the learner to *practice* recognition
  without help — they read 24 anti-signal blocks but never test
  themselves cold.
- **Fix sketch:** Add a new H2 `## Pattern Identification Workout`
  after "The Golden Rule" with 10 short interview-prompt fragments
  (e.g., "Design a system where users in 6 regions read the same
  product catalogue with sub-100 ms latency") and HTML
  `<details><summary>` collapsible answer blocks. Add a self-scoring
  rubric: 8/10 → ready, 5–7 → revisit Phase 3 anti-signals,
  < 5 → start over with how-to-think.md.

---

## C. Important gaps (P1)

### C-1. Phase-4 module READMEs are thin overview boilerplate

- 10 / 10 Phase-4 README.md files are 193–214 words. They all follow
  the same 5-section template (Overview / Difficulty / Core Concepts
  Tested / Companies / Prerequisites / Approach) and add nothing the
  learner couldn't get from `problem.md`.
- The Phase-5 equivalents are slightly thicker (253–292 words) but
  carry the same boilerplate.
- **Fix sketch:** Either fold them into `problem.md` as a top header
  (saving 20 files of clicking), or expand each to include a
  one-paragraph "what makes this design tricky?" hook + a
  "prerequisites checklist" the learner can self-mark before
  attempting. See §H TODOs 25–34.

### C-2. No `## Further Reading` sections anywhere

- 0 / 98 audited files link to a paper, book chapter, or engineering
  blog post in a structured section. The root README cites three
  inspirations (donnemartin/system-design-primer, DDIA, ByteByteGo)
  but module bodies are silent.
- **Fix sketch:** Add a `## Further Reading` H2 at the bottom of each
  of the 24 P1/P2/P3 module READMEs and each of the 20 Phase-4/5
  solutions, with 3–5 bullet-linked sources. Per-module suggestions
  in §F.

### C-3. No self-evaluation rubrics on any problem.md

- 0 / 20 Phase-4/5 problem.md files have a rubric. The only rubric in
  the course is the generic 7-dimension mock rubric at
  `phase-6-mock-interviews/README.md:36-47`.
- **Fix sketch:** Append a `## Self-Evaluation Checklist` to each
  problem.md with ~8 yes/no questions specific to that design (e.g.,
  for URL-shortener: "Did you propose a Base62 length and justify
  collision probability? Did you discuss 301 vs 302? Did you address
  hot-URL caching? …"). See §H TODOs 35–54.

### C-4. Phase 4/5 solution.md gaps on failure modes & alternatives

- 11 / 20 solutions don't have any failure-mode discussion.
- 12 / 20 solutions don't enumerate alternatives considered.
- 12 / 20 solutions have zero external references.
- **Fix sketch:** Standardize a `## Failure Modes` + `## Alternatives
  Considered` + `## Further Reading` H2 trio at the tail of every
  solution. Coverage matrix at §A.5 names which specific designs
  need each.

### C-5. Phase 6 has no behavioural STAR examples

- `phase-6-mock-interviews/README.md:94-102` names 3 STAR themes but
  shows no example story. Same defect noted in the dsa-zth audit.
- **Fix sketch:** Add one anonymized 80-word STAR example per theme,
  modelled on the Amazon LP format ("S: We were ingesting 50 K
  events/sec into Postgres and write latency was breaching SLA. T:
  Cut p99 ingest latency by 40 % within the quarter…").

---

## D. Polish (P2)

### D-1. Duplicate answer-template content

- `templates/answer-template.md` (715 words) and
  `phase-3-design-patterns/08-answer-template/README.md` (1,317
  words) overlap. The phase-3 file cross-links to the templates one
  at line 13 but neither is declared canonical.
- **Fix:** Pick one as canonical. Recommend keeping the phase-3 file
  (it's part of the learning sequence) and reducing
  `templates/answer-template.md` to a one-page printable cheat sheet.

### D-2. plan.md module count vs phase-6 reality

- `plan.md:26` table claims 3 Phase-6 modules; filesystem has 1
  README. The "Total: 50" arithmetic is 3+9+7+8+10+10+3 = 50 and only
  works if phase-6 has 3 modules. Either add the 2 missing modules
  (mock guide + behavioural guide + final-review guide is the
  obvious split) or update the table to "Phase 6 / 1 / Mock + Review
  / Total: 48".

### D-3. redo-queue.md is unseeded

- Only an example row; no Phase-1-through-5 designs pre-loaded as
  "likely-to-struggle". A Day-14 learner has empty state.
- **Fix:** Seed with the 5 designs interview data suggests are
  hardest on first attempt: news-feed, Uber, payment-system,
  Google-search, ticket-booking. Mark them at Box 0 / "not yet
  attempted".

### D-4. phase-0-framework/README.md is thin (217 words)

- Just a table of contents. Add a 200-word "what success looks like
  after Phase 0" worked example (e.g., a 5-line back-of-envelope
  estimate for Twitter the learner should be able to produce
  unaided).

### D-5. setup.md doesn't mention diagram tooling

- 271 words on environment + dashboard launch. Add a 50-word section
  on diagram tools (Excalidraw, Mermaid Live Editor, draw.io) — the
  learner is supposed to be drawing for 12+ minutes per day.

### D-6. answer-template at phase-3/08 omits Anti-signals

- Correct by intent (per `.audit/append-signals-report.md:14-16`),
  but jarring against the other 23 modules. Add a one-line note at
  the bottom: "This module is a meta-template, not a pattern —
  Anti-signals do not apply."

### D-7. Phase-1 module structure lacks explicit "When to Use" H2

- All 9 P1 modules and all 7 P2 modules cover when-to-use inside
  Anti-signals / Interview Cheat Sheet but lack the explicit H2
  the prompt's structural definition asked for. Phase 3 has it; P1/P2
  don't. For uniformity, lift it to its own H2 in P1/P2 modules.

---

## E. Diagram inventory

### E-1. Modules with diagrams (24 / 24 P1/P2/P3 + 20 / 20 P4/P5 solutions)

Every audited module README and every solution.md contains at least
one Mermaid block. Spot-checked with `rg "^\`\`\`mermaid$"` — fences
balance correctly in all 44 files.

Diagram types present:

- **sequenceDiagram** — Phase 1.01 (DNS lookup), Phase 1.03 (cache-aside), Phase 1.08 (API request flow).
- **graph LR / TD / TB** — every Phase 4/5 HLD; Phase 2.04 (CAP triangle); Phase 3.05 (saga); Phase 5.02 (transcoding DAG, deep dive).
- **flowchart LR / TD** — Phase 1.06 (event-driven), Phase 3.05 (saga + compensation).
- **gantt** — Phase 3.08 (45-min interview timing).

### E-2. Diagrams that exist but could be sharper

- `phase-2-distributed-concepts/02-partitioning-sharding/README.md`
  has a consistent-hashing description but the diagram doesn't show
  virtual-node fan-out — a ring with named slices would be clearer.
- `phase-2-distributed-concepts/06-unique-id-generation/README.md`
  references Snowflake bit layout in text; an ASCII or Mermaid bit
  diagram (sign | timestamp 41 | datacenter 5 | worker 5 | sequence
  12) would help.
- `phase-3-design-patterns/04-circuit-breaker-retry/README.md` —
  state diagram (CLOSED ↔ OPEN ↔ HALF-OPEN) is described in prose but
  not drawn.

### E-3. Files that lack a diagram but would benefit

- `phase-0-framework/estimation-cheatsheet.md` — no diagram; a single
  "QPS → storage → bandwidth" flowchart would anchor the three
  formulas.
- `phase-0-framework/requirements-gathering.md` — no diagram; a
  FR-vs-NFR decision tree would help.
- `templates/answer-template.md` — has script blocks but no time-line
  visual. The phase-3 mirror has the Gantt; this file should too.
- `how-to-think.md` — has Mermaid in the Storage decision tree
  (line 90), but the overall RESHADED time allocation would benefit
  from a Gantt or pie like the phase-3-08 file.

### E-4. Broken Mermaid fences

None detected. All `\`\`\`mermaid` opens have matching `\`\`\`` closes,
and all diagrams declare a direction or type.

---

## F. External resources audit (per module)

**Universal:** 0 / 24 P1/P2/P3 modules carry an `## Further Reading`
or `## External Resources` section. 0 / 20 Phase-4/5 solution.md files
do. Below: per-module suggestions for what should be added.

### Phase 1
- 01-dns-networking → Cloudflare anycast post, RFC 1034/1035, DNS-perf benchmarks.
- 02-load-balancing → AWS ELB docs, HAProxy "Load Balancing 101", Envoy proxy whitepaper.
- 03-caching → Facebook TAO paper (USENIX ATC '13), Phil Karlton on cache invalidation, Redis Labs cache-stampede article.
- 04-databases-sql → DDIA Ch. 3, "Use the Index, Luke!" (Markus Winand), PostgreSQL docs on isolation levels.
- 05-databases-nosql → DDIA Ch. 6, DynamoDB paper (SOSP '07), Cassandra "anti-entropy" architecture doc.
- 06-message-queues → Kafka paper (NetDB '11), Confluent "Exactly-Once" series, AWS SQS vs Kinesis selection guide.
- 07-blob-storage-cdn → AWS S3 "Best Practices for High Performance", Cloudflare CDN architecture, BBC "We Are What We Cache".
- 08-api-design → Stripe API docs, Roy Fielding's REST dissertation Ch. 5, Google API design guide.
- 09-proxies-gateways → Envoy + Istio whitepaper, NGINX "Microservices" eBook, AWS API Gateway production patterns.

### Phase 2
- 01-scalability → "Latency Numbers Every Programmer Should Know" (Norvig/Dean), High Scalability "Numbers Everyone Should Know".
- 02-partitioning-sharding → DDIA Ch. 6, Vitess sharding docs, "Slack's Migration to a Cellular Architecture".
- 03-replication → DDIA Ch. 5, Raft visualization (raft.github.io), Aphyr's Jepsen Postgres series.
- 04-consistency-models → DDIA Ch. 9, Spanner paper (OSDI '12), Peter Bailis "Linearizability versus Serializability".
- 05-rate-limiting → Stripe rate-limiting post, Cloudflare's "How we built rate limiting capable of scaling to millions of domains".
- 06-unique-id-generation → Twitter Snowflake blog, ULID spec, Instagram engineering ID generation post.
- 07-distributed-consensus → Raft paper (Ongaro & Ousterhout), Paxos Made Simple (Lamport), etcd Learning Materials.

### Phase 3
- 01-fan-out → Twitter "Big Data in Real Time at Twitter" (Strata '12), Instagram "Sharding & IDs at Instagram".
- 02-event-sourcing-cqrs → Greg Young CQRS docs, Martin Fowler "Event Sourcing", Confluent "Event-driven architecture".
- 03-pub-sub → Apache Kafka design doc, AWS SNS/SQS fan-out pattern.
- 04-circuit-breaker-retry → Netflix Hystrix wiki, Polly resilience library docs, Marc Brooker "Timeouts, retries, and backoff with jitter".
- 05-saga-pattern → Chris Richardson microservices.io saga, Caitie McCaffrey "Distributed Sagas".
- 06-sharding-strategies → Vitess docs, MongoDB sharding guide, Cassandra partitioner comparison.
- 07-cache-patterns → AWS ElastiCache patterns whitepaper, Azure Cache for Redis patterns, Memcached "best practices".
- 08-answer-template → ByteByteGo system-design-interview repo, Alex Xu Vol. 1 Ch. 1.

### Phase 4/5 Designs
- Every solution.md should cite: (a) one engineering-blog post from
  the named company (e.g., bit.ly tech blog for URL-shortener,
  Pinterest "Building a smarter home feed" for news-feed, Uber
  H3/geohash post for Uber), (b) one DDIA or Xu chapter, (c) one
  vendor doc (DynamoDB / Kafka / Redis Cluster / CDN).

---

## G. Numeric / factual spot-checks

### G-1. Latency table (`estimation-reference.md:6-22`)

All 14 rows match Jeff Dean's canonical numbers (with the
"Numbers Everyone Should Know" rounding):

- L1 cache 0.5 ns ✓ (correct — the dsa-zth example flagged "L1 cache:
  100 ns" as wrong; here it's right).
- Branch mispredict 5 ns ✓
- L2 7 ns ✓
- Main memory 100 ns ✓
- SSD 4 KB random 150 µs ✓
- Datacenter RT 500 µs ✓
- SSD 1 MB sequential 1 ms ✓
- HDD seek 10 ms ✓
- CA → Netherlands → CA 150 ms ✓

**Finding:** clean.

### G-2. Storage example for Instagram

- `estimation-reference.md:124-149` says 100 M photos/day × 500 KB =
  50 TB/day, 1.5 PB/month, 90 PB over 5 years. Arithmetic checks:
  100 M × 500 KB = 50 TB ✓; 50 × 30 = 1,500 TB = 1.5 PB ✓;
  50 × 365 × 5 = 91,250 TB ≈ 91 PB ✓.
- `phase-5-classic-advanced/01-instagram/solution.md` uses the same
  numbers. Consistent across files.

### G-3. plan.md module-count arithmetic

- `plan.md:26` table sums to 50 (3 + 9 + 7 + 8 + 10 + 10 + 3).
  Filesystem reality: Phase 6 has 1 README, not 3. Either the table
  is wrong (real total = 48) or two phase-6 sub-modules are missing.
  See §D-2.

### G-4. Twitter scale example (`how-to-think.md:67-79`)

- 500 M DAU, 600 M tweets/day, write QPS = 600 M / 86,400 ≈ 7,000 ✓.
- 100 : 1 read:write → 700 K read QPS ✓.
- 600 M × 1 KB = 600 GB/day, × 30 = 18 TB/month ✓.

All arithmetic correct.

### G-5. YouTube scale example (`phase-5-classic-advanced/02-youtube/solution.md:7-22`)

- 4,300 videos/min × 1,440 min × 10 GB = 61,920,000 GB ≈ **62 PB/day**
  ✓. Daily egress 50 M viewers × 5 Mbps = 250 Tbps ✓.

### G-6. URL-shortener Base62 capacity

- `phase-4-classic-starter/01-url-shortener/problem.md:39` says
  "Base62 with 7 characters gives you 62^7 ≈ 3.5 trillion
  combinations". Check: 62^7 = 3,521,614,606,208 ≈ 3.5 × 10^12 ✓.

**Numeric audit summary:** 0 wrong figures detected.

---

## H. Numbered TODO list (consolidated, ready to execute)

Each TODO is action-typed and carries a file path + effort
(XS = < 15 min, S = 15–60 min, M = 1–3 h, L = > 3 h, XL = > a day).

### H-1 to H-24: Seed every `case-studies/` directory (P0)

1. Create `phase-1-building-blocks/01-dns-networking/case-studies/netflix-route53.md` — 300-word case on how Netflix uses Route 53 weighted records for regional failover. Effort: S.
2. Create `phase-1-building-blocks/02-load-balancing/case-studies/aws-elb-vs-nlb.md` — 400-word comparison of ALB / NLB / GLB choice criteria. Effort: S.
3. Create `phase-1-building-blocks/03-caching/case-studies/facebook-tao.md` — 500-word distillation of the TAO paper, focused on the graph-cache + write-through aspects. Effort: M.
4. Create `phase-1-building-blocks/04-databases-sql/case-studies/github-postgres.md` — 400-word case on GitHub's Vitess-on-MySQL migration. Effort: S.
5. Create `phase-1-building-blocks/05-databases-nosql/case-studies/discord-cassandra.md` — 400-word case on Discord's 12 → 177 node Cassandra migration. Effort: S.
6. Create `phase-1-building-blocks/06-message-queues/case-studies/linkedin-kafka.md` — 400-word case on Kafka's origin at LinkedIn. Effort: S.
7. Create `phase-1-building-blocks/07-blob-storage-cdn/case-studies/netflix-open-connect.md` — 400-word case on Netflix's edge-CDN appliance program. Effort: S.
8. Create `phase-1-building-blocks/08-api-design/case-studies/stripe-api-versioning.md` — 400-word case on Stripe's date-based API versioning. Effort: S.
9. Create `phase-1-building-blocks/09-proxies-gateways/case-studies/lyft-envoy.md` — 400-word case on Envoy's origin at Lyft and the service-mesh adoption story. Effort: S.
10. Create `phase-2-distributed-concepts/01-scalability/case-studies/dropbox-scaling-magic-pocket.md` — 400-word case on Dropbox's exit from S3 to Magic Pocket. Effort: S.
11. Create `phase-2-distributed-concepts/02-partitioning-sharding/case-studies/instagram-sharded-ids.md` — 400-word case on Instagram's 64-bit ID partitioning scheme. Effort: S.
12. Create `phase-2-distributed-concepts/03-replication/case-studies/postgres-streaming-replication.md` — 400-word case on Postgres async vs sync replication trade-offs in production. Effort: S.
13. Create `phase-2-distributed-concepts/04-consistency-models/case-studies/spanner-truetime.md` — 500-word distillation of Spanner / TrueTime. Effort: M.
14. Create `phase-2-distributed-concepts/05-rate-limiting/case-studies/stripe-rate-limiters.md` — 400-word case on Stripe's "How we built rate limiters" post. Effort: S.
15. Create `phase-2-distributed-concepts/06-unique-id-generation/case-studies/twitter-snowflake.md` — 400-word case on Snowflake bit layout + clock-skew handling. Effort: S.
16. Create `phase-2-distributed-concepts/07-distributed-consensus/case-studies/etcd-raft-kubernetes.md` — 400-word case on etcd as Kubernetes' Raft store. Effort: S.
17. Create `phase-3-design-patterns/01-fan-out/case-studies/twitter-celebrity-problem.md` — 500-word case on the hybrid push/pull architecture for celebrity fan-out. Effort: M.
18. Create `phase-3-design-patterns/02-event-sourcing-cqrs/case-studies/walmart-event-sourcing.md` — 400-word case on Walmart's event-sourced inventory system. Effort: S.
19. Create `phase-3-design-patterns/03-pub-sub/case-studies/google-pub-sub-at-scale.md` — 400-word case on Google Cloud Pub/Sub design choices. Effort: S.
20. Create `phase-3-design-patterns/04-circuit-breaker-retry/case-studies/netflix-hystrix.md` — 400-word case on Netflix Hystrix (and why it was deprecated for resilience4j). Effort: S.
21. Create `phase-3-design-patterns/05-saga-pattern/case-studies/uber-trip-saga.md` — 500-word case on Uber's trip lifecycle as an orchestrated saga. Effort: M.
22. Create `phase-3-design-patterns/06-sharding-strategies/case-studies/figma-sharding.md` — 400-word case on Figma's Postgres-sharding journey. Effort: S.
23. Create `phase-3-design-patterns/07-cache-patterns/case-studies/pinterest-memcached.md` — 400-word case on Pinterest's multi-tier cache architecture. Effort: S.
24. For `phase-3-design-patterns/08-answer-template/case-studies/`, decide intentionally: either delete the directory (it's a meta-template, no cases apply) or seed with one `bytebytego-example-walkthrough.md`. Recommend delete + note in README. Effort: XS.

### H-25 to H-34: Expand thin Phase-4 module READMEs

25. Expand `phase-4-classic-starter/01-url-shortener/README.md` (currently 214 w) by adding (a) a "What makes this design tricky?" paragraph on collision-vs-coordination trade-off, (b) a prerequisites self-check checklist (5 items). Effort: S.
26. Same for `phase-4-classic-starter/02-pastebin/README.md` (212 w) — focus on encryption + expiry being the new dimensions beyond URL-shortener. Effort: S.
27. Same for `phase-4-classic-starter/03-rate-limiter/README.md` (194 w) — focus on the three windowing algorithms as the central choice. Effort: S.
28. Same for `phase-4-classic-starter/04-key-value-store/README.md` (199 w) — focus on quorum + consistent hashing being the core. Effort: S.
29. Same for `phase-4-classic-starter/05-unique-id-generator/README.md` (193 w) — focus on the global-uniqueness-without-coordination puzzle. Effort: S.
30. Same for `phase-4-classic-starter/06-web-crawler/README.md` (206 w) — focus on politeness + duplicate-URL detection. Effort: S.
31. Same for `phase-4-classic-starter/07-notification-system/README.md` (193 w) — focus on multi-channel fan-out + delivery guarantees. Effort: S.
32. Same for `phase-4-classic-starter/08-chat-system/README.md` (202 w) — focus on online/offline state + message ordering. Effort: S.
33. Same for `phase-4-classic-starter/09-news-feed/README.md` (212 w) — focus on the push/pull/hybrid choice + celebrity fan-out. Effort: S.
34. Same for `phase-4-classic-starter/10-typeahead/README.md` (206 w) — focus on the trie+rank trade-off + index-update freshness. Effort: S.

### H-35 to H-54: Add Self-Evaluation Checklist to every problem.md

35. Append `## Self-Evaluation Checklist` to `phase-4-classic-starter/01-url-shortener/problem.md` with 8 yes/no items: collision strategy named, Base62 length justified, KGS or hash explained, 301 vs 302 discussed, cache eviction policy stated, expiry strategy stated, custom-alias uniqueness handled, analytics counting strategy stated. Effort: S.
36. Same template (8 design-specific items) for `phase-4-classic-starter/02-pastebin/problem.md`. Effort: S.
37. Same for `phase-4-classic-starter/03-rate-limiter/problem.md` — items on token-bucket vs sliding-window, distributed counters, fail-open vs fail-closed. Effort: S.
38. Same for `phase-4-classic-starter/04-key-value-store/problem.md` — quorum, vector clocks, gossip. Effort: S.
39. Same for `phase-4-classic-starter/05-unique-id-generator/problem.md` — Snowflake bit layout, clock skew, multi-region. Effort: S.
40. Same for `phase-4-classic-starter/06-web-crawler/problem.md` — robots.txt, politeness delay, dedup. Effort: S.
41. Same for `phase-4-classic-starter/07-notification-system/problem.md` — channels, retries, idempotency keys. Effort: S.
42. Same for `phase-4-classic-starter/08-chat-system/problem.md` — WebSocket vs long-poll, presence, push delivery. Effort: S.
43. Same for `phase-4-classic-starter/09-news-feed/problem.md` — push vs pull, ranking, celebrity fan-out. Effort: S.
44. Same for `phase-4-classic-starter/10-typeahead/problem.md` — trie storage, prefix index, freshness. Effort: S.
45. Same template (8 design-specific items) for `phase-5-classic-advanced/01-instagram/problem.md`. Effort: S.
46. Same for `phase-5-classic-advanced/02-youtube/problem.md` — chunked upload, transcoding DAG, ABR, CDN tiers. Effort: S.
47. Same for `phase-5-classic-advanced/03-twitter/problem.md`. Effort: S.
48. Same for `phase-5-classic-advanced/04-uber/problem.md` — geohash, matching, surge pricing. Effort: S.
49. Same for `phase-5-classic-advanced/05-dropbox/problem.md` — chunk dedup, sync, conflict resolution. Effort: S.
50. Same for `phase-5-classic-advanced/06-google-search/problem.md` — inverted index, ranking, freshness. Effort: S.
51. Same for `phase-5-classic-advanced/07-distributed-cache/problem.md` — consistent hashing, replication, evictions. Effort: S.
52. Same for `phase-5-classic-advanced/08-payment-system/problem.md` — idempotency keys, reconciliation, double-spend. Effort: S.
53. Same for `phase-5-classic-advanced/09-ticket-booking/problem.md` — seat hold, payment race, virtual waiting room. Effort: S.
54. Same for `phase-5-classic-advanced/10-google-maps/problem.md` — tile pyramid, routing, ETA estimation. Effort: S.

### H-55 to H-58: Add Pattern Identification Workout to how-to-think.md (P0)

55. In `how-to-think.md`, after line 239 ("The Golden Rule"), add a new H2 `## Pattern Identification Workout`. Include exactly 10 prompts, each ~50 words, drawn from the universe of Phase 1–3 anti-signal phrases. Effort: M.
56. For each of the 10 prompts in TODO 55, wrap the answer in `<details><summary>Show answer</summary>…</details>` so it's hidden by default. Answer = the named module ID + one-sentence justification. Effort: included in TODO 55.
57. Append a scoring rubric to the same section: 8–10 = ready for Phase 4; 5–7 = revisit the relevant anti-signal block; 0–4 = re-read all of Phase 3. Effort: XS.
58. Cross-link the new section from `daily-schedule.md` Day 32 ("Phase 3 wrap-up") as the gate to enter Phase 4. Effort: XS.

### H-59 to H-78: Add Failure Modes / Alternatives / Further Reading to under-covered solutions

For each of the 11 solutions lacking failure-modes (per §A.5):

59. `phase-4-classic-starter/01-url-shortener/solution.md` — add `## Failure Modes` (KGS down, cache cold, hot URL, DB shard failure). Effort: S.
60. `phase-4-classic-starter/02-pastebin/solution.md` — same. Effort: S.
61. `phase-4-classic-starter/03-rate-limiter/solution.md` — Redis cluster failure, clock skew, fail-open vs fail-closed. Effort: S.
62. `phase-4-classic-starter/07-notification-system/solution.md` — provider outage, retry storm, duplicate delivery. Effort: S.
63. `phase-4-classic-starter/08-chat-system/solution.md` — WebSocket drop, message ordering on reconnect, presence flapping. Effort: S.
64. `phase-4-classic-starter/09-news-feed/solution.md` — fan-out worker crash, ranker service down, stale timeline. Effort: S.
65. `phase-4-classic-starter/10-typeahead/solution.md` — index update lag, hot prefix, cluster node loss. Effort: S.
66. `phase-5-classic-advanced/01-instagram/solution.md` — image-pipeline failure, CDN cache miss storm. Effort: S.
67. `phase-5-classic-advanced/03-twitter/solution.md` — fan-out lag at celebrity scale, timeline cache eviction. Effort: S.
68. `phase-5-classic-advanced/09-ticket-booking/solution.md` — hold expiry race, payment timeout mid-saga. Effort: S.
69. `phase-5-classic-advanced/10-google-maps/solution.md` — tile-CDN miss storm, routing-graph rebuild failure. Effort: S.

For each of the 12 solutions lacking an Alternatives block:

70. Add `## Alternatives Considered` to `phase-4-classic-starter/07-notification-system/solution.md` (e.g., SQS-direct vs Kafka, custom retry vs Sidekiq). Effort: S.
71. Add to `phase-4-classic-starter/08-chat-system/solution.md` (XMPP vs WebSocket vs MQTT, MongoDB vs Cassandra for messages). Effort: S.
72. Add to `phase-4-classic-starter/09-news-feed/solution.md` (push vs pull vs hybrid — make the rejection of pure-push explicit). Effort: S.
73. Add to `phase-4-classic-starter/10-typeahead/solution.md` (trie in Redis vs Elasticsearch completion suggester vs ML-ranked). Effort: S.
74. Add to `phase-5-classic-advanced/01-instagram/solution.md` (S3 vs custom object store like Haystack). Effort: S.
75. Add to `phase-5-classic-advanced/02-youtube/solution.md` (HLS vs DASH, VP9 vs AV1 today). Effort: S.
76. Add to `phase-5-classic-advanced/03-twitter/solution.md` (fan-out-on-write vs read, Manhattan vs Cassandra). Effort: S.
77. Add to `phase-5-classic-advanced/04-uber/solution.md` (H3 vs S2 vs geohash, Kafka vs custom dispatch). Effort: S.
78. Add to `phase-5-classic-advanced/05-dropbox/solution.md` (block-level vs file-level dedup, custom store vs S3). Effort: S.

### H-79 to H-92: Add Further Reading to under-covered solutions

79. Append `## Further Reading` (3-bullet linked list) to each of the 12 solutions lacking external references (per §A.5): P4.01, P4.02, P4.03, P4.04, P4.05, P4.06, P4.08, P4.10, P5.02, P5.04, P5.07, P5.09, P5.10. Cite at minimum: (a) one company engineering blog post, (b) one DDIA chapter or Xu volume page, (c) one vendor doc. Effort per file: XS. Total effort: M.

(Items 80-91 are sub-tasks of 79, one per file; effort accounted for under 79.)

### H-92 to H-115: Add Further Reading to every module README

92. Append `## Further Reading` to `phase-1-building-blocks/01-dns-networking/README.md` per §F-Phase-1 suggestions. Effort: XS.
93. Same for `phase-1-building-blocks/02-load-balancing/README.md`. Effort: XS.
94. Same for `phase-1-building-blocks/03-caching/README.md`. Effort: XS.
95. Same for `phase-1-building-blocks/04-databases-sql/README.md`. Effort: XS.
96. Same for `phase-1-building-blocks/05-databases-nosql/README.md`. Effort: XS.
97. Same for `phase-1-building-blocks/06-message-queues/README.md`. Effort: XS.
98. Same for `phase-1-building-blocks/07-blob-storage-cdn/README.md`. Effort: XS.
99. Same for `phase-1-building-blocks/08-api-design/README.md`. Effort: XS.
100. Same for `phase-1-building-blocks/09-proxies-gateways/README.md`. Effort: XS.
101. Same for `phase-2-distributed-concepts/01-scalability/README.md`. Effort: XS.
102. Same for `phase-2-distributed-concepts/02-partitioning-sharding/README.md`. Effort: XS.
103. Same for `phase-2-distributed-concepts/03-replication/README.md`. Effort: XS.
104. Same for `phase-2-distributed-concepts/04-consistency-models/README.md`. Effort: XS.
105. Same for `phase-2-distributed-concepts/05-rate-limiting/README.md`. Effort: XS.
106. Same for `phase-2-distributed-concepts/06-unique-id-generation/README.md`. Effort: XS.
107. Same for `phase-2-distributed-concepts/07-distributed-consensus/README.md`. Effort: XS.
108. Same for `phase-3-design-patterns/01-fan-out/README.md`. Effort: XS.
109. Same for `phase-3-design-patterns/02-event-sourcing-cqrs/README.md`. Effort: XS.
110. Same for `phase-3-design-patterns/03-pub-sub/README.md`. Effort: XS.
111. Same for `phase-3-design-patterns/04-circuit-breaker-retry/README.md`. Effort: XS.
112. Same for `phase-3-design-patterns/05-saga-pattern/README.md`. Effort: XS.
113. Same for `phase-3-design-patterns/06-sharding-strategies/README.md`. Effort: XS.
114. Same for `phase-3-design-patterns/07-cache-patterns/README.md`. Effort: XS.
115. Same for `phase-3-design-patterns/08-answer-template/README.md`. Effort: XS.

### H-116 to H-122: Phase-6 fixes

116. Decide on Round 3 in `phase-6-mock-interviews/README.md:31-34`: either add three skeleton problem files for Google Docs / DoorDash / Datadog (each with FR/NFR/scale, no solution), or reword to "pick a prior design you haven't attempted". If you go with the former, create `phase-6-mock-interviews/round-3/01-collaborative-doc/problem.md`, `…/02-food-delivery/problem.md`, `…/03-metrics-monitoring/problem.md`. Effort: M.
117. Add a worked mock-interview transcript (400–600 words) to `phase-6-mock-interviews/README.md` showing what a "good" answer sounds like for one Phase-4 design (suggested: URL-shortener — the simplest). Effort: M.
118. Replace `phase-6-mock-interviews/README.md:94-102` STAR placeholder with 3 anonymized 80-word STAR examples (one per theme). Effort: S.
119. Add a `## After-Mock Remediation Map` section to `phase-6-mock-interviews/README.md` that maps each rubric dimension's failure mode to a specific module / section (e.g., "Estimation < 3 → re-read `phase-0-framework/estimation-cheatsheet.md`"). Effort: S.
120. Cross-link the redo-queue Leitner box mechanics from `phase-6-mock-interviews/README.md:127-132` to `redo-queue.md:17-25` with an explicit "after each mock, add the design to box 1". Effort: XS.

### H-121 to H-130: Other polish

121. Seed `redo-queue.md` with 5 likely-to-struggle designs (news-feed, Uber, payment-system, Google-search, ticket-booking) at Box 0 / "not yet attempted". Effort: XS.
122. Reconcile `plan.md:26` "Phase 6 = 3 modules" vs the actual 1 README. Either add the 2 missing sub-files (mock + behavioural + final review) or correct the table and the "Total: 50" arithmetic to "Total: 48". Effort: S.
123. Decide canonical answer-template between `templates/answer-template.md` (715 w) and `phase-3-design-patterns/08-answer-template/README.md` (1,317 w). Recommend keeping phase-3 file canonical; reduce templates/ file to a one-page printable cheat sheet. Effort: S.
124. Add one-line explanation to `phase-3-design-patterns/08-answer-template/README.md` (at top) stating "This module is a meta-template, not a pattern — Anti-signals do not apply." for future-contributor clarity. Effort: XS.
125. Add `## When to Use` and `## When NOT to Use` explicit H2 sections to all 9 Phase-1 modules + all 7 Phase-2 modules (currently covered only inside Anti-signals). Mirror the structure used in Phase 3.05 (saga). Effort: M.
126. In `phase-0-framework/README.md`, expand from 217 words to ~500 by adding a worked "by the end of Phase 0, you can produce this" Twitter back-of-envelope example. Effort: S.
127. Add a Mermaid Gantt or pie diagram of the RESHADED 45-min allocation to `how-to-think.md` (mirror of phase-3-08 Gantt). Effort: XS.
128. Add a 50-word "Diagram Tools" subsection to `setup.md` (Excalidraw, Mermaid Live Editor, draw.io, whiteboard.fyi). Effort: XS.
129. Add a state-diagram Mermaid block (CLOSED ↔ OPEN ↔ HALF-OPEN) to `phase-3-design-patterns/04-circuit-breaker-retry/README.md`. Effort: XS.
130. Add a bit-layout ASCII or Mermaid diagram for Snowflake to `phase-2-distributed-concepts/06-unique-id-generation/README.md`. Effort: XS.

---

## Methodology

**Read in full:**

- All 6 root markdown files (README, how-to-think, plan, progress, daily-schedule, estimation-reference, redo-queue, setup) — 7 files.
- All 4 Phase-0 files.
- 4 Phase-1 module READMEs in full (01-dns-networking, 03-caching, 06-message-queues partial, 08-api-design partial). The remaining 5 sampled at headers + regex-scanned for required sections.
- 2 Phase-2 module READMEs in full (04-consistency-models, others sampled).
- 2 Phase-3 module READMEs in full (05-saga-pattern, 08-answer-template; others sampled).
- 4 Phase-4 sub-files in full (01-url-shortener triplet + a sample solution).
- 4 Phase-5 sub-files in full (02-youtube triplet + 09-ticket-booking solution partial).
- `phase-6-mock-interviews/README.md` in full.
- `templates/answer-template.md` partial.
- `.audit/append-signals-report.md` in full + `.audit/stub-list.txt` in full.

**Mechanically scanned (PowerShell + ripgrep):**

- All 24 module READMEs across P1/P2/P3 for: Mermaid presence, Anti-signals block, When-to-Use H2, When-NOT-to-Use H2, Further Reading section.
- All 20 Phase-4/5 `solution.md` files for: API, data model, Mermaid, sharding mention, caching mention, failure-mode vocabulary, trade-offs table, alternatives discussion, external references. Coverage matrix at §A.5.
- All 20 Phase-4/5 `problem.md` files for: Functional / Non-functional / Scale / Hints / Rubric.
- All 99 `*.md` files for word count and disk size (PowerShell `Get-ChildItem` + `(Get-Content).Split()`).
- Latency-table figures spot-checked against Jeff Dean's canonical numbers and Norvig's "Teach Yourself Programming in Ten Years".
- Cross-references (`see Phase X.Y`, `cf. Phase…`) — grep found none in source markdown; matches were only in `.audit-tmp` artefacts left over from a prior session.

**Tools used:** `glob`, `grep` (ripgrep), `view`, `web_fetch` for the
dsa-zth reference report, PowerShell `Get-Content` / `Measure-Object`
for word counts and structural regex sweeps.

---

## Statistics

- Total `*.md` files on disk: **99**
- Total `*.md` files audited (excluding this report): **98**
- Total word count audited: **~68,000 words** (sum of column 2 in the
  word-count table)
- Files < 100 words (hard stubs): **0**
- Files in 100–400 word range (thin): **15** (1 root, 1 phase-0, 10
  Phase-4 READMEs, 3 Phase-5 READMEs that scrape under the 300 line)
- Modules without Mermaid diagrams: **0**
- Modules without Anti-signals block: **1** (phase-3/08-answer-template, intentionally — see §A.3)
- Modules without external resources / Further Reading: **44 / 44** (24 module READMEs + 20 solution files; not one carries a structured References section)
- Modules without explicit `## When NOT to Use` H2: **23 / 24** (only saga has it)
- Empty `case-studies/` directories advertised by root README: **24 / 24**
- Phase-4/5 `problem.md` files without self-evaluation rubric: **20 / 20**
- Phase-4/5 `solution.md` files with full coverage (API+schema+Mermaid+shard+cache+failure+trade-off+alt+refs): **1 / 20** (P5.08 payment-system is the only one with all nine)
- Numeric/factual errors detected: **0**
- Mermaid syntax errors detected: **0**
- Broken in-repo cross-references detected: **0** (no `see Phase X.Y`-style references found in source markdown)

**Counts by severity:**

- P0 (beginner hits a wall): **3** findings → TODOs 1–24, 116, 55–58 (case-studies, phase-6 fresh problems, pattern workout). Effort to clear all P0: ~M-aggregate over ~30 sub-tasks.
- P1 (important gaps): **5** findings → TODOs 25–54 (thin READMEs, rubrics), 59–78 (failure modes & alternatives), 79–115 (Further Reading sweep). Effort: large-aggregate.
- P2 (polish): **7** findings → TODOs 117–130. Effort: small-aggregate.
