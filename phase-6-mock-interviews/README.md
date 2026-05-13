# Phase 6: Mock Interviews & Review (Days 55-60)

> The final 6 days. Two mocks a day, retrospectives each evening. By Day 60 you should be able to answer any of the 10 prompts below cold in 45 minutes.

## How to Run a Mock

- Open [`templates/answer-template.md`](../templates/answer-template.md) and the timer on the dashboard.
- Pick a prompt below at random; do NOT prepare.
- Speak out loud as if to an interviewer. If alone, record yourself on webcam — watching the replay surfaces ums, silences, and skipped steps you can't feel in the moment.
- Stop the timer at 45 minutes regardless of completion.
- Self-score using the rubric below. Save the score and notes in your `/review` journal.

## The 10 Mock Prompts

A mix of Easy / Medium / Hard. Most are deliberately *not* in the Phase 4-5 canon, so you can't lean on a memorised solution.

| # | Prompt | Difficulty | Time | What to nail |
|---|---|---|---|---|
| 1 | Design a service that lets a streamer chat with their audience (10K concurrent viewers, ~200 msg/s per stream). | Easy | 45m | WebSocket fan-out + presence + back-pressure |
| 2 | Design Stripe's idempotency-key system for the `POST /charges` endpoint. | Medium | 45m | Idempotency table + retry semantics + TTL |
| 3 | Design a vehicle-tracking service for a fleet of 100K trucks reporting GPS every 5 s. | Medium | 45m | Time-series DB + GeoHash + downsampling |
| 4 | Design a real-time fraud-detection system for credit-card transactions with a < 50 ms inline budget. | Hard | 45m | Online ML scoring + feature store + shadow-mode rollout |
| 5 | Design a metering system that bills SaaS customers per API call (3 B calls/day, must be reconcilable to the cent). | Hard | 45m | Event log + aggregation + reconciliation + late-arriving events |
| 6 | Design a search-typeahead service with personalised suggestions for 100M users. | Hard | 45m | Trie / FST + per-user model + edge cache |
| 7 | Design a real-time leaderboard for a viral mobile game (Top-100 across 10M players, updated continuously). | Medium | 45m | Sorted-set + sharded counters + write-coalescing |
| 8 | Design GitHub Actions: CI worker fleet, queue, artifact storage, log streaming. | Hard | 45m | Queue + sandbox isolation + artifact CDN + live-log fan-out |
| 9 | Design a feature-flag service consumed by 1,000 microservices with sub-second propagation. | Medium | 45m | Config store + edge cache + pub-sub invalidation |
| 10 | Design a distributed cron scheduler with **no missed jobs and no double-fires** (10K jobs/min). | Hard | 45m | Consensus (Raft / etcd) + idempotency + DLQ |

After each mock, log: (1) the prompt, (2) your score, (3) the single weakest area, (4) the one concrete drill you'll do tomorrow to fix it.

## Scoring Rubric

5 criteria × 5 points = 25 total. Same rubric appears in [`templates/answer-template.md`](../templates/answer-template.md#self-scoring-rubric-reference-from-phase-6) — Phase 6 is just where you actually use it.

| Criterion | 0 (poor) | 3 (average) | 5 (strong) |
|---|---|---|---|
| **Requirements** | Did not gather; jumped to drawing boxes | Got functional reqs; missed non-functional | FRs + 3 NFRs with numbers (DAU, latency, consistency, geo) |
| **High-Level Design** | Single monolithic box or unlabeled cloud | 3-4 generic boxes, vague arrows | 5-7 boxes with labeled arrows + at least one API contract per critical hop |
| **Deep Dive** | None or hand-waved | 1 deep area, weak math | 1-2 deep areas with concrete numbers (e.g., "Redis cluster needs 12 shards because…") |
| **Trade-offs** | None mentioned | 1 weak trade-off | 3 concrete trade-offs with named alternatives (Cassandra vs DynamoDB; push vs pull fan-out; etc.) |
| **Time mgmt** | Ran out of time or finished 10+ min over | Within ±5 min of each milestone | On the dot, with a clean summary in the last 2 min |

### Scoring outcomes

- **≥ 20** — interview-ready. Spend remaining days on polish: speed, diagrams, behavioural prep.
- **15-19** — solid foundation. Drill the *single weakest* criterion across all four mocks before adding new ones.
- **< 15** — re-do the last two weeks of Phase 4-5 in compressed form. Don't add new designs until your floor lifts.

## STAR Behavioural Prompts

Senior-level rounds (L5/L6+) intermix system-design with behavioural signal. Practise STAR (Situation → Task → Action → Result, with metrics) on these five canonical prompts:

1. **Hardest technical decision in the past 2 years.** Walk through the trade-off, the alternative you rejected, and the result with a number.
2. **A time you disagreed with an architect or tech lead.** Surface the disagreement, how you escalated or resolved it, and what shipped.
3. **A postmortem you led.** Root cause, the action items, and how you measurably prevented recurrence.
4. **A system you wish you'd designed differently.** What would you change, why, and what's the migration cost / risk.
5. **A time you mentored someone on system design or distributed systems.** The learner's gap, your approach, the observable outcome.

Time-box each story to 90 seconds. Write them out once; then practise speaking them.

## Pairing Protocol (optional, for pairs)

If you're studying with a peer for Days 55-60:

- Take turns being **interviewer** and **interviewee** — 45 min each round, two rounds per day.
- Interviewer reads the prompt fully, then transcribes the interviewee's drawing on a shared whiteboard. **Do not coach during the round** — only ask the kind of follow-up questions a real interviewer would.
- After the round: interviewer scores against the rubric out loud. Spend 5 min discussing the lowest-scoring criterion before the swap.
- Swap roles. Two mocks per day × 6 days = **12 reps each** before Day 60.

## Time Budgets per Phase Day

| Day | Schedule |
|---|---|
| 55 | Mock #1 + retrospective + clear any redo-queue items |
| 56 | Mock #2 + STAR practice (×2 stories) |
| 57 | Mock #3 + estimation drills (back-of-envelope worksheet) |
| 58 | Mock #4 + STAR practice (×2 stories) |
| 59 | Mock #5 + review the three weakest designs from Phase 4-5 |
| 60 | Final mock + STAR (×3 stories) + retrospective journal entry: *what changed since Day 1?* |

## Per-Phase Time Budget Inside a Single 45-Minute Mock

Use the dashboard timer or a wristwatch. Glance at it at each milestone; recover quickly if you're behind — better to skim than to skip a phase.

| Phase | Window | Goal |
|---|---|---|
| Requirements | 0:00 – 5:00 | FRs + NFRs on the whiteboard, with numbers |
| Estimation | 5:00 – 10:00 | QPS, storage, bandwidth |
| High-Level Design | 10:00 – 25:00 | Box diagram + API contracts |
| Deep Dive | 25:00 – 40:00 | 1-2 components with math |
| Trade-offs + Wrap | 40:00 – 45:00 | 3 trade-offs, summary, "what I'd change with 10× traffic" |

## What To Do After Day 60

1. **Keep mocking** — 2-3 full mocks per week until interview day. Skill decays fast without reps.
2. **Pair with a friend** — practise with someone who asks unscripted follow-ups; that's where the muscle is built.
3. **Work the redo queue** — revisit weak designs on a spaced-repetition cadence (3-day, 7-day, 21-day intervals).
4. **Cross-train** — pair with [DSA Zero to Hero](https://vinay199129.github.io/dsa-zth/) so coding rounds don't undo your system-design prep.

## Interview-Day Checklist

The morning of the real interview, run through this list once. Most candidates fail not on knowledge but on logistics:

- [ ] Whiteboard / drawing tool tested 30 min before. Pen works. Camera frames the board.
- [ ] Water within reach. Phone on Do-Not-Disturb.
- [ ] One-page cheat sheet of latency numbers + QPS conversion table beside the keyboard.
- [ ] Two STAR stories rehearsed last night, fresh in working memory.
- [ ] First thing you'll say written down: *"Let me make sure I understand the requirements correctly..."*

Good luck. The reps you put in over Days 1-60 are the only thing that matter once the round starts — trust them.
