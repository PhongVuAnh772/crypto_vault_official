import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { NavigationState, Route } from 'react-native-tab-view';
import { AppThemeType } from 'src/core/type/ThemeType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { HexString, Web3BaseWalletAccount } from 'web3';
import {
    ClaimableType,
    OwnedNFTType,
} from '../../bottomTab/explore/explore.type';
import { DataClaimableType } from '../confirm/confirmClaimToken.type';
export interface SwiperComponentProps {
    data: string[];
}

export interface CollectionModalProps {
    collectionModal: boolean;
    handleWithCollection: () => void;
    onCloseCollectionModal: () => void;
    itemCollectionCheck: {
        image?: string;
        name?: string;
    };
}

export interface ExpandableTextProps {
    children: ReactNode;
    descriptionLength: number;
}

export interface GottingNFTModalProps {
    gottingModal: boolean;
    onCloseGottingModal: () => void;
}

export interface JettonPriceChartProps {
    gottingModal: boolean;
    onCloseGottingModal: () => void;
    itemGotting?: string;
    _handleShowChartAsync: (url: string) => void;
}

export interface ProjectDetailPropsType extends RootNavigationType {
    props: {
        projectBanner: string;
        endDate: string;
        _id: string;
        startDate: string;
    };
    showRequirePinCode: () => void;
    setContractTonAddress: React.Dispatch<React.SetStateAction<string>>;
    contractTonAddress: string;
    loadingLinking: boolean;
    handleShowInstruction: () => void;
    handleShowPinCodeInstruction: () => void;
    showImportLinking: boolean;
    setShowImportLinking: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ProjectDetailChildrenPropsType {
    projectBanner?: string;
    endDate?: string;
    _id: string;
}

export interface JETTONDetailsAndPickingChartProps {
    theme: AppThemeType;
    enableViewChart: () => void;
    JETTON_name?: string;
    JETTON_symbol?: string;
    JETTON_contract_address?: string;
    _handleShowChartAsync: (url: string) => void;
    loading: boolean;
    dataClaimable: ClaimableType | null;
    t: TFunction<'translation', undefined>;
}

export interface ConfirmationModalProps {
    comfirmationModal: boolean;
    onCloseComfirmationModal: () => void;
    theme: AppThemeType;
    dataClaimable: DataClaimableType | null;
    onShowCollectionModal: () => void;
    setItemCollectionCheck: React.Dispatch<
        React.SetStateAction<{
            name: string;
        } | null>
    >;
    totalPrice: number;
    loading: boolean;
}

export interface TokenWhatYouGotModalProps {
    t: TFunction<'translation', undefined>;
    comfirmationModal: boolean;
    onCloseComfirmationModal: () => void;
    theme: AppThemeType;
    dataClaimable: ClaimableType | null;
    onShowCollectionModal: () => void;
    setItemCollectionCheck: React.Dispatch<
        React.SetStateAction<{
            name: string;
        } | null>
    >;
    totalPrice: number;
    loading: boolean;
    dataGetOwned: OwnedNFTType[];
}

export interface TokenYouGotModalProps {
    comfirmationModal: boolean;
    onCloseComfirmationModal: () => void;
    theme: AppThemeType;
    dataClaimable: DataClaimableType;
    onShowCollectionModal: () => void;
    setItemCollectionCheck: React.Dispatch<
        React.SetStateAction<{
            name: string;
        } | null>
    >;
    totalPrice: number;
    handleClaimToken: () => Promise<void>;
    loading: boolean;
}

export interface ClaimTokenHeaderProps {
    closeModal: () => void;
}

export interface TokenWhatYouGotHeaderProps {
    closeModal: () => void;
    theme: AppThemeType;
}

export interface ClaimDetail {
    response: {
        image: string;
        name: string;
        counting: number;
        amount: number;
        _id: string;
        image_data: string;
    };
    nftId: string;
    amount: number;
}

export interface ViewMorePriceFeedProps {
    action: () => void;
    theme: AppThemeType;
    loading: boolean;
    newUI?: boolean;
}

export interface ToggleSeeMoreViewProps {
    textShown?: boolean;
    toggleNumberOfLines?: () => void;
}

export interface SwitchProtocolWarningModalProps {
    theme: AppThemeType;
    disableAction: () => void;
    acceptAction: (promisingProtocol?: string) => void;
    visibleModal: boolean;
    insets: EdgeInsets;
    promisingProtocol?: string;
    currentFalsingProtocol: string;
    projectName: string;
    isLoading: boolean;
    currentIcon?: React.ReactNode;
    expectIcon?: React.ReactNode;
}

export type NFTTransactionDetailsLoadingProps = {
    loading: boolean;
};

export type LinkingTonAddressComponentProps = {
    handleCopyToClipboard: () => void;
    setContractAddress: (value: string) => void;
    contractAddress: string;
    onScanQR: () => void;
    insets: EdgeInsets;
    handleShowInstruction: () => void;
    setErrorValidAddress: React.Dispatch<React.SetStateAction<boolean>>;
};

export type LinkedTonAddressComponentProps = {
    insets: EdgeInsets;
    contractAddress: string;
    handleShowInstruction: () => void;
};

export interface SignedTransaction {
    message?: string;
    messageHash: string;
    v: string;
    r: string;
    s: string;
    signature: string;
}

export interface Web3Account extends Web3BaseWalletAccount {
    address: HexString;
    privateKey: HexString;
}

export type ProjectDescriptionProps = {
    description: string;
    textShown: boolean;
    onTextLayout: (e: any) => void;
    toggleNumberOfLines: () => void;
    theme: AppThemeType;
    insets: EdgeInsets;
};

export type BottomSheetInstructionLinkingWalletProps = {
    isVisible: boolean;
    closeModalCreateNewWallet: () => void;
    continueAction: () => void;
    onDismiss: () => void;
    insets: EdgeInsets;
    bottomSheetRef: React.RefObject<BottomSheetModalMethods>;
};

export type ModalLinkingWalletProps = {
    showModalImportWallet: boolean;
    isScanning: boolean;
    handleCancel: () => void;
    handleStart: () => void;
    closeModalImport: () => void;
    theme: AppThemeType;
    insets: EdgeInsets;
    walletAddressError: boolean;
    isFocus: boolean;
    onChangeText: (value: string) => void;
    walletAddress: string;
    onBlur: () => void;
    onFoCus: () => void;
    handleCopyToClipboard: () => void;
    loadingLinking: boolean;
    onShowScanQr: () => void;
    newUI: boolean;
};

export type RenderNFTCollectionTabBarProps<T extends Route> = {
    navigationState: NavigationState<T>;
    jumpTo: (key: string) => void;
};
