# Problem: Design a Ticket Booking System (BookMyShow / Ticketmaster)

## Requirements

### Functional

- Users can browse events and venues with available seating.
- Users can view an interactive seat map and select specific seats.
- Selected seats are temporarily held (reserved) during the payment window.
- Users complete payment to confirm the booking; held seats are released on timeout.
- Users can cancel bookings (with refund policy enforcement).
- The system supports flash sales (high-demand events going on sale at a specific time).

### Non-Functional

- **Correctness:** No double-booking — a seat can only be sold to one user.
- **Availability:** 99.9% normally; graceful degradation during flash sales.
- **Latency:** Seat availability check < 200ms; booking confirmation < 3 seconds.
- **Scalability:** Handle 100,000+ concurrent users attempting to book the same event.
- **Fairness:** First-come-first-served during flash sales (no queue jumping).
- **Hold timeout:** Reserved seats released after 10 minutes if payment is not completed.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Events per day | 50,000 |
| Seats per large event | 80,000 |
| Average seats per event | 5,000 |
| Bookings per day (normal) | 5 million |
| Flash sale concurrent users | 100,000+ per event |
| Flash sale booking attempts/sec | 50,000 per event |
| Hold expiry timeout | 10 minutes |
| Payment completion rate | 70% (30% of holds expire) |
| Average ticket price | $75 |

## Hints

### Hint 1: Seat Locking Strategy

You need to prevent two users from booking the same seat. Optimistic locking (check-and-set with version) works under low contention. But during a flash sale with 50,000 users clicking "Book" in the same second on the same 80,000 seats, you need pessimistic locking (SELECT FOR UPDATE) to avoid excessive retry storms.

### Hint 2: Temporary Hold with Timeout

When a user selects a seat, you "hold" it for 10 minutes while they complete payment. If they don't pay, the hold expires and the seat becomes available again. Think about: where is the hold state stored? How do you efficiently detect and release expired holds? What if the hold-release job is delayed?

### Hint 3: Flash Sale Traffic Management

When a huge concert goes on sale at 10:00 AM, 500,000 users hit the system simultaneously. Your booking service can handle 10,000 requests/sec. How do you absorb the burst? Think about virtual waiting rooms, queue-based admission, and request throttling.

## Think About

- What happens if a user selects 4 seats but only 2 are available? Partial booking or all-or-nothing?
- How do you display real-time seat availability on the seat map to 100,000 concurrent users?
- What if the payment gateway is slow? Does the hold timeout extend?
- How do you handle "return to queue" when a hold expires and the seat goes back to the pool?
- How do you prevent bots from bulk-buying tickets during flash sales?
- What database isolation level do you need for the booking transaction?
