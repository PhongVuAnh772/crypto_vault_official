import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { NFTDetailEVMCollectionType } from 'src/core/redux/slice/NFT/NFTImport.type';
import { MetadataUnAddedParamListType } from 'src/navigation/stacks/type/NFTUnAddedDetailPropsType';

export type NFTUnAddedDetailProp = {
    navigation: NavigationProp<ParamListBase>;
    detail: NFTDetailEVMCollectionType;
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
    resMetadata: MetadataNFTEVM;
};

export type MetadataNFTEVM = {
    description: string;
    image: string;
    name: string;
};

export type NFTUnAddedDetailEVMViewProps = {
    navigation: NavigationProp<ParamListBase>;
    detail: NFTDetailEVMCollectionType;
    added: boolean;
    archived: boolean;
    metadata: MetadataUnAddedParamListType;
};
