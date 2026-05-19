# 10) Security

## Smart Contract

- third-party audits and differential fuzzing.
- invariant/property tests in CI.
- timelocked governance + emergency pause.

## Mobile Security

- secure storage keys protected by platform keystore/enclave.
- TLS pinning for API and ws domains.
- root/jailbreak/emulator detection with policy degradation.
- runtime tamper checks and anti-hooking signals.

## API Security

- signed requests for critical mutations.
- strict idempotency and replay window checks.
- adaptive rate limiting by user/device/risk score.
- WAF and bot mitigation at edge.

## Wallet Attack Prevention

- explicit decoded transaction summary before signing.
- domain-bound typed data.
- deep-link return token validation.

## MEV and Replay

- default slippage guardrails.
- optional private relay route.
- chainId + nonce + expiration enforcement.

