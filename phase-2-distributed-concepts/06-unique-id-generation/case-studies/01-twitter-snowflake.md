# Case Study: Twitter Snowflake — Distributed 64-bit IDs Without a Coordinator

> How Twitter replaced its auto-increment-based tweet IDs with a 64-bit, time-ordered, machine-local scheme that generated thousands of unique IDs per millisecond per host with zero coordination.

## Context

Twitter's original tweet IDs came from a centralized MySQL `AUTO_INCREMENT` row, which by 2010 was a write bottleneck and a single point of failure. The team needed an ID generator that was **k-sortable** (so the timeline could be sorted by ID rather than fetching timestamps), **compact enough to fit in 64 bits** (because the public API exposed IDs as integers to clients), and **decentralized** (no coordinator on the write path). Twitter Engineering's "Announcing Snowflake" post (2010) introduced the scheme; the original code was open-sourced as the `twitter-server/snowflake` Scala project. Snowflake has since become the de facto template for distributed ID generation across the industry.

## The Decision

Twitter chose a **time-prefixed bit-packed ID** rather than UUIDv4 (random) or a database sequence (centralized). The parent module README's "UUID vs Snowflake vs DB sequence vs ULID" comparison is the exact decision matrix. UUIDv4 was rejected because 128 bits doubles storage and breaks the API contract; DB sequences were rejected as the existing bottleneck. The Snowflake split — **41 bits timestamp + 10 bits machine ID + 12 bits sequence within ms** — was tuned so that **41 bits of milliseconds = ~69 years from a custom epoch**, **10 bits of machine = 1,024 IDs-generators**, and **12 bits of sequence = 4,096 IDs per ms per host**, giving **~4 million IDs/sec per host** and ~4 billion IDs/sec across the fleet.

## How It Works

- **64-bit layout**: 1 sign bit (unused, always 0 to keep IDs positive in signed-int representations) + **41 bits ms-since-custom-epoch** + **10 bits worker ID** + **12 bits sequence**.
- Custom epoch (Twitter chose 2010-11-04) starts the timestamp from a recent date, giving the full 69-year window forward.
- **Worker ID** is assigned at process start via **ZooKeeper ephemeral nodes**: each Snowflake instance grabs an unused 10-bit slot under `/snowflake/workers/`, releases it on shutdown.
- **Sequence** is a per-process counter reset each millisecond; if a process exhausts 4,096 IDs in one ms, it **spin-waits to the next millisecond** rather than overflow.
- **Clock-skew protection**: if the local clock moves backward (NTP correction), the worker **refuses to generate IDs** until the clock catches up — preventing duplicate IDs.
- Service exposed as a small Thrift/RPC daemon on each host; clients call it instead of hitting MySQL.
- IDs are **k-sortable**: sorting by ID is approximately sorting by time, with last-12-bit ordering only meaningful within the same millisecond per worker.
- Reported numbers: **~10k IDs/sec per host with theoretical headroom to 4M/sec/host**; tweet ID generation moved off the MySQL critical path entirely.
- Time monotonicity uses `System.currentTimeMillis()` plus a guard against backward jumps.

## What Surprised Engineers

The non-obvious failure mode is **clock skew across the fleet, not within a host**. Two Snowflake workers with slightly different clocks can generate IDs that don't k-sort cleanly across hosts: worker A at "ms=1000" emits ID `100...`, worker B at "ms=999" (running slow) emits ID `099...` *after* A's. Within a single host the IDs are monotonic; across hosts they're only approximately ordered, with the skew bounded by NTP accuracy (~tens of ms). For Twitter's use case (timeline sorting) this was fine; for tighter requirements you need TrueTime-style bounds or HLCs. The second surprise: the **10-bit worker ID** felt generous in 2010 but is **only 1,024 workers** — large fleets later had to split worker ID into datacenter + worker, eating bits from the sequence.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Decentralized — no coordinator on the write path | ZooKeeper still required for worker-ID assignment |
| K-sortable IDs → can sort timelines without timestamps | Cross-host ordering is approximate; depends on clock-sync quality |
| 64 bits → cheap to store, indexable, API-friendly | Bit allocations are fixed forever; over-provision worker ID up front |

## Lessons for Your Interview

- When the interviewer asks "how do you generate IDs at scale", reach for **Snowflake-style time-prefixed IDs**, not UUIDv4 — give the bit split out loud.
- Mention **clock-skew protection (refuse on backward clock)** as a real concern — this signals you've thought past the happy path.
- Use **worker ID via ZooKeeper ephemeral node** as the coordination story; alternatives (config file, IP-derived) have trade-offs you can discuss.
- Reserve **more worker-ID bits than you think you need** — Twitter's 10 bits was tight at scale.
- For ordering guarantees stronger than "approximately sorted", introduce **HLCs** or **TrueTime** as the next step up.

## Sources

- Twitter Engineering: "Announcing Snowflake" (2010) — https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake
- Twitter open-source Snowflake (archived) — https://github.com/twitter-archive/snowflake
- "Snowflake-style IDs at Discord" — https://discord.com/developers/docs/reference#snowflakes
- Instagram Engineering: "Sharding & IDs at Instagram" (2012) — variant scheme using Postgres
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 8 ("Unreliable Clocks") and Chapter 5 (replication ordering)
