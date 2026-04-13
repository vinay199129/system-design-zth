# Problem: Design a Notification System

## Requirements

### Functional

- Send notifications via push (iOS/Android), SMS, and email
- Support notification templates with variable substitution
- Respect user preferences (opt-in/out per channel, quiet hours)
- Support both real-time triggers and scheduled notifications
- Track delivery status (sent, delivered, failed, opened)
- Rate limit notifications per user to prevent spam

### Non-Functional

- Scale: 10M notifications per day
- Latency: Real-time notifications delivered within 5 seconds
- Reliability: At-least-once delivery (no lost notifications)
- Availability: 99.9% uptime
- Extensible: Easy to add new channels (e.g., Slack, WhatsApp)

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Notifications / day | 10M |
| Peak notifications / sec | ~500 |
| Push notifications | 60% of total |
| Email | 30% of total |
| SMS | 10% of total |
| Users | 50M |
| Templates | ~500 |
| Avg message size | 1 KB |

## Hints

### Hint 1

Think about each notification channel as a separate processing pipeline. A single notification event might need to be delivered to multiple channels for the same user. This is a classic fan-out pattern — one message becomes many.

### Hint 2

Third-party services (APNs, FCM, Twilio, SendGrid) have different reliability characteristics. You need a retry mechanism with exponential backoff, but also a dead-letter queue for notifications that permanently fail.

### Hint 3

Users can receive duplicate notifications if the producer retries after a timeout. You need idempotency — use a unique notification ID and check-before-send to prevent the same message from being delivered twice.

## Think About

- How do you handle a user who has both iOS and Android devices?
- What happens if the push notification service (APNs/FCM) is temporarily down?
- How do you implement "quiet hours" without delaying critical notifications?
- How would you support notification grouping (e.g., "5 people liked your post")?
- How do you prevent a single event from generating thousands of notifications (e.g., a celebrity posts)?
