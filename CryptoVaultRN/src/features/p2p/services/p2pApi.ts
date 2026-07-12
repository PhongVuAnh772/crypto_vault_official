import { CONFIG } from 'src/core/constants/config';
import { ApiResult, P2PAd, P2PChatMessage, P2PDispute, P2POrder } from '../shared/types';

async function call<T>(path: string, token: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`${CONFIG.API_BASE_URL}/api/v1/p2p${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: payload?.error ?? 'Request failed' };
  return payload as ApiResult<T>;
}

export const p2pApi = {
  listAds: (token: string, params?: { assetCode?: string; fiatCode?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.assetCode) sp.set('assetCode', params.assetCode);
    if (params?.fiatCode) sp.set('fiatCode', params.fiatCode);
    if (params?.limit) sp.set('limit', String(params.limit));
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return call<P2PAd[]>(`/ads${query}`, token, 'GET');
  },

  createAd: (token: string, input: {
    walletAssetId: string;
    paymentMethodId?: string;
    assetCode: string;
    networkCode: string;
    fiatCode: string;
    price: string;
    minFiatAmount: string;
    maxFiatAmount: string;
    totalAssetAmount: string;
  }) => call<P2PAd>('/ads', token, 'POST', input),

  createOrder: (token: string, adId: string, assetAmount: string) =>
    call<P2POrder>('/orders', token, 'POST', { adId, assetAmount }),

  listOrders: (token: string, params?: { role?: 'BUYER' | 'SELLER'; status?: P2POrder['status']; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.role) sp.set('role', params.role);
    if (params?.status) sp.set('status', params.status);
    if (params?.limit) sp.set('limit', String(params.limit));
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return call<P2POrder[]>(`/orders${query}`, token, 'GET');
  },

  getOrder: (token: string, orderId: string) => call<P2POrder>(`/orders/${orderId}`, token, 'GET'),

  markPaid: (token: string, orderId: string, proofUrl: string) =>
    call<P2POrder>(`/orders/${orderId}/paid`, token, 'POST', { proofUrl }),

  releaseOrder: (token: string, orderId: string, idempotencyKey: string) =>
    call<P2POrder>(`/orders/${orderId}/release`, token, 'POST', { idempotencyKey }),

  openDispute: (token: string, orderId: string, reason: string) =>
    call<P2PDispute>(`/orders/${orderId}/dispute`, token, 'POST', { reason }),

  listOrderChat: (token: string, orderId: string) =>
    call<P2PChatMessage[]>(`/orders/${orderId}/chat`, token, 'GET'),

  sendOrderChat: (token: string, orderId: string, message: string) =>
    call<P2PChatMessage>(`/orders/${orderId}/chat`, token, 'POST', { message }),
};
