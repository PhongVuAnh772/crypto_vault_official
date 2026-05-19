# 8) Smart Contract Architecture

## Core Contracts

- `Factory`: pool discovery and deterministic deployment.
- `Pool`: AMM invariant execution.
- `Router`: path execution entrypoint.
- `LPToken` (if v2 model): liquidity share accounting.
- `FeeManager`: protocol fee policy.
- `Treasury`: protocol revenue sink.
- `GovernanceHooks`: timelocked parameter updates.

## Modularity

- immutable pool logic preferred.
- router upgradeable behind strict timelock governance.
- chain-specific deployment registry.

## Gas Optimization

- custom errors
- calldata packing
- minimal storage writes
- pull over push transfer model

## MEV Protection

- mandatory `deadline` and `amountOutMin`.
- private relay support from tx relay service.
- optional delayed reveal mode for advanced flows.

## Security Risks and Controls

- reentrancy: guarded critical paths.
- oracle manipulation: TWAP checks for sensitive paths.
- upgrade abuse: timelock + multisig + emergency pause guardrails.
- signature replay: chainId/domain separation.

