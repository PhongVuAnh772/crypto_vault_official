# Service Dependency Map

```mermaid
flowchart LR
Gateway --> Quote
Gateway --> Routing
Gateway --> Simulation
Gateway --> TxRelay
Quote --> Pricing
Routing --> Pricing
Simulation --> RPCMesh
TxRelay --> RPCMesh
RPCMesh --> Chains
Chains --> Indexer
Indexer --> Bus
Bus --> Analytics
Bus --> WebSocketGateway
WebSocketGateway --> MobileClients
Analytics --> ClickHouse
Gateway --> PostgreSQL
Quote --> Redis
Routing --> Redis
WebSocketGateway --> Redis
```

## Critical Paths

- Trade request path: `Gateway -> Quote/Routing/Simulation -> TxRelay`.
- Realtime status path: `Chain -> Indexer -> Bus -> WSG -> Mobile`.

## Failure Isolation Rules

- Analytics failures must never block trade path.
- Indexer lag triggers degraded mode (receipt polling fallback).
- Redis outage falls back to reduced realtime features, not API outage.

