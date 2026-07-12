import { apiClient } from './client';

export interface WithdrawRequest {
  userId: string;
  tokenId: string;
  walletId: string;
  toAddress: string;
  amount: string | number;
  fee?: string | number;
}

export const WalletApi = {
  /**
   * Lấy danh sách ví tài sản của người dùng
   */
  getWallets: async () => {
    const response = await apiClient.get('/api/v1/wallets');
    return response.data;
  },

  /**
   * Khởi tạo quá trình rút tiền (On-Chain)
   * Yêu cầu Backend trừ LockedBalance và đẩy transaction vào Work-Queue
   */
  withdrawFunds: async (payload: WithdrawRequest) => {
    const response = await apiClient.post('/api/v1/wallets/withdraw', payload);
    return response.data; // { success, transactionId }
  },

  /**
   * Lấy lịch sử biến động sổ cái (Ledger Entries) của Ví
   */
  getLedgerHistory: async (userId: string) => {
    const response = await apiClient.get(`/api/v1/ledger/${userId}`);
    return response.data; 
  }
};
