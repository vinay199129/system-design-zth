# 03 Pub/Sub Messaging

> Pub/sub decouples producers from consumers — the backbone of every scalable, event-driven architecture.

## Why This Matters

Publish-subscribe messaging is foundational to nearly every system design interview. When an interviewer asks how services communicate asynchronously, how you handle spikes in traffic, or how you decouple microservices, pub/sub is the answer. It appears in designs for notification systems, order pipelines, real-time analytics, and log aggregation.

Interviewers expect you to distinguish between pub/sub and point-to-point queues, understand delivery guarantees, and know real AWS/GCP/Azure service names. Saying "I'd use a message queue" is not enough — you need to specify whether you mean a topic (fan-out to all subscribers) or a queue (one consumer gets each message), and why.

The SNS+SQS pattern (or its equivalents) is so common in production systems that knowing it signals real-world experience. Dead letter queues, consumer groups, and idempotency are the details that separate strong candidates from average ones.

## The Pattern

### How It Works

A **publisher** sends messages to a **topic** (or channel). All **subscribers** registered to that topic receive a copy of every message. The publisher doesn't know or care who the subscribers are.

```mermaid
flowchart TD
    P1[Order Service] -->|publish| T1[Topic: order-events]
    P2[Payment Service] -->|publish| T2[Topic: payment-events]

    T1 -->|subscribe| S1[Notification Service]
    T1 -->|subscribe| S2[Analytics Service]
    T1 -->|subscribe| S3[Inventory Service]

    T2 -->|subscribe| S1
    T2 -->|subscribe| S4[Fraud Detection Service]

    subgraph SNS_SQS["SNS + SQS Pattern (AWS)"]
        SNS[SNS Topic] --> SQS1[SQS Queue → Service A]
        SNS --> SQS2[SQS Queue → Service B]
        SNS --> SQS3[SQS Queue → Service C]
    end

    SQS1 -.->|failed messages| DLQ1[Dead Letter Queue A]
    SQS2 -.->|failed messages| DLQ2[Dead Letter Queue B]
```

**Point-to-Point Queue:** Each message is consumed by exactly one consumer. Used for task distribution (e.g., processing jobs).

**Topic-Based Pub/Sub:** Each message is delivered to ALL subscribers. Used for event notification and fan-out.

### Delivery Guarantees

| Guarantee | Behavior | Example |
|---|---|---|
| **At-most-once** | Fire and forget. Messages may be lost. | UDP, basic webhooks |
| **At-least-once** | Retry until acknowledged. Duplicates possible. | SQS, Kafka (default) |
| **Exactly-once** | Each message processed exactly once. | Kafka with idempotent consumers (expensive) |

In practice, **at-least-once + idempotent consumers** is the standard approach. Exactly-once is extremely expensive and rarely necessary.

### Variations

**Consumer Groups (Kafka):** Multiple consumers in a group share partitions. Each message goes to exactly one consumer in the group, enabling parallel processing with ordering guarantees per partition.

**Fan-Out via SNS+SQS:** SNS topics fan out to multiple SQS queues. Each queue has its own retry policy, dead letter queue, and scaling. This is the standard AWS pattern for decoupled microservices.

**Dead Letter Queues (DLQ):** Messages that fail processing after N retries are moved to a DLQ for manual inspection or automated reprocessing. Always include DLQs in your design.

## When to Use This Pattern

| Signal in Interview | Apply This Pattern |
|---|---|
| "Services need to communicate asynchronously" | Pub/sub for event-driven decoupling |
| "Multiple services care about the same event" | Topic-based pub/sub (fan-out) |
| "Process tasks from a work queue" | Point-to-point queue with consumer groups |
| "Handle traffic spikes gracefully" | Queue as a buffer between producer and consumer |
| "Design a notification system" | Pub/sub topic per event type |

## Trade-offs

| Pros | Cons |
|---|---|
| Full decoupling — producers don't know consumers | Eventual consistency (messages have latency) |
| Independent scaling of producers and consumers | Message ordering is hard across partitions |
| Built-in buffering for traffic spikes | Debugging distributed flows is complex |
| Easy to add new consumers without changing producers | Exactly-once delivery is expensive |
| Retry and DLQ for fault tolerance | Additional infrastructure to manage |

## Real-World Examples

- **Amazon:** SNS+SQS for order processing. Order events fan out to fulfillment, billing, notification, and analytics services via separate queues.
- **Netflix:** Uses Apache Kafka for real-time event streaming. Viewing events flow to recommendation, analytics, and billing pipelines.
- **Uber:** Kafka for trip events. Every trip state change is published to topics consumed by pricing, ETA, driver matching, and analytics services.

## Interview Cheat Sheet

- **Topic** = fan-out to all subscribers. **Queue** = one consumer per message.
- Default to **at-least-once delivery + idempotent consumers**. Mention this explicitly.
- Always include **dead letter queues** for failed messages.
- **SNS+SQS** (AWS) or **Pub/Sub + Cloud Functions** (GCP) are standard patterns — use real service names.
- **Consumer groups** enable parallel processing while maintaining per-partition ordering.
- Pub/sub introduces **eventual consistency** — acknowledge this trade-off.
- Messages should be **small** (metadata + IDs). Large payloads go in object storage with a reference in the message.

## Common Interview Questions

1. "How do services communicate in your design?" — Pub/sub for events, queues for tasks.
2. "What if a consumer is down?" — Messages queue up. DLQ catches repeated failures. Consumer resumes on recovery.
3. "How do you ensure a message isn't processed twice?" — Idempotency keys. Consumer checks if the event ID was already processed.
4. "How do you handle message ordering?" — Partition by entity ID (e.g., order_id). Ordering within a partition is guaranteed.

## Deep Dive: Solving the Duplicate Message Problem

At-least-once delivery means consumers will occasionally receive the same message twice. The standard solution is **idempotency**: every message carries a unique `event_id`, and consumers maintain an idempotency store (e.g., a Redis set or database table of processed IDs). Before processing, the consumer checks if the `event_id` exists — if yes, skip it. For database operations, use **upsert** semantics or **idempotency keys** on the write. In interviews, state this pattern clearly: "All my consumers are idempotent — they check a deduplication store before processing, so at-least-once delivery is safe."

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

---

### Intuition

Pub/sub is the message-bus pattern: producers don't know who consumes, consumers don't know who produces, and the broker routes by topic. It's the cheapest way to add a feature later — drop in a new subscriber and it sees every event without anyone updating the producer. The flip side: with no coupling, you have no built-in flow control. If a consumer falls behind, the broker just stockpiles messages until you fix it (or run out of disk). Knowing how to detect and recover from lag is the senior-engineer signal here.

### Worked Example: Kafka consumer lag math

Producer: 50,000 msg/s. Consumer group total throughput: 30,000 msg/s.

**Lag growth rate:**

```
dL/dt = produce_rate − consume_rate = 50,000 − 30,000 = 20,000 msg/s
Over 1 minute: 1.2 M backlog
Over 1 hour:   72 M backlog (likely exceeds retention or disk)
```

**Detection:** Kafka exposes `consumer_lag` per partition. Alert when lag exceeds a threshold (e.g., > 100k or > 5 min of work).

**Recovery:** autoscale the consumer group from 12 → 24 workers. New throughput = 60,000 msg/s. Now consumers can both drain the backlog *and* keep up with new arrivals.

**Time-to-recover after autoscale fires at T=0:**

```
T = 0  s: autoscaler triggers, lag has grown to ~100k during 5 s detection.
T = 30 s: new workers fully warmed up, consume rate = 60,000/s.
          Lag at this point = 100k + 20k × 30 = 700k (still growing during warmup!)
Drain rate (steady) = 60,000 − 50,000 = 10,000/s
Time to drain 700k at 10k/s = 70 s
Total recovery = 30 s warmup + 70 s drain = 100 s
```

| Phase | Duration | Lag at end |
|---|---|---|
| Detection | 0–5 s | 100k |
| Autoscale + warmup | 5–35 s | 700k |
| Drain | 35–105 s | 0 |
| **Total** | **~100 s** | back to steady state |

**Surprise:** the warmup phase *increases* lag because new workers aren't yet ready — autoscaling on absolute lag alone is too slow. **Lesson:** pre-warm the consumer pool (over-provision by 20–30 %) and trigger autoscale on **lag rate**, not just absolute lag. If you wait for backlog to be visible, recovery already costs 100+ seconds.

### Further Reading

- Narkhede, Shapira & Palino, *Kafka: The Definitive Guide* — ch. 4 covers consumer groups and lag in depth.
- [Confluent Documentation — Monitoring Kafka clients](https://docs.confluent.io/platform/current/kafka/monitoring.html) — what to alert on.
- Jay Kreps — [*The Log: What every software engineer should know about real-time data's unifying abstraction*](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) (LinkedIn Engineering, 2013) — the foundational essay.

