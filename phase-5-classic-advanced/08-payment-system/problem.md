# Problem: Design a Payment System (Stripe)

## Requirements

### Functional

- Merchants can charge customers via credit card, debit card, or bank transfer.
- The system supports refunds (full and partial).
- The system maintains a financial ledger with double-entry bookkeeping.
- Merchants can view transaction history and settlement reports.
- The system processes payouts to merchant bank accounts on a schedule.
- Webhook notifications are sent for payment events (success, failure, refund).

### Non-Functional

- **Correctness:** Exactly-once payment processing — no duplicate charges, no lost payments.
- **Availability:** 99.99% — payment processing must not go down during peak commerce.
- **Latency:** Payment authorization < 2 seconds.
- **Durability:** Every financial transaction must be durably recorded and auditable.
- **Compliance:** PCI-DSS compliant — never store raw card numbers.
- **Reconciliation:** Internal ledger must match bank statements within 24 hours.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Payments per second (average) | 10,000 |
| Payments per second (peak — Black Friday) | 100,000 |
| Average transaction value | $50 |
| Daily transaction volume | $50 billion |
| Merchants on platform | 5 million |
| Refund rate | 2% of transactions |
| Settlement cycle | T+2 (2 business days) |
| Webhook delivery SLA | < 30 seconds |
| Idempotency key TTL | 24 hours |

## Hints

### Hint 1: Idempotency

Network failures happen. A client sends a payment request, the server processes it, but the response is lost. The client retries. Without idempotency, the customer is charged twice. How do you ensure that retrying a payment request with the same idempotency key returns the same result without processing it again?

### Hint 2: Double-Entry Bookkeeping

In accounting, every transaction has two sides: a debit and a credit. When a customer pays $50, the merchant account is credited $50 and the customer's payment method is debited $50. The sum of all debits must equal the sum of all credits at all times. How do you maintain this invariant in a distributed system?

### Hint 3: Distributed Transactions

A payment flow touches multiple services: payment service → fraud detection → bank API → ledger → notification. If the bank charges the card but the ledger write fails, the system is inconsistent. Two-phase commit (2PC) or the Saga pattern can help. Which one fits this use case?

## Think About

- What happens if the bank API times out? Is the payment charged or not? How do you find out?
- How do you handle a refund for a payment that was processed 6 months ago?
- How does the reconciliation batch job work? What happens when it finds a discrepancy?
- How do you handle currency conversion for international payments?
- How do you detect and prevent fraudulent transactions in real time?
- What happens during a partial system outage? Can you still process payments for unaffected merchants?
