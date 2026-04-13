# Design: YouTube / Video Streaming

> Design a video streaming platform that ingests, transcodes, stores, and streams video to billions of users with adaptive bitrate delivery.

## Overview

YouTube is a video-sharing platform where creators upload videos and viewers stream them on demand. The system must handle massive video ingestion, a multi-stage transcoding pipeline producing multiple resolutions and codecs, adaptive bitrate streaming via HLS/DASH, and a recommendation engine that drives the majority of watch time. Storage costs and CDN bandwidth dominate the infrastructure budget.

## Difficulty: Hard

## Core Concepts Tested

- Video upload and transcoding pipeline (DAG-based)
- Adaptive bitrate streaming (HLS, DASH)
- CDN architecture and edge caching for video segments
- Recommendation engine and watch history
- Comment system at scale
- Storage tiering (hot/warm/cold) for video assets
- Content moderation pipeline

## Companies That Ask This

Google, Netflix, Amazon, Meta, Microsoft, TikTok, Spotify, Twitch

## Prerequisites

- 01-scaling-foundations (horizontal scaling, queues)
- 03-caching (CDN, edge caching)
- 07-blob-storage (object storage for large files)
- 05-message-queues (async processing pipelines)
- 09-news-feed (recommendation basics)

## Approach

1. Clarify scope: upload, transcode, stream, search, recommend, comments.
2. Estimate traffic: uploads/day, concurrent viewers, storage growth/day.
3. Design upload flow: chunked upload → object storage → transcoding queue.
4. Design transcoding pipeline: DAG of tasks per video (resolutions × codecs).
5. Design streaming: manifest files, segment delivery via CDN, ABR logic.
6. Design metadata service: video info, search index, view counts.
7. Design recommendation engine: collaborative + content-based filtering.
8. Address scaling: CDN cost optimization, long-tail storage, copyright detection.
