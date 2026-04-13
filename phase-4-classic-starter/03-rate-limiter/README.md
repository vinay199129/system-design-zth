# Design: Rate Limiter

> Design a distributed rate limiting service that throttles requests based on configurable rules.

## Overview

A rate limiter controls the number of requests a client can send within a time window. It protects services from abuse, prevents resource starvation, and ensures fair usage. This problem tests your understanding of distributed counting, time-window algorithms, and middleware architecture.

## Difficulty: Medium

## Core Concepts Tested

- Rate limiting algorithms (Token Bucket, Sliding Window, Fixed Window)
- Distributed counting with Redis
- Middleware/gateway architecture
- Race conditions in distributed counters
- HTTP 429 and retry-after semantics
- Multi-tenancy and rule configuration

## Companies That Ask This

Google, Amazon, Cloudflare, Stripe, Uber, Netflix, Shopify

## Prerequisites

- Phase 1: Caching (Redis)
- Phase 2: API Gateway Patterns
- Phase 2: Distributed Systems Basics
- Phase 3: Race Conditions and Atomicity

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: algorithm choice, distributed counting, rule configuration
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how you handle race conditions in a multi-server environment
