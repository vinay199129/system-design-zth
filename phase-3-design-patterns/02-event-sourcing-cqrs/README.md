# 02 Event Sourcing & CQRS

> Instead of storing current state, store every change that ever happened — then derive any view you need.

## Why This Matters

Event sourcing and CQRS appear in interviews for systems requiring audit trails, temporal queries, or complex domain logic. When an interviewer asks you to design a banking system, order management platform, or collaborative editor, these patterns should surface naturally. They signal that you understand the limitations of CRUD and can reason about data models beyond simple row updates.

CQRS (Command Query Responsibility Segregation) often accompanies event sourcing but is independently useful. Any time your read and write patterns have drastically different performance requirements, CQRS is the answer. This comes up in e-commerce (high-volume reads for product pages, lower-volume writes for orders) and analytics systems.

Interviewers test these patterns to evaluate whether you can handle complexity without over-engineering. Knowing when NOT to use event sourcing is as important as knowing when to use it.

## The Pattern

### How It Works

**Event Sourcing:** Instead of storing the current state of an entity, you store an append-only sequence of events that describe every change. The current state is derived by replaying events from the beginning (or from a snapshot).

**CQRS:** Separate the write model (commands that produce events) from the read model (materialized views optimized for queries). Events flow from the write side to the read side through an event bus.

```mermaid
flowchart LR
    subgraph WriteSide["Write Side (Commands)"]
        C[Client Command] --> CS[Command Service]
        CS --> V[Validate & Apply]
        V --> ES[(Event Store<br/>Append-Only Log)]
    end

    ES --> EB[Event Bus]

    subgraph ReadSide["Read Side (Queries)"]
        EB --> P1[Projection: User Profile View]
        EB --> P2[Projection: Analytics View]
        EB --> P3[Projection: Search Index]
        P1 --> RDB1[(Read DB 1)]
        P2 --> RDB2[(Read DB 2)]
        P3 --> RDB3[(Search Engine)]
    end

    Q[Client Query] --> RDB1
```

**Event Replay:** To rebuild state, replay all events for an entity. To create a new read model, replay the entire event log through a new projection.

**Snapshots:** For entities with many events, periodically save a snapshot of the current state. Replay only events after the snapshot.

### Variations

**Pure Event Sourcing:** No separate read store. Current state is always computed by replaying events. Simple but slow for read-heavy systems.

**Event Sourcing + CQRS:** Events are the source of truth on the write side. Multiple read-optimized projections are maintained asynchronously. This is the production-grade approach.

**CQRS Without Event Sourcing:** Separate read and write databases, but the write side uses traditional CRUD. Simpler to implement when you don't need full event history.

## When to Use This Pattern

| Signal in Interview | Apply This Pattern |
|---|---|
| "Design a banking / payment system" | Event sourcing for audit trail + CQRS for balance queries |
| "Design an order management system" | Event sourcing for order lifecycle tracking |
| "Need complete audit history" | Event sourcing is the natural fit |
| "Read and write patterns differ wildly" | CQRS to independently scale read/write |
| "Design a collaborative editor" | Event sourcing for operation log / conflict resolution |
| "Undo/redo functionality needed" | Event sourcing — replay minus the undone event |

## Trade-offs

| Pros | Cons |
|---|---|
| Complete audit trail for free | Eventual consistency between write and read models |
| Replay events to build any view | Event schema evolution is painful |
| Temporal queries ("state at time T") | Increased storage requirements |
| Independent scaling of read/write | Higher complexity — two models to maintain |
| Natural fit for event-driven architectures | Not worth it for simple CRUD applications |

## Real-World Examples

- **Banking Systems:** Every transaction is an event (deposit, withdrawal, transfer). Account balance is derived by summing events. Regulators require this level of auditability.
- **LinkedIn:** Uses event sourcing for activity feeds. Each user action is an event that feeds into multiple projections (feed, notifications, analytics).
- **Walmart:** CQRS for product catalog — separate write path for inventory updates from the read path serving millions of product page views.

## Interview Cheat Sheet

- Event sourcing stores **events**, not state. The event store is append-only.
- CQRS = different models for reads and writes. They can use different databases.
- **Snapshots** prevent slow replay for entities with thousands of events.
- Read models are **eventually consistent** — call this out and explain why it's acceptable.
- Use event sourcing when you need **auditability, temporal queries, or event replay**.
- Don't propose event sourcing for a simple CRUD app — interviewers will question your judgment.

## Common Interview Questions

1. "Design a banking ledger system" — Event sourcing for transaction log, CQRS for balance/statement views.
2. "How do you handle schema changes in the event store?" — Upcasting (transform old events to new schema on read) or versioned event types.
3. "What happens if the read model gets out of sync?" — Rebuild from event store by replaying all events.
4. "How do you query the current balance?" — Read from the materialized view, not by replaying events on every request.

## Deep Dive: Event Schema Evolution

The hardest operational challenge with event sourcing is evolving event schemas over time. When `OrderPlaced_v1` needs a new field, you have three strategies: (1) **Upcasting** — transform old events to the new schema at read time, (2) **Versioned events** — store both `v1` and `v2`, projections handle both, (3) **Copy-and-transform** — migrate the event store by rewriting events (rarely done, breaks immutability). In interviews, mention upcasting as the default approach and explain that the event store itself remains immutable — transformations happen in the projection layer.
