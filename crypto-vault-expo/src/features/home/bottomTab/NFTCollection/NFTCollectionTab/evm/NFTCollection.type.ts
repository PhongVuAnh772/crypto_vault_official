import { NftItem } from '@ton-api/client';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    NFTCollection,
    NFTData,
    NFTDetailEVMCollectionType,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import { NFTTokenStandard } from 'src/core/services/Web3/type';

type NFTType = {
    description?: string;
    external_url?: string;
    image: string;
    name: string;
    attributes?: [];
    network_image?: string;
    nftId: number;
    image_data?: string;
    quantity?: number;
    tokenStandard?: NFTTokenStandard;
    nftDetailAll: NFTDetailEVMCollectionType & NftItem;
};
interface LoadingWrapperProps {
    loading: boolean;
    children: React.ReactNode;
    skeletonHeight?: number | DimensionValue;
    skeletonWidth?: number | DimensionValue;
    containerSkeleton?: StyleProp<ViewStyle>;
}
type ListEmpty = {
    onPress: () => void;
};

type NFTCollectionTonListProps = {
    lightMode: boolean;
    collection: NFTCollection[];
    refreshing: boolean;
    onRefresh: () => void;
    handleOnPressImport: () => void;
    isLoadings: LoadingImage;
    handlePressViewAll: (data: NFTCollection) => void;
    handlePressNFT: (item: NFTData) => void;
    setLoadings: (uri: string, value: boolean) => void;
};

export type HeaderCollectionRenderingProps = {
    imageUri: string;
    setLoadingImage: (uri: string, value: boolean) => void;
    isLoading: boolean;
    loading: boolean;
    title: string;
    isHideViewAll: boolean;
    handlePressViewAll: () => void;
    length?: number;
};
export type {
    ListEmpty,
    LoadingWrapperProps,
    NFTCollectionTonListProps,
    NFTType
};

