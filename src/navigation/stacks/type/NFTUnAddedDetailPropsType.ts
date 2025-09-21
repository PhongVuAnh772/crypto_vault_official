import { NFTDetailEVMCollectionType } from 'src/core/redux/slice/NFT/NFTImport.type';
import { Nftitem } from 'src/core/services/TonServices/type';

export type NFTUnAddedDetailParamListType = {
    metadata: MetadataUnAddedParamListType;
    added: boolean;
    archived: boolean;
    detail: NFTDetailEVMCollectionType | Nftitem;
};

export interface MetadataUnAddedParamListType {
    description: string;
    image: string;
    name: string;
}
