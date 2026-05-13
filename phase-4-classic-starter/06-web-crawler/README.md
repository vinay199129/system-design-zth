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

## Learning Objectives

By the end of this design, you can:

- Defend **BFS frontier with per-host queue + Bloom filter dedup** over a **single global priority queue** in 60 seconds (politeness, hot-host avoidance, memory cost).
- Explain when a **focused/DFS** crawl is appropriate (one site, small budget) and when it isn't (internet-scale freshness).
- Estimate fetch QPS, storage, and bandwidth to crawl **1B pages/month** with average page size 100 KB in 5 minutes.
- Name the most common pitfalls — **spider traps**, **session-id URL explosion**, and **robots.txt non-compliance leading to IP bans**.
- Relate this design back to **Phase 1 Graph Algorithms (BFS)** and **Phase 1 Bloom Filters**.

## Common Pitfalls

1. **Single global frontier, no per-host throttling.** One target host gets hammered and bans you — partition the frontier into per-host queues with crawl-delay.
2. **In-memory `Set<String>` for URL dedup.** Memory explodes past 100 GB at scale — use a Bloom filter with controlled false-positive rate (0.1%).
3. **No `robots.txt` cache or compliance.** Webmasters block you and serve poisoned pages — fetch and respect `robots.txt`, honor `Crawl-delay`, cache per host.
4. **Following session-id URLs (`?sid=...`).** Infinite duplicate pages — URL normalization: strip session params, canonicalize, drop fragments.
5. **No content (near-duplicate) dedup.** Same article re-indexed under 5 URLs — simhash / minhash on extracted text.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Pages/day, freshness SLA, politeness rules, content types, scope (whole web vs vertical) |
| HLD | 15 | Boxes: Frontier → Fetcher pool → Parser → Content Store; Bloom filter + URL canonicalizer alongside |
| Deep Dive | 15 | Two-tier frontier (priority queue + per-host queue), DNS cache, fetcher politeness |
| Trade-offs + wrap | 5 | BFS-uniform vs PageRank-priority crawl; freshness vs coverage budget |

## Related Designs

- **04-key-value-store** — the content store at the end of the crawler is exactly a wide-column KV.
- **10-typeahead** — same offline-pipeline shape (collect → process → serve).
- **Phase 5: 06-google-search** — the crawler designed here is step 1 of the full search system.
