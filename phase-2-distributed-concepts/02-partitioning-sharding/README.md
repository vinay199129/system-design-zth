# 02 Partitioning & Sharding

> Sharding splits data across multiple machines so no single database becomes a bottleneck — it's how systems like Google, Facebook, and Uber handle petabytes of data.

## Why This Matters

When your database can no longer handle the write volume on a single machine (even after read replicas, caching, and query optimization), sharding is the answer. Interviewers expect you to know *how* to partition data, *which strategy* to choose, and the *consequences* of each approach — especially hotspots, rebalancing, and cross-shard queries.

Sharding appears in nearly every large-scale design: "Design a chat system" requires sharding messages by conversation ID; "Design a social network" requires sharding user data; "Design a URL shortener" requires sharding the URL mappings. Understanding consistent hashing — the dominant sharding strategy in modern distributed systems — separates strong candidates from average ones.

This topic connects directly to replication (Module 03), consistency (Module 04), and unique ID generation (Module 06), making it a linchpin of distributed systems knowledge.

## How It Works

### Hash-Based Partitioning

Apply a hash function to the partition key and use modulo to assign to a shard: `shard = hash(key) % N`. Simple, but **rebalancing is catastrophic** — changing N reshuffles almost every key.

### Range-Based Partitioning

Assign contiguous ranges of keys to each shard (e.g., A-F → Shard 1, G-M → Shard 2). Simple to understand, supports range queries, but prone to **hotspots** if some ranges are accessed more than others.

### Consistent Hashing

The industry-standard approach. Nodes and keys are placed on a hash ring. Each key is assigned to the first node encountered clockwise on the ring. Adding or removing a node only affects its immediate neighbors, minimizing data movement.

```mermaid
graph TD
    subgraph Hash Ring
        direction TB
        R[" "]
    end

    N1["Node A<br/>(position 0°)"] ---|owns 0°-89°| R
    N2["Node B<br/>(position 90°)"] ---|owns 90°-179°| R
    N3["Node C<br/>(position 180°)"] ---|owns 180°-269°| R
    N4["Node D<br/>(position 270°)"] ---|owns 270°-359°| R

    K1(["Key 'user_42'<br/>hash → 45°"]) -.->|assigned to| N2
    K2(["Key 'user_99'<br/>hash → 200°"]) -.->|assigned to| N4
    K3(["Key 'user_7'<br/>hash → 350°"]) -.->|assigned to| N1

    style N1 fill:#4A90D9,color:#fff
    style N2 fill:#D94A4A,color:#fff
    style N3 fill:#49B265,color:#fff
    style N4 fill:#D9A34A,color:#fff
```

**Virtual nodes** solve load imbalance: each physical node gets multiple positions on the ring (e.g., 150 virtual nodes each). This smooths out the distribution. Amazon's Dynamo and Apache Cassandra both use this approach.

### Directory-Based Partitioning

A separate lookup service maps each key to its shard. Maximum flexibility (any mapping logic), but the directory becomes a single point of failure and a potential bottleneck. Used when partition logic is complex or changes frequently.

## Key Concepts

| Concept | Description | When to Use |
|---------|-------------|-------------|
| Hash partitioning | `hash(key) % N` | Simple, uniform distribution, no range queries needed |
| Range partitioning | Key ranges per shard | Need range queries (time-series, alphabetical) |
| Consistent hashing | Keys and nodes on a hash ring | Dynamic cluster membership, minimal rebalancing |
| Virtual nodes | Multiple ring positions per physical node | Fix load imbalance in consistent hashing |
| Directory-based | Lookup table maps keys → shards | Complex or frequently changing partition logic |
| Composite partitioning | Combine strategies (e.g., range + hash) | Multi-tenant systems, complex access patterns |

## Trade-offs

| Approach A | Approach B | Choose A When | Choose B When |
|-----------|-----------|--------------|--------------|
| Hash partitioning | Range partitioning | Uniform access, no range queries | Need range scans (dates, IDs) |
| Consistent hashing | Simple modulo hash | Cluster size changes often | Fixed cluster size, simplicity preferred |
| Single shard key | Composite shard key | One dominant access pattern | Multiple access patterns (e.g., by user AND by time) |
| Application-level sharding | Proxy-based sharding | Full control, custom logic | Transparent to application, managed (e.g., Vitess) |

## Hotspot Mitigation Strategies

Hotspots occur when one shard receives disproportionate traffic. Common causes and fixes:

| Cause | Example | Mitigation |
|-------|---------|------------|
| Celebrity problem | Justin Bieber's profile on a user-sharded DB | Cache hot keys, add read replicas for that shard |
| Temporal skew | All writes go to "current day" shard | Add random suffix to partition key, aggregate later |
| Poor key choice | Sharding by country → US shard gets 60% traffic | Choose higher-cardinality key or composite key |
| Hash collision | Multiple hot keys hash to same shard | Virtual nodes, better hash function |

## Rebalancing Strategies

| Strategy | How It Works | Downside |
|----------|-------------|----------|
| Fixed partitions | Pre-create many partitions (e.g., 1000), assign groups to nodes | Hard to change partition count later |
| Dynamic splitting | Split a partition when it exceeds a size threshold | Complexity, momentary unavailability during split |
| Consistent hashing | Add node to ring, only neighbors rebalance | Vnodes needed for even distribution |
| Manual | Operator decides when and how to rebalance | Slow, error-prone, doesn't scale |

## Interview Cheat Sheet

- **Always specify your shard key** and justify why it distributes evenly.
- Consistent hashing with virtual nodes is the default answer for most distributed systems.
- Cross-shard queries are expensive — design your shard key to co-locate data accessed together.
- Mention **scatter-gather** pattern for queries that must span shards (but note it's slow).
- Secondary indexes on sharded data: local (per-shard, fast writes) vs global (cross-shard, fast reads).
- Resharding is painful — over-provision partitions upfront when possible.
- **Real examples:** DynamoDB uses consistent hashing; Cassandra uses vnodes; Vitess manages MySQL sharding for YouTube.

## Common Interview Questions

1. "How would you shard a user database?" — By `user_id` using consistent hashing. Co-locate user data to avoid cross-shard joins.
2. "What if one shard gets too hot?" — Identify the hot key, cache it, or split the shard. Virtual nodes help prevent this.
3. "How do you handle cross-shard queries?" — Scatter-gather: query all shards in parallel, merge results. Avoid if possible through smart key choice.
4. "What happens when you add a new shard?" — With consistent hashing, only adjacent keys migrate. With modulo hash, everything reshuffles — unacceptable.
5. "How does Cassandra distribute data?" — Consistent hashing with virtual nodes. Each node owns multiple token ranges on the ring.

## Deep Dive: Consistent Hashing in Practice

**Amazon DynamoDB** popularized consistent hashing in its 2007 Dynamo paper. Key design decisions:

1. **Ring with virtual nodes:** Each physical node gets ~150 virtual nodes on the ring, ensuring even distribution even with heterogeneous hardware.
2. **Replication on the ring:** Each key is replicated to the next N-1 nodes clockwise, giving both partitioning and replication in one mechanism.
3. **Preference list:** The list of nodes responsible for a key. Skips positions that map to the same physical node to ensure replicas land on different machines.
4. **Coordinator node:** The first node in the preference list handles the request and coordinates with replicas.

**Practical impact:** When a node joins or leaves, only ~1/N of the data needs to move. Compare this to modulo hashing where all data reshuffles — at scale, this difference is the difference between a 30-second rebalance and a multi-hour outage.

**Interview tip:** Draw the ring. Interviewers love seeing you sketch the hash ring, place nodes, show where a key lands, then demonstrate what happens when a node is added. It's one of the most effective whiteboard explanations in system design.

---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic is the right tool if you see:

- **"Writes exceed what one database can absorb"** (millions of writes/sec, multi-TB working set) — sharding is the answer; replication does not scale writes.
- **"Per-user / per-tenant data with a natural shard key"** (user_id, tenant_id, conversation_id) — clean partitioning by that key avoids cross-shard joins.
- **"Add and remove nodes with minimum data movement"** — consistent hashing with virtual nodes.
- **"Time-series data with rolling windows / TTL"** — range-shard by time so old shards can be dropped wholesale.
- **"Hot key suspicion"** (celebrity, trending item, single tenant dominates traffic) — call out hot-key mitigation (split, replicate, route).

### Anti-signals (looks like this topic, isn't)

- **"Read-heavy, write-light single DB at 80% capacity"** — read replicas first; sharding is operationally heavy and premature.
- **"Need cross-shard transactions on most writes"** — sharding makes transactions painful; either reshape the schema, denormalize, or use a globally consistent DB (Spanner).
- **"Dataset is < 100 GB and fits in RAM on one node"** — sharding adds complexity with no payoff; vertical scale or read replicas.

---

### Intuition

Sharding is what you do when a single machine can no longer hold or serve your data — you split rows by some key and put each split on its own machine. The whole game is the **shard key**: pick well and traffic spreads evenly; pick badly and one shard handles 80 % of the load while the others nap. The deepest trap is *celebrities* — accounts so popular they dominate a single shard no matter how you slice — and *time-correlated hot keys* like "today's date" or "current month".

### Worked Example: Picking a shard key for Uber rides

You're sharding the `trips` table. Three candidate keys:

| Candidate | Write skew | Cross-shard query cost | Celebrity / hot-city risk |
|---|---|---|---|
| `rider_id` | Low — riders take 1–4 trips/day | "All trips in city X today" → fan-out across all shards | None (no single rider dominates) |
| `(city, day)` | **High** — NYC on NYE = single shard meltdown | "Rider's trip history" → fan-out; "city throughput dashboard" → 1 shard ✅ | **Severe** (peak cities × peak days collide) |
| `trip_id` (random/snowflake) | Lowest — uniform | Both rider-history and city-feed fan out | None |

**Working through New Year's Eve in NYC.** Suppose NYC accounts for 1 % of US trip volume on an average *day*, but during the ball drop it surges to 10× that for two hours.

```
Average NYC/day:       1% × 1M US trips/day = 10,000 trips/day = 7 trips/min
NYE peak hour at 10×:  100,000 trips/hour   = 1,700 trips/min = 28 writes/sec
Sustained ball-drop minute (10× of peak hour): ~280 writes/sec
```

For `(city='NYC', day='2024-12-31')`, that single partition takes **~300 sustained writes/sec with 2k+ peak**, while every other shard naps. A shard sized for 50k writes/sec total can survive — but you've paid for 50 shards' capacity to serve one.

**The actual production answer:** `rider_id` as the primary shard key, with a **secondary materialised view** indexed by `(city, hour)` for analytics. Uniform write distribution; accept fan-out on the rare city-dashboard query.

**Surprise:** "logical" keys like `(city, day)` look natural and almost always lose. **Lesson:** pick the shard key for the *write pattern*, not the read pattern. Denormalize or replicate for reads.

### Further Reading

- [Vitess — Sharding documentation](https://vitess.io/docs/user-guides/configuration-basic/sharding/) — YouTube's MySQL-at-scale layer; `vindex` design.
- DDIA ch. 6 — partitioning by key range vs hash, with secondary indexes.
- [Slack Engineering — Scaling Datastores at Slack with Vitess](https://slack.engineering/scaling-datastores-at-slack-with-vitess/) — real shard-key evolution.
- [Discord — How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages) — choosing partition keys under hot-key pressure.

