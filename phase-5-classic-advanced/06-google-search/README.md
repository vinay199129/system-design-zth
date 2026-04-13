# Design: Google Search

> Design a web search engine that crawls billions of pages, builds an inverted index, ranks results with PageRank, and serves queries with sub-second latency.

## Overview

Google Search is a web search engine that discovers pages via crawling, indexes their content, ranks them by relevance and authority, and serves results to users in milliseconds. The system spans a web crawler that navigates the internet, an indexing pipeline that builds inverted indexes, a ranking system incorporating PageRank and hundreds of signals, and a query serving layer with multi-tier caching. The scale is staggering: billions of pages, trillions of links, and tens of thousands of queries per second.

## Difficulty: Hard

## Core Concepts Tested

- Web crawler design (politeness, dedup, priority scheduling)
- Inverted index construction and storage
- PageRank algorithm (simplified)
- Query serving with multi-tier caching
- Spell correction and query suggestion
- Snippet generation and result formatting
- Distributed computation (MapReduce-style)

## Companies That Ask This

Google, Microsoft (Bing), Amazon, Apple, Yandex, Baidu, DuckDuckGo

## Prerequisites

- 01-scaling-foundations (MapReduce, distributed processing)
- 02-databases (inverted indexes, document stores)
- 03-caching (multi-tier caching strategies)
- 05-message-queues (crawler job queues)
- 06-distributed-systems (consistency, partitioning)

## Approach

1. Clarify scope: crawl, index, rank, query, autocomplete, spell check.
2. Estimate traffic: pages to crawl, index size, queries/sec.
3. Design the web crawler: URL frontier, politeness policy, dedup (URL + content).
4. Design the indexing pipeline: tokenize → build inverted index → store sharded.
5. Design ranking: PageRank for authority + TF-IDF for relevance + freshness signals.
6. Design query serving: parse query → retrieve from index → rank → return top-K.
7. Add caching: result cache, index cache, DNS cache.
8. Address scaling: incremental indexing, real-time freshness, query latency tail.
