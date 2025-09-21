import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { NFTDetailEVMCollectionType } from 'src/core/redux/slice/NFT/NFTImport.type';
import { Nftitem } from 'src/core/services/TonServices/type';
import { MetadataUnAddedParamListType } from 'src/navigation/stacks/type/NFTUnAddedDetailPropsType';

export type NFTUnAddedDetailProp = {
    navigation: NavigationProp<ParamListBase>;
    detail: NFTDetailEVMCollectionType | Nftitem;
    metadata: MetadataUnAddedParamListType;
    added: boolean;
};
export type DataFetching = {
    name?: string;
    description?: string;
    image?: string;
    tokenURI?: string;
    owner?: string;
    symbol?: string;
    tokenStandard?: string;
    quantity?: number;
    resMetadata: MetadataNFTTon;
};

export type MetadataNFTTon = {
    description: string;
    image: string;
    name: string;
};

export type NFTUnAddedDetailTonViewProps = {
    navigation: NavigationProp<ParamListBase>;
    detail: Nftitem;
    added: boolean;
    archived: boolean;
    metadata: MetadataUnAddedParamListType;
};

export type NFTUnAddedDetailTonProps = {
    navigation: NavigationProp<ParamListBase>;
    detail: Nftitem;
};
