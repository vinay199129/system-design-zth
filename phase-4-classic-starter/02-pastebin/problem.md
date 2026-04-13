# Problem: Design Pastebin

## Requirements

### Functional

- Users can create a paste with text content and receive a unique URL
- Users can read a paste by visiting its URL
- Pastes can have an optional expiration time (default: never)
- Users can set pastes as public or unlisted
- Support syntax highlighting for common programming languages
- Optional: user accounts to manage their pastes

### Non-Functional

- Scale: 5M new pastes per day
- Latency: Paste retrieval in < 200ms
- Availability: 99.9% uptime
- Durability: Content must not be lost once created
- Max paste size: 10 MB

## Constraints & Scale

| Metric | Value |
|--------|-------|
| New pastes / day | 5M |
| Read:Write ratio | 5:1 |
| Write QPS | ~58 |
| Read QPS | ~290 |
| Peak read QPS | ~870 |
| Avg paste size | 10 KB |
| Storage / day | 5M × 10 KB = 50 GB |
| Storage (5 years) | ~90 TB |
| Total pastes (5 years) | ~9 billion |

## Hints

### Hint 1

Text content and metadata have very different access patterns. Think about storing them separately — one in a database for fast lookups, the other in something designed for large blobs.

### Hint 2

The paste content is immutable after creation. This means it's a perfect candidate for aggressive caching and CDN distribution. What caching strategy fits immutable content best?

### Hint 3

Key generation is almost identical to the URL shortener problem. You can reuse the same KGS or hashing approach. The new challenge here is the content storage layer.

## Think About

- How do you handle a 10 MB paste vs a 100-byte paste efficiently?
- What happens when a viral paste gets millions of reads?
- How would you enforce the max paste size limit?
- How do you clean up expired pastes when you have billions of records?
- Should you deduplicate identical pastes? What are the trade-offs?
