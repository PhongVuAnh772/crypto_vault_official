import {
    AppRequest,
    ConnectEvent,
    ConnectItem,
    ConnectItemReply,
    DeviceInfo,
    KeyPair,
    RpcMethod,
} from '@tonconnect/protocol';
import TonEventType from 'src/core/enum/TonEventType';

export type TonConnectType = {
    showModalConnect: boolean;
    type: string;
    url?: decodeURl;
    connectedApps: {
        [chainName: string]: {
            [walletAddress: string]: {
                [hash: string]: IConnectedApp;
            };
        };
    };
    listenerMessageSSE: MessageSSE;
    dAppBrowse:string[]
};

export type decodeURl = {
    id: string;
    request: ConnectRequest;
    version: number;
};
export declare interface ConnectRequest {
    manifestUrl: string;
    items: ConnectItem[];
}

export interface IConnectedApp {
    name?: string;
    url?: string;
    iconUrl?: string;
    autoConnectDisabled?: boolean;
    notificationsEnabled?: boolean;
    connections: IConnectedAppConnection[];
}
export interface SaveAppConnectionType {
    chainName: 'mainnet' | 'testnet';
    address: string;
    appData: Omit<IConnectedApp, 'connections'>;
    connection: IConnectedAppConnection;
}
export interface MessageSSE {
    from?: string;
    activeRequest: boolean;
    request?: AppRequest<RpcMethod>;
}
export interface Request {
    from: string;
    messages: Message[];
    network: string;
    valid_until: number;
}
export interface Message {
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
}
export interface RemoveRemoteConnectionType {
    chainName: string;
    address: string;
    url: string;
    clientSessionId: string;
}
export interface RemoveInjectConnectionType {
    chainName: string;
    address: string;
    url: string;
}
export interface IConnectedAppConnectionRemote {
    type: TonConnectBridgeType.Remote;
    sessionKeyPair: KeyPair;
    clientSessionId: string;
    replyItems: ConnectItemReply[];
}

export interface IConnectedAppConnectionInjected {
    type: TonConnectBridgeType.Injected;
    replyItems: ConnectItemReply[];
}

export type IConnectedAppConnection =
    | IConnectedAppConnectionRemote
    | IConnectedAppConnectionInjected;
export enum TonConnectBridgeType {
    Remote = 'remote',
    Injected = 'injected',
}

export interface DAppManifest {
    url?: string;
    name?: string;
    iconUrl?: string;
    termsOfUseUrl?: string;
    privacyPolicyUrl?: string;
}

export interface TonConnectInjectedBridge {
    deviceInfo: DeviceInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(
        protocolVersion: number,
        message: ConnectRequest,
        auto: boolean,
    ): Promise<ConnectEvent>;
    // MARK: type
}
export type TonConnectEvent = {
    event: ConnectEvent;
    appConnection?: SaveAppConnectionType;
};

export type TonTransactionAction = {
    type: TonEventType;
    amount?:number | string;
    recipientAddress:string
    dataNft: MetadataNftType,
    dataJetton:MetadataJettonType
};

export interface RiskType {
    nfts: NftsType[];
    jettons: JettonsType[]
}
interface JettonsType{
    jetton:JettonType
}
interface JettonType{
    image:string,
    symbol:string

}
interface NftsType {
    metadata: MetadataNftType;
    address:string
}
export interface MetadataNftType {
    name: string;
    image: string;
    description: string;
}
export interface MetadataJettonType{
    symbol:string,
    image:string,
}
export type WithWalletIdentifier<T> = T & { walletIdentifier: string };
