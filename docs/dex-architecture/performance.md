# 11) Performance Optimization

## Mobile App

- startup:
  - lazy load feature modules.
  - defer non-critical queries until first interaction.
- rendering:
  - selector-based state reads.
  - memoized list items.
  - avoid global state writes for high-frequency market ticks.
- charts:
  - windowed time-series buffers.
  - throttled frame updates.
  - downsample for zoomed-out views.

## Networking and Realtime

- websocket:
  - adaptive heartbeat interval.
  - channel-level backpressure.
  - delta payloads over snapshots.
- HTTP:
  - stale-while-revalidate cache.
  - request coalescing for repeated quotes.

## Backend

- route graph warm caches.
- simulation timeout budget and fallback providers.
- event pipeline batching where ordering allows.

## Memory and Battery

- background mode reduces subscriptions.
- bounded caches with LRU eviction.
- suspend inactive animations and chart loops.

