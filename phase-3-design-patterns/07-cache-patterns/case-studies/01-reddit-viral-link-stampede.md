# Case Study: Reddit — Surviving a Celebrity Link with Single-Flight and CDN Cache Patterns

> How Reddit absorbs the "front-page hug of death" — sudden million-request spikes on a single URL — using request coalescing, edge caching, and aggressive stampede prevention.

## Context

Reddit's traffic shape is dominated by a long-tail of cold content punctuated by sudden mega-spikes on a single link: a post hits r/all front page, an AMA from a major celebrity, a news event linked from a default subreddit. These spikes can drive **>1 million requests in minutes** to a previously-cold URL, and the historical failure mode was a **cache stampede**: cache expires, every concurrent request misses, all of them hit the Postgres/Cassandra origin simultaneously, origin tips over, errors cascade. Reddit has published several engineering blog posts since 2017 describing their cache-stack evolution (Memcached → Redis → fastly CDN), and the broader pattern is also documented in HighScalability's "Reddit: how to lose stories" series and Reddit's own blog "How Reddit ranks comments" and "We had some downtime over the weekend".

## The Decision

Reddit chose **CDN edge caching plus single-flight (request coalescing) at the origin** rather than pre-warming or over-provisioning. The parent module README's "cache-aside vs read-through; thundering herd / cache stampede" patterns are exactly the design space. The insight: 99 % of traffic for a viral link is **the same identical request** (anonymous, logged-out, no personalization) — perfect for a CDN. The remaining personalized traffic must still hit origin, but with **single-flight** on the origin side, only the first request rebuilds the cache; concurrent misses wait for that single rebuild instead of stampeding the DB.

## How It Works

- **Layer 1 — Fastly CDN** in front of every URL: anonymous, logged-out responses cached at the edge with TTLs from seconds (front page) to minutes (post pages).
- **Cache key includes**: URL + sort order + a small set of vary headers; *not* user identity for anonymous requests, so the cache hit rate approaches 100 % for the long tail.
- **Layer 2 — Memcached / Redis** at the application tier for logged-in users and dynamic data (vote counts, comments).
- **Single-flight** at the application: a request to render `r/funny/comments/abc123` checks Memcached → on miss, **takes a lock keyed on the URL** (Redis SETNX with a short TTL), rebuilds the cache, releases the lock; concurrent misses **wait on the lock** or serve stale data.
- **Stale-while-revalidate**: when a cache entry is "soft expired", Reddit serves the stale version immediately and queues a background refresh; readers never wait on the rebuild.
- **Tiered TTLs**: hot content gets short TTLs (15–60 s) so vote counts feel live; cold content gets long TTLs (minutes).
- **Vote count debouncing**: vote counts are aggregated in Redis and flushed to Postgres asynchronously, so a viral post's 100k upvotes don't translate to 100k DB writes.
- During spikes Reddit reports CDN hit rates **>95 %** for hot URLs, meaning the origin sees thousands of requests per second instead of hundreds of thousands.

## What Surprised Engineers

The non-obvious lesson is that **cache stampede is a hot-key problem disguised as a TTL problem**. Engineers naturally reach for "longer TTL" as a fix, but the real cause is **N concurrent requests racing to be the cache-rebuilder** the moment TTL expires. Single-flight eliminates the race entirely — only one rebuilder, others wait or get stale. A second surprise: **stale-while-revalidate is more important than fresh data for viral content**. Users would rather see a 30-second-stale vote count than wait 500 ms for an exact one. Once Reddit adopted SWR semantics, the tail-latency under load collapsed.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| CDN absorbs >95 % of viral traffic | CDN cache invalidation lags writes; comments take seconds to appear globally |
| Single-flight prevents stampede with one extra Redis hop | Adds a lock-acquisition step on every miss; bad logic can leave stale locks |
| Stale-while-revalidate keeps tail latency low | Users may see stale data for up to TTL; not OK for highly transactional flows |

## Lessons for Your Interview

- When asked "what happens when a link goes viral", answer with **edge cache + single-flight + stale-while-revalidate** in that order.
- Explain single-flight in one sentence: "first miss takes a lock and rebuilds; concurrent misses wait or serve stale". Name it.
- Distinguish **anonymous-vs-personalized** traffic; the former is the CDN's job, the latter is the cache tier's.
- Mention **debouncing writes** (vote counts, view counts) as orthogonal to read caching — also critical for viral spikes.
- Cite the **>95 % CDN hit rate** as the metric that matters during a spike — interviewers like seeing you measure cache success.

## Sources

- Reddit Engineering: "Caching at Reddit" and various incident retrospectives — https://www.reddit.com/r/RedditEng/
- Reddit Engineering: "How Reddit ranks comments" (2017)
- HighScalability: "Reddit: lessons learned from mistakes made scaling to 1 billion pageviews a month" — http://highscalability.com/blog/2013/8/26/reddit-lessons-learned-from-mistakes-made-scaling-to-1-billi.html
- "Cache Stampede" — Wikipedia, with academic references to "Optimal Probabilistic Cache Stampede Prevention" (Vattani et al., VLDB 2015)
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 1 on response-time tails and Chapter 5 on staleness
