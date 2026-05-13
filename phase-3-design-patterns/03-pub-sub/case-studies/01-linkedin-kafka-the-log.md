# Case Study: LinkedIn Kafka — Pub/Sub as the Central Nervous System

> How LinkedIn invented Kafka to replace a tangle of point-to-point pipelines, and why Jay Kreps's "the log" essay reframed pub/sub as the foundation of an entire data platform.

## Context

By 2010, LinkedIn was running dozens of point-to-point data pipelines: profile updates → search index, profile updates → analytics, profile updates → graph cache, and so on. Each new consumer required a new pipeline; each producer had to know about all downstream systems; failure of one consumer could backpressure the producer. The team built **Kafka** (open-sourced 2011) as a high-throughput, durable, replayable pub/sub log. Jay Kreps's 2013 LinkedIn engineering essay "The Log: What every software engineer should know about real-time data's unifying abstraction" reframed Kafka not as a queue but as **the immutable log at the center of a company's data architecture**.

## The Decision

LinkedIn chose a **partitioned, replicated, append-only log with pull-based consumers** rather than a traditional broker like ActiveMQ/RabbitMQ. The parent module README's "queue vs log; topic vs partition; push vs pull" trade-offs are exactly the design space. The insight: a **log is a queue you can rewind**, which solves three problems at once — adding a new consumer requires no producer change (subscribe to existing topic), replaying past events for a backfill is just resetting the offset, and consumer outages don't backpressure producers (the log absorbs the lag). Partitioning gives horizontal scale; replication gives durability; the broker stays dumb and fast.

## How It Works

- **Topic** = logical stream, split into **partitions** for parallelism; **partition** = ordered, immutable, append-only log on disk.
- Producers write to a topic; broker appends to the assigned partition (by key hash or round-robin).
- Consumers **pull** at their own pace, tracking their position via a **consumer offset** stored back in Kafka (a special internal topic `__consumer_offsets`).
- **Replication**: each partition has `N` replicas (typically 3), one leader and `N-1` followers; producers can wait for `acks=all` (all in-sync replicas).
- **Consumer groups**: a group of consumers cooperatively divides partitions of a topic; adding a consumer rebalances partitions automatically.
- **Retention**: time-based (`retention.ms`, e.g., 7 days) or size-based; **compacted topics** retain only the latest value per key — turning the log into a snapshot.
- LinkedIn-reported scale (~2019): **>7 trillion messages/day** across the LinkedIn cluster; **petabytes** of data; thousands of topics.
- Producer throughput on commodity hardware: **hundreds of thousands of records/sec per broker** with batching and compression.
- ZooKeeper used historically for metadata/leader election; KRaft (Kafka-native Raft) replaces ZooKeeper from Kafka 2.8+ for cluster metadata.

## What Surprised Engineers

The non-obvious lesson — and the central thesis of "The Log" — is that **the log is more useful than the queue**. Traditional message queues delete messages after delivery; consumers had no way to recover from a bug. Once Kafka let consumers rewind, entire patterns emerged: **change-data-capture (CDC)** feeding multiple sinks, **kappa architecture** (one streaming pipeline instead of batch+stream), **event-sourcing at company scale**. A second surprise: **the broker stays simple by pushing complexity to consumers** — Kafka brokers don't track per-consumer state, route messages, or filter. That deliberate minimalism is what lets one broker handle hundreds of thousands of writes per second.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| New consumers added with zero producer change | Consumers must implement idempotency; at-least-once is the default |
| Replayable log → debugging, backfills, multiple sinks from one topic | Disk usage grows with retention; tuning retention is a real ops job |
| Broker is dumb and fast — no per-message routing logic | Broker doesn't filter / transform — stream processors (Kafka Streams, Flink) bolted on top |

## Lessons for Your Interview

- For any decoupling design, propose **a partitioned log (Kafka)** as the central bus and explain partitions = parallelism, replication = durability.
- Cite **"the log is a queue you can rewind"** when justifying Kafka over RabbitMQ/SQS — interviewers love the framing.
- Sketch **consumer groups** as the mechanism for parallel processing within a topic.
- Mention **compacted topics** when the use case is "latest value per key" (e.g., user-profile-update stream).
- Use Jay Kreps's "Kafka as company-wide nervous system" framing when discussing event-driven architecture at scale.

## Sources

- "The Log: What every software engineer should know about real-time data's unifying abstraction" — Jay Kreps, LinkedIn Engineering (2013) — https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
- Kafka: a Distributed Messaging System for Log Processing — Kreps, Narkhede, Rao, NetDB 2011 — https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf
- LinkedIn Engineering: "How LinkedIn customizes Apache Kafka for 7 trillion messages per day" (2019) — https://engineering.linkedin.com/blog/2019/apache-kafka-trillion-messages
- "I Heart Logs" — Jay Kreps, O'Reilly 2014 (book)
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 11 on stream processing
