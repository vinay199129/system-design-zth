# Design: Ticket Booking (BookMyShow / Ticketmaster)

> Design a ticket booking system that handles seat selection, concurrent reservations, and flash-sale traffic spikes without overselling.

## Overview

A ticket booking platform allows users to browse events, view seat maps, reserve seats, and complete purchases. The core challenge is preventing double-booking of the same seat when thousands of users attempt to book simultaneously, especially during flash sales where traffic spikes 100x above normal. The system must combine pessimistic locking for seat reservations, timeout-based hold expiry, and graceful degradation under extreme load.

## Difficulty: Hard

## Core Concepts Tested

- Seat map modeling and inventory management
- Pessimistic locking for concurrent seat reservation
- Timeout-based reservation with automatic release
- Flash sale handling (queue-based throttling, virtual waiting room)
- Eventual consistency for non-critical paths
- Payment integration with reservation lifecycle
- Read-heavy optimization with caching

## Companies That Ask This

BookMyShow, Ticketmaster, Amazon, Google, Microsoft, Uber, Flipkart, Razorpay

## Prerequisites

- 01-scaling-foundations (load balancing, rate limiting)
- 02-databases (transactions, locking strategies)
- 03-caching (read-heavy optimization)
- 05-message-queues (queue-based traffic shaping)
- 06-distributed-systems (consistency guarantees)

## Approach

1. Clarify scope: browse events, view seats, reserve, pay, cancel, flash sales.
2. Estimate traffic: normal vs. flash-sale QPS, concurrent bookings per event.
3. Design seat inventory: seat map schema with status (available/held/booked).
4. Design reservation flow: SELECT FOR UPDATE → hold with TTL → payment → confirm.
5. Design hold expiry: background job releasing expired holds.
6. Design flash sale handling: virtual waiting room, queue-based admission.
7. Design payment integration: reserve → pay → confirm (or release on failure).
8. Address scaling: read replicas for browsing, write isolation for booking, queue overflow.
