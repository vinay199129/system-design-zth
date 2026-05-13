# Case Study: Uber — Kafka as a Four-Trillion-Message-Per-Day Backbone

> How Uber runs one of the world's largest Kafka deployments, the regional/aggregate topology that ties datacenters together, and the rebalance pain that comes with it.

## Context

By 2022 Uber's Kafka fleet processed **more than 4 trillion messages per day** across thousands of topics, supporting use cases from real-time pricing and ETA prediction to trip-state events and analytics. Uber Engineering published "uReplicator: Uber Engineering's Robust Apache Kafka Replicator" (2018) and a follow-up "Reliable Reprocessing of Events in Uber Marketplace" plus the 2019 "Disaster Recovery for Multi-Region Kafka" post describing the architecture. The pain point that drove the design was that any single regional Kafka cluster outage or AWS-zone failure could stall ride dispatch globally — a $-per-minute problem.

## The Decision

Uber chose **per-region Kafka clusters federated via uReplicator (later xDC replication)** rather than a single global cluster, because a global cluster would have meant cross-region producer latency on every write. The parent module README's "message broker vs log" and "at-least-once vs exactly-once" trade-offs apply: Uber accepts **at-least-once** delivery and pushes idempotency to consumers, because exactly-once across regions would have required two-phase commit and crushed throughput. They also operate **aggregate clusters** that mirror events from multiple regions for global analytics and ML training.

## How It Works

- **Regional clusters**: each AWS region hosts its own Kafka cluster sized to that region's traffic; producers always write locally (sub-ms p50).
- **uReplicator / xDC replication** mirrors selected topics between regions and into a global **aggregate cluster** used by Hadoop/Spark/Flink jobs.
- **>4 trillion messages/day** as of 2022; thousands of topics, **hundreds of thousands of partitions** in aggregate.
- **Replication factor 3** per topic, `min.insync.replicas=2`, `acks=all` for durable topics.
- **Schema Registry** (Avro/Protobuf) enforces backward-compatible evolution; producers cannot publish a schema-breaking change.
- **Chaperone** — Uber's auditing system — tags each message with a checksum so loss/duplication across uReplicator hops is detectable end-to-end.
- Consumers commit offsets to the local cluster; on regional failover, applications resume from the mirrored offsets via tooling that maps **source-offset → destination-offset**.
- Heavy use of **compacted topics** for state stores (driver location, trip state) so consumers can rebuild state by replaying.
- A dedicated team operates a **self-service Kafka platform** — internal customers create topics via API, never directly via `kafka-topics.sh`.

## What Surprised Engineers

The most painful operational reality was **partition rebalancing**: adding brokers to a large cluster triggered a stop-the-world rebalance that could move terabytes of data over hours and degrade producer latency for the duration. Uber's response was to (a) cap individual cluster size in favor of more clusters, (b) build tooling around **Cruise Control** for incremental, throttled rebalances, and (c) treat any topic with >1,000 partitions as a code smell. The lesson: Kafka's scale-up story is rougher than its docs suggest, and the practical answer is "more, smaller clusters", not "one big one".

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Local writes are fast and survive remote-region outages | Cross-region consumers see replication lag, sometimes seconds during incidents |
| At-least-once + idempotent consumers scales linearly | Every consumer must implement dedup; this is non-negotiable engineering hygiene |
| Aggregate cluster centralizes analytics without burdening regional clusters | uReplicator and Chaperone are extra moving parts to operate |

## Lessons for Your Interview

- When asked for a multi-region event bus, sketch **regional Kafka + cross-region mirror + aggregate cluster** rather than "one global Kafka".
- Default to **at-least-once + idempotent consumers** and call out exactly-once as expensive; this signals production realism.
- Mention **Cruise Control** and bounded-cluster-size as the answer to "how do you scale Kafka horizontally?" — naïve answers say "add brokers" without acknowledging rebalance cost.
- Cite **schema registry + backward-compatible evolution** when discussing data-quality on a streaming bus; this is the difference between Kafka-as-database and Kafka-as-toy.
- Use 4 trillion msgs/day as your reference number; it sets a credible upper bound on what a single company runs on Kafka.

## Sources

- Uber Engineering: "uReplicator: Uber Engineering's Robust Apache Kafka Replicator" (2018) — https://www.uber.com/blog/ureplicator-apache-kafka-replicator/
- Uber Engineering: "Disaster Recovery for Multi-Region Kafka" (2019) — https://www.uber.com/blog/kafka/
- Uber Engineering: "Enabling Seamless Kafka Async Queuing with Consumer Proxy" (2021)
- LinkedIn Cruise Control — https://github.com/linkedin/cruise-control
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 11 on stream processing and exactly-once
