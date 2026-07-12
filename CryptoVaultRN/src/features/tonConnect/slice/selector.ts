import { Address } from '@ton/core';

import { TonConnectKey } from '../enum/TonConnectKey';
import {
    IConnectedAppConnection,
    TonConnectType,
    WithWalletIdentifier,
} from './tonConnect.type';

export const getAllConnections = (
    state: TonConnectType,
    isTestNet: boolean,
    address?: string[],
) => {
    const allConnections: WithWalletIdentifier<IConnectedAppConnection>[] = [];
    
    if (address) {
        for (const addr of address) {
            const walletAddress = Address.parse(addr).toRawString();
            const apps =
                state.connectedApps[
                    isTestNet ? TonConnectKey.testnet : TonConnectKey.mainnet
                ]?.[walletAddress] ?? {};

            const connections = Object.values(apps).flatMap(app =>
                app.connections.map(connection => ({
                    ...connection,
                    walletIdentifier: '',
                })),
            );

            allConnections.push(...connections);
        }
    }

    return allConnections;
};
