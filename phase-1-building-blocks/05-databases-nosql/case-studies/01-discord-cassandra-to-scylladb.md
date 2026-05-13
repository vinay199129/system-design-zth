# Case Study: Discord — Migrating Trillions of Messages from Cassandra to ScyllaDB

> How Discord moved a 177-node Cassandra cluster carrying trillions of chat messages to ScyllaDB to escape JVM garbage-collection tails and hot-partition pain.

## Context

By 2022 Discord stored **trillions of chat messages** in a Cassandra cluster of **177 nodes**, with the message service handling sustained read throughput in the **millions of operations per second**. The pain point was not capacity but **latency variance**: GC pauses on the JVM produced p99 spikes into hundreds of milliseconds, and a small number of "hot" channels (megachannels with hundreds of thousands of members) created hot partitions that hammered specific nodes. Discord engineering had documented their original move from MongoDB to Cassandra in 2017 and now described the move from Cassandra to **ScyllaDB** (a C++ Cassandra-compatible engine) in the 2023 post "How Discord Stores Trillions of Messages".

## The Decision

Discord chose ScyllaDB rather than DynamoDB or a custom storage engine because they wanted to **keep the Cassandra wide-column data model and CQL query surface** while eliminating JVM tail latency. The parent module README's wide-column vs document vs key-value matrix maps directly: messages are naturally a wide column (partition by channel, clustering by message ID), and the access pattern (range-scan recent messages in a channel) is ideal for Cassandra-family stores. They also rewrote their data service in **Rust** with a custom **request coalescing layer** ("data services") in front of ScyllaDB to absorb fan-out from hot channels.

## How It Works

- Partition key: **channel_id**; clustering key: **bucket + message_id (Snowflake)**, so messages within a channel are stored in time-ordered SSTables.
- Buckets group messages into ~10-day windows to bound partition size and avoid the classic Cassandra "infinite partition" anti-pattern.
- ScyllaDB cluster: smaller node count than the Cassandra fleet (Discord publicly described **moving from 177 Cassandra nodes to 72 ScyllaDB nodes**), each with more cores and NVMe SSDs.
- ScyllaDB uses a **shard-per-core** thread-per-core architecture (Seastar framework) with no shared state — each CPU owns a slice of the data and never contends on locks.
- **Replication factor 3** across availability zones; **LOCAL_QUORUM** for both reads and writes.
- Discord's Rust data service in front of ScyllaDB does **request coalescing**: if 1,000 users in a megachannel all request the same recent messages simultaneously, only one request hits ScyllaDB.
- p99 read latency reportedly **dropped from tens of milliseconds (Cassandra) to single-digit milliseconds (ScyllaDB)** post-migration.
- Migration ran **in parallel**: dual-write to both clusters, backfill historical data, then cut reads over channel-by-channel.

## What Surprised Engineers

The single biggest win was not raw throughput — it was the **disappearance of GC-correlated tail latency spikes** across the whole fleet. With the JVM-based Cassandra, p99 latency was a smooth-but-tall curve; with ScyllaDB it became flat. The non-obvious lesson: at large scale, **p99.9 dominates the user experience**, and removing a single source of jitter (GC) can be worth more than 10× the raw throughput. A second surprise: ScyllaDB's tighter scheduling exposed bad client patterns (unbounded concurrency from one bad service) that the JVM's GC had been masking by slowing everyone down equally.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Flat p99 latency, no GC tail spikes | New operational tooling (Scylla Manager) and team retraining |
| ~60 % fewer nodes for the same workload | Migration required dual-writes and months of backfill |
| Same CQL surface — no application schema rewrite | Smaller community than Cassandra; vendor support is more concentrated |

## Lessons for Your Interview

- When asked to design a chat-history store, default to **wide-column with (channel, bucket, message_id) partitioning** and explain bucketing as the way to bound partition size.
- Mention **request coalescing / single-flight** at the service layer in front of any NoSQL store — it dominates the cost curve for hot keys.
- Use **GC tail latency** as a concrete reason to prefer C/C++/Rust storage engines at very high QPS; this beats vague "we'd use NoSQL" hand-waving.
- Sketch a migration as **dual-write → backfill → shadow-read → cutover**; never just "switch".
- Reference Discord's 177 → 72 node consolidation as evidence that thread-per-core engines are not just faster, they're operationally cheaper.

## Sources

- Discord Engineering: "How Discord Stores Trillions of Messages" (2023) — https://discord.com/blog/how-discord-stores-trillions-of-messages
- Discord Engineering: "How Discord Stores Billions of Messages" (2017) — https://discord.com/blog/how-discord-stores-billions-of-messages
- ScyllaDB docs: shard-per-core architecture — https://www.scylladb.com/product/technology/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 3 on LSM storage engines and tail-latency sources
