import { apiClient } from './client';

export interface P2POrderRequest {
  adId: string;
  amount: string | number;
}

export const P2PApi = {
  getAds: async () => {
    const res = await apiClient.get('/api/v1/p2p/ads');
    return res.data;
  },

  createOrder: async (payload: P2POrderRequest) => {
    const res = await apiClient.post('/api/v1/p2p/orders', payload);
    return res.data;
  },

  // Người dùng xác nhận đã chuyển khoản Fiat (Mở Escrow Lock)
  markAsPaid: async (orderId: string) => {
    const res = await apiClient.post(`/api/v1/p2p/orders/${orderId}/pay`);
    return res.data;
  },

  // Người dùng (Seller) xác nhận đã nhận được tiền -> Giải phóng Token
  confirmRelease: async (orderId: string) => {
    const res = await apiClient.post(`/api/v1/p2p/orders/${orderId}/confirm`);
    return res.data;
  },

  // Gửi bằng chứng khiếu nại (Chuyển Order sang DISPUTED)
  createDispute: async (orderId: string, reason: string, proofUrl?: string) => {
    const res = await apiClient.post(`/api/v1/p2p/disputes`, { orderId, reason, proofUrl });
    return res.data;
  }
};
