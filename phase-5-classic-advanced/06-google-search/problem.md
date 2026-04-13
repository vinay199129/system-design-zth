# Problem: Design Google Search

## Requirements

### Functional

- Users can enter a text query and receive a ranked list of web page results.
- The system continuously crawls and indexes the web.
- Results include title, URL, and a relevant text snippet.
- The system provides autocomplete/query suggestions as the user types.
- The system corrects misspelled queries ("Did you mean...?").
- Results are ranked by relevance, authority, and freshness.

### Non-Functional

- **Availability:** 99.99% — search must always be available.
- **Latency:** Results returned < 500ms (including network round trip).
- **Freshness:** Breaking news pages indexed within minutes.
- **Scalability:** Handle 100,000+ queries/sec, index 100B+ web pages.
- **Relevance:** Top 10 results should satisfy the user's intent >80% of the time.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Total web pages to index | 100+ billion |
| Index size (compressed) | ~100 PB |
| Pages crawled per day | 5 billion |
| Search queries per second | 100,000 |
| Average query length | 3 words |
| Average results per page | 10 |
| Autocomplete suggestions per keystroke | 5-10 |
| Unique URLs discovered per day | 500 million |
| Average page size (HTML) | 50 KB |
| Crawl bandwidth per day | ~250 TB |

## Hints

### Hint 1: Web Crawler

You need a system that starts from seed URLs, fetches pages, extracts links, and follows them recursively. But you can't crawl everything at once. Think about: URL frontier (priority queue), politeness (don't DDoS websites), deduplication (same content at different URLs), and crawl scheduling (how often to re-crawl).

### Hint 2: Inverted Index

A forward index maps documents to words. An inverted index maps words to documents — this is what makes search fast. For the query "distributed systems," you look up both terms in the inverted index and intersect the posting lists. How do you build this at 100B document scale? How do you update it incrementally?

### Hint 3: Ranking

Having a list of pages containing the query terms isn't enough. You need to rank them. PageRank measures authority (pages linked to by many other important pages rank higher). TF-IDF measures content relevance. Freshness, user engagement, and hundreds of other signals also contribute. How do you combine them efficiently?

## Think About

- How do you handle the "freshness" requirement? A news article published 2 minutes ago needs to appear in results.
- How do you detect and handle spam pages trying to game the ranking?
- How do you shard the index? By document? By term? What are the trade-offs?
- How does autocomplete work while the user is still typing?
- What caching strategy works when 30% of queries are unique (long tail)?
- How do you handle queries in 100+ languages with different tokenization rules?
