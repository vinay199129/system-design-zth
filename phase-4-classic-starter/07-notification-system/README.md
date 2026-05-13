# Design: Notification System

> Design a scalable notification service that delivers push notifications, SMS, and email.

## Overview

A notification system sends timely alerts to users across multiple channels (push, SMS, email, in-app). It must handle diverse delivery channels, user preferences, rate limiting, and retry logic. This problem tests your understanding of message queues, third-party integrations, and building reliable delivery pipelines.

## Difficulty: Medium

## Core Concepts Tested

- Message queue architecture (fan-out pattern)
- Multi-channel delivery (push, SMS, email)
- Template rendering and personalization
- Rate limiting and deduplication
- Delivery tracking and retry with backoff
- User preference management

## Companies That Ask This

Meta, Google, Amazon, Uber, Twilio, Airbnb, LinkedIn

## Prerequisites

- Phase 1: Message Queues (Kafka, SQS)
- Phase 2: Pub/Sub Patterns
- Phase 2: Retry Strategies (Exponential Backoff)
- Phase 3: Third-Party API Integration

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 30 minutes with a timer
3. Focus on: message flow, channel routing, reliability, deduplication
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to how you handle delivery failures across different channels

## Learning Objectives

By the end of this design, you can:

- Defend **per-channel queues with independent consumers** over **a single shared queue** in 60 seconds (head-of-line blocking, channel-specific retry policies).
- Explain when **synchronous delivery** is acceptable (transactional OTP within a 30-second window) and when async is required.
- Estimate **10M push + 1M SMS + 1M email per minute** and the per-channel worker count in 5 minutes.
- Name the most common pitfalls — **duplicate sends on retry**, **ignoring quiet hours**, and **slow email blocking fast push**.
- Relate this design back to **Phase 1 Message Queues** and **Phase 2 Retry/Backoff**.

## Common Pitfalls

1. **One shared queue for all channels.** A slow SES backlog blocks the entire pipeline including time-critical push — split into per-channel queues with their own consumers.
2. **Retries without an idempotency key.** Same OTP SMS sent twice; user is confused or charged twice — derive a `notification_id` and dedupe at the worker.
3. **No DLQ for poison messages.** A bad template kills the consumer in a loop — DLQ after N retries and alert on its depth.
4. **Sending to a channel the user disabled.** Wastes APNS / Twilio slots and annoys users — check preferences *before* enqueueing.
5. **Retry storm on third-party 5xx.** Hammering APNS/Twilio gets you rate-limited — exponential backoff with jitter, circuit breaker around the provider.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | Channels (push/SMS/email/in-app), throughput per channel, user preferences, dedup, scheduling |
| HLD | 15 | Boxes: API → router → per-channel queue → worker → APNS/Twilio/SES; preference svc; template svc |
| Deep Dive | 15 | Retry policy, DLQ, dedup window, template rendering, scheduled-job dispatcher |
| Trade-offs + wrap | 5 | At-most-once SMS (cost-driven) vs at-least-once push (idempotent client) |

## Related Designs

- **06-message-queues** (Phase 1) — this design is the canonical multi-channel pub/sub consumer pattern.
- **08-chat-system** — offline message delivery hands off to this notification system for push.
- **Phase 5: 09-ticket-booking** — booking confirmation flow uses this for the user-facing receipt.
