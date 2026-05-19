# 13) Refactoring Plan

## Phase 0: Guardrails

- add feature flags for old/new DEX flows.
- add unified telemetry correlation ids across mobile + backend.

## Phase 1: Frontend Boundary Extraction

- isolate blockchain logic from screens into `modules/dex/infra`.
- introduce transaction state machine and queue.
- introduce ws lifecycle manager.

## Phase 2: Backend Service Split

- deploy quote/routing/simulation services in parallel with monolith.
- gateway routes requests via feature flags.

## Phase 3: Dual-Run and Shadow Validation

- mirror quote/route responses for diff scoring.
- shadow tx simulation against production traffic.
- assert SLO parity before write-path migration.

## Phase 4: Write Path Migration

- switch build/broadcast path to new services.
- keep legacy read APIs with translation adapters.

## Phase 5: Realtime and Analytics Cutover

- indexer -> event bus -> ws gateway cutover.
- switch analytics to ClickHouse pipeline.

## Phase 6: Legacy Decommission

- retire tightly coupled modules.
- freeze old contracts/services.

## Testing Strategy

- contract tests for API/ws schemas.
- deterministic route fixtures and simulation snapshots.
- mobile E2E on flaky network profiles.
- chaos tests for RPC outages and ws churn.

## Deployment Sequence

1. deploy infra primitives.
2. deploy read-only services.
3. enable shadow mode.
4. ramp write traffic by cohort.
5. full cutover with rollback switch.

