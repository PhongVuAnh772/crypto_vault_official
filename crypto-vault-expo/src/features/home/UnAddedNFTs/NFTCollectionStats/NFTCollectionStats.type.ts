import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import {
    NFTDetailEVMCollectionType,
    UnAddedNFTListType,
} from 'src/core/redux/slice/NFT/NFTImport.type';

export type NFTCollectionStatsProps = {
    navigation: NavigationProp<ParamListBase>;
    collectionAddress: string;
    archived: boolean;
    collectionData: UnAddedNFTListType;
};

export type NFTCollectionStatsItemProps = {
    item: NFTDetailEVMCollectionType;
    convertIpfsToHttp: (ipfsLink: string) => string;
};

export type NFTItemStatsProps = {
    item: NFTDetailEVMCollectionType;
    index: number;
    onPress: (e: NFTDetailEVMCollectionType) => void;
    setIsLoading: (uri: string, value: boolean) => void;
    isLoading: boolean;
    selectedProtocol: ProtocolDataWithSupportedTokensFormBEType | undefined;
    archived: boolean;
};

export type NFTCollectionLoadingStatProps = {
    loading: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
};

export type NFTCollectionLoadingItemProps = {
    item: number;
    index: number;
};

export type BottomSheetNFTStatsMenuType = {
    showModal: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onDismiss: () => void;
};

export type BottomSheetNFTArchivingType = {
    showModal: boolean;
    onClose: () => void;
    onDelete: () => void;
    onDismiss: () => void;
    isArchived: boolean;
};

export type EmptyNFTCollectionDetailProps = {
    refreshing?: boolean;
    onRefresh?: () => void;
};
