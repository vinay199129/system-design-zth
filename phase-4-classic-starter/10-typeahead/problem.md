# Problem: Design Typeahead / Autocomplete

## Requirements

### Functional

- As a user types in a search box, show the top 5-10 matching suggestions
- Suggestions are ranked by popularity (search frequency)
- Suggestions update as the user types each character
- Support multi-word queries (e.g., "how to" → "how to cook rice")
- Remove offensive or harmful suggestions
- Optional: personalized suggestions based on user history

### Non-Functional

- Scale: 10B search queries per day
- Latency: Return suggestions in < 50ms (per keystroke)
- Availability: 99.99% — search suggestions must always work
- Freshness: Trending queries appear within 15-30 minutes
- Language support: Multiple languages

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Search queries / day | 10B |
| Unique queries | ~1B |
| QPS (suggestions) | ~120K |
| Peak QPS | ~360K |
| Avg query length | 20 characters |
| Avg keystrokes per query | 8 (with autocomplete) |
| Suggestion latency target | < 50ms |
| Trie size (1B queries) | ~50 GB |

## Hints

### Hint 1

A trie is the natural data structure for prefix matching — given the prefix "app", you can traverse to node "a" → "p" → "p" and find all completions below it. But a naive trie is too slow for real-time suggestions. Think about how to precompute the top-K results at each trie node.

### Hint 2

You don't need to update the trie in real time for every query. The serving trie can be rebuilt periodically (every 15-30 minutes) from an aggregation of query logs. This separates the real-time serving layer from the data collection layer.

### Hint 3

For latency < 50ms, caching is essential. Most users type common prefixes ("how", "what", "best"). The top 10-20% of prefixes serve 80%+ of all suggestions requests. A prefix → suggestions cache (Redis) can handle the majority of requests without touching the trie.

## Think About

- How do you handle trending queries that spike suddenly (e.g., breaking news)?
- Should you send a suggestion request for every keystroke, or debounce on the client side?
- How do you handle suggestions for misspelled prefixes?
- How would you personalize suggestions for each user without adding latency?
- How do you filter out offensive or sensitive suggestions in real time?
