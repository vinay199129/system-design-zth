# Design: News Feed

> Design a social media news feed like Facebook's News Feed, Twitter/X's Timeline, or Instagram's Feed.

## Overview

A news feed aggregates and displays posts from people a user follows, ranked and personalized. This is one of the most frequently asked system design questions because it touches on fan-out strategies, caching, ranking, and the classic push vs pull debate. Every large-scale social platform has solved some version of this problem.

## Difficulty: Medium

## Core Concepts Tested

- Fan-out on write vs fan-out on read
- Feed ranking and personalization
- Cache architecture for feed delivery
- Social graph traversal
- Pub/sub and message queue patterns
- Hybrid push/pull architectures

## Companies That Ask This

Meta, Twitter/X, LinkedIn, Pinterest, TikTok, Snap

## Prerequisites

- Phase 1: Databases and Indexing
- Phase 2: Caching (Multi-Layer)
- Phase 2: Message Queues and Fan-Out
- Phase 3: Social Graph Data Models
- Phase 3: Ranking and Recommendation Basics

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 35 minutes with a timer
3. Focus on: fan-out strategy, feed generation, caching, ranking
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to the celebrity/influencer problem and how it changes your approach
