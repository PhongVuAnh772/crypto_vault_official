# 5) Backend Services

## Service Catalog

### Quote Service
- Purpose: best executable quote surface.
- Scaling: stateless HPA, CPU and latency based.
- API: `GET /v1/quotes`.
- Cache: Redis key `quote:{chain}:{pair}:{amountBucket}`.
- Observability: p95 latency, quote stale ratio.

### Routing Service
- Purpose: pathfinding across pools + aggregators.
- Scaling: memory-heavy pods, warm route graph snapshots.
- API: `POST /v1/routes/compute`.
- Async: graph refresh worker.
- Cache: Redis + local LFU.

### Simulation Engine
- Purpose: preflight execution checks.
- API: `POST /v1/simulations`.
- Scaling: isolated pool with strict timeout budgets.
- Observability: revert classification metrics.

### Pricing Engine
- Purpose: normalized market price feeds and TWAP.
- Ingest: onchain + CEX + aggregator feeds.
- Output: bus events + Redis snapshots.

### Websocket Gateway
- Purpose: realtime fanout, subscription auth, replay cursor handling.
- Scaling: shard by user/session hash.
- Backplane: Redis pub/sub or NATS stream.

### Indexer Service
- Purpose: chain event ingestion and canonical tx state.
- Scaling: per-chain worker groups.
- Reliability: reorg-aware confirmations and rewind logic.

### Analytics Service
- Purpose: OLAP ingestion and product metrics.
- Storage: ClickHouse.
- Jobs: streaming aggregation and retention compaction.

### Notification Service
- Purpose: push/email/webhook for tx lifecycle and risk alerts.
- Queue: Kafka topic consumers with DLQ.

### Transaction Relay
- Purpose: private relay, gas policy, replacement strategy.
- API: `POST /v1/transactions/relay`.

### Future Risk Engine
- Purpose: perp/orderbook risk checks, margin constraints, mark pricing.

## Deployment Model

- All services independently deployable via Helm.
- Shared tracing context across all request + event boundaries.
- SLO gates in CI/CD rollout policy.

