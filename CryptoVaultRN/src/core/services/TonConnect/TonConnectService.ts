import { Address, beginCell } from '@ton/core';
import {
    AppRequest,
    CHAIN,
    CONNECT_EVENT_ERROR_CODES,
    ConnectRequest,
    RpcMethod,
    SEND_TRANSACTION_ERROR_CODES,
    SessionCrypto,
    WalletResponse,
} from '@tonconnect/protocol';
import TonWalletVersion from 'src/core/enum/TonWalletVersion';
import TonServices from 'src/core/services/TonServices';
import { TonAccountsType } from 'src/core/services/TonServices/type';
import {
    IConnectedApp,
    IConnectedAppConnection,
    MessageSSE,
    Request,
    TonConnectBridgeType,
    TonConnectEvent,
    TonConnectType,
} from 'src/features/tonConnect/slice/tonConnect.type';
import { AddressListItemType } from 'src/core/redux/slice/account.type';

import { tonConnectDeviceInfo } from 'src/core/constants/TonConnectDevice';
import TransferUtils from 'src/core/services/TonTransactions/transferUtils';
import {
    findConnectedAppByClientSessionId,
    getConnectedAppByUrl,
} from 'src/core/utils/tonConnect';
import { TonConnectKey } from '../../../features/tonConnect/enum/TonConnectKey';
import TonConnectTransfer from '../TonTransactions/tonConnectTransfer';
import TonWallet from '../TonWallet';
import { ConnectEventError } from './ConnectEventError';
import { ConnectReplyBuilder } from './ConnectReplyBuilder';
import { TCEventID } from './EventID';
import { SendTransactionError } from './SendTransactionError';
import TonConnectUtils from './TonConnectUntil';

class TonConnectService {
    async connect(
        protocolVersion: number,
        request: ConnectRequest,
        privateKey: string,
        publicKey: string,
        address: string,
        isTestNet: boolean,
        sessionCrypto?: SessionCrypto,
        clientSessionId?: string,
        webViewUrl?: string,
    ): Promise<TonConnectEvent> {
        try {
            TonConnectUtils.checkProtocolVersionCapability(protocolVersion);
            TonConnectUtils.verifyConnectRequest(request);
            const manifest = await TonConnectUtils.getManifest(request);
            const replyBuilder = new ConnectReplyBuilder(request, manifest);
            try {
                const { secretKey } = await TransferUtils.initializeWallet(
                    TonWalletVersion.V5,
                    publicKey,
                    privateKey,
                );
                const keySecret = Buffer.from(secretKey);
                const keyPublic = Buffer.from(publicKey, 'base64');
                const walletStateInit =
                    await this.getWalletStateInit(publicKey);
                const replyItems = await replyBuilder.createReplyItems(
                    Address.parse(address).toRawString(),
                    keySecret,
                    keyPublic,
                    walletStateInit,
                    isTestNet,
                );

                return {
                    event: {
                        id: TCEventID.getId(),
                        event: TonConnectKey.connect,
                        payload: {
                            items: replyItems,
                            device: tonConnectDeviceInfo,
                        },
                    },
                    appConnection: {
                        chainName: isTestNet
                            ? TonConnectKey.testnet
                            : TonConnectKey.mainnet,
                        address: address,
                        appData: manifest,
                        connection: webViewUrl
                            ? {
                                  type: TonConnectBridgeType.Injected,
                                  replyItems,
                              }
                            : {
                                  type: TonConnectBridgeType.Remote,
                                  sessionKeyPair:
                                      sessionCrypto!.stringifyKeypair(),
                                  clientSessionId: clientSessionId ?? '',
                                  replyItems,
                              },
                    },
                };
            } catch {
                throw new ConnectEventError(
                    CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR,
                    'Wallet declined the request',
                );
            }
        } catch (error) {
            return {
                event: new ConnectEventError(
                    CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
                    error + '',
                ),
            };
        }
    }
    async handleRequestFromRemoteBridge<T extends RpcMethod>(
        request: AppRequest<T>,
        clientSessionId: string,
        state: TonConnectType,
        privateKey: string,
        publicKey: string,
        address: string,
        isTestNet: boolean,
        version?: TonWalletVersion,
        isDummySecretKey?: boolean,
    ) {
        const { connectedApp, connection } = findConnectedAppByClientSessionId(
            clientSessionId,
            state,
            address,
            isTestNet,
        );
        return this.handleRequest(
            request,
            connectedApp,
            connection,
            privateKey,
            publicKey,
            version ?? TonWalletVersion.V5,
            address,
            isTestNet,
            isDummySecretKey,
        );
    }
    async handleRequest<T extends RpcMethod>(
        request: AppRequest<T>,
        connectedApp: IConnectedApp | null,
        connection: IConnectedAppConnection | null,
        privateKey: string,
        publicKey: string,
        version: TonWalletVersion,
        address: string,
        isTestNet: boolean,
        isDummySecretKey?: boolean,
    ): Promise<WalletResponse<T> | undefined> {
        if (!connectedApp || !connection) {
            return {
                error: {
                    code: SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR,
                    message: 'Unknown app',
                },
                id: request.id,
            };
        }

        if (request.method === TonConnectKey.sendTransaction) {
            return this.sendTransaction(
                request,
                privateKey,
                publicKey,
                version,
                address,
                isTestNet,
                isDummySecretKey,
            );
        }

        return {
            error: {
                code: SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
                message: `Method "${request.method}" is not supported by the wallet app`,
            },
            id: request.id,
        };
    }
    async sendTransaction(
        request: AppRequest<TonConnectKey.sendTransaction>,
        privateKey: string,
        publicKey: string,
        version: TonWalletVersion,
        address: string,
        isTestNet: boolean,
        isDummySecretKey?: boolean,
    ): Promise<WalletResponse<TonConnectKey.sendTransaction> | undefined> {
        try {
            const tonService = new TonServices();
            const tonTransaction = new TonConnectTransfer();
            const params = JSON.parse(request.params[0]) as Request;
            const isValidRequest =
                params &&
                typeof params.valid_until === 'number' &&
                Array.isArray(params.messages) &&
                params.messages.every(
                    (msg: any) => !!msg.address && !!msg.amount,
                );
            const walletNetwork = isTestNet ? CHAIN.TESTNET : CHAIN.MAINNET;

            const isValidNetwork = params?.network
                ? params.network === walletNetwork
                : true;
            if (!isValidRequest) {
                throw new SendTransactionError(
                    request.id,
                    SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
                    'Bad request',
                );
            }

            if (!isValidNetwork) {
                throw new SendTransactionError(
                    request.id,
                    SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
                    'Wrong network',
                );
            }

            const getAccountRes = await tonService.getAccounts({
                address: Address.parse(address),
            });
            let finalFromAccountData;

            if (getAccountRes.isSuccess) {
                finalFromAccountData = getAccountRes.data as TonAccountsType;
            } else {
                console.error('Get account data error');
                return undefined;
            }
            const transactionData =
                await tonTransaction.createTransferTonConnect({
                    privateKey: privateKey,
                    version: version,
                    publicKey: publicKey,
                    estimateFee: true,
                    fromAccountData: finalFromAccountData,
                    param: params.messages,
                    isDummySecretKey: isDummySecretKey ?? false,
                });

            if (!isDummySecretKey) {
                await tonService.sendMessageToBlockchain({
                    boc: transactionData?.transferData.messageBOCString ?? '',
                });
            }

            if (transactionData) {
                if (isDummySecretKey) {
                    return transactionData.fee as any;
                } else {
                    return {
                        result:
                            transactionData?.transferData.messageBOCString ??
                            '',
                        id: request.id,
                    };
                }
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof SendTransactionError) {
                return error;
            }
            return new SendTransactionError(
                request.id,
                SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
                error + '',
            );
        }
    }
    async autoConnect(
        webViewUrl: string,
        isTestNet: boolean,
        publicKey?: string,
        address?: string,
        state?: TonConnectType,
    ): Promise<TonConnectEvent> {
        try {
            if (!(publicKey && address && state)) {
                throw new ConnectEventError(
                    CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR,
                    'Unknown app',
                );
            }
            const connectedApp = getConnectedAppByUrl(
                webViewUrl,
                state,
                isTestNet,
            )?.connectedApp;

            if (
                !connectedApp ||
                connectedApp.connections.length === 0 ||
                connectedApp.autoConnectDisabled
            ) {
                throw new ConnectEventError(
                    CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR,
                    'Unknown app',
                );
            }
            const keyPublic = Buffer.from(publicKey, 'base64');
            const walletStateInit = await this.getWalletStateInit(publicKey);
            const replyItems = ConnectReplyBuilder.createAutoConnectReplyItems(
                address,
                keyPublic,
                walletStateInit,
                isTestNet,
            );

            if (
                !connectedApp.connections.some(
                    item => item.type === TonConnectBridgeType.Injected,
                )
            ) {
                return {
                    event: {
                        id: TCEventID.getId(),
                        event: TonConnectKey.connect,
                        payload: {
                            items: replyItems,
                            device: tonConnectDeviceInfo,
                        },
                    },
                    appConnection: {
                        chainName: isTestNet
                            ? TonConnectKey.testnet
                            : TonConnectKey.mainnet,
                        address: address,
                        appData: {
                            name: connectedApp.name,
                            url: connectedApp.url,
                            iconUrl: connectedApp.iconUrl,
                            notificationsEnabled:
                                connectedApp.notificationsEnabled,
                        },
                        connection: {
                            type: TonConnectBridgeType.Injected,
                            replyItems,
                        },
                    },
                };
            } else {
                return {
                    event: {
                        id: TCEventID.getId(),
                        event: TonConnectKey.connect,
                        payload: {
                            items: replyItems,
                            device: tonConnectDeviceInfo,
                        },
                    },
                };
            }
        } catch (error) {
            return {
                event: new ConnectEventError(
                    CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
                    error + '',
                ),
            };
        }
    }
    async getWalletStateInit(publicKey: string): Promise<string> {
        const tonWallet = new TonWallet();
        const walletData = await tonWallet.createWallet(
            TonWalletVersion.V5,
            publicKey,
        );

        const initBoc = beginCell()
            .storeUint(0, 2)
            .storeMaybeRef(walletData.init.code)
            .storeMaybeRef(walletData.init.data)
            .storeUint(0, 1)
            .endCell()
            .toBoc();
        const walletStateInit = initBoc.toString('base64');
        return walletStateInit;
    }
    async handleRequestFromInjectBridge<T extends RpcMethod>(
        url: string,
        request: AppRequest<T>,
        state: TonConnectType,
        privateKey: string,
        publicKey: string,
        address: string,
        isTestNet: boolean,
        version?: TonWalletVersion,
        isDummySecretKey?: boolean,
    ) {
        const connectedApp =
            getConnectedAppByUrl(url, state, isTestNet)?.connectedApp || null;
        const allConnections = connectedApp?.connections ?? [];

        const connection =
            allConnections.find(
                item => item.type === TonConnectBridgeType.Injected,
            ) || null;
        return this.handleRequest(
            request,
            connectedApp,
            connection,
            privateKey,
            publicKey,
            version ?? TonWalletVersion.V5,
            address,
            isTestNet,
            isDummySecretKey,
        );
    }
    async handleTransaction(
        data: MessageSSE,
        state: TonConnectType,
        isTestNet: boolean,
        params?: Request,
        tonAddressData?: AddressListItemType,
        isDummySecretKey?: boolean,
    ): Promise<WalletResponse<RpcMethod> | undefined> {
        let response;
        if (data.request && data.from && tonAddressData && params) {
            response = await this.handleRequestFromRemoteBridge(
                data.request,
                data.from,
                state,
                tonAddressData.privateKey,
                tonAddressData.publicKey,
                params.from,
                isTestNet,
                tonAddressData?.version,
                isDummySecretKey ?? false,
            );
        }
        return response;
    }
    async handleTransactionFromInjectBridge(
        webViewUrl: string,
        requestTransaction: AppRequest<RpcMethod>,
        getAllConnect: TonConnectType,
        tonAddressData?: AddressListItemType,
        isTestNet?: boolean,
        isDummySecretKey?: boolean,
    ): Promise<WalletResponse<RpcMethod> | undefined> {
        let response;
        if (tonAddressData && requestTransaction) {
            response = await this.handleRequestFromInjectBridge(
                webViewUrl,
                requestTransaction,
                getAllConnect,
                tonAddressData?.privateKey,
                tonAddressData?.publicKey,
                tonAddressData?.address,
                isTestNet ?? false,
                tonAddressData?.version,
                isDummySecretKey ?? false,
            );
        }
        return response;
    }
}

export default TonConnectService;
