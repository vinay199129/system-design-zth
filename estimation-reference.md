# Estimation Quick Reference

> Print this. Tape it to your wall. These numbers will justify every design decision you make.

## Latency Numbers Every Engineer Should Know

| Operation | Latency | Notes |
|-----------|---------|-------|
| L1 cache reference | 0.5 ns | CPU cache |
| Branch mispredict | 5 ns | |
| L2 cache reference | 7 ns | |
| Mutex lock/unlock | 25 ns | |
| Main memory reference | 100 ns | |
| Compress 1KB with Zippy | 3 us | |
| Send 1KB over 1 Gbps network | 10 us | |
| Read 4KB randomly from SSD | 150 us | |
| Read 1MB sequentially from memory | 250 us | |
| Round trip within same datacenter | 500 us | |
| Read 1MB sequentially from SSD | 1 ms | |
| HDD seek | 10 ms | |
| Read 1MB sequentially from HDD | 20 ms | |
| Send packet CA -> Netherlands -> CA | 150 ms | |

### Key Takeaways

- Memory is ~100x faster than SSD, ~1000x faster than HDD
- Datacenter round trip (~500us) is ~300x faster than cross-continent (~150ms)
- Compression is fast -- always compress before sending over network
- Cache everything you can in memory (Redis: 100ns access)

## QPS Calculations

### The Core Formula

```
QPS = (Daily Active Users * Actions per User) / 86,400 seconds
Peak QPS = QPS * 2 to 5 (traffic spike factor)
```

### Quick Conversion Table

| Requests/Day | QPS | Peak QPS (3x) |
|-------------|-----|---------------|
| 1 million | 12 | 36 |
| 10 million | 116 | 348 |
| 100 million | 1,157 | 3,471 |
| 1 billion | 11,574 | 34,722 |
| 10 billion | 115,741 | 347,222 |

### Capacity of Common Systems

| System | QPS (approx) |
|--------|-------------|
| Single web server | 1,000 - 10,000 |
| Single SQL database | 1,000 - 5,000 |
| Redis / Memcached | 100,000+ |
| Kafka cluster | 1,000,000+ msgs/sec |
| CDN edge node | 100,000+ |

## Storage Calculations

### The Core Formula

```
Daily storage = Items/day * Size per item
Monthly = Daily * 30
Yearly = Daily * 365
5-year = Yearly * 5
```

### Size Reference

| Data Type | Typical Size |
|-----------|-------------|
| Tweet / Short text | 250 bytes - 1 KB |
| User profile | 1 - 10 KB |
| JSON API response | 1 - 50 KB |
| Thumbnail image | 10 - 50 KB |
| Photo (compressed) | 200 KB - 2 MB |
| Video (1 min, compressed) | 5 - 50 MB |
| Log entry | 100 bytes - 1 KB |

### Power of 2 Quick Reference

| Power | Approximate Value | Shorthand |
|-------|-------------------|-----------|
| 10 | 1 Thousand | 1 KB |
| 20 | 1 Million | 1 MB |
| 30 | 1 Billion | 1 GB |
| 40 | 1 Trillion | 1 TB |
| 50 | 1 Quadrillion | 1 PB |

### Handy Multiplication Rules

| Calculation | Result |
|-------------|--------|
| 1 KB * 1 billion | 1 TB |
| 1 MB * 1 million | 1 TB |
| 1 KB * 1 million | 1 GB |
| 1 MB * 1 billion | 1 PB |

## Bandwidth Calculations

### The Core Formula

```
Bandwidth = QPS * Average response size
```

### Example: Image Service

```
QPS = 10,000 image requests/sec
Average image = 500 KB
Bandwidth = 10,000 * 500 KB = 5 GB/sec = 40 Gbps

That's significant -- you need a CDN.
```

## Example: Full Estimation for Instagram

```
Users: 1 billion total, 500M DAU
Photos uploaded/day: 100M
Photo size: 500 KB average

STORAGE:
  Daily: 100M * 500 KB = 50 TB/day
  Monthly: 1.5 PB/month
  5-year: 90 PB (just photos)

QPS (uploads):
  100M / 86,400 = ~1,157 QPS
  Peak: ~3,500 QPS

QPS (views -- 10x reads):
  1B views/day / 86,400 = ~11,574 QPS
  Peak: ~35,000 QPS

BANDWIDTH (views):
  11,574 QPS * 500 KB = ~5.8 GB/sec
  CDN handles most of this via edge caching

CONCLUSION:
  - Need blob storage (S3) for photos
  - Need CDN for serving (5.8 GB/sec from origin is too much)
  - Need image processing pipeline (resize, compress)
  - Database stores metadata only (~1 KB per photo = 100 GB/day)
```
