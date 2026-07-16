export type TradeIntentStatus =
  | "queued"
  | "awaiting_signature"
  | "submitted"
  | "pending"
  | "confirmed"
  | "failed"
  | "reorged";

export interface TradeIntent {
  intentId: string;
  chainId: number;
  walletAddress: string;
  routeId: string;
  txHash?: string;
  status: TradeIntentStatus;
  errorCode?: string;
  createdAt: number;
  updatedAt: number;
}

