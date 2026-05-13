# Case Study: LMAX — Event Sourcing, CQRS, and the Disruptor at 6 Million TPS

> How an exchange-grade trading platform achieved millions of orders per second on a single thread by treating every state change as an event and replaying it through a lock-free ring buffer.

## Context

LMAX is a UK-regulated multilateral trading facility that needed to match financial orders with **microsecond-level latency** and a deterministic audit trail. Around 2010–2011 the team rebuilt their core matching engine and published the design: Martin Fowler's bliki article "The LMAX Architecture" (2011) and the InfoQ talk "LMAX — How to Do 100K TPS at Less than 1ms Latency" (Martin Thompson, Dave Farley, 2010). They publicly reported sustained matching of **6 million orders per second** on commodity hardware. LMAX is widely cited as the **origin of practical CQRS + event-sourcing** outside academic Domain-Driven-Design literature.

## The Decision

LMAX chose **event sourcing + CQRS + single-threaded in-memory business logic** rather than a distributed database with transactions. The parent module README's "event sourcing vs CRUD; CQRS read/write separation" trade-off is the entire design ethos. The insight: a CPU core can do **billions of operations per second** if you let it stay in L1/L2 cache; sharding across threads adds locks, contention, and cache-line bouncing. So they made business logic single-threaded by construction, fed it through a **lock-free ring buffer (the Disruptor)**, and persisted every input event before processing so state could be rebuilt from the log.

## How It Works

- **Input events** (orders, cancels) arrive over the network → marshalled into a fixed-size **Disruptor ring buffer** (a pre-allocated array, no GC, mechanical-sympathy-aware).
- The ring buffer is consumed by **multiple consumers in parallel**: a journaler that writes the event to disk, a replicator that ships it to a hot standby, and the business logic processor — each at their own pace, coordinating via cursors.
- The **business logic processor is single-threaded** and runs entirely in-memory. The order book is a pure in-memory data structure; no DB, no locks.
- **Output events** (trades, fills, rejects) go into a second Disruptor ring buffer for downstream marshalling, persistence, and broadcast.
- **CQRS split**: writes go through the Disruptor + business logic; **reads (queries, analytics, reporting)** are served from **separate read models** built by replaying the event log into Postgres / search indices / Hadoop.
- **Recovery / DR**: if the primary dies, the standby (which has been consuming the same event log) takes over with up-to-the-last-replicated-event state. A cold start replays the entire event log from disk.
- Reported numbers: **~6M TPS** sustained, **<100 µs** median end-to-end latency on commodity Intel hardware (~2010-era).
- The Disruptor itself was open-sourced and remains a reference implementation of mechanical-sympathy programming.

## What Surprised Engineers

The non-obvious lesson is that **going *single-threaded on purpose* was a throughput win, not a loss**. Conventional wisdom in 2010 said "use more cores" — but the Disruptor team showed that one core with no contention beats N cores with locks for many workloads. The second surprise: **garbage collection was the enemy**. They had to pre-allocate every ring slot, intern strings, avoid `BigDecimal`, and tune the JVM aggressively because a single GC pause would blow the latency SLA. The broader lesson: event-sourcing's *replayability* is what makes the single-threaded design durable — you can lose a host and rebuild state from the log without distributed transactions.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Microsecond latency; millions of TPS on one machine | Vertical scaling only; one CPU core is the matching engine |
| Full audit log; any state at any time is reproducible from the event stream | Read models must be rebuilt on schema change — operationally expensive |
| CQRS lets reads scale independently with eventual consistency | Eventual consistency means "is my trade in the report yet?" is not instant |

## Lessons for Your Interview

- When the interviewer asks "how would you build a low-latency matching engine / accounting ledger", lead with **event sourcing + single-threaded in-memory state**.
- Mention the **Disruptor pattern (lock-free ring buffer)** explicitly; this is a memorable concrete answer.
- Sketch the **CQRS split**: writes through the event log, reads from materialized projections rebuilt asynchronously.
- Cite **GC pauses as a real-time hazard** when JVM is involved — propose pre-allocation, off-heap, or non-GC languages (Rust, C++) as mitigation.
- Use **event log as the system of record, snapshots as optimization** — replay is the recovery story.

## Sources

- "The LMAX Architecture" — Martin Fowler (2011) — https://martinfowler.com/articles/lmax.html
- "LMAX — How to Do 100K TPS at Less than 1ms Latency" — Martin Thompson, Dave Farley, InfoQ 2010 — https://www.infoq.com/presentations/LMAX/
- LMAX Disruptor (open source) — https://github.com/LMAX-Exchange/disruptor
- Greg Young, "CQRS Documents by Greg Young" (2010) — canonical CQRS write-up
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 11 on event-sourced systems
