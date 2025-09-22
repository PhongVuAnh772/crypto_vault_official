import { AccountStatus } from '@ton-api/client';
import {
    Address,
    beginCell,
    Cell,
    internal,
    loadStateInit,
    MessageRelaxed,
} from '@ton/core';
import {
    AppRequest,
    CONNECT_EVENT_ERROR_CODES,
    ConnectRequest,
    RpcMethod,
    WalletResponse,
} from '@tonconnect/protocol';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import { MIN_PROTOCOL_VERSION } from 'src/core/constants/TonConnectDevice';
import { sendGet } from 'src/core/network/requests';
import { AddressListItemType } from 'src/core/redux/slice/account.type';
import { TonConnectKey } from 'src/features/tonConnect/enum/TonConnectKey';
import {
    DAppManifest,
    Message,
    MessageSSE,
    Request,
    TonConnectType,
} from 'src/features/tonConnect/slice/tonConnect.type';
import TonServices from '../TonServices';
import { TonAccountsType } from '../TonServices/type';
import { TonOpCodes } from '../TonTransactions/opCode';
import { ConnectEventError } from './ConnectEventError';
import TonConnectService from './TonConnectService';

const checkProtocolVersionCapability = (protocolVersion: number) => {
    if (
        typeof protocolVersion !== 'number' ||
        protocolVersion < MIN_PROTOCOL_VERSION
    ) {
        throw new ConnectEventError(
            CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
            `Protocol version ${String(protocolVersion)} is not supported by the wallet app`,
        );
    }
};
const verifyConnectRequest = (request: ConnectRequest) => {
    if (!(request.manifestUrl && request.items?.length)) {
        throw new ConnectEventError(
            CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
            'Wrong request data',
        );
    }
};

const getManifest = async (request: ConnectRequest) => {
    try {
        const { data: manifest } = await sendGet<DAppManifest>({
            customBaseUrl: request.manifestUrl,
        });

        const isValid =
            manifest &&
            typeof manifest.url === 'string' &&
            typeof manifest.name === 'string' &&
            typeof manifest.iconUrl === 'string';

        if (!isValid) {
            throw new ConnectEventError(
                CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR,
                'Manifest is not valid',
            );
        }

        if (manifest.iconUrl) {
            FastImage.preload([{ uri: manifest.iconUrl }]);
        }

        return manifest;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ConnectEventError(
                CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR,
                `Can't get ${request.manifestUrl}`,
            );
        }

        throw error;
    }
};

const parseStateInit = (stateInit?: string) => {
    if (!stateInit) {
        return;
    }
    const { code, data } = loadStateInit(Cell.fromBase64(stateInit).asSlice());

    return { code, data };
};
const parsePayload = (payload?: string, customExcessesAccount?: string) => {
    if (!payload) {
        return;
    }
    let body = Cell.fromBase64(payload);

    if (customExcessesAccount) {
        body = rebuildBodyWithCustomExcessesAccount(
            body,
            customExcessesAccount,
        );
    }
    return body;
};
const rebuildBodyWithCustomExcessesAccount = (
    payload: Cell,
    customExcessesAccount: string,
) => {
    const slice = payload.beginParse();
    const opCode = slice.loadUint(32);
    let builder = beginCell();
    switch (opCode) {
        case TonOpCodes.STONFI_SWAP:
            builder = builder
                .storeUint(TonOpCodes.STONFI_SWAP, 32)
                .storeAddress(slice.loadAddress())
                .storeCoins(slice.loadCoins())
                .storeAddress(slice.loadAddress());

            if (slice.loadBoolean()) {
                slice.loadAddress();
            }
            return builder
                .storeBit(1)
                .storeAddress(Address.parse(customExcessesAccount))
                .endCell();
        case TonOpCodes.NFT_TRANSFER:
            builder = builder
                .storeUint(TonOpCodes.NFT_TRANSFER, 32)
                .storeUint(slice.loadUintBig(64), 64)
                .storeAddress(slice.loadAddress());

            slice.loadMaybeAddress();

            while (slice.remainingRefs) {
                builder = builder.storeRef(slice.loadRef());
            }

            return builder
                .storeAddress(Address.parse(customExcessesAccount))
                .storeBits(slice.loadBits(slice.remainingBits))
                .endCell();
        case TonOpCodes.JETTON_TRANSFER:
            builder = builder
                .storeUint(TonOpCodes.JETTON_TRANSFER, 32)
                .storeUint(slice.loadUint(64), 64)
                .storeCoins(slice.loadCoins())
                .storeAddress(slice.loadAddress());

            slice.loadMaybeAddress();

            while (slice.remainingRefs) {
                const forwardCell = slice.loadRef();
                // recursively rebuild forward payloads
                builder = builder.storeRef(
                    rebuildBodyWithCustomExcessesAccount(
                        forwardCell,
                        customExcessesAccount,
                    ),
                );
            }

            return builder
                .storeAddress(Address.parse(customExcessesAccount))
                .storeBits(slice.loadBits(slice.remainingBits))
                .endCell();
        default:
            return payload;
    }
};

const getReceiveAddressData = async (recipientAddress: string) => {
    const tonServices = new TonServices();
    const getTonAccountsRes = await tonServices.getAccounts({
        address: Address.parse(recipientAddress),
    });
    if (getTonAccountsRes.isSuccess) {
        const tonAccountData = getTonAccountsRes.data as TonAccountsType;

        return tonAccountData;
    } else {
        return undefined;
    }
};
const internalMessages = async (
    address: string,
    param: Message[],
    bounce?: boolean,
): Promise<MessageRelaxed[] | undefined> => {
    const internalMessages = [] as MessageRelaxed[];
    try {
        for (const element of param) {
            const recipientAccountData = await getReceiveAddressData(
                element.address,
            );
            if (!recipientAccountData) {
                return undefined;
            }
            const init = parseStateInit(element.stateInit);

            const body = parsePayload(element.payload, address);
            const recipientAccountIsActive =
                recipientAccountData.status === AccountStatus.Active;

            const finalBounce = bounce ?? recipientAccountIsActive;

            const [recipientAddressValid] = [Address.parse(element.address)];

            const sendAmount = BigInt(element.amount.toString());

            internalMessages.push(
                internal({
                    to: recipientAddressValid,
                    bounce: finalBounce,
                    value: sendAmount,
                    body: body,
                    init: init,
                }),
            );
        }
        return internalMessages;
    } catch (error) {
        console.error('create internalMessages error :', error);
        return undefined;
    }
};
const getDomainUrl = (url?: string) => {
    const domain = url?.replace(/^https?:\/\//, '') ?? '';
    return domain;
};
const handleTransaction = async (
    data: MessageSSE,
    state: TonConnectType,
    isTestNet: boolean,
    params?: Request,
    tonAddressData?: AddressListItemType,
    isDummySecretKey?: boolean,
): Promise<WalletResponse<RpcMethod> | undefined> => {
    const tonConnect = new TonConnectService();
    let response;
    if (data.request && data.from && tonAddressData && params) {
        response = await tonConnect.handleRequestFromRemoteBridge(
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
};
const handleTransactionFromInjectBridge = async (
    getAllConnect: TonConnectType,
    webViewUrl: string,
    isTestNet: boolean,
    tonAddressData?: AddressListItemType,
    requestTransaction?: AppRequest<RpcMethod>,
    isDummySecretKey?: boolean,
): Promise<WalletResponse<RpcMethod> | undefined> => {
    let response;
    const tonConnect = new TonConnectService();
    if (tonAddressData && requestTransaction) {
        response = await tonConnect.handleRequestFromInjectBridge(
            webViewUrl,
            requestTransaction,
            getAllConnect,
            tonAddressData?.privateKey,
            tonAddressData?.publicKey,
            tonAddressData?.address,
            isTestNet,
            tonAddressData?.version,
            isDummySecretKey ?? false,
        );
    }
    return response;
};
const convertDataAllConnect = (
    isTestNet: boolean,
    address: string,
    data: TonConnectType,
) => {
    const walletAddress = Address.parse(address).toRawString();
    const network = isTestNet ? TonConnectKey.testnet : TonConnectKey.mainnet;
    const listConnected = data.connectedApps?.[network]?.[walletAddress] ?? {};
    const listData = Object.keys(listConnected).map(key => ({
        id: key,
        ...listConnected[key],
    }));

    return listData;
};

const TonConnectUtils = {
    checkProtocolVersionCapability,
    verifyConnectRequest,
    getManifest,
    internalMessages,
    getDomainUrl,
    handleTransaction,
    handleTransactionFromInjectBridge,
    convertDataAllConnect,
};

export default TonConnectUtils;
