import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { AppThemeType } from 'src/core/type/ThemeType';

export interface ProjectInformationTransactionProps {
    projectName?: string;
    wallet_1?: string;
    recipientAddress?: string;
    theme: AppThemeType;
    protocolName?: string;
    protocolImage?: string;
    dateTransaction?: string;
    transactionHash?: string;
    handleCopy: () => void;
    handleViewOnScan: () => void;
    loading: boolean;
    actionNavigatingSeeMoreScreen?: () => void;
}

export interface WarningTransactionStatusProps {
    theme: AppThemeType;
    text: string;
}

type ClaimDetailNFTs = {
    amount: number;
    nftId: string;
};

export interface ClaimDetailsProps {
    claimHistory: ClaimHistory[];
    claimDate: string;
    project: Project;
    transactionHash: string;
    nfts: ClaimDetailNFTs[];
    _id?: string;
}

interface Project {
    name: string;
    protocolName: string;
}

interface ClaimHistory {
    transactionHash: string;
    walletAddress: string;
    nftId: string;
    amount: number;
    nftContractAddress: string;
    nftProtocol: string;
    claimableTokenProject: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface TransactionClaimDetailProps {
    navigation: NavigationProp<ParamListBase>;
    data: ClaimDetailsProps;
}
