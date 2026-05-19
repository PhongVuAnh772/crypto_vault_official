# 3) React Native Frontend Architecture

## Folder Structure

```text
src/
  app/
    bootstrap/
    navigation/
    providers/
  modules/
    dex/
      presentation/
        screens/
        components/
      domain/
        entities/
        usecases/
        state-machines/
      data/
        repositories/
        mappers/
      infra/
        api/
        ws/
        wallet/
    portfolio/
    wallet/
    market/
  shared/
    ui/
    hooks/
    constants/
    types/
  core/
    network/
    storage/
    telemetry/
    security/
```

## State and Cache

- TanStack Query for server-state and mutation workflows.
- Zustand for ephemeral UI control state.
- XState for transaction lifecycle state machine.
- MMKV persisted cache for token list and recent intents.

## WebSocket Management

- Singleton socket manager with channel multiplexing.
- app-state aware mode:
  - foreground: full subscriptions.
  - background: only transaction status channels.
- reconnect with cursor replay.

## Navigation

- Root stack.
- tabs: `Market`, `Trade`, `Portfolio`, `Wallet`, `Settings`.
- feature stacks under each tab.

## TypeScript Patterns

- strict mode + no implicit any.
- branded ids (`WalletId`, `IntentId`) to avoid cross-use bugs.
- DTO-to-domain mapping layer mandatory.
- no raw API payload use in presentation layer.

## Performance

- FlatList/FlashList for large token and activity lists.
- selective subscriptions with shallow selectors.
- chart updates batched/throttled.
- suspend heavy polling when app in background.

