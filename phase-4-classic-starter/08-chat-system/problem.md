# Problem: Design a Chat System

## Requirements

### Functional

- 1:1 messaging between users in real time
- Group chat (up to 500 members)
- Message delivery indicators: sent, delivered, read
- Online/offline presence indicators
- Message history and search
- Support text messages, images, and file attachments
- Multi-device sync (phone + desktop)

### Non-Functional

- Scale: 50M daily active users
- Latency: < 100ms for message delivery (sender to receiver)
- Reliability: No message loss — at-least-once delivery
- Ordering: Messages within a conversation must be ordered
- Availability: 99.99% uptime

## Constraints & Scale

| Metric | Value |
|--------|-------|
| DAU | 50M |
| Messages / day | 10B |
| Avg messages / user / day | 200 |
| Message QPS | ~115K |
| Peak QPS | ~350K |
| Avg message size | 500 bytes |
| Storage / day | ~5 TB |
| Concurrent connections | 20M |
| Avg group size | 50 members |

## Hints

### Hint 1

HTTP is request-response — it doesn't work well for real-time messaging where the server needs to push messages to the client. Think about WebSocket connections that persist between the client and a chat server. Each user maintains a long-lived connection.

### Hint 2

When a user sends a message, the chat server needs to find which server the recipient is connected to. You need a centralized mapping of `user_id → chat_server` so you can route messages to the right place. Redis works well for this.

### Hint 3

For group messages, the sender's chat server needs to deliver the message to all group members. With a 500-member group, that's 500 delivery operations per message. Think about whether the sender's server should do all the fan-out or if a message queue should handle it.

## Think About

- What happens when user B is offline? How does user B receive messages when they come back online?
- How do you maintain message ordering across multiple servers?
- How do you handle the scenario where a user has the app open on both phone and desktop?
- What happens to messages if a chat server crashes mid-delivery?
- How do you efficiently sync message history when a user opens the app after being offline for a week?
