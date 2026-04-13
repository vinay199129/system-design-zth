# Problem: Design a Distributed Cache (Redis)

## Requirements

### Functional

- Clients can GET, SET, and DELETE key-value pairs.
- Keys support TTL (time-to-live) for automatic expiration.
- Support multiple eviction policies (LRU, LFU, random).
- Data is partitioned across multiple nodes for horizontal scaling.
- Data is replicated for fault tolerance (survive single-node failures).
- Cluster supports adding and removing nodes without downtime.

### Non-Functional

- **Latency:** p99 < 1ms for GET/SET operations.
- **Throughput:** Support 1M+ operations/sec per node.
- **Availability:** 99.99% — cache should survive node failures without data loss.
- **Scalability:** Scale linearly with added nodes, support 100+ node clusters.
- **Consistency:** Configurable — strong consistency for some use cases, eventual for others.
- **Memory efficiency:** Maximize useful data per GB of RAM.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Total cluster memory | 10 TB |
| Nodes in cluster | 100 |
| Memory per node | 100 GB |
| Operations per second (cluster) | 100 million |
| Average key size | 50 bytes |
| Average value size | 500 bytes |
| Key-value pairs stored | ~18 billion |
| Network round trip (intra-cluster) | < 0.5ms |
| Replication factor | 3 |
| Acceptable data loss window | 1 second (async replication lag) |

## Hints

### Hint 1: Data Partitioning

You need to distribute 18 billion keys across 100 nodes. Simple modular hashing (key % N) breaks when you add or remove nodes — nearly all keys remap. Consistent hashing with virtual nodes minimizes key movement. How many virtual nodes per physical node? How do you handle hot keys?

### Hint 2: Replication Strategy

Each key is stored on a primary node and replicated to 2 followers. If the primary fails, a follower is promoted. But what about the writes received by the old primary that hadn't been replicated yet? Think about sync vs. async replication trade-offs.

### Hint 3: Eviction Under Memory Pressure

When a node is at 100% memory capacity and a new SET arrives, something must be evicted. LRU (Least Recently Used) is the most common strategy — but maintaining a perfect LRU order for billions of keys is expensive. How does Redis approximate LRU? What are the alternatives?

## Think About

- How does a client know which node holds a given key? Client-side routing, proxy, or redirect?
- What happens during a network partition? Does the cache prioritize consistency or availability?
- How do you handle "hot keys" where one key receives 10% of all traffic?
- How do you implement TTL expiration efficiently without scanning all keys?
- What persistence options exist? When should you use them vs. treating the cache as purely ephemeral?
- How do you handle cluster-wide operations like "flush all" or "get cluster stats"?
