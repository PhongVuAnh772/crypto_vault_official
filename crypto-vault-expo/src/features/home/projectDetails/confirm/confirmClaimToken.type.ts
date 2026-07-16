import { EdgeInsets } from 'react-native-safe-area-context';
import { AppThemeType } from 'src/core/type/ThemeType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    ClaimableType,
    ClaimHistory,
    NFTHistoryType,
    OwnedNFTType,
} from '../../bottomTab/explore/explore.type';

export interface UseProjectDetailType {
    // data;
    navigation: RootNavigationType;
}

export interface ClaimDetailProps {
    claimHistory: ClaimHistoryConfirmType;
    project: ProjectConfirmType;
}

interface ProjectConfirmType {
    name: string;
    protocolName: string;
}

interface ClaimHistoryConfirmType {
    __v: number;
    _id: string;
    amount: number;
    claimableTokenProject: string;
    createdAt: string;
    nftContractAddress: string;
    nftWalletAddress: string;
    nfts: [];
    tokenReceiverWalletAddress: string;
    updatedAt: string;
}

export interface ProjectInformationProps {
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
    loading: boolean;
}

export interface DataClaimableType {
    projectNFT?: {
        name?: string;
    };
    projectNftProtocol?: {
        name: string;
        logo: string;
    };
    project?: {
        projectName: string;
    };
}
export interface LoadingConfirmListViewType {
    isLoading: boolean;
}

export interface DataToTalProps {
    nfts: [];
}
export interface ProjectDetailChildProps {
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
    dataClaimable: ClaimableType | null;
    dataGetOwned: (ClaimHistory | OwnedNFTType | NFTHistoryType)[] | undefined;
    loading: boolean;
    totalClaim: string;
    totalInAllTransaction?: number;
    enableToken?: string;
    actionNavigatingSeeMoreScreen?: () => void;
    insets: EdgeInsets;
    enableVerticalScrollBar?: boolean;
}

export interface TotalClaimingFooterProps {
    total: string;
    theme: AppThemeType;
    loading: boolean;
    enableToken?: string;
}

export type DataNFTYouGotType = {
    nfts: OwnedNFTType[] | undefined;
    tokenReceiverWalletAddress: string;
    totalAMount: string;
};

export type DataGottedNFT = {
    nfts: OwnedNFTType[];
    totalAmount: string;
    tokenReceiverWalletAddress: string;
};

export interface ProtocolNFTViewProps {
    loading?: boolean;
    theme: AppThemeType;
    protocol_name?: string;
    project_image?: string;
    enableDivider?: boolean;
    usingWithExplore?: boolean;
}

export interface ContactSupportModalProps {
    theme: AppThemeType;
    visibleModal: boolean;
    disableAction: () => void;
    acceptAction: () => void;
    nameContact: string;
    setNameContact: (nameContact: string) => void;
    emailContact: string;
    setEmailContact: (emailContact: string) => void;
    inquiryContact: string;
    setInquiryContact: (inquiryContact: string) => void;
    disabled: boolean | undefined;
    loading: boolean;
}
