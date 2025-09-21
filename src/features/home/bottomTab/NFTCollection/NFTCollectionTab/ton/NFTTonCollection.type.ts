import { NftItem } from '@ton-api/client';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    NFTTonCollection,
    NFTTonData,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import { NFTDetailEVMCollectionType } from 'src/features/home/NFTCollection/ton/NFTImport/NFTTonImport.type';

type NFTType = {
    description?: string;
    external_url?: string;
    image?: string;
    name?: string;
    attributes?: [];
    network_image?: string;
    nftId?: number;
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
    collection: NFTTonCollection[];
    refreshing: boolean;
    onRefresh: () => void;
    handleOnPressImport: () => void;
    isLoadings: LoadingImage;
    handlePressViewAll: (data: NFTTonCollection) => void;
    handlePressNFT: (item: NFTTonData) => void;
    setLoadings: (uri: string, value: boolean) => void;
};
export type {
    ListEmpty,
    LoadingWrapperProps,
    NFTCollectionTonListProps,
    NFTType,
};
