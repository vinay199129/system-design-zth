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
