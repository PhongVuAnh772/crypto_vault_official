export type P2PAd = {
  id: string;
  seller_id: string;
  asset_code: string;
  fiat_code: string;
  network_code: string;
  price: string;
  min_fiat_amount: string;
  max_fiat_amount: string;
  remaining_asset_amount: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
};

export type P2PDispute = {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'REJECTED';
  created_at: string;
};

export type P2PChatMessage = {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  attachment_url?: string | null;
  created_at: string;
};

export type P2POrder = {
  id: string;
  order_no: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  asset_amount: string;
  fiat_amount: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'RELEASED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED';
  expires_at: string;
  paid_at?: string | null;
  released_at?: string | null;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
