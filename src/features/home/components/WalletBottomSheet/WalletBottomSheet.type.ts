import { Dispatch, SetStateAction } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';

export enum MenuActionType {
    remove = 'remove',
    edit = 'edit',
}
export type WalletBottomSheetType = {
    showBottomSheetModal: boolean;
    closeModalAction: () => void;
    onDismiss?: () => void;
    showSubModal?: boolean;
    maxHeight?: number;
    menuActionType?: MenuActionType | null;
    onCloseMenuWallet: () => void;
    removeWalletAction: () => Promise<void>;
    editWalletAction: () => Promise<void>;
    newWalletAddress: string;
    setNewWalletAddress: React.Dispatch<React.SetStateAction<string>>;
    avtColor?: string;
    menuPosition: {
        x: number;
        y: number;
    };
    onEditAction: () => void;
    onRemoveAction: () => void;
    isAddView: boolean;
    setIsAddView: Dispatch<SetStateAction<boolean>>;
    addressList?: AddressListItemType[];
    protocolBaseData?: ProtocolDataWithSupportedTokensFormBEType;
    selectedAddressId?: string;
    handlePressWallet: (data: AddressListItemType) => void;
    onShowMenuWallet: (wallet: AddressListItemType, index: number) => void;
    buttonRefs: React.MutableRefObject<{
        [key: string]: TouchableOpacity | null;
    }>;
};
