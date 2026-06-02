import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { NftItem } from '@ton-api/client';
import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    AddressListItemType,
    ProtocolDataFromBEType,
    ProtocolDataType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import { NftTonNewItem } from 'src/core/services/TonServices/type';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import { AppThemeType } from 'src/core/type/ThemeType';
import { NFTType } from 'src/features/home/bottomTab/NFTCollection/NFTCollectionTab/evm/NFTCollection.type';

export interface CollectionMoralisResponse {
    data: CollectionMoralisType;
    isSuccess: boolean;
    status: number;
}

export type ExtendedInput = {
    currentProtocol: ProtocolDataWithSupportedTokensFormBEType;
    currentWallet: AddressListItemType;
    accountId: string | undefined;
    tonWallet: AddressListItemType;
};

export interface UnAddedNFTListType {
    collection_banner_image: null;
    collection_logo: null | string;
    contract_type: string;
    floor_price: null;
    floor_price_currency: null;
    floor_price_usd: null;
    name: string;
    possible_spam: boolean;
    symbol: string;
    token_address: string;
    verified_collection: boolean;
}

interface CollectionMoralisType {
    cursor: string;
    page: number;
    page_size: number;
    result: UnAddedNFTListType[];
    status: string;
}

export type NFTTonItems = NftItem & {
    active?: boolean;
};

export type TonNFTResponses = {
    nftItems: NFTTonItems[];
};

export type NFTSlice = {
    tonCollection: {
        [idAccount: string]: {
            [idAddress: string]: NFTTonCollection[];
        };
    };
    collection: {
        [idAccount: string]: {
            [idAddress: string]: NFTCollection[];
        };
    };
    collectionsMoralis: CollectionMoralisResponse | {};
    detailNFTsByCollection: NFTDetailColectionAPIResponse | {};
    cursorCollectionsMoralis: string | null;
    cursorDetailNFTsByCollection: string | null;
    currentRoutesTabIndex: number;
    archivedCollectionFocused: string[];
};

export type ImportNFTParams = {
    contractAddress: string;
    nftId: number;
    id: string;
    protocolData: ProtocolDataFromBEType;
    accountId: string;
    nftData: NFTResponse;
};
export type NFTResponse = {
    name: string;
    owner: string;
    symbol: string;
    tokenURI: string;
    tokenStandard: NFTTokenStandard;
    quantity?: number;
};

export type NFTTonResponse = {
    name: string;
    owner: string;
    symbol: string;
    tokenURI?: string;
    tokenStandard?: NFTTokenStandard;
    quantity?: number;
};

export type ImportNFTTonParams = {
    contractAddress: string;
    id: string;
    protocolData: ProtocolDataFromBEType;
    accountId: string;
    dataTonNFT: NftTonNewItem;
};
export type NFTRootData = Omit<NFTResponse, 'quantity' | 'tokenStandard'> & {
    contractAddress: string;
    id: string;
    accountId: string;
    protocol: ProtocolDataFromBEType;
};
export type NFTCollection = {
    name: string;
    contractAddress: string;
    network: string;
    tokenStandard?: NFTTokenStandard;
    data: NFTData[];
    latestId?: number; // only for ERC1155
};
export type NFTData = {
    root: NFTRootData;
    detail: NFTType;
};
export type ImportNFTResponseSuccessfullyType = {};

export type ProtocolType = {
    item: ProtocolDataFromBEType;
    currentSelector?: ProtocolDataFromBEType | null;
    onPress?: (value: ProtocolDataFromBEType) => void;
    setLoadingImages: (uri: string, value: boolean) => void;
    isLoadingImage: LoadingImage;
    theme: AppThemeType;
};
export type BottomSheetModalSelectProtocol = {
    showBottomSheetModal: boolean;
    closeModal: () => void;
    listProtocol?: ProtocolDataType[];
    setSearchProtocol: (value: string) => void;
    currentProtocol?: ProtocolDataType;
    onPressProtocol?: (value: ProtocolDataType) => void;
    valueInputText: string;
    setLoadingImages: (uri: string, value: boolean) => void;
    isLoadingImage: LoadingImage;
    refModal: React.RefObject<BottomSheetModalMethods>;
};
export type MigrateNFTType = {
    accountId: string;
    chainId: number;
    walletAddress: string;
    idCollection: string;
};

export type NFTDetailColectionAPIResponse = {
    cursor: string;
    page: number;
    page_size: number;
    result: NFTDetailEVMCollectionType[];
};

export interface CollectionDetailMoralisResponse {
    data: NFTDetailColectionAPIResponse;
    isSuccess: boolean;
    status: number;
    result: NFTDetailEVMCollectionType[];
    cursor: string | null;
}

export interface NFTDetailEVMCollectionType {
    token_address: string;
    token_id: string;
    amount: string;
    token_hash: string;
    block_number: string;
    block_number_minted: null | string;
    contract_type: string;
    name: string;
    symbol: string;
    token_uri: string;
    metadata: string | Record<string, any> | null;
    normalized_metadata?: Record<string, any> | null;
    media?: Array<{
        mimetype?: string;
        parent_hash?: string;
        status?: string;
        updatedAt?: string;
        media_collection?: {
            low?: { url?: string };
            high?: { url?: string };
        };
        original_media_url?: string;
    }>;
    last_token_uri_sync: string;
    last_metadata_sync: string;
    minter_address: null | string;
    owner_of: string;
    rarity_rank: number;
    rarity_percentage: number;
    rarity_label: string;
    possible_spam: boolean;
    verified_collection: boolean;
    floor_price: null | string;
    floor_price_usd: null | string;
    floor_price_currency: null | string;
    active: boolean;
}

//////////////////////////////////////////
// TON

export type NFTDetailTonColectionType = NFTDetailEVMCollectionType &
    NftItem & {
        active?: boolean;
    };

export type NFTTonRootData = Omit<NFTTonResponse, 'quantity'> & {
    contractAddress: string;
    id: string;
    accountId: string;
    protocol: ProtocolDataFromBEType;
    tonCollectionAddress: string;
};

export type NFTTonType = {
    description?: string;
    external_url?: string;
    image?: string;
    name?: string;
    attributes?: [];
    network_image?: string;
    image_data?: string;
    quantity?: number;
    tokenStandard?: NFTTokenStandard;
    nftDetailAll: NftTonNewItem;
};

export type NFTTonData = {
    root: NFTTonRootData;
    detail: NFTTonType;
};

export type NFTTonCollection = {
    name: string;
    contractAddress: string;
    network: string;
    data: NFTTonData[];
    latestId?: number;
};
