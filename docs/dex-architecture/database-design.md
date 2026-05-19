# 7) Database Design

## Storage Roles

- PostgreSQL: transactional truth for user-facing operations.
- Redis: low-latency cache, session state, idempotency keys.
- ClickHouse: analytics and historical aggregation.

## PostgreSQL Core Tables

- `users`
- `wallets`
- `swap_intents`
- `swaps`
- `transactions`
- `pools`
- `liquidity_positions`
- `token_metadata`
- `candlesticks` (short retention operational reads)

## Example Schemas

```sql
create table wallets (
  id uuid primary key,
  user_id uuid not null,
  chain_id int not null,
  address text not null,
  provider text not null,
  created_at timestamptz not null default now(),
  unique (chain_id, address)
);
```

```sql
create table swap_intents (
  id uuid primary key,
  user_id uuid not null,
  wallet_id uuid not null,
  chain_id int not null,
  request_hash text not null,
  route jsonb not null,
  status text not null,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on swap_intents (user_id, created_at desc);
```

## Redis Strategy

- quote cache TTL by volatility tier.
- route cache with optimistic refresh.
- websocket session + cursor map.
- distributed locks for nonce and queue coordination.

## ClickHouse Strategy

- append-only facts:
  - `swap_facts`
  - `pool_liquidity_facts`
  - `tx_lifecycle_facts`
  - `user_activity_facts`
- materialized views for near-realtime dashboards.

