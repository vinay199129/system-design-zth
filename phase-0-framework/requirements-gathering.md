# Requirements Gathering

> The first 5 minutes of your interview determine the quality of the next 40.

## Why Requirements Matter

A system designed for 1,000 users looks completely different from one designed for 1 billion users. If you don't ask, you'll design for the wrong scale.

## The Two Types of Requirements

### Functional Requirements (FR)

What the system **does**. These define features and user flows.

**Template questions:**
- Who are the users? (consumers, businesses, internal teams)
- What are the top 3-5 features? (be specific)
- What can we defer to v2? (keep scope tight)
- What does the user journey look like? (step by step)

### Non-Functional Requirements (NFR)

How **well** the system does it. These drive architecture decisions.

| NFR | Question to Ask | Impact on Design |
|-----|----------------|-----------------|
| Scale | How many DAU? requests/day? | Sharding, caching, CDN |
| Latency | What's the acceptable response time? | Cache layers, edge computing |
| Availability | Can we afford downtime? (99.9% vs 99.99%) | Replication, multi-region |
| Consistency | Is eventual consistency OK? | Database choice, sync vs async |
| Durability | Can we lose data? | Replication factor, backups |
| Throughput | Reads vs writes ratio? | Read replicas, write-ahead logs |

## Practice: Scope Three Systems

### System 1: "Design a URL Shortener"

**Good scoping:**

> **FR:**
> - User submits a long URL, gets a short URL back
> - Clicking the short URL redirects to the original
> - URLs can have optional TTL (expiration)
> - Analytics: click count per URL (nice-to-have)
>
> **NFR:**
> - Scale: 100M URLs shortened per month, 10B redirects per month
> - Latency: Redirect in < 100ms
> - Availability: 99.99% (redirects must always work)
> - Consistency: Eventual is fine (a few seconds delay for new URLs is OK)
>
> **Out of scope:** Custom domains, user accounts, link editing

### System 2: "Design a Chat System"

**Good scoping:**

> **FR:**
> - 1-on-1 messaging and group messaging (up to 500 members)
> - Online/offline presence indicator
> - Message history (persistent, searchable)
> - Read receipts and typing indicators
>
> **NFR:**
> - Scale: 50M DAU, 2B messages/day
> - Latency: Messages delivered < 200ms (real-time feel)
> - Availability: 99.99%
> - Consistency: Messages must be ordered correctly per conversation
> - Durability: No message loss
>
> **Out of scope:** Voice/video calls, file sharing > 10MB, end-to-end encryption (mention but don't design)

### System 3: "Design a News Feed"

**Good scoping:**

> **FR:**
> - Users see a personalized feed of posts from people they follow
> - Users can post text + images
> - Feed is ranked (not just chronological)
> - Infinite scroll with pagination
>
> **NFR:**
> - Scale: 500M DAU, 200M posts/day, 5B feed views/day
> - Latency: Feed loads < 500ms
> - Availability: 99.99%
> - Consistency: Eventual (new posts appearing with 5-10s delay is acceptable)
> - Read/write ratio: 25:1 (read-heavy)
>
> **Out of scope:** Ads, stories, live video, comments

## Framework: The SCOPE Method

Use this mental checklist:

| Letter | Question |
|--------|----------|
| **S** | **Scale** -- How many users? requests? data? |
| **C** | **Core features** -- What are the top 3-5 things this system does? |
| **O** | **Out of scope** -- What are we NOT building today? |
| **P** | **Performance** -- Latency, throughput, availability targets? |
| **E** | **Edge cases** -- What happens at extreme scale? during failures? |

## Common Interviewer Responses

| When you ask... | They might say... | What it means... |
|----------------|-------------------|-----------------|
| "How many users?" | "Design for scale" | Assume 100M+ DAU, show you can scale |
| "SQL or NoSQL?" | "What would you choose?" | They want to see your reasoning |
| "Strong or eventual consistency?" | "What are the trade-offs?" | Discuss both, pick one with justification |
| "Is this feature in scope?" | "What do you think?" | Prioritize: include if core, defer if not |

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Skip requirements and start drawing | You'll design for the wrong problem |
| Ask 20 questions | Keep it to 5-7 key questions, max 5 min |
| Assume without stating | Always say "I'll assume X" out loud |
| Forget non-functional requirements | NFRs drive architecture more than features |
| Scope too broadly | 3-5 features max in a 45-min interview |
