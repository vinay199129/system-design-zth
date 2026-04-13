# Design: Instagram / Photo Sharing

> Design a photo-sharing social network that handles billions of image uploads, generates personalized feeds, and delivers media globally through a CDN pipeline.

## Overview

Instagram is a photo and video sharing platform where users upload media, follow other users, and consume a ranked feed of content. The system must handle massive write throughput for uploads, efficient image processing pipelines, and low-latency feed generation for hundreds of millions of daily active users. Key challenges include celebrity fan-out, real-time feed ranking, and global media delivery.

## Difficulty: Hard

## Core Concepts Tested

- CDN architecture and image delivery pipeline
- Image resize, transcode, and storage strategies
- Feed generation with hybrid fan-out (push vs. pull)
- Celebrity/influencer fan-out optimization
- Explore/Discover recommendation engine
- Object storage at scale (S3-like systems)
- Social graph storage and traversal

## Companies That Ask This

Meta, Google, Amazon, Microsoft, Apple, Uber, Snap, Pinterest, TikTok, ByteDance

## Prerequisites

- 01-scaling-foundations (horizontal scaling, load balancing)
- 02-databases (SQL vs. NoSQL, sharding)
- 03-caching (multi-tier caching, CDN basics)
- 07-blob-storage (object storage patterns)
- 09-news-feed (feed generation fundamentals)

## Approach

1. Clarify functional scope: uploads, feed, stories, explore, search.
2. Estimate traffic: uploads/sec, feed reads/sec, storage growth.
3. Design the upload pipeline: client → API → object storage + processing queue.
4. Design the image processing pipeline: resize, transcode, thumbnail generation.
5. Design the feed system: hybrid fan-out with celebrity optimization.
6. Add CDN layer for global media delivery.
7. Design Explore/Discover with collaborative filtering.
8. Address scaling bottlenecks: hot partitions, thundering herd, cache invalidation.
