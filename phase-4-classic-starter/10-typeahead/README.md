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
