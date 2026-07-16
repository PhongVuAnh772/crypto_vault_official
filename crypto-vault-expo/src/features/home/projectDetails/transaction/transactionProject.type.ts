import { AppThemeType } from 'src/core/type/ThemeType';

interface NFT {
    _id: string;
    amount: number;
    nftId: string;
}

interface Protocol {
    rpcUrl: string;
}

interface Transaction {
    nftContractAddress: string;
    nfts: NFT[];
    protocol: Protocol;
    transactionHash: string;
}

export type TransactionProps = {
    _id: string;
    endDate: string;
    projectBanner: string;
    projectName: string;
    projectProtocolLogo: string;
    projectProtocolSymbol: string;
    startDate: string;
};

export interface EmptyHistoryProps {
    theme: AppThemeType;
}

export interface ItemClaimHistoryProps {
    transactionHash: string;
    nfts: NFTProps[];
}

export interface NFTProps {
    image: string;
    name: string;
    amount: number;
    _id: string;
    tokenURI: string;
}

export interface NFTContainerProps {
    response: {
        name: string;
        image_data: string;
    };
    _id: string;
    amount: number;
}

interface NFTPropsLocal {
    _id: string;
    amount: number;
    // Add other properties that NFTProps should have
    tokenURI?: string; // Example additional property
}

export interface NFTResponseProps extends NFTPropsLocal {
    response: {
        name?: string;
        image_data?: string;
        // Add other properties that the response should have
    };
}

export type Transactions = Transaction[];

export type LoadingListTransactionProps = {
    isLoading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
};
