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
