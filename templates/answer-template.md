# System Design Answer Template

> Use this 45-minute framework for every design problem. Practice until it's automatic.

## The 45-Minute Structure

### Phase 1: Requirements & Estimation (10 min)

**Functional Requirements (3 min)**

```
"Let me clarify the core features we need to support:"

1. [Core feature 1]
2. [Core feature 2]
3. [Core feature 3]
4. [Nice-to-have, if time permits]

"For scope, I'll focus on [features 1-3] and mention [feature 4] if we have time."
```

**Non-Functional Requirements (2 min)**

```
"For non-functional requirements:"

- Scale: [X DAU, Y requests/day]
- Latency: [target, e.g., < 200ms for reads]
- Availability: [e.g., 99.99% uptime]
- Consistency: [strong vs eventual, and why]
- Durability: [data loss tolerance]
```

**Back-of-Envelope Estimation (5 min)**

```
"Let me do a quick estimation:"

Traffic:
  - DAU = X
  - Actions/user/day = Y
  - QPS = X * Y / 86,400 = Z
  - Peak QPS = Z * 3 = W

Storage:
  - Size per item = A
  - Items/day = B
  - Daily storage = A * B = C
  - 5-year storage = C * 365 * 5 = D

Bandwidth:
  - QPS * avg response size = E
```

### Phase 2: High-Level Design (15 min)

**System Architecture (10 min)**

```
"Here's my high-level architecture:"

[Draw the box diagram]

Components:
1. Client (Web/Mobile)
2. Load Balancer
3. API Gateway
4. [Service 1] - handles [responsibility]
5. [Service 2] - handles [responsibility]
6. Database - [SQL/NoSQL, reason]
7. Cache - [Redis, reason]
8. Message Queue - [Kafka, reason]
9. [Blob Store / CDN / Search, if needed]
```

**API Design (5 min)**

```
"The key APIs are:"

[Endpoint 1]: [Method] /api/v1/[resource]
  Request: { ... }
  Response: { ... }

[Endpoint 2]: [Method] /api/v1/[resource]
  Request: { ... }
  Response: { ... }

Pagination: cursor-based
Auth: [JWT / OAuth2]
Rate limit: [X requests/min]
```

### Phase 3: Detailed Design (15 min)

**Data Model (5 min)**

```
"For the data model:"

Table: [name]
  - id (PK)
  - [field1] (type)
  - [field2] (type)
  - created_at (timestamp)
  Index on: [field] for [query pattern]
  Partition by: [strategy] because [reason]
```

**Deep Dive: Component 1 (5 min)**

```
"The most interesting challenge here is [X]. Let me dive deeper:"

Option A: [approach] - pros: [X], cons: [Y]
Option B: [approach] - pros: [X], cons: [Y]

"I'd choose [Option X] because [justification based on our requirements]."

Edge cases:
- What if [scenario]? -> [handling]
- What if [scenario]? -> [handling]
```

**Deep Dive: Component 2 (5 min)**

```
"Another critical piece is [Y]:"

[Detailed explanation with diagram if needed]
```

### Phase 4: Evaluation & Wrap-up (5 min)

**Bottlenecks & Scaling (2 min)**

```
"Potential bottlenecks:"
1. [Component] - could be bottleneck at [X scale]
   Mitigation: [strategy]
2. [Component] - single point of failure
   Mitigation: [redundancy strategy]
```

**Trade-offs (2 min)**

```
"Key trade-offs in this design:"
1. We chose [X] over [Y] because [reason]
2. If requirements change to [Z], we'd modify [component]
```

**Future Improvements (1 min)**

```
"If we had more time, I'd add:"
1. [Improvement 1]
2. [Improvement 2]
3. [Monitoring / alerting / observability]
```

## Phrases That Impress Interviewers

| Situation | Say This |
|-----------|----------|
| Starting the design | "Let me make sure I understand the requirements correctly..." |
| Making a decision | "I'd choose X over Y because, given our scale of Z..." |
| Acknowledging trade-offs | "The trade-off here is consistency vs availability. Given that..." |
| Going deeper | "Let me zoom into this component because it's the most critical..." |
| Handling uncertainty | "I'm not 100% sure about the internals of X, but conceptually..." |
| Wrapping up | "To summarize, the key design decisions are..." |

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|-----------|
| Jump to drawing boxes | Start with requirements and estimation |
| Design everything at once | Start simple, add complexity when numbers demand it |
| Use buzzwords without explanation | Explain what each component does and why |
| Ignore failure cases | Discuss what happens when things break |
| Give one option | Present 2-3 options with trade-offs, then choose |
| Stay silent while thinking | Think out loud -- the interviewer evaluates your process |
