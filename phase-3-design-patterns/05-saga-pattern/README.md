# 05 Saga Pattern

> When you can't use a distributed transaction, sagas coordinate multi-service workflows with compensating rollbacks.

## Why This Matters

The saga pattern appears in any interview involving transactions that span multiple services — e-commerce checkout, travel booking, money transfers, or order fulfillment. The moment your design has "Service A writes, then Service B writes, then Service C writes," the interviewer will ask: "What if Service C fails? How do you roll back A and B?"

You cannot use traditional ACID transactions across microservices. Two-phase commit (2PC) is too slow and creates tight coupling. Sagas are the industry-standard alternative. Knowing the difference between choreography and orchestration — and when to use each — is a strong differentiator.

Interviewers also test your understanding of **compensating transactions** — the logic required to undo a completed step. This is where many candidates struggle, because compensating actions are not simply "delete the row." They're domain-specific operations that restore business invariants.

## The Pattern

### How It Works

A **saga** is a sequence of local transactions across services. Each step either succeeds and triggers the next step, or fails and triggers **compensating transactions** for all previously completed steps.

```mermaid
flowchart TD
    Start([Order Placed]) --> S1[Step 1: Reserve Inventory]
    S1 -->|success| S2[Step 2: Process Payment]
    S2 -->|success| S3[Step 3: Arrange Shipping]
    S3 -->|success| Done([Order Confirmed])

    S3 -->|failure| C2[Compensate: Refund Payment]
    C2 --> C1[Compensate: Release Inventory]
    C1 --> Failed([Order Failed])

    S2 -->|failure| C1b[Compensate: Release Inventory]
    C1b --> Failed

    subgraph Orchestrator["Saga Orchestrator"]
        SO[Saga Execution<br/>Coordinator]
        SO -.->|commands| S1
        SO -.->|commands| S2
        SO -.->|commands| S3
        SO -.->|compensate| C1
        SO -.->|compensate| C2
    end
```

### Choreography vs Orchestration

**Choreography:** Each service listens for events and decides what to do next. No central coordinator. Services publish events that trigger the next step.
- Pros: Loose coupling, simple for small workflows.
- Cons: Hard to track saga state, difficult to debug, implicit flow logic.

**Orchestration:** A central **Saga Execution Coordinator (SEC)** directs the workflow. It tells each service what to do and handles failures.
- Pros: Clear flow logic, easy to monitor, centralized error handling.
- Cons: Single point of coordination (mitigate with redundancy), tighter coupling to the orchestrator.

**Rule of thumb:** Use choreography for 2-3 step sagas. Use orchestration for 4+ steps or complex branching logic.

### Compensating Transactions

Each forward step must have a defined compensating action:

| Forward Step | Compensating Action |
|---|---|
| Reserve inventory | Release reserved inventory |
| Charge credit card | Issue refund |
| Create shipping label | Cancel shipment |
| Send confirmation email | Send cancellation email |

Compensating actions must be **idempotent** — they may be invoked more than once during retries.

### Variations

**Parallel Sagas:** Independent steps execute in parallel (e.g., reserve inventory AND validate address simultaneously). Compensation waits for all parallel steps.

**Nested Sagas:** A step in one saga triggers a child saga. Parent saga compensates by aborting the child saga.

## When to Use This Pattern

| Signal in Interview | Apply This Pattern |
|---|---|
| "Multi-service transaction" (order, booking, transfer) | Saga with orchestration |
| "What if step 3 fails after step 1 and 2 succeed?" | Compensating transactions |
| "Design an e-commerce checkout pipeline" | Saga across inventory, payment, shipping |
| "Design a travel booking system" | Saga across flights, hotels, car rentals |
| "How do you handle partial failures?" | Saga with defined rollback steps |

## When NOT to Use This Pattern

- **Single-service transactions:** Use regular database ACID transactions.
- **Read-only operations:** No state changes to compensate.
- **Simple two-step flows:** A retry or idempotent write may suffice.
- **When strong consistency is required:** Sagas provide eventual consistency. If you need immediate consistency, consider a synchronous approach with 2PC (if latency is acceptable).

## Trade-offs

| Pros | Cons |
|---|---|
| Maintains data consistency across services | Eventually consistent — intermediate states are visible |
| No distributed locks or 2PC | Compensating logic is complex and domain-specific |
| Each service owns its own data | Debugging saga failures requires centralized logging |
| Scales well in microservice architectures | Idempotency required for all steps and compensations |

## Real-World Examples

- **Amazon:** Order processing uses orchestrated sagas. The order orchestrator coordinates inventory, payment, fraud check, and fulfillment services.
- **Uber:** Trip lifecycle is a saga — rider request, driver matching, trip start, trip end, payment. Each step has compensating actions for cancellations.
- **Booking.com:** Hotel reservation sagas coordinate room holds, payment authorization, and confirmation across hotel partner APIs.

## Interview Cheat Sheet

- Sagas = sequence of local transactions + compensating transactions for rollback.
- **Choreography** for simple flows (2-3 steps). **Orchestration** for complex flows (4+ steps).
- Every forward step needs a **compensating action** — define these explicitly.
- Sagas are **eventually consistent** — intermediate states are visible to users.
- Compensating actions must be **idempotent**.
- Use a **saga log** (persistent state machine) to track progress and recover from orchestrator failures.
- Don't forget the **SEC failure case** — the orchestrator itself must be recoverable (persist saga state to a durable store).

## Common Interview Questions

1. "How do you handle distributed transactions across microservices?" — Sagas with orchestration.
2. "Design an order checkout flow" — Saga across inventory, payment, and shipping.
3. "What if the payment succeeds but shipping fails?" — Compensating transaction: refund the payment, release inventory.
4. "Choreography or orchestration — when do you pick each?" — Choreography for simple event chains, orchestration for complex multi-step workflows.

## Deep Dive: Saga State Recovery

The orchestrator maintains a **saga log** — a persistent record of which steps completed and which are pending. If the orchestrator crashes mid-saga, it reads the log on recovery and resumes from the last completed step. This log is typically stored in a durable database with the saga state machine (states: STARTED, STEP_N_COMPLETE, COMPENSATING, COMPLETED, FAILED). Each transition is written atomically. In interviews, mention this explicitly: "The saga orchestrator persists its state so it can recover from crashes and resume or compensate correctly."
