# Problem: Design Uber / Ride Sharing

## Requirements

### Functional

- Riders can request a ride by specifying pickup and dropoff locations.
- The system matches riders with the nearest available driver.
- Drivers can go online/offline and receive ride requests.
- Both rider and driver see real-time GPS tracking during the trip.
- The system calculates fare based on distance, time, and surge multiplier.
- Surge pricing activates when demand exceeds supply in an area.
- Users can rate drivers and riders after trip completion.

### Non-Functional

- **Availability:** 99.99% — ride matching must always be available.
- **Latency:** Match a driver < 5 seconds; location updates displayed < 1 second.
- **Consistency:** Strong consistency for trip state (no double-dispatching a driver).
- **Scalability:** Support 20M+ rides/day, 5M+ concurrent drivers.
- **Real-time:** Location updates every 3-5 seconds from all active drivers.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Daily rides | 20 million |
| Concurrent active drivers | 5 million |
| Ride requests per second (peak) | 10,000 |
| Driver location updates per second | 1.5 million (5M drivers × every 3 sec) |
| Average trip duration | 15 minutes |
| Cities served | 10,000+ |
| Average match time target | < 5 seconds |
| Location update payload | ~100 bytes (lat, lng, timestamp, driver_id) |

## Hints

### Hint 1: Geospatial Indexing

Finding "nearby drivers" is a spatial query. You need a data structure that efficiently answers "give me all drivers within 3 km of this point." Think about geohash, QuadTree, or S2 cells. Each has trade-offs in precision, update cost, and query efficiency.

### Hint 2: Matching Algorithm

The simplest approach sends the request to the nearest driver. But what about: driver heading in the opposite direction, driver about to complete another ride (and will be closer soon), ETA vs. straight-line distance? How do you score candidates?

### Hint 3: Real-Time Tracking

5 million drivers sending location every 3 seconds = 1.5M writes/sec. This data is ephemeral — you only care about the latest location. What storage and delivery mechanism handles this write throughput and pushes updates to riders in real time?

## Think About

- How do you handle a rider in an area with no available drivers? Expand search radius? Queue the request?
- What prevents two ride requests from being matched to the same driver simultaneously?
- How does surge pricing work? What granularity (per city, per neighborhood, per geohash cell)?
- How do you handle driver location updates crossing geohash/cell boundaries?
- What happens during a major event (concert ending: 50,000 ride requests in 5 minutes)?
- How do you handle cross-city trips where the pickup and dropoff are in different service regions?
