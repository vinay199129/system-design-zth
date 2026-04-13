# Design: Uber / Ride Sharing

> Design a real-time ride-sharing platform that matches riders with nearby drivers using geospatial indexing and delivers live tracking updates.

## Overview

Uber connects riders requesting trips with available drivers in real-time. The system must handle geospatial indexing for proximity queries, efficient driver-rider matching algorithms, dynamic surge pricing based on supply/demand, and continuous real-time location tracking. The architecture must tolerate high write throughput from millions of drivers updating their location every few seconds.

## Difficulty: Hard

## Core Concepts Tested

- Geospatial indexing (geohash, QuadTree, S2 cells)
- Real-time driver-rider matching algorithms
- Surge pricing and dynamic supply/demand modeling
- Real-time location tracking via WebSocket
- Trip lifecycle management and state machines
- ETA estimation and routing
- Payment integration and fare calculation

## Companies That Ask This

Uber, Lyft, Google, Amazon, Microsoft, DoorDash, Grab, Ola, DiDi

## Prerequisites

- 01-scaling-foundations (horizontal scaling, load balancing)
- 02-databases (geospatial indexes, time-series data)
- 05-message-queues (event streaming)
- 06-distributed-systems (consistency, availability)
- 04-uber (this design builds on all Phase 1-3 concepts)

## Approach

1. Clarify scope: request ride, match, track, complete, pay, surge pricing.
2. Estimate traffic: active drivers, ride requests/sec, location updates/sec.
3. Design location service: geospatial index for "find nearby drivers" queries.
4. Design matching service: scoring algorithm (distance, ETA, driver rating).
5. Design trip service: state machine (requested → matched → en-route → completed).
6. Design real-time tracking: WebSocket connections, location broadcast.
7. Design surge pricing: supply/demand ratio per geohash cell.
8. Address scaling: location update throughput, matching latency, cross-region trips.
