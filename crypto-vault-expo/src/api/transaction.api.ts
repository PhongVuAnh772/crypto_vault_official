import { apiClient } from './client';

export const TransactionApi = {
  /**
   * Lấy lịch sử biến động toàn hệ thống
   * transaction bao gồm CẢ Deposit, Withdraw, và Trade P2P
   */
  getTransactions: async () => {
    const res = await apiClient.get('/api/v1/transactions');
    return res.data;
  },

  /**
   * Truy vấn trạng thái trực tiếp của 1 giao dịch On-Chain
   */
  getTransactionStatus: async (transactionId: string) => {
    const res = await apiClient.get(`/api/v1/transactions/${transactionId}`);
    return res.data;
  },

  /**
   * Lấy danh sách lịch sử nạp tiền On-Chain
   */
  getDeposits: async () => {
    const res = await apiClient.get('/api/v1/deposits');
    return res.data;
  }
};
