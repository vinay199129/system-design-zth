# Problem: Design Google Maps

## Requirements

### Functional

- Users can view a map at any location and zoom level (2D map tiles).
- Users can search for places (addresses, businesses, landmarks).
- Users can request driving directions between two points (shortest/fastest).
- The system provides real-time ETA that accounts for current traffic.
- Users get turn-by-turn navigation with real-time rerouting.
- The system displays live traffic conditions on the map.

### Non-Functional

- **Availability:** 99.99% — navigation and map rendering must always work.
- **Latency:** Map tile load < 200ms; route calculation < 3 seconds; ETA update < 1 second.
- **Accuracy:** ETA predictions within 10% of actual travel time.
- **Scalability:** Support 1B+ monthly active users, millions of concurrent navigation sessions.
- **Freshness:** Traffic data updated every 30-60 seconds.
- **Offline:** Support offline map downloads for selected regions.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Monthly Active Users | 1 billion |
| Concurrent navigation sessions | 10 million |
| Map tile requests per second | 5 million |
| Route calculation requests per second | 100,000 |
| Road network nodes (intersections) | 500 million |
| Road network edges (road segments) | 1 billion |
| Driver GPS probes per second (for traffic) | 10 million |
| Total map tile storage | ~50 PB (all zoom levels) |
| Zoom levels | 0-21 (world view to building level) |
| Tile size | 256×256 pixels (~20-50 KB compressed) |

## Hints

### Hint 1: Map Tile System

Rendering the entire world map on every request is impossible. Instead, the map is pre-rendered as a pyramid of tiles at various zoom levels. At zoom level 0, the entire world is one tile. At zoom level 21, there are trillions of tiles showing building-level detail. Think about: tile addressing, lazy rendering, CDN caching, and vector vs. raster tiles.

### Hint 2: Routing Algorithm

The road network is a weighted graph (nodes = intersections, edges = road segments, weights = time or distance). Dijkstra's algorithm works but is too slow for a 500M-node graph. Contraction hierarchies pre-process the graph to enable <100ms routing queries by computing "shortcut" edges. How does the pre-processing work? How do you handle real-time traffic updates?

### Hint 3: ETA Prediction

Simple ETA = distance / speed limit is wildly inaccurate. Real ETA requires: current traffic speed on each road segment, historical traffic patterns (rush hour), and ML models that account for weather, events, and road type. Where does the real-time traffic data come from? (Hint: the drivers using the app right now.)

## Think About

- How do you update traffic data without re-computing routes for all 10M active navigations?
- How do you handle areas with poor GPS accuracy (tunnels, dense urban canyons)?
- How do you store and serve the road network graph across multiple machines?
- What happens when a road is closed? How quickly does the system reflect this?
- How do you support offline maps? What subset of data does the user download?
- How do you handle multi-modal routing (drive + walk + transit)?
