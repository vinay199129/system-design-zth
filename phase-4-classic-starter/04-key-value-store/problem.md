# Problem: Design a Distributed Key-Value Store

## Requirements

### Functional

- `put(key, value)` — store a key-value pair
- `get(key)` — retrieve the value for a given key
- `delete(key)` — remove a key-value pair
- Keys and values are arbitrary byte arrays
- Support configurable consistency levels (strong, eventual, quorum)

### Non-Functional

- Scale: Horizontally scalable to hundreds of nodes
- Latency: p99 read/write < 10ms
- Availability: 99.99% — must handle node failures gracefully
- Partition tolerance: Must continue operating during network partitions
- Durability: Data must survive node crashes

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Data size | 100 TB+ |
| Key size | Up to 256 bytes |
| Value size | Up to 1 MB |
| Read QPS | 500K |
| Write QPS | 200K |
| Nodes | 50-200 |
| Replication factor | 3 |

## Hints

### Hint 1

To distribute data across N nodes, you need a partitioning strategy. Simple modulo hashing breaks when nodes are added or removed. Think about what hashing scheme minimizes data movement during scaling events.

### Hint 2

With 3 replicas, you need a protocol to decide when a write is "committed." Consider quorum-based approaches: if you write to W nodes and read from R nodes, what relationship between W, R, and N guarantees you read the latest write?

### Hint 3

When a node goes down and comes back, its data might be stale. You need a mechanism to detect and repair inconsistencies. Think about how you can efficiently compare the data on two nodes without transferring all of it.

## Think About

- What happens when two clients write to the same key at the same time on different nodes?
- How do you add a new node without making existing data unavailable?
- What happens during a network partition — do you prioritize consistency or availability?
- How do you detect that a node has failed vs just being slow?
- How do you handle a value that is too large (1 MB) differently from a small one (100 bytes)?
