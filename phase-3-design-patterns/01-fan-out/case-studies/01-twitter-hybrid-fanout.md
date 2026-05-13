# Case Study: Twitter — Hybrid Fan-out for Timelines

> How Twitter combines write-time fan-out (push to follower inboxes) with read-time fan-out (pull on demand) to make a celebrity's tweet visible to 100M followers without crushing Redis.

## Context

Twitter's home timeline must serve every active user's chronological + ranked tweet feed within a few hundred milliseconds. The fan-out problem is asymmetric: most users have <1,000 followers, but a small number — celebrities, politicians, brands — have **tens of millions to >100 million** followers. The original "Real-time delivery at Twitter" architecture (Raffi Krikorian, QCon 2012; updated by Yao Yue's "Cache à la carte" talks 2014–2017) describes the timeline service evolution. The pain point: pure write-time fan-out (push to every follower's inbox on every tweet) is **infeasible** for celebrities; pure read-time fan-out (merge from each followed user at read) is **infeasible** at Twitter's 500M tweets/day read load.

## The Decision

Twitter chose a **hybrid fan-out** strategy. The parent module README's "fan-out on write vs fan-out on read" trade-off is exactly the decision. They split users into two classes: **regular users**, whose tweets are pushed at write time into each follower's Redis-backed timeline; and **celebrities** (above a follower-count threshold), whose tweets are **not** fanned out — instead, every follower's read merges their pushed timeline with a fresh pull of recent tweets from celebrities they follow. This gets the write-time path's cheap read cost for the common case, while bounding the worst-case write fan-out.

## How It Works

- **Tweet ingestion** → **fan-out service** → for each follower, append the tweet ID to that follower's **Redis timeline** (a sorted set / list capped at ~800 most-recent entries).
- **Celebrity threshold**: users with followers > **~1M** (publicly cited; exact threshold tuned) are excluded from write-time fan-out.
- **Read path**: client request → pull pre-computed timeline from Redis → in parallel, pull recent tweets from each **celebrity the user follows** → **merge sort by time/ranking** → return top N.
- Redis timelines are partitioned by **user_id**; each timeline shard handles millions of users.
- **Hot users** (active right now) have their timelines kept in Redis; **cold users** (inactive for weeks) have timelines purged and rebuilt on next login.
- Scale numbers (publicly cited, ~2017): **~500M tweets/day**, **~150k tweets/sec peak**, fan-out service writing **~10B timeline entries/day** to Redis.
- **Twemcache / Pelikan** custom cache servers handle the Redis-like fanout backend at lower memory cost than vanilla Redis.
- **Search and analytics** are separate pipelines (Lucene-based, Heron streaming) — not part of the timeline fan-out.

## What Surprised Engineers

The non-obvious lesson is that **the celebrity threshold is itself a moving target**. Setting it too low pushes too many users into read-time fan-out and slows the timeline; setting it too high lets a celebrity tweet trigger a write-time fan-out spike that takes minutes to drain and delays delivery. Twitter's solution evolved toward **per-user policy**, not a global threshold — and toward **partial fan-out** (push to active followers, defer for inactive ones). A second surprise: the read-side merge must **bound the celebrity pull** (only the last few hours), or rare logins re-pull years of history.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Reads are O(1) Redis-lookup for the common case | Two code paths (push and pull) to maintain and reason about |
| Celebrity tweets don't blow up the fan-out queue | Read path now has variable latency (depends on how many celebrities you follow) |
| Inactive-user timelines can be evicted cheaply | Rebuilding a cold user's timeline on login is itself an O(followers) job |

## Lessons for Your Interview

- For "Design Twitter / Instagram feed", **always propose hybrid fan-out** — pure write or pure read is a junior answer.
- State the **threshold for celebrities explicitly** (e.g., >1M followers) and explain it's tunable per-user.
- Sketch the **read path as a merge** of pushed timeline + celebrity pull + ranking, bounded by a time window.
- Mention **active-user-only fan-out** as an optimization: don't pre-compute timelines for users who haven't logged in for 30 days.
- Use **Redis sorted sets capped at ~800 entries** as a credible storage model; explain why an unbounded list is a memory bomb.

## Sources

- "Real-time delivery at Twitter" — Raffi Krikorian, QCon 2012 — https://www.infoq.com/presentations/Real-Time-Delivery-Twitter/
- "Timelines at scale" — Twitter Engineering Blog (2013) — https://blog.twitter.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how
- Yao Yue, "Cache à la carte" talks (Strange Loop, QCon 2014–2017) — Pelikan / Twemcache design
- High Scalability: "The architecture Twitter uses to deal with 150M active users, 300K QPS, a 22 MB/S firehose, and send tweets in under 5 seconds" (2013) — http://highscalability.com/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 1 "Describing Performance" uses Twitter's fan-out as a worked example
