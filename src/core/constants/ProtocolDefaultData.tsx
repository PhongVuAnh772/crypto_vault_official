import VMType from '../enum/VMType';
import { ProtocolDataWithSupportedTokensFormBEType } from '../redux/slice/account.type';
import EnvConfig from './EnvConfig';

const bitcoinProtocolDefaultData: ProtocolDataWithSupportedTokensFormBEType = {
    _id: '66da762f291e0ce47c6d8d56',
    name: 'Bitcoin',
    rpcUrl: '',
    status: 'active',
    chainId: null,
    symbol: 'BTC',
    blockExplorerUrl: EnvConfig.BLOCK_CYPHER_PUSH_TRANSACTION_DETAIL_ULR,
    VM: VMType.Bitcoin,
    tokenTransferFee: 0.001,
    coinTransferFee: 0.001,
    nftTransferFee: 0.001,
    logo: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042111-bitcoin.png',
    createdAt: '',
    updatedAt: '',
    slip0044: 0,
    price: 61930.583284637,
    nativeToken: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimal: 8,
    },
    supportedToken: [
        {
            decimal: 8,
            isNativeToken: true,
            logo: null,
            name: 'Bitcoin',
            symbol: 'BTC',
        },
    ],
    isDefault: true,
};

const ethereumProtocolDefaultData: ProtocolDataWithSupportedTokensFormBEType = {
    _id: '66da778a291e0ce47c6d8d5c',
    name: 'Ethereum',
    rpcUrl: '',
    status: 'active',
    symbol: 'ETH',
    blockExplorerUrl: EnvConfig.ETH_EXPLORER_URL,
    VM: VMType.EVM,
    tokenTransferFee: 0.001,
    coinTransferFee: 0.001,
    nftTransferFee: 0.001,
    logo: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042132-ethereum.png',
    createdAt: '',
    updatedAt: '',
    slip0044: 60,
    price: 2336.35833663544,
    nativeToken: {
        name: 'Ether',
        symbol: 'ETH',
        decimal: 18,
    },
    supportedToken: [
        {
            decimal: 18,
            isNativeToken: true,
            logo: null,
            name: 'Ether',
            symbol: 'ETH',
        },
    ],
    isDefault: true,
};

const tonProtocolDefaultData: ProtocolDataWithSupportedTokensFormBEType = {
    _id: '66e3bd3544fc7ffae93443c2',
    name: 'TON',
    rpcUrl: '',
    status: 'active',
    symbol: 'TON',
    blockExplorerUrl: EnvConfig.TON_VIEWER_TRANSACTION_URL,
    VM: VMType.Ton,
    tokenTransferFee: 0.001,
    coinTransferFee: 0.001,
    nftTransferFee: 0.001,
    logo: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042148-ton.png',
    createdAt: '',
    updatedAt: '',
    slip0044: 607,
    price: 4.735721798581789,
    nativeToken: {
        name: 'TonCoin',
        symbol: 'TON',
        decimal: 9,
    },
    supportedToken: [
        {
            decimal: 9,
            isNativeToken: true,
            logo: null,
            name: 'TonCoin',
            symbol: 'TON',
        },
    ],
    isDefault: true,
};

const binanceProtocolDefaultData: ProtocolDataWithSupportedTokensFormBEType = {
    _id: '66ed55fb499e454b70e63326',
    name: 'Binance Smart Chain',
    rpcUrl: '',
    status: 'active',
    symbol: 'BNB',
    blockExplorerUrl: EnvConfig.BNB_EXPLORER_URL,
    VM: VMType.EVM,
    tokenTransferFee: 0.001,
    coinTransferFee: 0.001,
    nftTransferFee: 0.001,
    createdAt: '',
    updatedAt: '',
    logo: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042120-bsc%20testnet.png',
    nativeToken: {
        name: 'Binance',
        symbol: 'BNB',
        decimal: 18,
    },
    slip0044: 20000714,
    price: 544.2434397728067,
    supportedToken: [
        {
            decimal: 18,
            isNativeToken: true,
            logo: null,
            name: 'Binance',
            symbol: 'BNB',
        },
    ],
    isDefault: true,
};

const polProtocolDefaultData: ProtocolDataWithSupportedTokensFormBEType = {
    _id: '66ed5939499e454b70e63360',
    name: 'Polygon',
    rpcUrl: '',
    status: 'active',
    symbol: 'POL',
    blockExplorerUrl: EnvConfig.POL_EXPLORER_URL,
    VM: VMType.EVM,
    tokenTransferFee: 0.0001,
    coinTransferFee: 0.0001,
    nftTransferFee: 0.0001,
    createdAt: '',
    updatedAt: '',
    logo: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-041952-polygon.png',
    nativeToken: {
        name: 'POL',
        symbol: 'POL',
        decimal: 18,
    },
    slip0044: 966,
    price: 0.3278020164252817,
    supportedToken: [
        {
            decimal: 18,
            isNativeToken: true,
            logo: null,
            name: 'POL',
            symbol: 'POL',
        },
    ],
    isDefault: true,
};

export const DefaultProtocolData = {
    bitcoin: bitcoinProtocolDefaultData,
    ton: tonProtocolDefaultData,
    ethereum: ethereumProtocolDefaultData,
    polygon: polProtocolDefaultData,
    binance: binanceProtocolDefaultData,
};

export const DefaultProtocolDataList: ProtocolDataWithSupportedTokensFormBEType[] =
    [
        bitcoinProtocolDefaultData,
        tonProtocolDefaultData,
        ethereumProtocolDefaultData,
        polProtocolDefaultData,
        binanceProtocolDefaultData,
    ];
