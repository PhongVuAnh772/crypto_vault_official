import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { APIResponseMoralis } from 'src/core/services/Moralis/type';
import { AppThemeType } from 'src/core/type/ThemeType';

export type EVMSendSlice = {
    currentToken:
        | SupportedTokenItemWithProtocol
        | SupportedNativeTokenWithProtocol
        | undefined;
    walletHistory?: APIResponseMoralis;
    transactionHistoryLoading: boolean;
};

export type BottomSheetContentConfirmationType = {
    sender: string;
    amount: string;
    amountFollowCurrency: string;
    logo: string;
    recipient: string;
    serviceFee: string;
    estimateGas: string;
    theme: AppThemeType;
    handleConfirm: () => void;
    isLoading: boolean;
    totalAmount: string;
    onClose: () => void;
    disable: boolean;
};
export type ErrorMessageType = {
    amount: string;
    page: string;
    address: string;
};
export type LoadingSendTokenType = {
    send: boolean;
    screen: boolean;
};
export type PinCodeType = {
    confirm: boolean;
    approve: boolean;
};
export type GivePermissionToken = {
    theme: AppThemeType;
    tokenName: string;
    sendAmount: string;
    estimateGas: string;
    handleConfirm: () => void;
    isLoading: boolean;
    commissionAmount: string;
    totalAmount: string;
    onClose: () => void;
    disable: boolean;
};

export type SendMaximumAmountComponentType = {
    onPress: () => void;
    theme: AppThemeType;
};
