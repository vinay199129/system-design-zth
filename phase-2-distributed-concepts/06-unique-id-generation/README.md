# 06 Unique ID Generation

> Generating unique IDs in distributed systems is deceptively complex — you need uniqueness, sortability, and high availability without a single point of failure.

## Why This Matters

Every distributed system needs unique identifiers: user IDs, order IDs, message IDs, transaction IDs. In a single-server world, an auto-incrementing database column works fine. In a distributed world with multiple servers, databases, and data centers, you need a strategy that guarantees uniqueness without coordination — and ideally produces IDs that are sortable by time.

"Design a unique ID generator" is a direct interview question at Twitter, Meta, and Uber. It also appears as a sub-problem in nearly every design: "How do you generate IDs for URLs in a URL shortener?" or "How do you order messages in a chat system?" Understanding the trade-offs between UUID, Snowflake, and database-based approaches is essential.

The deeper insight interviewers look for: ID generation connects to clock synchronization (a fundamental distributed systems challenge), database indexing (random UUIDs fragment B-trees), and system availability (centralized generators are single points of failure).

## How It Works

### UUID (Universally Unique Identifier)

128-bit identifiers, usually represented as 32 hex characters. UUIDv4 is randomly generated — no coordination needed.

**Pros:** No coordination, any server can generate. **Cons:** 128 bits is large (wasted index space), not sortable by time, poor database index locality (random values fragment B-trees).

### Auto-Increment with Database

Use a single database with `AUTO_INCREMENT`. Simple and sortable, but the database is a single point of failure and a throughput bottleneck.

**Multi-master variant:** Two databases, one generates odd IDs (1, 3, 5...), the other even (2, 4, 6...). Removes single point of failure but IDs aren't globally sorted by time.

### Database Ticket Server (Flickr's Approach)

Flickr used a dedicated MySQL server as a "ticket server" that hands out IDs. Two servers for redundancy (odd/even). Simple and battle-tested, but the ticket server can become a bottleneck and is an extra dependency.

### Twitter Snowflake

The industry-standard approach for distributed, time-sorted unique IDs. A 64-bit ID composed of:

```mermaid
graph LR
    subgraph Snowflake ID — 64 bits
        direction LR
        A["0<br/><i>Sign</i><br/>1 bit"] --> B["Timestamp<br/><i>ms since epoch</i><br/>41 bits"]
        B --> C["Datacenter ID<br/>5 bits"]
        C --> D["Machine ID<br/>5 bits"]
        D --> E["Sequence<br/><i>per-ms counter</i><br/>12 bits"]
    end

    subgraph Capacity
        T["41 bits → ~69 years"]
        DC["5 bits → 32 datacenters"]
        M["5 bits → 32 machines/DC"]
        S["12 bits → 4096 IDs/ms/machine"]
    end

    B -.-> T
    C -.-> DC
    D -.-> M
    E -.-> S

    style A fill:#888,color:#fff
    style B fill:#4A90D9,color:#fff
    style C fill:#49B265,color:#fff
    style D fill:#D9A34A,color:#fff
    style E fill:#D94A4A,color:#fff
```

**Properties:**
- **64 bits** — fits in a long integer, efficient for indexing.
- **Time-sorted** — IDs generated later are always larger (within clock accuracy).
- **No coordination** — each machine generates IDs independently using its datacenter+machine ID.
- **4,096 IDs per millisecond per machine** — extremely high throughput.
- **~69 years** of timestamps before overflow.

### ULID (Universally Unique Lexicographically Sortable Identifier)

128-bit IDs with a 48-bit timestamp prefix and 80-bit random suffix. Encoded in Crockford's Base32 (26 characters). Lexicographically sortable, compatible with UUID storage, and no coordination needed.

**Compared to UUIDv4:** Same size, but sortable and has better index locality.

## Comparison Table

| Method | Bits | Sortable | Coordination | Throughput | Index Friendly |
|--------|------|----------|--------------|------------|----------------|
| UUIDv4 | 128 | No | None | Unlimited | Poor (random) |
| UUIDv7 | 128 | Yes | None | Unlimited | Good (time-prefix) |
| Auto-increment | 32-64 | Yes | DB required | DB-limited | Excellent |
| Ticket server | 64 | Yes | Server required | Server-limited | Excellent |
| Snowflake | 64 | Yes | Clock sync only | 4096/ms/machine | Excellent |
| ULID | 128 | Yes | None | Unlimited | Good |

## Clock Synchronization — The Hidden Problem

Snowflake and any timestamp-based ID scheme depend on synchronized clocks. If a machine's clock drifts backward (after NTP correction), it could generate IDs with timestamps in the past, violating the sortability guarantee or — worse — duplicating IDs.

| Problem | Cause | Mitigation |
|---------|-------|------------|
| Clock drift | NTP correction jumps clock back | Snowflake: refuse to generate IDs until clock catches up |
| Clock skew between machines | Different NTP sync times | Use GPS/atomic clocks (Google Spanner) or tolerate small skew |
| Leap seconds | UTC adjustment | Smear leap seconds over 24h (Google's approach) |

## Key Concepts

| Concept | Description | When to Use |
|---------|-------------|-------------|
| Snowflake ID | 64-bit: timestamp + machine + sequence | Default for most distributed systems |
| UUIDv4 | 128-bit random | No sortability needed, maximum simplicity |
| UUIDv7 | 128-bit with Unix timestamp prefix | Drop-in UUID replacement with sortability |
| ULID | 128-bit time-sorted, Base32 encoded | Need sortable UUIDs with URL-safe encoding |
| Ticket server | Centralized ID dispenser | Small scale, simple systems |
| Epoch choice | Custom epoch reduces timestamp bits needed | Extend ID lifetime (Twitter uses 2010-11-04) |

## Trade-offs

| Approach A | Approach B | Choose A When | Choose B When |
|-----------|-----------|--------------|--------------|
| Snowflake (64-bit) | UUID (128-bit) | Storage efficiency matters, need sortability | No coordination at all, UUID compatibility required |
| Centralized ticket server | Decentralized Snowflake | Very small system, simplicity | Scale, no single point of failure |
| Time-sorted IDs | Random IDs | Need ordering (feeds, logs, events) | Need unpredictability (security tokens) |
| UUIDv7 | ULID | Standard UUID format required | Need shorter string representation |

## Interview Cheat Sheet

- **Default answer: Snowflake.** 64-bit, sortable, no coordination, high throughput. Explain the bit layout.
- UUIDs are 128 bits — that's twice the storage and index space of Snowflake. Mention this trade-off.
- **Random UUIDs fragment B-tree indexes** — inserts scatter across pages, causing write amplification. Time-sorted IDs avoid this.
- Always state your **requirements** first: uniqueness, sortability, size, throughput, availability.
- If the interviewer asks about security (e.g., "can someone guess the next ID?"), Snowflake IDs are predictable — use random IDs or encrypted IDs for user-facing URLs.
- Mention **clock synchronization** as a real-world challenge for Snowflake — it shows distributed systems depth.

## Common Interview Questions

1. "Design a unique ID generator for a distributed system." — Snowflake: 64-bit with timestamp, datacenter, machine, sequence. Explain bit allocation.
2. "Why not just use UUID?" — 128 bits wastes space, not sortable (B-tree fragmentation), not time-ordered.
3. "What if the clock goes backward?" — Snowflake waits until the clock catches up. Log an alert. Refuse to generate IDs to prevent duplicates.
4. "How does Twitter generate tweet IDs?" — Snowflake: 41-bit timestamp (ms since custom epoch 2010-11-04) + 10-bit machine ID + 12-bit sequence.
5. "How do you generate short URLs?" — Base62-encode a Snowflake ID or auto-incremented counter. 7 characters of Base62 = 3.5 trillion unique URLs.

## Deep Dive: Designing a Snowflake-like System

**Step-by-step design:**

1. **Choose epoch:** Pick a recent custom epoch (e.g., 2024-01-01) to maximize the 41-bit timestamp range. This gives ~69 years before overflow.

2. **Assign machine IDs:** Use ZooKeeper/etcd to assign unique 10-bit machine IDs (1024 machines max). When a machine starts, it registers and claims an ID.

3. **Handle clock issues:**
   - Track last-generated timestamp.
   - If current time < last timestamp, either wait or throw an error (never generate backward).
   - If current time == last timestamp, increment sequence (12 bits = max 4095 per ms).
   - If sequence overflows, wait until next millisecond.

4. **Performance:** ID generation is a single-machine, in-memory operation — no network calls, no database. A single machine can generate **4 million IDs per second** (4096 per ms × 1000 ms).

5. **Deployment:** Run as a lightweight library within each service (not a separate service). This avoids network hops and eliminates a single point of failure.

**Real-world adoption:** Twitter Snowflake, Discord Snowflake (extended to 64-bit with worker/process IDs), Instagram (modified Snowflake using PostgreSQL stored procedure with shard ID embedded), Sony's Sonyflake (optimized for fewer machines, longer sequence).

---

## First-time Recognition Signals

When you read a brand-new system design prompt, this topic deserves explicit design if you see:

- **"Globally unique IDs across many shards / regions / services"** — UUIDv4, Snowflake, or KGS depending on shape.
- **"Short, URL-safe ID"** (URL shortener, paste ID, invite code) — base62-encoded counter or hash-based scheme.
- **"Roughly time-ordered IDs so we can paginate by ID"** — Snowflake-style (timestamp + machine + sequence) gives k-sorted order.
- **"Distributed system with no central ID coordinator"** — Snowflake or UUIDv7 per node.
- **"IDs are also the shard key, so they must distribute uniformly"** — hash-based IDs or random suffixes.

### Anti-signals (looks like this topic, isn't)

- **"Single SQL database"** — `BIGINT AUTO_INCREMENT` / `SERIAL` is fine; don't reach for Snowflake to look fancy.
- **"Need an unguessable security token / share link"** — `crypto.randomBytes` UUIDv4 is correct; Snowflake leaks creation time and machine ID.
- **"Need strict total ordering across the whole system"** — Snowflake gives only k-sorted-by-second; strict total order requires a coordinator or a single sequence service.

---

### Intuition

Once you scale beyond a single SQL primary, `AUTO_INCREMENT` stops working — multiple writers can't share a counter without coordination. You need IDs that are unique without talking to anyone *and* roughly sortable by time (so they cluster nicely on disk and are easy to debug). Snowflake-style IDs achieve both by packing a timestamp + worker ID + sequence into a 64-bit integer. The whole scheme rests on one assumption: clocks are monotonic — and in practice, they aren't.

### Worked Example: Snowflake bit-layout walkthrough

Twitter's original Snowflake: 64-bit integer.

```
| 1 bit | 41 bits          | 10 bits     | 12 bits    |
| sign  | ms since epoch   | worker_id   | sequence   |
| = 0   |                  | 0..1023     | 0..4095    |
```

**Capacity:**

- 41-bit ms → `2^41 / (1000 × 60 × 60 × 24 × 365) ≈ 69.7 years` of unique timestamps from epoch.
- 10-bit worker → **1024 workers** mint IDs in parallel.
- 12-bit sequence → **4,096 IDs per ms per worker** = `4,096 × 1,000 = 4.096 M IDs/sec per worker`.
- Cluster total: `1024 × 4.096 M ≈ 4.19 billion IDs/sec`. Far more than any single service needs.

**The clock-skew failure mode:**

Worker A's clock jumps backward 500 ms (NTP correction, VM live-migration, leap second).

```
T0   = 1700000000123 ms → mints IDs   ...123-A-0001 .. -0042
NTP rewind → clock = 1700000000023
T0-100 = 1700000000023 ms → would mint ...023-A-0001 again
```

The new IDs collide with already-issued ones from this same worker → duplicate primary keys, silent overwrites, or constraint violations.

**Mitigations:**

- **Refuse to mint while `wall_clock < last_issued_ms`.** Twitter's original Snowflake does this; the worker errors out for the duration of the skew (usually ms). Drops throughput briefly, preserves uniqueness.
- **Borrow from sequence:** continue minting at `last_issued_ms` and increment the sequence; safe as long as the drift is less than the sequence headroom (12 bits = 4,096 IDs cushion per ms).
- **Disable NTP step adjustments** in production (slew only). Standard SRE practice.

| Variant | Time bits | Worker bits | Seq bits | Throughput |
|---|---|---|---|---|
| Snowflake (Twitter) | 41 ms | 10 | 12 | 4 M/s/worker |
| Sonyflake | 39 (10 ms units) | 16 | 8 | 25 k/s/worker (more workers) |
| Instagram | 41 ms | 13 (shard) | 10 | 1 M/s/shard |
| ULID | 48 ms | — | 80-bit random | unique, sortable, no coordination |
| UUIDv7 (RFC 9562) | 48 ms | — | 74-bit random | modern standard |

**Surprise:** Snowflake is only "k-sorted by second" — two IDs ms apart from different workers can interleave. **Lesson:** don't rely on Snowflake order for strict happens-before — use a Lamport clock or version vector if you need it.

### Further Reading

- [Twitter — Announcing Snowflake (2010)](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake) — original blog post.
- [Instagram Engineering — Sharding & IDs at Instagram](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)
- [Sonyflake](https://github.com/sony/sonyflake), [ULID spec](https://github.com/ulid/spec), [KSUID](https://github.com/segmentio/ksuid) — alternative encodings with different trade-offs.
- [UUIDv7 — RFC 9562](https://datatracker.ietf.org/doc/rfc9562/) — modern time-ordered UUID standard.

