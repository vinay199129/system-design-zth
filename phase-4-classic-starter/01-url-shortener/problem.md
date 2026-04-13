# Problem: Design a URL Shortener

## Requirements

### Functional

- Given a long URL, generate a unique short URL
- When a user visits the short URL, redirect to the original long URL
- Users can optionally pick a custom short alias
- Short links expire after a configurable time (default: 5 years)
- Track basic analytics: click count, creation time

### Non-Functional

- Scale: 100M new URLs created per month
- Latency: Redirect must complete in < 100ms
- Availability: 99.99% uptime — reads must never fail
- Durability: Once created, a short URL must always resolve (until expiry)
- Short URLs should be as compact as possible

## Constraints & Scale

| Metric | Value |
|--------|-------|
| New URLs / month | 100M |
| Read:Write ratio | 100:1 |
| Write QPS | ~40 |
| Read QPS (redirects) | ~4,000 |
| Peak read QPS | ~12,000 |
| URL length (avg) | 500 bytes |
| Storage per record | ~1 KB (URL + metadata) |
| Storage (5 years) | ~6 TB |
| Total URLs (5 years) | ~6 billion |

## Hints

### Hint 1

How many characters do you need in your short key to support 6 billion unique URLs? Think about the alphabet size and key length — Base62 with 7 characters gives you 62^7 ≈ 3.5 trillion combinations.

### Hint 2

There are two main strategies for generating short keys: hashing the long URL (and taking a prefix) or using a pre-generated key service. Each has different trade-offs around collisions, latency, and coordination.

### Hint 3

Since reads vastly outnumber writes, a caching layer (LRU eviction) in front of the database can serve the vast majority of redirect requests without hitting storage. Think about what percentage of URLs are "hot."

## Think About

- How do you handle hash collisions if two different URLs produce the same short key?
- What happens if two users submit the same long URL simultaneously?
- Should the same long URL always map to the same short URL, or get a new one each time?
- How would you implement custom aliases without conflicts?
- What happens if your key generation service goes down?
- How would you handle URL expiration at scale — eager deletion or lazy cleanup?
