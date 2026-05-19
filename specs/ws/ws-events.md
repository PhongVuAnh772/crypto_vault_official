# WebSocket Event Contracts

## Auth and Session

- Client connects to `/v1/ws`.
- Client sends:

```json
{
  "type": "auth",
  "token": "jwt",
  "clientSessionId": "uuid",
  "lastCursorByChannel": {
    "intent:5f...": "12893",
    "wallet:1:0xabc": "7721"
  }
}
```

## Subscribe

```json
{
  "type": "subscribe",
  "channels": ["intent:uuid", "wallet:1:0xabc", "market:1:ETH-USDT"]
}
```

## Envelope

```json
{
  "eventId": "uuid",
  "channel": "intent:uuid",
  "seq": 12910,
  "ts": 1710000000000,
  "eventType": "intent.status.changed",
  "payload": {}
}
```

## Event Types

- `intent.status.changed`
- `wallet.balance.delta`
- `pool.liquidity.delta`
- `market.candle.delta`
- `market.quote.delta`

## intent.status.changed

```json
{
  "intentId": "uuid",
  "txHash": "0x...",
  "status": "pending",
  "confirmations": 1,
  "errorCode": null
}
```

## wallet.balance.delta

```json
{
  "chainId": 1,
  "address": "0xabc",
  "asset": "USDT",
  "availableDelta": "-10.3",
  "lockedDelta": "10.3",
  "snapshotVersion": 2881
}
```

## Replay and Gap Recovery

- Gateway replies on auth with:

```json
{
  "type": "replay.required",
  "channels": ["intent:uuid"]
}
```

- Client calls replay REST endpoint and then resumes live stream.

