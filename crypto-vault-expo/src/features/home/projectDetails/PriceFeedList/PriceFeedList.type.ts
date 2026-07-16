import { StyleProp, ViewStyle } from 'react-native';
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

export interface ProjectInformationProps {
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
}

export interface GetOwnedNFTType {}

export interface DataGetOwnedType {
    nfts: OwnedNFTType[] | undefined;
}
export interface ProjectDetailChildProps {
    insets: EdgeInsets;
    styles: StyleProp<ViewStyle>;
    project_name?: string;
    wallet_1?: string;
    recipient_address?: string;
    theme: AppThemeType;
    dataClaimable: ClaimableType;
    dataGetOwned: DataGetOwnedType | OwnedNFTType[];
    loading: boolean;
    totalClaim: number;
}

export interface RenderPriceFeedNewProps {
    item: OwnedNFTType;
    theme: AppThemeType;
    dataClaimable: ClaimableType | null;
    insets: EdgeInsets;
    loading: boolean;
    inHome: boolean;
}

export interface TotalClaimingFooterProps {
    total: number;
    theme: AppThemeType;
    loading: boolean;
}

export interface ProtocolNFTViewProps {
    styles: StyleProp<ViewStyle>;
    theme: AppThemeType;
    protocol_name: string;
    project_image: string;
}

export type LoadingListPriceFeedViewProps = {
    isLoading: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
};
