import axios from 'axios';
import ApiConstants from '../constants/ApiConstants';

export interface RemoteAsset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  contract_address: string;
  is_native: boolean;
  chain_name: string;
  chain_key: string;
}

export interface RemoteNetwork {
  id: string;
  name: string;
  chain_key: string;
  architecture: string;
  is_testnet: boolean;
}

class SyncService {
  async fetchAssets(): Promise<RemoteAsset[]> {
    try {
      const response = await axios.get(`${ApiConstants.SERVER_URL}/api/v1/public/assets`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch assets from server', error);
      return [];
    }
  }

  async fetchNetworks(): Promise<RemoteNetwork[]> {
    try {
      const response = await axios.get(`${ApiConstants.SERVER_URL}/api/v1/public/networks`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch networks from server', error);
      return [];
    }
  }
}

export default new SyncService();
