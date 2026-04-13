# Problem: Design a Rate Limiter

## Requirements

### Functional

- Limit the number of requests a client can make within a time window
- Support multiple rate limiting rules (per user, per IP, per API endpoint)
- Return HTTP 429 (Too Many Requests) when the limit is exceeded
- Include `Retry-After` header telling the client when to try again
- Support configurable rules without code deployment

### Non-Functional

- Scale: 10M+ requests per second across all services
- Latency: Rate check must add < 5ms overhead per request
- Availability: If the rate limiter fails, requests should be allowed (fail-open)
- Accuracy: Minimize false positives (blocking legitimate users)
- Distributed: Must work across multiple servers and data centers

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Total requests/sec | 10M |
| Unique clients | 100M |
| Rules per client | 5-10 |
| Rate check latency | < 5ms |
| Rule storage | ~1 KB per rule |
| Counter storage | ~100 bytes per counter |
| Counter memory (all) | ~50 GB |

## Hints

### Hint 1

Think about where the rate limiter lives in the request flow. It should be checked before the request reaches the application server — either as middleware, an API gateway plugin, or a sidecar proxy.

### Hint 2

Redis is the most common backing store for rate limiters because it supports atomic operations (`INCR`, `EXPIRE`) and sub-millisecond latency. Think about how to make the check-and-increment operation atomic.

### Hint 3

There are several algorithms to choose from: Fixed Window, Sliding Window Log, Sliding Window Counter, Token Bucket, and Leaking Bucket. Each has different characteristics for burst tolerance, memory usage, and accuracy.

## Think About

- What happens if two requests from the same client arrive simultaneously on different servers?
- How do you rate-limit consistently across multiple data centers?
- Should you fail-open (allow requests) or fail-closed (block requests) when Redis is down?
- How do you handle different limits for different tiers (free vs premium)?
- How would you implement rate limiting for a WebSocket connection?
