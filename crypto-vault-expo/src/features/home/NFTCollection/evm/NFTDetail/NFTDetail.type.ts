import { NFTTokenStandard } from 'src/core/services/Web3/type';

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
    showModal: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    detailName: string;
    usingTonView?: boolean;
    indexNFT?: number;
};
export type AvatarNFTType = {
    uri: string;
    uriNetwork: string;
    setLoadings: (uri: string, value: boolean) => void;
    isLoading: boolean;
    typeNFT?: NFTTokenStandard;
    loadingHeight?: number;
};

export type TopContentNFTDetailsProps = {
    isLoading: boolean;
    setLoadings: (uri: string, value: boolean) => void;
    typeNFT?: NFTTokenStandard;
    imageUri: string;
    uriNetwork: string;
    isERC1155: boolean;
    detailName: string;
    detailId: number;
    tokenStandard: string;
    quantity: number;
    handlePressURL: () => void;
    contractAddress: string;
    copyAction: () => void;
    description?: string;
};

export type NFTImportContentProps = {
    handleCopyToClipboard: () => Promise<void>;
    setContractAddress: React.Dispatch<React.SetStateAction<string>>;
    contractAddress: string;
    idNFT?: string;
    onScanQR: () => void;
    setIdNFT?: React.Dispatch<React.SetStateAction<string>>;
    usingWithEVM?: boolean;
};
