# Design: Unique ID Generator

> Design a distributed system that generates globally unique IDs at scale.

## Overview

In distributed systems, you cannot rely on a single auto-incrementing database counter. A unique ID generator produces IDs that are unique across all nodes without coordination. This problem tests your understanding of distributed coordination, time-based ordering, and the trade-offs between different ID generation strategies.

## Difficulty: Medium

## Core Concepts Tested

- UUID vs Snowflake vs ULID trade-offs
- Time-based ordering and clock synchronization
- Bit manipulation and encoding schemes
- Coordination-free design
- Database sharding key requirements
- Monotonicity and sortability

## Companies That Ask This

Twitter/X, Meta, Amazon, Uber, Databricks, Snowflake

## Prerequisites

- Phase 1: Binary and Bit Manipulation
- Phase 2: Distributed Systems Basics
- Phase 2: Database Sharding
- Phase 3: Clock Synchronization (NTP, Logical Clocks)

## Approach

1. Start with [problem.md](problem.md) — understand the functional and non-functional requirements
2. Try designing the system for 25 minutes with a timer
3. Focus on: ID structure, uniqueness guarantees, sortability, coordination avoidance
4. Compare your design with [solution.md](solution.md)
5. Pay special attention to what properties your IDs need (sorted? compact? random?)
