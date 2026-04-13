# Design: Payment System (Stripe)

> Design a payment processing platform that guarantees exactly-once payment execution through idempotency, double-entry bookkeeping, and distributed transaction management.

## Overview

A payment system like Stripe processes financial transactions between buyers, merchants, and banks. The system must guarantee that payments are processed exactly once (no duplicate charges), maintain accurate financial records using double-entry bookkeeping, handle distributed transactions across multiple services, and reconcile with external banking systems. Correctness is non-negotiable — a single bug can move real money incorrectly.

## Difficulty: Hard

## Core Concepts Tested

- Idempotency keys for exactly-once semantics
- Double-entry bookkeeping (every debit has a credit)
- Distributed transactions: two-phase commit (2PC) and Saga pattern
- Reconciliation batch processing
- Payment state machine (pending → authorized → captured → settled)
- PCI-DSS compliance and tokenization
- Retry and timeout handling for external bank APIs

## Companies That Ask This

Stripe, PayPal, Square, Amazon, Google, Goldman Sachs, Visa, Mastercard, Adyen

## Prerequisites

- 01-scaling-foundations (reliability, fault tolerance)
- 02-databases (ACID transactions, isolation levels)
- 05-message-queues (reliable delivery, dead letter queues)
- 06-distributed-systems (distributed transactions, Saga)

## Approach

1. Clarify scope: charge, refund, payout, ledger, reconciliation.
2. Estimate traffic: payments/sec, average transaction value, peak (Black Friday).
3. Design the payment flow: client → API (with idempotency key) → payment service → bank.
4. Design the ledger: double-entry bookkeeping with immutable entries.
5. Design distributed transactions: Saga for multi-step payment flows.
6. Design reconciliation: batch job comparing internal ledger vs. bank statements.
7. Design retry logic: exponential backoff, circuit breakers for bank APIs.
8. Address trade-offs: consistency vs. latency, synchronous vs. async settlement.
