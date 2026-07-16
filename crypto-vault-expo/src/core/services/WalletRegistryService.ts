import { api } from './api.service';

export const WalletRegistryService = {
  /**
   * Đồng bộ địa chỉ ví lên Backend Wallets Registry
   */
  registerWallet: async (userId: string, chainId: string, address: string, metadata: any = {}) => {
    try {
      const response = await api.post('/wallets', {
        userId,
        chainId,
        address,
        metadata,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
