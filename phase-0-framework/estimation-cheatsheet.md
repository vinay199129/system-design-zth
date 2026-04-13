# Estimation Cheatsheet

> Master these numbers and formulas. You'll use them in every single design.

## The Three Calculations

Every estimation boils down to three things:

1. **Traffic (QPS)** -- How many requests per second?
2. **Storage** -- How much data do we store?
3. **Bandwidth** -- How much data flows per second?

## Traffic Estimation

### Formula

```
QPS = (DAU * actions_per_user_per_day) / 86,400
Peak QPS = QPS * spike_factor (typically 2-5x)
```

### Example: Chat Application

```
DAU = 50M
Messages/user/day = 40
Total messages/day = 50M * 40 = 2B

QPS = 2B / 86,400 = ~23,148
Peak QPS = 23,148 * 3 = ~69,444

Read QPS (users check messages ~5x per message sent):
  Read QPS = 23,148 * 5 = ~115,741
  Peak read QPS = ~347,222
```

**Conclusion:** Need caching for reads (347K QPS exceeds a single DB). Consider message queue for write buffering.

## Storage Estimation

### Formula

```
Daily storage = items_per_day * size_per_item
Monthly = daily * 30
Yearly = daily * 365
5-year = yearly * 5
```

### Example: Photo Sharing (Instagram)

```
Photos uploaded/day = 100M
Average photo size = 500 KB

Daily = 100M * 500 KB = 50 TB/day
Monthly = 50 TB * 30 = 1.5 PB/month
5-year = 50 TB * 365 * 5 = 91 PB

Metadata per photo = 1 KB
Daily metadata = 100M * 1 KB = 100 GB/day
5-year metadata = 100 GB * 365 * 5 = 182.5 TB
```

**Conclusion:** Need blob storage (S3) for photos. Metadata fits in a sharded database.

## Bandwidth Estimation

### Formula

```
Incoming bandwidth = write_QPS * avg_write_size
Outgoing bandwidth = read_QPS * avg_response_size
```

### Example: Video Streaming (YouTube)

```
Videos watched/day = 5B views
Average video chunk served = 2 MB (adaptive bitrate, 10-sec chunk)
Chunks per view = 60 (10-min average video)

Outgoing = 5B * 60 * 2 MB / 86,400 = ~6.9 TB/s = ~55 Tbps

Uploads/day = 500K
Average upload size = 500 MB

Incoming = 500K * 500 MB / 86,400 = ~2.9 GB/s = ~23 Gbps
```

**Conclusion:** 55 Tbps outgoing is massive -- CDN is absolutely mandatory. Also need transcoding pipeline for uploaded videos.

## Practice Problems

### 1. URL Shortener

```
Reads: 100M clicks/day
Writes: 1M URLs shortened/day

Calculate: Read QPS, Write QPS, Storage for 5 years
```

**Answer:**

```
Write QPS = 1M / 86,400 = ~12
Read QPS = 100M / 86,400 = ~1,157
Read/Write ratio = ~100:1 (read-heavy -> cache)

URL record = short_url (7 bytes) + long_url (200 bytes) + metadata (50 bytes) = ~260 bytes
Daily storage = 1M * 260 bytes = 260 MB/day
5-year = 260 MB * 365 * 5 = ~474 GB (fits on a single machine)
```

### 2. Chat System

```
DAU: 50M
Messages/user/day: 40 sent, 200 received (group chats)
Average message size: 200 bytes

Calculate: Write QPS, Storage for 1 year
```

**Answer:**

```
Total messages/day = 50M * 40 = 2B
Write QPS = 2B / 86,400 = ~23,148
Peak = ~69,444

Daily storage = 2B * 200 bytes = 400 GB/day
Yearly = 400 GB * 365 = 146 TB
```

### 3. Social Media Feed

```
DAU: 500M
Feed refreshes/user/day: 10
Posts in each feed: 50
Average post size (metadata): 2 KB

Calculate: Read QPS, Bandwidth
```

**Answer:**

```
Feed requests/day = 500M * 10 = 5B
Read QPS = 5B / 86,400 = ~57,870
Peak = ~173,611

Bandwidth = 57,870 * 50 posts * 2 KB = ~5.8 GB/s
```

## Common Mistakes in Estimation

| Mistake | Impact |
|---------|--------|
| Forgetting peak QPS | Under-provisioning by 2-5x |
| Using wrong units (MB vs GB) | Off by 1000x |
| Ignoring read/write ratio | Wrong caching strategy |
| Not considering media separately | Underestimating storage by 100x |
| Over-precision | Wasting time on exact numbers (round aggressively) |

## Pro Tips

1. **Round aggressively** -- 86,400 seconds/day ~ 100,000. Close enough.
2. **State assumptions** -- "I'll assume 500 bytes per record" is better than guessing silently
3. **Let numbers drive design** -- If QPS > 10K, you need caching. If storage > 10 TB, you need sharding.
4. **Practice 5 estimations** -- Do them until they're automatic (2-3 min each)
