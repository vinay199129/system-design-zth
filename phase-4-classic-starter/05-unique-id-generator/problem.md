# Problem: Design a Unique ID Generator

## Requirements

### Functional

- Generate globally unique IDs across all servers
- IDs must be sortable by time (roughly ordered)
- IDs must be numeric (fit in a 64-bit integer)
- Must support generating 10,000+ IDs per second per server
- No centralized coordination (single point of failure)

### Non-Functional

- Scale: 10K IDs/sec per node, 100+ nodes
- Latency: < 1ms per ID generation
- Availability: 99.999% — ID generation cannot be a bottleneck
- Uniqueness: Zero collisions guaranteed (not probabilistic)
- Ordering: IDs generated later should be numerically larger

## Constraints & Scale

| Metric | Value |
|--------|-------|
| IDs per second (total) | 1M+ |
| Nodes | 100-1000 |
| IDs per node per second | 10K |
| ID size | 64 bits |
| ID lifetime | Forever (never recycled) |
| Clock drift tolerance | < 5ms between nodes |

## Hints

### Hint 1

A 64-bit integer gives you a lot to work with. Think about dividing those 64 bits into segments: some bits for time, some for the machine, some for a sequence number. This is the core idea behind Twitter's Snowflake.

### Hint 2

If you embed a millisecond timestamp in the most significant bits, your IDs are automatically sortable by time. How many bits do you need for a timestamp to last 69 years?

### Hint 3

With 10 bits for machine ID (1024 machines) and 12 bits for sequence (4096 IDs per millisecond per machine), you can generate 4M+ IDs per second per machine. Do the math: is that enough?

## Think About

- What happens if the system clock moves backward (NTP adjustment)?
- How do you assign machine IDs — statically or dynamically?
- What are the pros and cons of UUID v4 vs Snowflake vs database auto-increment?
- Can you guarantee strict ordering across different machines?
- How would you extend this to multiple data centers?
