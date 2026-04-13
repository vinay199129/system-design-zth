# Problem: Design Instagram / Photo Sharing

## Requirements

### Functional

- Users can upload photos and short videos (up to 60 seconds).
- Users can follow other users and view their content.
- Users see a personalized, ranked feed of posts from followed accounts.
- Users can like, comment on, and share posts.
- Users can view an Explore/Discover page with recommended content.
- Users can search for other users and hashtags.
- Users can post Stories (ephemeral content, 24-hour TTL).

### Non-Functional

- **Availability:** 99.99% uptime — feed reads must never go down.
- **Latency:** Feed load < 200ms; image uploads acknowledged < 2 seconds.
- **Consistency:** Eventual consistency acceptable for feeds; strong consistency for follow relationships and like counts.
- **Durability:** Zero photo loss — once upload is confirmed, the photo must be persisted permanently.
- **Scalability:** Support 500M+ daily active users, 100M+ photo uploads/day.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Daily Active Users (DAU) | 500 million |
| Photo uploads per day | 100 million |
| Average photo size (original) | 3 MB |
| Resized variants per photo | 4 (thumbnail, small, medium, large) |
| New storage per day | ~500 TB (with variants) |
| Feed reads per second (peak) | 2 million |
| Average followers per user | 200 |
| Celebrity accounts (>1M followers) | ~50,000 |
| Read:Write ratio | 100:1 |

## Hints

### Hint 1: Upload Pipeline

Uploading a photo is not just storing a file. Think about what processing steps happen between "user taps upload" and "photo appears in followers' feeds." Consider how to make this asynchronous.

### Hint 2: Feed Generation Strategy

With 500M DAU, you cannot compute feeds on-the-fly at read time. But pre-computing feeds for every user on every post is also expensive. What hybrid approach handles both regular users and celebrities efficiently?

### Hint 3: CDN and Image Delivery

Users are global. A photo uploaded in Tokyo should load fast in São Paulo. Think about how images are distributed geographically and how multiple resolutions are served based on device type and network conditions.

## Think About

- How do you handle a celebrity with 100M followers posting a photo? Do you fan out to all 100M timelines?
- What happens if the image processing pipeline falls behind? How do you handle backpressure?
- How do you prevent duplicate uploads (user taps upload twice)?
- How do you rank the feed? Reverse-chronological is simple but not what users want anymore.
- What storage backend works for 500 TB/day of new images?
- How do you handle Stories that expire after 24 hours at scale?
