import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {RouteProp} from '@react-navigation/native';
import {TextInput} from 'react-native';
import {HomeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {HomeStackParamListType} from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    NFTData,
    NFTRootData,
} from '../../../../../core/redux/slice/NFT/NFTImport.type';
import {NFTType} from '../../../bottomTab/NFTCollection/NFTCollectionTab/evm/NFTCollection.type';

export type NFTSendParamsType = {
    data: NFTData;
    addressReceive: string;
    gasFee: number;
};
export type NFTConfirmationSendParamsType = {
    adminFee: number;
    gasFee: string;
    data: NFTData;
    addressReceive: string;
    sender: string;
    quantity?: string;
};

export type NFTSendParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTSend
>;
export type SendNFTSkeletonLoadingType = {
    isHasQuantity?: boolean;
};
export type NFTGivePermissionTypeView = {
    handleConfirm: () => void;
    feeFollowCurrency: string;
    isLoading: boolean;
    gasEstimate: string;
    nftData: NFTData;
};
export type NFTGivePermissionType = NFTSendParamsType;

export type NFTSendTonProps = {
    handleBack: () => void;
    showScanQRCamera: boolean;
    isLoadingSkeleton: boolean;
    isHasQuantity: boolean;
    root: NFTRootData;
    detail: NFTType;
    imageUri: string;
    handleCopyToClipboard: () => Promise<void>;
    error: string;
    quantityInputRef: React.RefObject<TextInput>;
    setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
    handleOnClickContinue: () => Promise<void>;
    onSubmitWalletAddress: () => void;
    onShowScanQRCamera: () => void;
    walletAddress: string;
    quantity: string;
    setQuantity: React.Dispatch<React.SetStateAction<string>>;
    showModalConfirmTransaction: boolean;
    handleCallBackScanQR: (value: string) => void;
    isLoadingPage: boolean;
    showModalGivePermission: React.RefObject<BottomSheetModalMethods>;
    feeFollowCurrency: () => string;
    props: RootNavigationType;
    gasEstimate: string;
    handleCallBackWhenCompleted: (pinCode: string) => Promise<void>;
    handleConfirm: () => void;
    isLoading: boolean;
    nftData: NFTData;
    isNotOwner: boolean;
    handleUnderstood: () => void;
    onCloseScanQr: () => void;
};
