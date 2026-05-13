# Case Study: GitLab — The 2017-01-31 PostgreSQL Replication Outage and Six Hours of Lost Data

> How a tired engineer typing `rm -rf` on the wrong host turned a routine replication-lag incident into the canonical lesson on backup integrity and human-in-the-loop replication.

## Context

On 2017-01-31, GitLab.com — at the time hosting hundreds of thousands of repositories — experienced a primary PostgreSQL database outage and lost **about six hours of database data** (issues, merge requests, comments, users) before restoring from a stale backup. The full timeline and a real-time YouTube recovery stream were published openly within 24 hours; the post-mortem at `about.gitlab.com/blog/2017-02-10-postmortem-of-database-outage-of-january-31/` is one of the most studied operational documents in the industry. The pain point that started the incident was a runaway replication lag spike caused by a spam-induced traffic surge on the production primary.

## The Decision

GitLab's *existing* design choice was **asynchronous streaming replication** from a single Postgres primary to one or more hot standbys, with **pg_basebackup** used to seed new standbys. The parent module README's discussion of "synchronous vs asynchronous replication, replica catch-up, and failover hazards" is the entire story here. The outage exposed how thin the operational margin really was: when the standby fell ~4 GB behind, an engineer attempted to rebuild it by deleting its data directory — but he was logged into the **primary** (`db1`), not the secondary (`db2`), and ran `rm -rf` against ~310 GB of production data before noticing.

## How It Works

The pre-incident architecture (simplified):

- **Single primary Postgres** instance carrying the entire GitLab application schema.
- **One asynchronous streaming replica** maintained for read offload and DR.
- **pg_basebackup**-style snapshots taken nightly, with WAL archiving for point-in-time recovery — *in theory*.
- An LVM snapshot, an S3 backup, an Azure backup, a daily pg_dump, and replication itself constituted **five separate "backup" mechanisms** on paper.

What happened on 2017-01-31:

1. Spam load pushed replication lag past safe thresholds; the standby fell out of sync.
2. Engineer attempted to rebuild the standby and accidentally ran `rm -rf /var/opt/gitlab/postgresql/data` **on the primary**.
3. ~310 GB removed; ~4.5 GB recovered before the deletion completed.
4. They turned to the five backup mechanisms in sequence and discovered:
   - **LVM snapshot**: 6 hours old, the most recent option.
   - **pg_dump**: silently failing for weeks because of a pg_dump/Postgres version mismatch — empty files.
   - **S3 backup**: bucket was empty; uploads had never been configured correctly.
   - **Azure disk snapshot**: not enabled for the DB host.
   - **WAL archiving**: not running.
5. Final recovery used the 6-hour-old LVM snapshot; ~5,000 projects, ~5,000 comments, and ~700 new users lost permanently.

## What Surprised Engineers

The non-obvious lesson — and the one GitLab itself led with in the post-mortem — is that **untested backups are not backups**. Four of the five backup mechanisms had been silently broken for *weeks or months*, and the failure mode was indistinguishable from success: cron jobs ran, exit codes were zero, files appeared in directories. Only an attempted **restore** would have revealed the problem, and no restore drill had been run. The second lesson: **asynchronous replication is not a backup**, because it propagates `DELETE` and `DROP` exactly like any other write — a destructive command on the primary destroys the replica too if it has already replicated.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Async streaming replication is simple, low-latency, well-understood | Provides zero protection against destructive operator errors |
| Multiple backup mechanisms theoretically offer defense in depth | If none are *tested*, they collapse to one or zero working backups |
| Single primary makes write semantics easy to reason about | All recovery time is human-paced; no automated failover existed at the time |

## Lessons for Your Interview

- Always distinguish **replication** (for availability) from **backups** (for human errors and corruption); name both explicitly in any design.
- Propose **automated, periodic restore drills** — say "we'd restore a backup to a staging environment weekly and verify row counts"; this is the credibility move.
- Mention **WAL archiving + PITR** as the proper Postgres recovery story, with RPO target stated (e.g. "5-minute RPO via continuous WAL shipping").
- Treat any production host as **named, color-coded, and confirmed before destructive commands** — interviewers love hearing this human-factors awareness.
- Use the GitLab incident by name when asked "what's the worst replication failure you know of"; it's the canonical reference.

## Sources

- GitLab post-mortem: "Postmortem of database outage of January 31" (2017) — https://about.gitlab.com/blog/2017-02-10-postmortem-of-database-outage-of-january-31/
- GitLab live incident doc (Google Doc, archived) — referenced from the post-mortem
- YouTube recovery livestream archive (GitLab, Feb 2017)
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 5 on leader/follower replication and Chapter 7 on durability
- *Database Reliability Engineering*, Campbell & Majors, O'Reilly 2017 — Chapter 6 on backup verification
