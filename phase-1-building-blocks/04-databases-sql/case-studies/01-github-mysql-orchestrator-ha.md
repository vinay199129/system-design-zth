# Case Study: GitHub — MySQL High Availability with Orchestrator and Semi-Sync Replication

> How GitHub keeps a multi-terabyte MySQL fleet writable through datacenter failures using semi-synchronous replication, automated topology repair, and a consensus-based failover orchestrator.

## Context

GitHub's primary application data — repositories metadata, issues, pull requests, users — lives in MySQL. By 2018 the fleet had grown to **dozens of clusters, each with a primary plus several replicas**, totaling petabytes of data and tens of thousands of QPS at peak. The pain point was a series of unplanned failovers in 2016–2018 (including the well-known 2018-10-21 incident) where manual recovery took hours. The engineering team published a sequence of posts on the github.blog engineering channel describing the move to automated, consensus-driven failover using the open-source **Orchestrator** tool combined with **MySQL semi-synchronous replication**.

## The Decision

GitHub chose **MySQL with row-based replication and semi-sync** rather than migrating to a distributed SQL system, because the operational maturity of MySQL plus their existing Vitess-style sharding (later: actual Vitess in 2021) was preferable to a wholesale rewrite. The parent module README's "single-leader replication: synchronous vs asynchronous" trade-off applies directly: pure async replication risks data loss on failover, pure sync hurts write latency, **semi-sync** is the practical middle. They paired this with Orchestrator (originally written by Shlomi Noach at Booking.com) to detect failures and promote a replica without a human in the loop.

## How It Works

- Each MySQL cluster: **1 primary + ~6 replicas** distributed across multiple datacenters/zones; row-based binary log replication.
- **Semi-synchronous replication**: the primary waits for at least one replica to ACK each binlog event before returning success to the client. Write latency adds the replica RTT (~1–2 ms intra-DC) but bounds data loss to in-flight transactions.
- **Orchestrator** maintains a real-time graph of the replication topology, polling each node every few seconds. On primary failure it picks the most-up-to-date replica (highest GTID), reparents siblings, and promotes — typically **within 30 seconds**.
- **Consul + Raft** back Orchestrator's own state so the orchestrator itself is HA (3 or 5 nodes).
- Application discovers the current primary via a **DNS or service-discovery indirection** (GLB / Consul) that Orchestrator updates after promotion.
- **GTID-based** replication ensures replicas can rebind to the new primary without losing or duplicating events.
- **Pseudo-GTID** as fallback for clusters not yet on real GTIDs — lets Orchestrator reattach replicas using injected heartbeat statements.
- Failover drills run **monthly** in production; the public post-mortems describe quarterly game days.
- Reads: **read-from-replica** with bounded staleness (~100 ms p99 replication lag); writes go to the primary.

## What Surprised Engineers

The 2018-10-21 incident exposed a non-obvious failure mode: a 43-second network partition between US East and US West **split the writable primary across two regions** because Orchestrator's quorum was incomplete and a stale topology decision allowed both sides to accept writes briefly. The remediation was not "better Orchestrator" — it was **never let two writers exist**, enforced via stricter Orchestrator placement (quorum entirely in one region) and an explicit anti-flapping cooldown. The lesson: split-brain in single-leader replication is the worst kind of bug because it silently diverges data, and the fix is operational policy, not code.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Bounded data loss on failover (semi-sync ACK) | Every write pays one extra replica RTT |
| Automated failover ~30 s vs hours of manual recovery | Orchestrator and Consul become new SPOFs requiring their own HA |
| Stay on familiar MySQL tooling, no rewrite | Cross-region writes still funnel through one primary; multi-master is rejected |

## Lessons for Your Interview

- When asked about MySQL HA, the right answer is **semi-sync + automated promotion + GTID** — not "I'd use a multi-master setup".
- Name **Orchestrator** (or Vitess `vtctld`) when the interviewer wants the failover decision-maker; explain it must be itself HA via Raft/Consul.
- Cite the **split-brain risk** when promotion is unfenced; introduce a fencing token or STONITH-style "kill the old primary first" step.
- Use **monthly failover drills** as a credibility signal — interviewers love when candidates mention production-readiness practices, not just architecture.
- Mention bounded replica lag (~100 ms p99) as the budget that lets you serve reads from replicas safely.

## Sources

- GitHub Engineering: "MySQL High Availability at GitHub" (2018) — https://github.blog/engineering/mysql-high-availability-at-github/
- GitHub Engineering: "October 21 post-incident analysis" (2018) — https://github.blog/2018-10-30-oct21-post-incident-analysis/
- Shlomi Noach, "Orchestrator" project — https://github.com/openark/orchestrator
- MySQL Reference Manual, "Semisynchronous Replication" — https://dev.mysql.com/doc/refman/8.0/en/replication-semisync.html
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 5, single-leader replication and failover hazards
