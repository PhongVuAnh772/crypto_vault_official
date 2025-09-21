import { Bytes, Numbers } from 'web3';

export type Web3ServiceType = {
    urpUrl: string;
    address?: string;
    abi?: [];
    contractAddress?: string;
};
type AccessKey = {
    readonly path: string;
    readonly slip: number;
    readonly pinCode: string;
};
export type approveNFTERC721Type = NFTAddressType &
    AccessKey & {
        smartContractUseForApproved: string;
    };
export type getPrivateKeyAndNonceAddressReturn = {
    nonce: number;
    privateKey: string;
    walletAddress: string;
};
export type transactionObjectType = {
    from: string;
    to: string;
    data: string;
};
export type NFTAddressType = {
    nftSmartContract: string;
    tokenId: number;
};
export type NFTTransferType = {
    readonly nftAddress: string;
    readonly sender?: string;
    readonly recipient: string;
    readonly nftId: number;
    readonly smartContractUseForTransfer: string;
    readonly beneficiaryAddress: string;
    readonly commission: number;
    readonly callBackWhenSuccessful: (data: TransactionWeb3Response) => void;
    readonly decimals: number;
} & AccessKey;
export type TransferNFTERC1155Type = NFTTransferType & {
    readonly quantity: string;
};
export type TransactionWeb3Response = {
    readonly transactionHash: Bytes;
    readonly transactionIndex: Numbers;
    readonly blockHash: Bytes;
    readonly blockNumber: Numbers;
    readonly from: string;
    readonly to: string;
    readonly cumulativeGasUsed: Numbers;
    readonly gasUsed: Numbers;
    readonly effectiveGasPrice?: Numbers;
    readonly contractAddress?: string;
    readonly logs: {
        readonly id?: string;
        readonly removed?: boolean;
        readonly logIndex?: Numbers;
        readonly transactionIndex?: Numbers;
        readonly transactionHash?: Bytes;
        readonly blockHash?: Bytes;
        readonly blockNumber?: Numbers;
        readonly address?: string;
        readonly data?: Bytes;
        readonly topics?: Bytes[];
    }[];
};

export type AddCustomTokenParamsType = {
    readonly contractAddress?: string;
};
export type GivePermissionParamsType = {
    readonly smartContractToken: string;
    readonly smartContractApproved: string;
    readonly amount: bigint;
} & AccessKey;
export type EstimateGasFeeTokenType = {
    readonly amount: bigint;
    readonly smartContract: string;
    readonly walletAddress: string;
    readonly tokenContractAddress: string;
};

export type TransferNativeTokenParamsType = {
    readonly beneficiaryAddress: string;
    readonly commission: bigint;
    readonly recipientAddress: string;
    readonly amount: bigint;
    readonly smartContract: string;
} & AccessKey;

export type TransferTokenParamsType = TransferNativeTokenParamsType & {
    readonly tokenContractAddress?: string;
};
export type EstimateGasFeeForTransferNFT1155 = {
    readonly beneficiaryAddress: string;
    readonly commission: number;
    readonly commissionContractAddress: string;
    readonly recipientAddress: string;
    readonly quantity: string;
    readonly nftContractAddress: string;
    readonly nftId: number;
    readonly decimals: number;
    readonly sender: string;
};

export type EstimateGasFeeTransferTokenType = Omit<
    TransferTokenParamsType,
    'path' | 'slip' | 'pinCode'
> & {
    sender: string;
};

export type TransferToken = {
    tokenAddress: string;
    recipient: string;
    beneficiary: string;
    commission: bigint;
    amountToRecipient: bigint;
    [key: string]: unknown;
    __length__: number;
};
export type ImportNFTParams = {
    readonly contractAddress: string;
    readonly nftId: number;
    readonly walletAddress: string;
};

export type GetOwnerOfNFTERC1155Params = ImportNFTParams;
export type ApproveNFT1155Params = Pick<
    ImportNFTParams,
    'contractAddress' | 'walletAddress'
>;
export type GetApproveNFT1155Params = {
    commissionContractAddress: string;
    walletAddress: string;
    contractAddress: string;
};
export type GetERC721DetailParams = Pick<
    ImportNFTParams,
    'contractAddress' | 'nftId'
>;
export enum NFTTokenStandard {
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
}
export type checkNFTResponse = {
    readonly owner: string;
    readonly balance: number;
    readonly nftType: NFTTokenStandard;
};
export type ApproveNFT1155ParamsSignTransactionType = AccessKey &
    Omit<GetApproveNFT1155Params, 'walletAddress'>;

export type EstimateGasFeeForNormalTransfer = {
    readonly toAddress: string;
    readonly amount: bigint;
};
