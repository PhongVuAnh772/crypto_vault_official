import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {RouteProp} from '@react-navigation/native';
import {CodeScanner} from 'react-native-vision-camera';
import {ProtocolDataWithSupportedTokensFormBEType} from 'src/core/redux/slice/account.type';
import {HomeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {HomeStackParamListType} from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {NFTTonRootData, NFTTonType} from '../NFTImport/NFTTonImport.type';
export type NFTSendParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTTonSend
>;

export type NFTSendTonProps = {
    handleBack: () => void;
    showScanQRCamera: boolean;
    isLoadingSkeleton: boolean;
    root: NFTTonRootData;
    detail: NFTTonType;
    handleCopyToClipboard: () => Promise<void>;
    error: string;
    setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
    handleOnClickContinue: () => Promise<void>;
    onSubmitWalletAddress: () => void;
    onShowScanQRCamera: () => void;
    walletAddress: string;
    handleCallBackScanQR: (value: string) => void;
    isLoadingPage: boolean;
    props: RootNavigationType;
    handleConfirm: () => void;
    isNotOwner: boolean;
    handleUnderstood: () => void;
    requirePinCode: boolean;
    closeRequirePinCode: () => void;
    bottomSheetSendMaximum: React.RefObject<BottomSheetModalMethods>;
    onCloseBottomSheetSendMaximum: () => void;
    codeScanner: CodeScanner;
    inputRecipientAddress: boolean;
    toAddressError: boolean;
    adminFee: number;
    networkFee: number;
    showModal: boolean;
    onModalConfirmDismiss: () => void;
    fromAddress: string;
    fromAmount: string;
    fromSubAmount: string;
    confirmAction: () => void;
    toAddress: string;
    onClose: () => void;
    sign: string;
    errorBalance: boolean;
    currentProtocol: ProtocolDataWithSupportedTokensFormBEType | undefined;
    errorBalanceCover: boolean;
    onCloseScanQr: () => void;
    hidingErrorBalance: () => void;
};
