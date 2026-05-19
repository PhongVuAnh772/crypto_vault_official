# 4) Wallet Architecture

## Connector Model

- WalletConnect v2 primary connector.
- MetaMask mobile deeplink connector.
- Embedded wallet connector (optional, MPC or enclave-backed).
- Solana/Phantom future connector behind common interface.

## Interface

```ts
interface WalletAdapter {
  connect(): Promise<WalletSession>;
  disconnect(): Promise<void>;
  signMessage(input: SignMessageInput): Promise<SignedPayload>;
  signAndSendTx(input: SignTxInput): Promise<TxSubmission>;
  restore(session: EncryptedSession): Promise<WalletSession | null>;
}
```

## Security

- private keys never persisted in JS memory for embedded mode.
- encrypted session persistence using platform keystore wrapped key.
- chainId + domain-separated typed data signing.
- anti-phishing origin labels in signing modal.

## Mobile UX

- explicit pre-sign review:
  - route path
  - min receive
  - max slippage
  - deadline
  - network fee
- deep-link return token for resumed state.

## Reconnect and Queue

- transaction queue per wallet + chain.
- nonce manager for pending tx replacement.
- reconnect flow restores wallet session and pending queue.

