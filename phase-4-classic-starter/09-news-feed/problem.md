# Problem: Design a News Feed

## Requirements

### Functional

- Users can publish posts (text, images, videos)
- Users see a personalized feed of posts from people they follow
- Feed is sorted by relevance (ranked) with recency as a secondary signal
- Support infinite scrolling (paginated feed)
- Users can like, comment, and share posts
- Feed updates should appear within seconds of publishing

### Non-Functional

- Scale: 500M DAU
- Latency: Feed loads in < 200ms
- Availability: 99.99% uptime
- Freshness: New posts appear in followers' feeds within 5 seconds
- Consistency: Eventual consistency is acceptable

## Constraints & Scale

| Metric | Value |
|--------|-------|
| DAU | 500M |
| Avg follows per user | 300 |
| New posts / day | 500M |
| Feed requests / day | 5B |
| Feed QPS | ~58K |
| Peak feed QPS | ~175K |
| Avg post size | 2 KB (metadata) |
| Celebrity users (>1M followers) | ~50K |
| Avg feed size (cached) | 200 posts × 2 KB = 400 KB |

## Hints

### Hint 1

There are two fundamental approaches to building a feed: **fan-out on write** (push model) — when a user posts, immediately copy the post into all followers' feeds. **Fan-out on read** (pull model) — when a user opens their feed, query all followed users' posts in real time. Think about the trade-offs for each.

### Hint 2

The celebrity problem is the key challenge. A user with 10M followers would require 10M write operations for every post in a push model. Consider a hybrid approach — push for normal users, pull for celebrities.

### Hint 3

The feed isn't just reverse chronological — it's ranked. A lightweight ranking model scores posts based on features like: recency, engagement (likes/comments), user affinity (how often you interact with the author), and content type preference.

## Think About

- How do you handle a user who follows 10,000 accounts?
- What happens to the feed when a user unfollows someone — do you remove their posts?
- How do you ensure a user doesn't see the same post twice across pagination calls?
- How would you handle viral posts with millions of likes/comments?
- Should you pre-compute feeds or compute them on the fly?
