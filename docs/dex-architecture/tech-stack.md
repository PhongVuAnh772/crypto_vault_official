# 12) Tech Stack Recommendations

## Frontend (React Native)

- Workflow: Bare React Native (recommended for wallet native integrations and security controls).
- Language: TypeScript strict mode.
- Navigation: React Navigation.
- Server-state: TanStack Query.
- Local/ephemeral state: Zustand.
- Transaction lifecycle: XState.
- WebSocket client: custom manager over native `WebSocket` with app-state integration.
- Secure storage: MMKV + Keychain/Keystore wrapper.
- Animations: Reanimated.
- List virtualization: FlashList.
- Charts: Skia-based charts or optimized wagmi/victory wrapper.

## Backend

- Primary: Go (gateway, ws, quote/routing services).
- Optional performance kernels: Rust (simulation/risk).
- API: REST + websocket.
- Event bus: Kafka (durable) + NATS JetStream (low-latency control streams).

## Data/Infra

- Kubernetes for orchestration.
- Redis cluster for cache/session.
- PostgreSQL for OLTP.
- ClickHouse for analytics.
- OpenTelemetry stack for observability.

## Blockchain

- EVM first (Ethereum/L2/BSC/Polygon/Arbitrum/Optimism).
- Solana support via pluggable chain adapter.

