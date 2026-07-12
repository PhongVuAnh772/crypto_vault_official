import {
    NFTTonData,
    NFTTonRootData,
    NFTTonType,
} from '../NFTImport/NFTTonImport.type';

export type NFTSendConfirmationParamsListType = {
    networkFee: string;
    subNetworkFee: string;
    root: string;
    detail: string;
    lastPreview: string;
    sign: string;
    fromAddress: string;
    toAddress: string;
    adminFee: string;
    subAdminFee: string;
};

export type NFTConfirmParamsType = {
    NFTTonConfirmationSend: {
        networkFee: number;
        subNetworkFee: number;
        root: NFTTonRootData;
        detail: NFTTonType;
        lastPreview: string;
        sign: string;
        fromAddress: string;
        toAddress: string;
        adminFee: number;
        subAdminFee: number;
        nftData: NFTTonData;
        totalAmount: number;
        formattedTotalFeeBigAmount: number;
        bigNetworkFee: bigint;
        adminFeeBigInt: number;
        formattedNetworkFee: number;
        formattedAdminFee: bigint;
        bigAdminFee: bigint;
    };
};
