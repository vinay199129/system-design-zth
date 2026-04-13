# Problem: Design YouTube / Video Streaming

## Requirements

### Functional

- Creators can upload videos of any length (up to 12 hours).
- Videos are transcoded into multiple resolutions (144p to 4K) and codecs (H.264, VP9, AV1).
- Viewers can stream videos with adaptive bitrate (quality adjusts to network conditions).
- Users can search for videos by title, description, and tags.
- Users see a personalized home feed with video recommendations.
- Users can like, dislike, comment on, and subscribe to channels.
- Creators can view analytics (views, watch time, demographics).

### Non-Functional

- **Availability:** 99.99% — video playback must never fail for available content.
- **Latency:** Video playback start < 2 seconds; search results < 500ms.
- **Durability:** Zero video loss after upload confirmation.
- **Scalability:** Support 2B+ monthly active users, 500+ hours of video uploaded per minute.
- **Bandwidth:** Efficient delivery — minimize buffering and CDN costs.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Monthly Active Users | 2 billion |
| Daily Active Users | 800 million |
| Videos uploaded per minute | 500 hours |
| Average video length | 7 minutes |
| Average original video size | 1.5 GB |
| Transcoded variants per video | 10-15 (resolutions × codecs) |
| Concurrent video streams (peak) | 50 million |
| Total stored video content | 1+ exabyte |
| Average daily watch time per user | 40 minutes |
| Read:Write ratio | 1000:1 |

## Hints

### Hint 1: Transcoding Pipeline

A single video upload triggers a complex processing DAG: extract audio, generate thumbnails, transcode to multiple resolutions and codecs, run content moderation, update search index. How do you orchestrate this reliably? What happens if one step fails?

### Hint 2: Adaptive Bitrate Streaming

Users don't download entire videos. They stream segments. Think about how the video is split into small chunks (2-10 seconds), how the client decides which quality to request next, and what protocol (HLS/DASH) coordinates this.

### Hint 3: CDN Strategy

Video is the most bandwidth-intensive content type on the internet. Not all videos are equally popular — a tiny fraction drives most views. How do you decide what to cache at the edge vs. fetch from origin? Consider the long tail.

## Think About

- How do you handle a 4K, 2-hour movie upload? Chunked upload, resumable uploads?
- What if transcoding fails midway? How do you retry without re-processing completed steps?
- How do you count views accurately at 50M concurrent streams without overwhelming a counter?
- How does the recommendation engine decide what to show on the home page?
- How do you detect and block copyright-infringing content in near real time?
- What storage tier strategy minimizes costs for videos that haven't been watched in years?
