# Case Study: Instagram — Sharding Postgres by User ID with a Custom 64-bit ID Scheme

> How early-stage Instagram sharded Postgres across thousands of logical shards using a Snowflake-style 64-bit ID that encoded the shard number directly in the primary key.

## Context

In 2012 Instagram had **~25 million users** and was doubling roughly every few months on a small engineering team running Postgres on AWS. A single Postgres instance could not absorb the growth, and the team did not want to migrate to a NoSQL store mid-flight. Mike Krieger's post "Sharding & IDs at Instagram" on the Instagram Engineering blog (2012) describes the approach. The pain point: writes per second on the user-photos table were saturating the single Postgres write leader, and they needed a sharding scheme that **worked client-side**, didn't require a coordinator, and let them grow shard count later.

## The Decision

Instagram chose **range-of-logical-shards-per-physical-host partitioning** rather than hash-on-user-id directly into N machines. The parent module README's "range vs hash vs directory" trade-off and "rebalancing pain" discussion are central here: by creating **thousands of logical shards** (Postgres schemas) and packing many of them onto each physical Postgres machine, they decoupled **shard count** from **machine count**. Rebalancing means moving a logical shard from one machine to another — a smaller, online operation — rather than re-hashing all keys. The 64-bit ID scheme encodes the logical shard in the ID itself so any service can route a row without a directory lookup.

## How It Works

- **64-bit ID layout**: 41 bits of millisecond timestamp + 13 bits of logical shard ID + 10 bits of auto-increment within (shard, millisecond).
- **41 timestamp bits** → ~41 years from a custom epoch; **13 shard bits** → **8,192 logical shards**; **10 sequence bits** → 1,024 IDs per ms per shard.
- ID generation happens **inside Postgres** via a `PL/PGSQL` function that reads `nextval` on a per-shard sequence and bit-packs the result; no central ID server.
- Each user is assigned a shard at signup via `user_id % 8192` (or similar mapping table for special cases); all of that user's photos/comments live on the same logical shard.
- **Multiple logical shards per physical Postgres host**: e.g., 8,192 logical shards mapped to a few dozen machines initially; as load grows, schemas are detached and moved to new hosts using Postgres streaming replication.
- Read and write routing happens in the **application layer** — the app extracts the 13 shard bits from the ID and looks up the host in a config map.
- **Cross-shard queries are forbidden** by convention; the feed is built by querying each followed user's shard and merging client-side (or via a cached fan-out).
- Reported result: comfortably scaled past hundreds of millions of users on the same architecture.

## What Surprised Engineers

The non-obvious lesson is that **the shard ID being inside the primary key** is what made this design durable. Other sharding schemes that route via a separate lookup table eventually hit a coordinator bottleneck or get out of sync with replicas. Encoding the shard in the ID means every cache key, every log line, every audit record self-identifies — and the routing function can be reimplemented in 5 lines in any language. The downside discovered later: once you've baked the shard count (13 bits = 8,192) into your IDs, **you cannot increase it without an offline migration**, so always pick the bit width generously up front.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Logical shards decouple from physical hosts → online rebalance possible | Application-layer routing — every service must implement the lookup |
| Shard ID embedded in PK — no directory service to scale | Bit-width of shard ID is fixed at design time; over-provisioning is mandatory |
| Pure Postgres — keep transactions, indices, familiar tooling | Cross-shard joins forbidden; analytics requires a separate warehouse |

## Lessons for Your Interview

- When designing a sharded SQL system, propose **logical shards >> physical hosts** so rebalancing moves shards, not keys.
- Sketch the ID layout as **(time, shard, sequence)** and explain bit-widths concretely; this is the same Snowflake idea reused for sharding.
- Default to **co-locate all of one user's data on one shard** to make per-user queries cheap; only break this rule when a single user's footprint exceeds a shard.
- Mention **client-side routing** as the right answer when interviewers ask "how do you avoid a single point of failure for shard routing".
- Reserve more shard bits than you think you need — 13 bits = 8,192 was barely enough for Instagram; 16 = 65,536 is a safer default.

## Sources

- Instagram Engineering: "Sharding & IDs at Instagram" (Mike Krieger, 2012) — https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c
- Instagram Engineering: "Storing hundreds of millions of simple key-value pairs in Redis" (2012)
- Pinterest Engineering: "Sharding Pinterest: How we scaled our MySQL fleet" (2015) — parallel approach — https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 6, partitioning by hash of key vs key range
