import { ConnectEvent, DeviceInfo } from '@tonconnect/protocol';
import { WebViewBridgeMessage } from '../jsBridge/types';

export interface TonConnectInjectedBridge {
    deviceInfo: DeviceInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(
        message: Omit<WebViewBridgeMessage, 'name' | 'type'>,
    ): Promise<void>;
    restoreConnection(): Promise<ConnectEvent>;
    disconnect(): Promise<void>;
    send(message: Omit<WebViewBridgeMessage, 'name' | 'type'>): Promise<void>;
   
}
