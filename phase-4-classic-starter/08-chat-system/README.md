# Design: Chat System

> Design a real-time chat system like WhatsApp, Slack, or Facebook Messenger.

## Overview

A chat system supports real-time messaging between users in 1:1 conversations and group chats. It requires persistent WebSocket connections, message ordering, delivery guarantees, and offline message handling. This problem tests your understanding of real-time communication, presence management, and data storage for high-throughput messaging.

## Difficulty: Hard

## Core Concepts Tested

- WebSocket connections and connection management
- Message ordering and delivery guarantees
- Online/offline presence tracking
- Group messaging fan-out
- Message storage and sync across devices
- Push notifications for offline users

## Companies That Ask This

Meta (WhatsApp, Messenger), Slack, Google, Microsoft (Teams), Discord, Telegram

## Prerequisites

- Phase 1: Networking (TCP, WebSocket, Long Polling)
- Phase 2: Message Queues
- Phase 2: Pub/Sub Patterns
- Phase 3: Consistency and Ordering
- Phase 3: Connection Management at Scale

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 40 minutes with a timer
3. Focus on: real-time delivery, message ordering, offline handling, group messaging
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to the difference between 1:1 and group message delivery

## Learning Objectives

By the end of this design, you can:

- Defend **persistent WebSocket connections (with long-poll fallback) + Redis pub/sub for cross-node fan-out** over **plain HTTP polling** in 60 seconds (latency, server load, presence accuracy).
- Explain when **Server-Sent Events (SSE)** is sufficient (server-to-client only, e.g. notifications) and when full-duplex WS is needed.
- Estimate **~100k concurrent connections per WS gateway** and the gateway fleet for 50M concurrent users in 5 minutes.
- Name the most common pitfalls — **presence-flap heartbeats**, **storing messages in SQL**, and **fanning out groups of 1M members at write time**.
- Relate this design back to **Phase 1 Networking** (WebSocket, long polling) and **Phase 3 Consistency & Ordering**.

## Common Pitfalls

1. **Sticky load balancing by source IP.** Mobile clients change IPs constantly and reconnect to the wrong node — consistent-hash by `user_id` instead.
2. **Storing messages in MySQL.** Hits a wall at a few TB and read amplification — Cassandra/HBase wide rows partitioned by `conversation_id`.
3. **Writing presence on every heartbeat.** Redis melts under the write storm — only write on state change, use a TTL key for liveness.
4. **Push fan-out for huge groups at write time.** A 100k-member group means 100k writes per message — pull-on-read above a threshold (e.g. > 256 members).
5. **Trusting client-side timestamps for ordering.** Clocks lie — server assigns a monotonic per-conversation sequence number.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | 1:1 + group, presence, offline delivery, multi-device sync, read receipts |
| HLD | 15 | LB → WS gateway → message service → Cassandra; Redis pub/sub for cross-node fan-out; notification svc for offline |
| Deep Dive | 15 | End-to-end delivery: send → store → fan-out → ack; multi-device cursor sync; group push vs pull |
| Trade-offs + wrap | 5 | Push vs pull fan-out for groups; at-least-once delivery + client-side dedup |

## Related Designs

- **07-notification-system** — handles the offline-user push handoff.
- **06-message-queues** (Phase 1) — the cross-node delivery bus is exactly pub/sub.
- **Phase 5: 03-twitter** — DMs reuse this design; the timeline reuses Cassandra wide-row pattern.
