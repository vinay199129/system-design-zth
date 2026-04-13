# Problem: Design Twitter / Social Network

## Requirements

### Functional

- Users can post tweets (280 characters, with optional images/videos).
- Users can follow/unfollow other users.
- Users see a home timeline of tweets from accounts they follow.
- Users can search for tweets, users, and hashtags.
- Users can like, retweet, and reply to tweets.
- The system displays trending topics in real time.
- Users receive notifications for mentions, likes, and retweets.

### Non-Functional

- **Availability:** 99.99% — timeline reads must always be available.
- **Latency:** Timeline load < 200ms; tweet post < 500ms (visible to author immediately).
- **Consistency:** Eventual consistency for timelines; strong consistency for tweet content.
- **Scalability:** Support 400M+ daily active users, 600M+ tweets/day.
- **Ordering:** Tweets appear in timelines within 5 seconds of posting.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Daily Active Users (DAU) | 400 million |
| Tweets per day | 600 million (~7,000/sec avg, 15,000/sec peak) |
| Timeline reads per second (peak) | 3 million |
| Average followers per user | 200 |
| Median followers per user | 50 |
| Users with >1M followers | ~30,000 |
| Average tweet size | 500 bytes (text + metadata) |
| New tweet storage per day | ~300 GB |
| Search queries per second | 500,000 |
| Read:Write ratio | 500:1 |

## Hints

### Hint 1: The Fan-Out Problem

When a user with 200 followers tweets, you could write that tweet into 200 timelines (fan-out on write). When a celebrity with 50M followers tweets, fan-out on write means 50M writes. What's the alternative? Can you combine both approaches?

### Hint 2: Trending Topics

Trending topics change every few minutes. You need to detect which hashtags and terms are spiking in volume right now compared to their baseline. Think about streaming aggregation with a sliding time window.

### Hint 3: Tweet ID Generation

At 7,000 tweets/sec, you need globally unique, roughly time-ordered IDs. Auto-increment from a single database won't scale. How do you generate IDs that are unique, sortable, and distributed?

## Think About

- A celebrity with 50M followers tweets. How long until all followers see it in their timeline?
- How do you handle "reply chains" — a tweet with 100,000 replies?
- If a user follows 5,000 accounts, how is their timeline assembled?
- How do you handle spam and bot detection at this scale?
- What happens when a tweet goes viral — 1M retweets in 10 minutes?
- How do you rank the timeline? Pure chronological vs. algorithmic?
