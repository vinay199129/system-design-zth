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
