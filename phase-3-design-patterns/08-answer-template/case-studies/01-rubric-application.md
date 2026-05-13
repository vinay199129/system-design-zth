# Case Study: Rubric Application — A Worked "Design Twitter" Walkthrough

> A self-referential case study: how a candidate's "Design Twitter" interview answer scores against the answer-template rubric, with the moves that earn each section's points.

## Context

This case study is the meta-template of the series: rather than walking through a production system, it walks through **a candidate using the answer template in a real interview**. The setup: a senior-engineer system-design loop at a FAANG-tier company. Prompt: *"Design Twitter."* Time budget: **45 minutes**. The candidate uses the RESHADED framework (Requirements → Estimation → Storage → High-level → API → Detailed → Evaluation → Done) defined in this repo's `templates/answer-template.md` and `phase-0-framework/how-to-think.md`. The interviewer is silently scoring against the rubric — clarification, estimation, trade-off reasoning, depth, and wrap-up.

## The Decision

The candidate's first decision is to **not start drawing boxes**. The parent module README's "anti-patterns to avoid" list explicitly flags jumping to architecture before requirements. Instead they spend the first 3 minutes asking clarifying questions: "Are we designing the timeline, tweet posting, search, or all three?" "Read-heavy or write-heavy?" "Global scale or one region?" The interviewer narrows scope to **tweet posting + home timeline + follow graph** at **300M DAU, ~150k tweets/sec peak**. This single act of scoping converts a 100-minute problem into a 45-minute one and earns the **Requirements** section's full marks.

## How It Works

The candidate's 45-minute trace:

- **Min 0–3 — Functional requirements**: 3 core features (post tweet, view home timeline, follow). 1 deferred (search). Stated aloud.
- **Min 3–5 — Non-functional**: 200 ms p95 timeline read, 99.99 % availability, eventual consistency on timeline (acceptable), strong on follow.
- **Min 5–10 — Estimation**: 300M DAU × 5 tweets/day → **~17k tweets/sec average, ~150k peak**. Avg follower count ~200 → fan-out **~3M timeline writes/sec average**. Tweet ~300 bytes → **~5 GB/day**, **~2 TB/year**.
- **Min 10–25 — High-level design**: client → LB → API gateway → tweet service / timeline service / fan-out service → MySQL (sharded by user_id) + Redis (timelines) + Kafka (event bus) + blob store (media). Mermaid-style box drawing.
- **Min 25–35 — Deep dive: fan-out**. Candidate proposes **hybrid fan-out** (push for regular users, pull for celebrities) — citing the Twitter case study by name. Sketches Redis sorted-set timeline capped at 800 entries, celebrity threshold ~1M followers.
- **Min 35–40 — Deep dive: storage**. Sharded MySQL (user_id) for follow graph and tweets; Redis for timelines; S3 for media. Mentions **Snowflake-style 64-bit IDs**.
- **Min 40–43 — Bottlenecks & failure modes**: Redis hot-shard on celebrities → mitigation: read replicas + per-region cache. Fan-out queue backlog under spikes → mitigation: backpressure, drop-old-tweets policy for inactive users.
- **Min 43–45 — Trade-offs & summary**: chose eventual consistency on timeline to enable cache-aside; would revisit if requirements changed to "guaranteed see all tweets in order".

## What Surprised Engineers

The non-obvious lesson — and the one most candidates miss — is that **the rubric heavily weights *trade-off articulation*, not novelty**. The candidate above didn't invent anything; every component is in the textbook. What scored was **stating the trade-off out loud at each decision** ("I'm choosing Redis sorted sets here, costing memory but giving O(log n) inserts; the alternative is a write-optimized log which would slow reads"). The second surprise: **estimation done early constrains all later decisions**. A candidate who skips estimation can't justify "sharded MySQL" vs "single Postgres" — the 150k QPS number forces the decision, and saying that aloud earns points.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Following the RESHADED order keeps the candidate from skipping requirements/estimation | Rigid order can feel mechanical if interviewer wants to jump ahead |
| Citing concrete case studies (Twitter hybrid fan-out, Snowflake IDs) signals depth | Risks sounding rehearsed if the candidate can't justify *why* those apply here |
| Naming trade-offs out loud at every decision earns rubric points | Slows pace; must be balanced against the 45-min budget |

## Lessons for Your Interview

- **Spend the first 5 minutes on requirements + estimation** — non-negotiable. The numbers anchor every later choice.
- **Verbalize trade-offs at every fork**: "I'd pick X over Y because, at our scale of Z, …". Silent decisions don't score.
- **Cite real systems by name** (Twitter hybrid fan-out, Snowflake IDs, Vitess sharding) — interviewers recognize them and credit production awareness.
- **Always discuss failure modes** in the last 5 minutes; rubric explicitly weights "what happens when this breaks".
- **End with an explicit summary**: "To recap, the key decisions are A, B, C; the main trade-offs are X, Y; if requirements changed to Z, I'd revisit B".

## Sources

- `templates/answer-template.md` and `phase-0-framework/how-to-think.md` in this repo
- Alex Xu, *System Design Interview, Vol. 1* (2020) — Chapter 4 "Design Twitter"
- Phase-3 fan-out case study: `phase-3-design-patterns/01-fan-out/case-studies/01-twitter-hybrid-fanout.md`
- Phase-2 unique-id case study: `phase-2-distributed-concepts/06-unique-id-generation/case-studies/01-twitter-snowflake.md`
- "System Design Interview Mock Rubric" — Pramp / Interviewing.io public materials
