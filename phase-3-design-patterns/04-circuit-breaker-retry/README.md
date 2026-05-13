# 04 Circuit Breaker & Retry Patterns

> When a dependency fails, your system needs to fail gracefully — not cascade into a full outage.

## Why This Matters

Resilience patterns are tested in every system design interview that involves microservices, external API calls, or distributed dependencies. The moment you mention "Service A calls Service B," the interviewer will probe: "What happens when Service B is down?" If your answer isn't circuit breakers, retries with backoff, and graceful degradation, you'll lose points.

These patterns demonstrate operational maturity. Any engineer can design a happy-path system. Interviewers want to see that you think about failure modes, cascading failures, and recovery strategies. Netflix's Chaos Engineering culture (and their Hystrix library) popularized these patterns, and they remain the standard vocabulary for resilient distributed systems.

Circuit breakers, retries, bulkheads, and timeouts are complementary — they form a layered defense against dependency failures. Knowing how they interact and when to apply each one is what separates senior-level answers.

## The Pattern

### How It Works

A **circuit breaker** wraps calls to an external dependency and monitors failure rates. It has three states:

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Failure threshold exceeded
    Open --> HalfOpen: Timeout expires
    HalfOpen --> Closed: Probe request succeeds
    HalfOpen --> Open: Probe request fails

    note right of Closed: All requests pass through.\nFailures are counted.
    note right of Open: All requests fail immediately.\nNo calls to dependency.
    note right of HalfOpen: One probe request allowed.\nSuccess = recover. Failure = stay open.
```

- **Closed (normal):** Requests flow through. The breaker counts failures. If failures exceed a threshold (e.g., 50% failure rate over 10 seconds), it trips to Open.
- **Open (tripped):** All requests **fail immediately** without calling the dependency. This prevents overwhelming a struggling service. After a timeout, it transitions to Half-Open.
- **Half-Open (probing):** A single probe request is allowed through. If it succeeds, the breaker resets to Closed. If it fails, it returns to Open.

### Exponential Backoff with Jitter

When retrying failed requests, use exponential backoff to avoid thundering herd:

```
wait_time = min(base_delay * 2^attempt + random_jitter, max_delay)
```

- **Attempt 1:** 100ms + jitter
- **Attempt 2:** 200ms + jitter
- **Attempt 3:** 400ms + jitter
- **Attempt 4:** 800ms + jitter
- Cap at `max_delay` (e.g., 30 seconds)

**Jitter is critical.** Without it, all failed clients retry at exactly the same intervals, creating synchronized spikes. Full jitter randomizes the wait across `[0, calculated_delay]`.

### Variations

**Bulkhead Pattern:** Isolate dependency calls into separate thread pools or connection pools. If one dependency stalls, it only exhausts its own pool — other dependencies remain unaffected. Think of watertight compartments on a ship.

**Timeout Pattern:** Set aggressive timeouts on all external calls. A slow response is often worse than a failed response because it holds resources (threads, connections) hostage.

**Graceful Degradation:** When a dependency is unavailable, return cached data, default values, or a reduced feature set instead of an error. Example: if the recommendation service is down, show trending items instead.

## When to Use This Pattern

| Signal in Interview | Apply This Pattern |
|---|---|
| "Service A depends on Service B" | Circuit breaker on the call boundary |
| "What if the database / cache is down?" | Retry with backoff + graceful degradation |
| "How do you prevent cascading failures?" | Circuit breaker + bulkhead + timeout |
| "External third-party API in your design" | Circuit breaker + retry + fallback |
| "High availability requirements" | Full resilience stack |

## Trade-offs

| Pros | Cons |
|---|---|
| Prevents cascading failures across services | Added latency from retry delays |
| Fast failure when dependency is down (circuit open) | Complexity in tuning thresholds and timeouts |
| Protects struggling services from being overwhelmed | False positives — circuit may open during transient issues |
| Enables graceful degradation | Stale data when serving from fallback/cache |
| Self-healing (half-open probe) | Monitoring overhead to track breaker states |

## Real-World Examples

- **Netflix Hystrix:** Pioneered the circuit breaker pattern for microservices. Each service dependency has its own circuit breaker with configurable thresholds. Now succeeded by Resilience4j.
- **AWS SDK:** Built-in exponential backoff with jitter for all API calls. Retry policies are configurable per operation.
- **Shopify:** Uses circuit breakers on all external payment gateway calls. If a gateway fails, traffic is routed to a backup gateway.

## Interview Cheat Sheet

- **Circuit breaker** prevents calling a known-failed dependency. **Retry** handles transient failures.
- Always pair retries with **exponential backoff + jitter** — never retry in a tight loop.
- **Bulkheads** isolate failures; **timeouts** bound waiting time. Use both with circuit breakers.
- Mention **graceful degradation** — what does the user see when a dependency is down?
- Only retry **idempotent** operations. Retrying a non-idempotent write can cause duplicates.
- Circuit breaker thresholds: typically 50% failure rate over a 10-second sliding window.
- Name concrete tools: Resilience4j (Java), Polly (.NET), or built-in cloud SDK retries.

## Common Interview Questions

1. "How do you handle a downstream service outage?" — Circuit breaker + fallback response.
2. "How do you prevent retry storms?" — Exponential backoff with jitter + circuit breaker.
3. "Service B is slow — how does that affect Service A?" — Timeouts + bulkhead isolation.
4. "How do you test resilience?" — Chaos engineering, fault injection, circuit breaker state monitoring.

## Deep Dive: Tuning Circuit Breaker Thresholds

The failure threshold and recovery timeout are the two most important tuning parameters. Set the **failure threshold** too low and the breaker trips on normal transient errors; set it too high and it doesn't protect against real outages. Start with 50% failure rate over a 10-second sliding window as a baseline. The **recovery timeout** (time in Open before transitioning to Half-Open) should be long enough for the dependency to recover — typically 30-60 seconds. In production, these values are tuned per dependency based on its SLA and failure characteristics. In interviews, state reasonable defaults and explain that they're tunable.

---

## First-time Recognition Signals

When you read a brand-new system design prompt, this pattern is the right tool if you see:

- **"Service A depends on service B; if B slows down, A must not pile up requests"** — the textbook circuit breaker.
- **"Avoid cascading failures across microservices"** — Hystrix / resilience4j / service-mesh retries with budgets.
- **"Transient network blips should be retried, permanent errors should fail fast"** — retry-with-backoff + circuit breaker together.
- **"Third-party dependency with unpredictable latency"** (payment gateway, geocoding API) — wrap calls in a breaker.
- **"Bulkhead isolation between tenants / call types"** so a slow tenant cannot starve others — bulkhead pattern alongside breakers.

### Anti-signals (looks like this pattern, isn't)

- **"Monolith with no cross-process calls"** — circuit breakers are about cross-process resilience; for in-process calls, just use a timeout.
- **"Failure is permanent (4xx auth error, validation failure)"** — retries waste time; fail fast and surface the error.
- **"Idempotency is not guaranteed and the call has side effects"** — retries without idempotency keys cause duplicate charges, double sends, etc.; add idempotency before adding retries.

---

### Intuition

Retries are the simplest fix for transient failure ("just try again") and the most dangerous one ("everybody just tries again — exactly when the downstream is already on fire"). Circuit breakers protect against the second case: after a string of failures, the breaker *opens* and fails fast for a cool-down period, sparing the downstream a stampede of retries. Exponential backoff with **jitter** is the standard way to make retries themselves play nicely under load.

### Worked Example: Exponential backoff with jitter

5 retries, base = 100 ms, exponent = 2 (`delay = base × 2^attempt`).

**No jitter (deterministic):**

```
Retry 1: 100 ms
Retry 2: 200 ms
Retry 3: 400 ms
Retry 4: 800 ms
Retry 5: 1,600 ms
Total wait: 3,100 ms
```

Problem: if 1,000 clients all fail at T=0 (downstream had a blip), they *all* retry at T=100 ms, then T=300 ms, then T=700 ms — the downstream sees 1,000-RPS spikes synchronized to those exact times. The thundering herd survives backoff.

**Full jitter (AWS recommendation):**

```
sleep = random_uniform(0, base × 2^attempt)
```

| Retry | Range (ms) | Expected mean (ms) |
|---|---|---|
| 1 | 0–100 | 50 |
| 2 | 0–200 | 100 |
| 3 | 0–400 | 200 |
| 4 | 0–800 | 400 |
| 5 | 0–1600 | 800 |

Over 1,000 clients, retry 1 now fires uniformly between 0–100 ms → **~10 RPS spread evenly** instead of 1,000 RPS at T=100 ms exact.

**Peak instantaneous load comparison:**

```
1,000 clients retrying:
- No jitter:    1,000 RPS spike in a ~1ms window at each retry time
- Equal jitter: ~20 RPS sustained over a 50ms window
- Full jitter:  ~10 RPS sustained over a 100ms window
```

**Surprise:** full jitter is *worse* for mean latency (some clients wait longer than necessary) but dramatically better for the system as a whole. **Lesson:** jitter is a coordination-cost trade — you spend a little tail latency to avoid the synchronized cliff.

Combine with a circuit breaker: after 5 consecutive failures, *open* the breaker for 30 s. While open, fail fast (no retries at all) — this prevents the retry storm before it begins, even if individual clients ignore your backoff guidance.

### Further Reading

- [AWS Architecture Blog — Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) — Marc Brooker's canonical post (the source of the "full jitter" recipe).
- [Netflix Hystrix — How It Works](https://github.com/Netflix/Hystrix/wiki/How-it-Works) — the original circuit-breaker reference (archived but conceptually current).
- [resilience4j documentation](https://resilience4j.readme.io/) — modern Hystrix successor for the JVM.
- [Microsoft Learn — Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) + [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) — concise reference architecture.

