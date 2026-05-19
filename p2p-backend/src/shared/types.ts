export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type P2POrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'RELEASED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED';

