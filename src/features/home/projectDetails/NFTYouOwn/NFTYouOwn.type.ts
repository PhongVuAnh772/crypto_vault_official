import { TFunction } from 'i18next';
import { StyleProp, ViewStyle } from 'react-native';
import Canvas from 'react-native-canvas';
import { EdgeInsets } from 'react-native-safe-area-context';
import { AppThemeType } from 'src/core/type/ThemeType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    ClaimableType,
    OwnedNFTType,
} from '../../bottomTab/explore/explore.type';

export interface UseProjectDetailType {
    navigation: RootNavigationType;
}

export type NFTSelectedType = {
    _id: string;
    amount: number;
    contractAddress: string;
    image: string;
    nftId: string;
    rereceiverWalletAddress: string;
};

export interface ProjectInformationProps {
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
}
export interface ProjectDetailChildProps {
    styles: StyleProp<ViewStyle>;
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
    dataClaimable: ClaimableType | null;
    dataGetOwned: OwnedNFTType[];
    loading: boolean;
    totalClaim: number;
    insets: EdgeInsets;
}

export interface TotalClaimingFooterProps {
    total: number;
    theme: AppThemeType;
    loading: boolean;
}

export interface ProtocolNFTViewProps {
    theme: AppThemeType;
    protocol_name: string;
    project_image: string;
}

interface Information {
    _id: string;
    amount: number;
    contractAddress: string;
    image: string;
    nftId: number | string | undefined;
}

export interface ItemCollectionDetail {
    _id: string;
    amount: number;
    contractAddress: string;
    image: string;
    nftId: string;
    rereceiverWalletAddress: string;
}

export interface CollectionDetailNFTProps {
    information: Information | null;
    actionCollecting: () => void;
    cancelAction: () => void;
    statusModal: boolean;
    theme: AppThemeType;
    handleSubmitImport: () => Promise<void>;
    setItemYouOwnSelected: (item: ItemCollectionDetail | null) => void;
    setLoadingHandle: React.Dispatch<React.SetStateAction<boolean>>;
    loadingHandle: boolean;
    checkingExistingInCollection: () => void;
    isExistingInCollection: boolean;
    handleGetImage: () => Promise<void>;
    image: string | undefined;
    canvasRef: React.MutableRefObject<Canvas>;
    actionHideStatus: () => void;
}

export type RenderNFTYouOwnListNewProps = {
    item: OwnedNFTType;
    theme: AppThemeType;
    dataClaimable: ClaimableType | null;
    handleOpenNFTSelectedModal: (item: NFTSelectedType) => void;
    t: TFunction<'translation', undefined>;
    loading: boolean;
    inModal?: boolean;
};

export type LoadingListNFTOwnViewProps = {
    isLoading: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
};
