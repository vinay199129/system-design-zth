# Case Study: Stripe — API Versioning and Idempotency Keys

> How Stripe has kept its public REST API backward-compatible for more than a decade by versioning per-account and making every mutating request safely retryable via client-supplied idempotency keys.

## Context

Stripe launched its API in **2011** and has explicitly committed to **never making a breaking change** without an opt-in version bump. Every Stripe-integrated business — from indie SaaS to Fortune 500s — depends on this stability. As of the early 2020s Stripe processes **hundreds of billions of dollars** in payment volume annually across millions of merchants, with the same public API surface that early users learned. Public sources: Stripe's engineering blog "APIs as infrastructure: future-proofing Stripe with versioning" (Brandur Leach, 2017) and "Designing robust and predictable APIs with idempotency" (2017).

## The Decision

Stripe chose **date-based API versions pinned per account** plus **client-supplied idempotency keys** on all `POST` mutations. The parent module README's "REST vs RPC / API evolution" trade-off shows up directly: rather than versioning in the URL (`/v2/charges`) and forcing customers to migrate, Stripe versions via an HTTP header (`Stripe-Version: 2024-04-10`) and runs a **translation layer in the gateway** that converts old request/response shapes to the current internal model. Idempotency keys solve the orthogonal problem of "network said timeout — was my charge created?": with a key, retries are safe.

## How It Works

- **Version pinning**: each account is pinned to the API version active when the account was created (or last explicitly upgraded). Old integrations keep working untouched.
- **Per-request override**: clients can send `Stripe-Version: 2024-04-10` to test a newer version without changing the account default.
- **Gateway translation**: incoming requests in version `V` are mapped through a chain of small **version-change modules**, each implementing one breaking change. The internal service only knows the latest schema.
- **Idempotency keys**: client generates a UUID (or any string ≤255 chars) and sends `Idempotency-Key: <uuid>`; Stripe stores the response for **24 hours** keyed by `(account_id, idempotency_key)` and replays it on duplicate POSTs.
- Idempotency cache is backed by Redis with persistence; mismatched request bodies under the same key are rejected to prevent ambiguity.
- **Cursor-based pagination** on list endpoints (`starting_after` / `ending_before`) avoids the offset-skip problem; page sizes capped at 100.
- **Webhook deliveries** sign every payload with HMAC-SHA256 and include a timestamp, letting integrators reject replays.
- Errors follow a consistent envelope: `error.type` (`api_error`, `card_error`, `invalid_request_error`) plus `error.code` and a machine-readable `decline_code` for cards.
- All breaking-change details are documented in the public **upgrade log** at `stripe.com/docs/upgrades` going back to 2011.

## What Surprised Engineers

The non-obvious lesson is that **idempotency keys must include the response body, not just the request**. Stripe initially considered storing only "this key has been seen, return 200" — but that loses the original response (charge ID, balance transaction, etc.). They had to store the full serialized response, which made the idempotency store a non-trivial Redis tier with its own scaling concerns. A second subtlety: idempotency keys must be scoped to the **account**, not globally, or one merchant's key choice could collide with another's. Third: **request body fingerprinting** is essential — replaying a different body with the same key must error, or you have an exfiltration vector.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Decade-plus of backward compatibility; no forced migrations | Translation layer adds latency and code complexity for every legacy version |
| Safe retries everywhere — clients can naively retry on timeout | Idempotency cache is a stateful component that must be HA and scaled with traffic |
| Versions are date-readable, easy to talk about | Every breaking change must be implemented twice — in the new service and as a version-change module |

## Lessons for Your Interview

- When the interviewer asks about API evolution, propose **header-based versioning + per-account pinning** as a more sophisticated alternative to URL versioning.
- Always include **idempotency keys on `POST`** in your API design; explain the timeout/retry problem they solve in one sentence.
- Sketch the **request-fingerprint check** so that a duplicate key with a different body is rejected — this catches the "bad client logic" case.
- Mention **cursor-based pagination** as the default; offset-based is a red flag at scale.
- Use Stripe's "no breaking change since 2011" as the canonical example of how seriously to take backward compatibility.

## Sources

- Stripe blog: "APIs as infrastructure: future-proofing Stripe with versioning" (Brandur Leach, 2017) — https://stripe.com/blog/api-versioning
- Stripe blog: "Designing robust and predictable APIs with idempotency" (2017) — https://stripe.com/blog/idempotency
- Stripe docs: API upgrade log — https://stripe.com/docs/upgrades
- Stripe docs: Idempotent requests — https://stripe.com/docs/api/idempotent_requests
- "API Design Patterns" by JJ Geewax, Manning 2021 — chapters on resource versioning
