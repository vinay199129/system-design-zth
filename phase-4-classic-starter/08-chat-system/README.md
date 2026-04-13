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
