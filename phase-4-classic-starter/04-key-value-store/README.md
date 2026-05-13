# Design: Key-Value Store

> Design a distributed key-value store like DynamoDB, Redis, or Etcd.

## Overview

A distributed key-value store provides simple put/get/delete operations for arbitrary data, distributed across multiple nodes for scalability and fault tolerance. This problem is a deep dive into distributed systems fundamentals: partitioning, replication, consistency, failure detection, and conflict resolution.

## Difficulty: Hard

## Core Concepts Tested

- Consistent hashing and data partitioning
- Replication strategies (leader-based, leaderless)
- CAP theorem and consistency models
- Conflict resolution (vector clocks, last-write-wins)
- Failure detection (gossip protocol)
- Merkle trees for anti-entropy

## Companies That Ask This

Amazon, Google, Meta, Apple, Netflix, Databricks, Confluent

## Prerequisites

- Phase 1: Hashing and Data Structures
- Phase 2: Replication and Partitioning
- Phase 2: CAP Theorem
- Phase 3: Consistency Models (Eventual, Strong, Causal)
- Phase 3: Gossip Protocols

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 45 minutes with a timer (this one is harder)
3. Focus on: partitioning, replication, consistency guarantees, failure handling
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to the CAP trade-offs and how real systems (Dynamo, Cassandra) make them

## Learning Objectives

By the end of this design, you can:

- Defend **leaderless quorum (Dynamo-style)** over **single-leader Raft** in 60 seconds (write availability, no failover blip, vs strong-consistency cost).
- Explain when **last-write-wins** is acceptable (idempotent, monotonic, e.g. session blobs) and when it loses real data.
- Estimate node count for **100 TB at 100k QPS** with replication factor 3 in 5 minutes.
- Name the most common pitfalls — **wall-clock LWW**, **gossip without phi-accrual**, and **forgetting hinted handoff**.
- Relate this design back to **Phase 2 Replication & Partitioning** and the **CAP/PACELC** framework.

## Common Pitfalls

1. **Hash partitioning without virtual nodes.** Adding/removing a node moves 1/N of the data unevenly and creates hot shards — use 128–256 vnodes per physical node.
2. **Last-write-wins with wall clocks.** NTP skew silently overwrites real writes — use vector clocks, version vectors, or HLC.
3. **Read repair only, no anti-entropy.** Cold keys drift forever — schedule Merkle-tree comparison between replicas.
4. **TCP-based gossip with long timeouts.** Failure detection takes minutes — use UDP gossip with phi-accrual detector (Cassandra style).
5. **No hinted handoff.** Replication factor silently violated during transient outages — the coordinator must stash writes for unreachable replicas.

## Time Budget (per templates/answer-template.md)

| Stage | Minutes | What you should produce |
|---|---|---|
| Requirements | 10 | put/get/delete API, latency targets (p99 < 10 ms), 99.999% durability, multi-region |
| HLD | 15 | Boxes: client → coordinator → consistent-hash ring of replicas; gossip layer; anti-entropy job |
| Deep Dive | 15 | Quorum math (N=3, R=2, W=2), conflict-resolution path, sloppy quorum + hinted handoff |
| Trade-offs + wrap | 5 | AP (Dynamo) vs CP (Spanner/Zookeeper) — when each is correct |

## Related Designs

- **03-rate-limiter** — Redis is the canonical KV store; this design is the textbook version of what Redis Cluster runs.
- **Phase 5: 07-distributed-cache** — same partitioning + replication design, in-memory and latency-first.
- **Phase 5: 03-twitter** — tweet/timeline storage uses Manhattan, a Dynamo-flavoured wide-column KV.
