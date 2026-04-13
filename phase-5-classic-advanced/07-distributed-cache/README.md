# Design: Distributed Cache (Redis)

> Design a distributed in-memory caching system with consistent hashing, replication, and configurable eviction policies.

## Overview

A distributed cache like Redis provides sub-millisecond access to frequently read data by storing it in memory across a cluster of nodes. The system must distribute keys evenly using consistent hashing, replicate data for fault tolerance, handle node additions and removals gracefully, and support multiple eviction policies. This is an infrastructure-level design that tests deep understanding of distributed systems primitives.

## Difficulty: Hard

## Core Concepts Tested

- Consistent hashing with virtual nodes
- Data replication strategies (leader-follower, leaderless)
- Eviction policies (LRU, LFU, TTL-based)
- Cluster management and membership protocol (gossip)
- Cache coherence and invalidation strategies
- Persistence options (RDB snapshots, AOF log)
- Data structures in memory (hash tables, skip lists)

## Companies That Ask This

Amazon, Google, Meta, Microsoft, Redis Labs, Twitter/X, Uber, Netflix

## Prerequisites

- 01-scaling-foundations (hashing, partitioning)
- 03-caching (caching strategies, invalidation)
- 06-distributed-systems (consistency, replication, failure detection)
- 02-databases (data structures, persistence)

## Approach

1. Clarify scope: get/set/delete, TTL, eviction, replication, cluster management.
2. Estimate traffic: reads/sec, writes/sec, data size, key distribution.
3. Design data partitioning: consistent hashing with virtual nodes.
4. Design replication: async replication to followers, promotion on leader failure.
5. Design eviction: LRU as default, configurable per key namespace.
6. Design cluster management: gossip protocol for membership, health checks.
7. Design client library: consistent hashing ring, automatic failover.
8. Address trade-offs: consistency vs. availability, memory vs. persistence, single-threaded vs. multi-threaded.
