# Case Study: Uber — Cadence and Temporal for Saga-Style Distributed Transactions

> How Uber built a durable workflow engine to coordinate multi-step business processes across dozens of microservices, replacing ad-hoc retry logic and brittle two-phase commits with explicit sagas.

## Context

By 2017 Uber's marketplace was a sprawl of microservices: a ride request touched dispatch, pricing, payments, fraud, driver-matching, and notifications, each owned by a different team. The pain point: business flows that spanned services (sign-up, payments, refunds, driver onboarding) were each implemented with bespoke retry queues, state machines in Postgres, and "did this side effect actually happen?" reconciliation jobs — a category of code that **silently lost trips, double-charged riders, or stuck onboarding flows**. Uber Engineering published "Cadence: The Only Workflow Platform You'll Ever Need" (2018) describing the in-house workflow engine; in 2019 the original authors forked it as the open-source **Temporal**.

## The Decision

Uber chose **explicit durable workflows with saga semantics** rather than distributed two-phase commit. The parent module README's "saga vs 2PC; orchestration vs choreography" trade-off is the entire pivot. 2PC was rejected because it requires every participant to support `prepare` and locks resources across services — unworkable across teams. Sagas — sequences of local transactions with **explicit compensating actions** for each step — are the practical model. Cadence/Temporal make sagas durable by **persisting every workflow event (decisions, activities, signals)** to a backing store (Cassandra/Postgres/MySQL), so a workflow can survive worker crashes and resume exactly where it left off.

## How It Works

- **Workflow definition**: a function in Java/Go/TypeScript/Python that orchestrates a business process — call activity A, wait for signal, call activity B, on failure run compensation C.
- The workflow function is **deterministic**: re-executing from the persisted event history yields the same decisions. Side effects happen only in **activities** (RPC calls, DB writes, sends).
- **Activities** are arbitrary code with built-in **retry policies** (initial interval, backoff coefficient, max attempts, max interval).
- **Saga pattern**: each forward step registers a **compensating action**; on failure, the workflow runs compensations in reverse order.
- **Event history** is persisted per workflow to the backing DB; a workflow can be **paused, queried, signaled, and resumed** at any point — even days later.
- **Durable timers**: workflows can `sleep` for arbitrary durations (seconds to years) without holding worker threads — the timer is persisted, the worker is freed.
- Scale at Uber: **millions of workflows in flight** at any time; Cadence cluster sharded across thousands of cassandra-backed history shards.
- Worker pool is **horizontally scalable**: any worker can pick up any workflow task because state lives in the cluster, not the worker.
- Temporal's commercial cloud and the open-source project are the modern continuation.

## What Surprised Engineers

The non-obvious lesson is that **the determinism requirement on workflow code is genuinely surprising to developers**. You can't call `Math.random()`, `time.Now()`, or talk to a database directly in workflow code — only in activities — because a future replay must produce identical decisions. New users routinely violate this and get "non-determinism error" stack traces; the fix is to push every source of nondeterminism into an activity. The second surprise: **compensations are not transactions** — they're best-effort and can themselves fail, requiring their own retries and dead-letter handling. Engineers expecting "saga = 2PC with prettier syntax" learn the hard way that **eventual consistency is the actual semantic**.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Workflows survive crashes; no lost trips, no orphaned state | Workflow code must be deterministic — a real developer-experience tax |
| Compensations make multi-step business processes explicit, testable | Compensations can fail; need dead-letter handling and human-intervention paths |
| Same engine handles seconds-long and months-long workflows | Operational complexity: Cadence/Temporal cluster + Cassandra is a serious dependency |

## Lessons for Your Interview

- When asked "how would you handle distributed transactions", reach for **sagas with compensating actions**, not 2PC.
- Sketch **orchestrated** sagas (one coordinator workflow) for clarity in interviews; mention **choreographed** sagas (event-driven, no central coordinator) as the alternative.
- Use **Cadence / Temporal** by name as the production workflow engine when interviewers ask for a concrete tool.
- Mention **idempotency keys on every activity** as the foundation that makes retries safe — without idempotency, saga retries cause double-charges.
- Cite **determinism + event history replay** as the mechanism that makes workflow durability work — it's the design's central trick.

## Sources

- Uber Engineering: "Cadence: The Only Workflow Platform You'll Ever Need" (2018) — https://www.uber.com/blog/cadence-microservice-architecture/
- Temporal documentation and "Designing Workflows" guide — https://docs.temporal.io/
- "Sagas" — Hector Garcia-Molina and Kenneth Salem, 1987 — original paper, https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf
- Caitie McCaffrey, "Distributed Sagas: A Protocol for Coordinating Microservices" — 2017 talks
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 9 on transactions across services
