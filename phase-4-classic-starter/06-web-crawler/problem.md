# Problem: Design a Web Crawler

## Requirements

### Functional

- Given a set of seed URLs, crawl the web and discover new pages
- Download and store HTML content of each page
- Extract links from pages and add them to the crawl queue
- Respect `robots.txt` rules for each domain
- Avoid crawling the same URL or duplicate content twice
- Support prioritization — important pages should be crawled first

### Non-Functional

- Scale: Crawl 1 billion pages per month
- Throughput: ~400 pages per second
- Politeness: Max 1 request per second per domain
- Storage: Store raw HTML for all crawled pages
- Robustness: Handle malformed HTML, infinite loops, spider traps

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Pages / month | 1 billion |
| Pages / second | ~400 |
| Avg page size | 500 KB (HTML + assets) |
| Storage / month | ~500 TB |
| Unique domains | ~10M |
| URLs in frontier | 100M+ at any time |
| Crawl workers | 50-100 |

## Hints

### Hint 1

The URL frontier is the heart of the crawler. It's not just a simple queue — it needs to handle prioritization (important pages first) AND politeness (don't hit the same domain too frequently). Think about a two-level queue: a priority queue that feeds into per-domain queues.

### Hint 2

You'll see the same URL many times across different pages. A Bloom filter is a memory-efficient way to check "have I seen this URL before?" with a small false-positive rate. For 1 billion URLs, a Bloom filter needs about 1.2 GB.

### Hint 3

Two different URLs can point to the same content (e.g., `http://` vs `https://`, trailing slashes, query parameter reordering). Before adding a URL to the frontier, you need to normalize it. Additionally, content-level deduplication (simhash) catches pages with the same content at different URLs.

## Think About

- How do you handle spider traps (e.g., a calendar page with infinite date URLs)?
- How do you decide when to re-crawl a page vs crawl a new one?
- What happens if a domain's `robots.txt` blocks your crawler?
- How do you handle different content types (PDFs, images, JavaScript-rendered pages)?
- How do you distribute work across multiple crawl workers without duplicate effort?
