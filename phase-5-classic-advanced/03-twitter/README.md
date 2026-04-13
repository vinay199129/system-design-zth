# Design: Twitter / Social Network

> Design a microblogging platform that delivers real-time tweets to hundreds of millions of users using a hybrid fan-out architecture.

## Overview

Twitter is a social network where users post short messages (tweets), follow other users, and consume a real-time timeline. The core challenge is delivering tweets to followers with minimal latency while handling the extreme asymmetry between celebrity accounts (millions of followers) and regular users. Trending topics, search, and real-time notifications add further complexity.

## Difficulty: Hard

## Core Concepts Tested

- Hybrid fan-out: push for regular users, pull for celebrities
- Timeline generation and caching
- Trending topics with streaming aggregation
- Full-text search with Elasticsearch
- Social graph storage and query patterns
- Real-time delivery (WebSocket, SSE)
- Tweet ID generation (Snowflake-style)

## Companies That Ask This

Twitter/X, Meta, Google, Amazon, Microsoft, LinkedIn, Snap, ByteDance

## Prerequisites

- 01-scaling-foundations (sharding, replication)
- 02-databases (wide-column stores, graph databases)
- 03-caching (timeline caching)
- 05-message-queues (fan-out queues)
- 09-news-feed (fan-out strategies)

## Approach

1. Clarify scope: tweet, follow, timeline, search, trending, notifications.
2. Estimate traffic: tweets/sec, timeline reads/sec, celebrity follower counts.
3. Design tweet ingestion: write path with fan-out decision logic.
4. Design hybrid fan-out: push to pre-computed timelines for 99% of users, pull at read time for celebrity followers.
5. Design timeline service: merge cached timelines + pull-based celebrity tweets.
6. Design search: inverted index with Elasticsearch, real-time indexing pipeline.
7. Design trending topics: sliding-window count with streaming aggregation.
8. Address scaling: hot partition handling, cache stampede, rate limiting.
