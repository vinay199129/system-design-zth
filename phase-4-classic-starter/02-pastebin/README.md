# Design: Pastebin

> Design a service like Pastebin or GitHub Gist where users can store and share plain text snippets.

## Overview

Pastebin allows users to upload text content, receive a unique URL, and share it with others. Unlike a URL shortener, the system must store and serve the actual content (potentially large text blobs). This design tests your understanding of object storage, content delivery, and the separation of metadata from content.

## Difficulty: Easy

## Core Concepts Tested

- Blob/object storage vs relational metadata
- Content-addressable storage
- Read-heavy system with large payloads
- CDN and caching for static content
- Storage estimation for variable-size payloads
- Paste expiration and cleanup

## Companies That Ask This

Amazon, Google, Microsoft, Dropbox, Atlassian, Shopify

## Prerequisites

- Phase 1: Storage Types (Block, Object, File)
- Phase 1: Databases (SQL vs NoSQL)
- Phase 2: CDN and Caching
- Phase 2: Load Balancing
- Phase 3: Back-of-the-Envelope Estimation

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: separating metadata from content, storage choice, read optimization
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how content storage differs from the URL shortener design

## Learning Objectives

By the end of this design, you can:

- Defend **metadata-in-SQL + body-in-object-store** over **body-in-DB-row** in 60 seconds (row-size bloat, replication cost, CDN-friendliness).
- Explain when in-DB storage of the body is actually fine (< 1 KB pastes, single-region, low scale).
- Estimate storage and bandwidth for **1M pastes/day at 10 KB average** in 5 minutes.
- Name the most common pitfalls — **leaking raw S3 URLs**, **no expiration sweeper**, and **no rate limit on create**.
- Relate this design back to **Phase 1 Blob Storage & CDN** and the **01-url-shortener** key-generation pattern.

## Common Pitfalls

1. **Storing 10 MB pastes directly in Postgres.** Row size bloats the buffer pool and replication lag explodes — keep the body in S3, metadata in Postgres/DynamoDB.
2. **Returning the raw S3 URL to the client.** Leaks the bucket and lets anyone bypass auth — return a short signed URL or proxy through your app.
3. **No paste expiration / cleanup job.** Storage grows forever and old "burn-after-read" pastes leak — daily sweeper deletes expired metadata and S3 objects.
4. **No rate limit on the create endpoint.** Bots fill your bucket overnight — token-bucket per IP/user at the gateway.
5. **No content moderation hook.** Phishing kits and malware get hosted for free — at minimum, virus-scan + URL-blocklist on upload.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Functional (create / read / expire / optional syntax-highlight) + NFRs (99.95% read, p99 < 200 ms, body up to 10 MB) |
| HLD | 15 | 5 boxes: LB → App → KGS → SQL metadata → S3 body → CDN for hot pastes |
| Deep Dive | 15 | Write path with checksum + dedup, signed URL strategy, in-DB vs S3 threshold |
| Trade-offs + wrap | 5 | Public vs private pastes; inline-body cutoff (e.g. 4 KB stays in row, larger goes to S3) |

## Related Designs

- **01-url-shortener** — same KGS / Base62 key generator drives the paste key.
- **07-notification-system** — "share via email/push" handoff is delegated to this design.
- **Phase 5: 05-dropbox** — same metadata-plus-blob shape at petabyte scale with versioning and chunk dedup.
