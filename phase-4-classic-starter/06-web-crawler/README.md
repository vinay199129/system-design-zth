# Design: Web Crawler

> Design a scalable web crawler that can index billions of web pages.

## Overview

A web crawler systematically browses the web, downloading pages and extracting URLs to discover new pages. It is a core component of search engines, data mining systems, and web archiving tools. This problem tests your ability to design for massive parallelism, politeness constraints, deduplication, and storage of unstructured data at scale.

## Difficulty: Hard

## Core Concepts Tested

- BFS/DFS graph traversal at internet scale
- URL frontier and priority scheduling
- Politeness and robots.txt compliance
- URL deduplication (Bloom filters, checksums)
- Content deduplication (simhash, fingerprinting)
- Distributed task queue architecture

## Companies That Ask This

Google, Microsoft (Bing), Amazon, Apple, Baidu, Pinterest

## Prerequisites

- Phase 1: Graph Algorithms (BFS)
- Phase 1: Hashing (Bloom Filters)
- Phase 2: Message Queues
- Phase 2: Distributed Task Processing
- Phase 3: DNS Resolution and Networking

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 40 minutes with a timer
3. Focus on: URL frontier design, politeness, deduplication, crawl scheduling
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how you avoid overwhelming target servers
