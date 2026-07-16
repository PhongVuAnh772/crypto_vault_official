import { NFTTokenStandard } from 'src/core/services/Web3/type';
import { NFTTonData } from '../NFTImport/NFTTonImport.type';

export type BottomSheetMenuType = {
    showModal: boolean;
    onClose: () => void;
    onDelete: () => void;
    onDismiss: () => void;
};
export type MenuOptionType = {
    onPress: () => void;
};
export type DeleteNFTModalType = {
    data: NFTTonData;
    showModal: boolean;
    onCancel: () => void;
    onConfirm: (data: NFTTonData) => void;
};
export type AvatarNFTType = {
    uri: string;
    uriNetwork: string;
    setLoadings?: (uri: string, value: boolean) => void;
    isLoading?: boolean;
    typeNFT?: NFTTokenStandard;
    loadingHeight?: number;
};
