# Design: Google Maps

> Design a mapping platform that renders map tiles, computes optimal routes using graph algorithms, and predicts ETAs with real-time traffic data.

## Overview

Google Maps provides map rendering, turn-by-turn navigation, and location search to billions of users. The system must serve pre-rendered map tiles at multiple zoom levels, compute shortest and fastest routes using graph-based algorithms on a massive road network, predict accurate ETAs using real-time and historical traffic data, and handle millions of concurrent navigation sessions. The combination of geospatial data, graph algorithms, and real-time streaming makes this one of the most complex system designs.

## Difficulty: Hard

## Core Concepts Tested

- Geospatial tile system (slippy map tiles, zoom levels)
- Graph-based routing (Dijkstra, A*, contraction hierarchies)
- ETA prediction with real-time traffic data
- Map tile rendering and caching pipeline
- Location search and geocoding
- Real-time traffic ingestion from driver probes
- Offline map support and data compression

## Companies That Ask This

Google, Apple, Uber, Microsoft (Bing Maps), Amazon, Grab, Mapbox, HERE

## Prerequisites

- 01-scaling-foundations (partitioning, CDN)
- 02-databases (graph databases, geospatial indexes)
- 03-caching (tile caching, CDN edge caching)
- 06-distributed-systems (stream processing)
- Knowledge of graph algorithms (Dijkstra, A*)

## Approach

1. Clarify scope: map rendering, routing, search, ETA, traffic, navigation.
2. Estimate traffic: tile requests/sec, route queries/sec, traffic updates/sec.
3. Design tile system: pre-rendered tiles at 20+ zoom levels, served via CDN.
4. Design road network graph: nodes (intersections) and edges (road segments).
5. Design routing: contraction hierarchies for fast shortest-path queries.
6. Design ETA prediction: historical + real-time traffic data, ML model.
7. Design traffic ingestion: driver GPS probes → stream processing → edge weights.
8. Address scaling: tile storage costs, routing latency, cross-region graph partitioning.
