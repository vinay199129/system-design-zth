# Design: Typeahead / Autocomplete

> Design a typeahead suggestion system like Google Search autocomplete or Amazon's search suggestions.

## Overview

A typeahead system shows real-time search suggestions as users type in a search box. It must return relevant suggestions within milliseconds for every keystroke. This problem tests your understanding of trie data structures, prefix matching, ranking, and serving low-latency queries at massive scale.

## Difficulty: Medium

## Core Concepts Tested

- Trie data structure for prefix matching
- Ranking and frequency-based suggestions
- Caching prefix-to-suggestions mapping
- Data collection and aggregation pipeline
- Low-latency serving architecture
- Multi-language and personalization

## Companies That Ask This

Google, Amazon, Microsoft (Bing), Uber, Spotify, Netflix, Airbnb

## Prerequisites

- Phase 1: Trie Data Structure
- Phase 1: Sorting and Top-K Algorithms
- Phase 2: Caching Strategies
- Phase 3: Data Pipeline Architecture
- Phase 3: Back-of-the-Envelope Estimation

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: data structure for prefix lookup, ranking model, update pipeline, latency optimization
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how you separate the real-time serving path from the data collection path

## Learning Objectives

By the end of this design, you can:

- Defend **in-memory trie / FST with per-prefix precomputed top-K** over **Elasticsearch prefix queries** in 60 seconds (latency, throughput, simplicity at scale).
- Explain when **Elasticsearch completion suggester** is fine (low QPS, rich query needs, multi-language) and when it isn't.
- Estimate **trie memory for 100M historical queries** and per-keystroke latency budget in 5 minutes.
- Name the most common pitfalls — **per-request top-K computation**, **no edge cache**, and **stale or offensive trends surfacing**.
- Relate this design back to **Phase 1 Trie / Top-K** and **Phase 2 Caching**.

## Common Pitfalls

1. **Computing top-K children per request.** Too slow under load — precompute and cache top-K *on* each trie node.
2. **Single mutable trie serving reads and writes.** Lock contention kills latency — build an immutable snapshot offline, atomically swap.
3. **No edge caching of suggestions.** Every keystroke hits the origin — short-TTL CDN cache + client-side debounce (150 ms).
4. **No moderation pipeline.** Trending profanity or doxing queries surface — blocklist + manual-review queue + per-region filter.
5. **One global trie, no personalization.** "*github*" suggests the same for everyone — overlay a small per-user/per-locale trie on top.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | < 50 ms per keystroke, top 10 results, freshness of trends, multi-language, scale (100k QPS) |
| HLD | 15 | Two paths: serving (client → CDN → API → trie shard) and offline (query log → aggregator → trie builder) |
| Deep Dive | 15 | Trie node with precomputed top-K, offline rebuild + atomic swap, sharding by prefix |
| Trade-offs + wrap | 5 | Trie size vs query volume tracked; freshness vs rebuild cost |

## Related Designs

- **06-web-crawler** — same shape: offline pipeline feeds a low-latency serving layer.
- **09-news-feed** — both precompute reads to serve scroll/keystroke latency.
- **Phase 5: 06-google-search** — the search box you type into uses exactly this design.
