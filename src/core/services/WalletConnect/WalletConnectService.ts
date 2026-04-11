import '@walletconnect/react-native-compat';
import { WalletKit, IWalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { WALLET_CONNECT_PROJECT_ID } from 'env.config';

const metadata = {
  name: 'CryptoVault',
  description: 'Secure Multi-chain Crypto Wallet',
  url: 'https://cryptovault.app',
  icons: ['https://cryptovault.app/logo.png'],
};

class WalletConnectService {
  private static instance: WalletConnectService;
  public walletKit: IWalletKit | null = null;
  public core: any = null;

  private constructor() { }

  public static getInstance(): WalletConnectService {
    if (!WalletConnectService.instance) {
      WalletConnectService.instance = new WalletConnectService();
    }
    return WalletConnectService.instance;
  }

  public async init() {
    if (this.walletKit) return;

    try {
      this.core = new Core({
        projectId: WALLET_CONNECT_PROJECT_ID,
      });

      this.walletKit = await WalletKit.init({
        core: this.core,
        metadata,
      });

      console.log('WalletConnect initialized successfully');
      this.setupEventListeners();
    } catch (error) {
      console.error('WalletConnect initialization failed:', error);
    }
  }

  private setupEventListeners() {
    if (!this.walletKit) return;

    // TODO: Handlers for different events
    this.walletKit.on('session_proposal', async (proposal) => {
      console.log('Session Proposal received:', proposal);
      // Handler will be implemented in the UI/Redux phase
    });

    this.walletKit.on('session_request', async (request) => {
      console.log('Session Request received:', request);
      // Handler will be implemented in the UI/Redux phase
    });

    this.walletKit.on('session_delete', () => {
      console.log('Session Deleted');
    });
  }

  public async pair(uri: string) {
    if (!this.walletKit) {
      throw new Error('WalletKit not initialized');
    }
    try {
      await this.core.pairing.pair({ uri });
    } catch (error) {
      console.error('Pairing error:', error);
      throw error;
    }
  }
}

export default WalletConnectService.getInstance();
