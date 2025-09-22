import AsyncStorage from '@react-native-async-storage/async-storage';
import { IWalletKit, WalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import walletConnectConstants from '../constants/WalletConnectConstants';
import { getMetadata } from './misc';

export let walletKit: IWalletKit;

export async function createWalletKit() {
    const core = new Core({
        projectId: walletConnectConstants.projectId,
        // relayUrl: relayerRegionURL,
    });
    walletKit = await WalletKit.init({
        core,
        metadata: getMetadata(),
    });

    try {
        const clientId =
            await walletKit.engine.signClient.core.crypto.getClientId();
        console.log('WalletConnect ClientID: ', clientId);
        AsyncStorage.setItem('WALLETCONNECT_CLIENT_ID', clientId);
    } catch (error) {
        console.error(
            'Failed to set WalletConnect clientId in localStorage: ',
            error,
        );
    }
}


