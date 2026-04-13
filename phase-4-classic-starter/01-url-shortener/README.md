# Design: URL Shortener

> Design a service like TinyURL or Bit.ly that converts long URLs into short, unique aliases.

## Overview

A URL shortener maps a long URL to a compact alias (e.g., `short.ly/abc123`) and redirects users to the original URL when they visit the short link. This is one of the most commonly asked system design questions because it covers hashing, database design, caching, and scale estimation in a compact problem space.

## Difficulty: Easy

## Core Concepts Tested

- Hashing and encoding strategies (Base62, MD5)
- Read-heavy system design (100:1 read-to-write ratio)
- Database schema design and key generation
- Caching layer for hot URLs
- 301 vs 302 redirects and their implications
- Horizontal scaling and partitioning

## Companies That Ask This

Google, Meta, Amazon, Microsoft, Bloomberg, Uber, Twitter/X, Stripe

## Prerequisites

- Phase 1: Hashing & Encoding
- Phase 1: Databases (SQL vs NoSQL)
- Phase 2: Caching Strategies
- Phase 2: Load Balancing
- Phase 3: Back-of-the-Envelope Estimation

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: key generation, database choice, read path optimization
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to collision handling and analytics tracking
