import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import { CurrencyChangeNow } from 'src/core/services/ChangeNow/types';

export type SwapBoxProps = {
    title: string;
    onPressProtocol: () => void;
    logoProtocol: string;
    protocolName: string;
    tokenName: string;
    tokenLogo: string;
    balanceText: string;
    currencyText: string;
    onChangeText?: (text: string) => void;
    value: string;
    disabledInput: boolean;
    onPressToken: () => void;
    i18nParamsBalance?: Record<string, string>;
    disableSendMax?: boolean;
    onPressSendMax?: () => void;
    walletName: string;
    onShowWalletManagement: () => void;
    onShowBalanceInfo?: () => void;
    isShowBalanceInfo?: boolean;
};

export type ProtocolListBottomSheetProps = {
    refModal: React.RefObject<BottomSheetModal>;
    onCloseModalProtocol: () => void;
    protocolList: ProtocolDataWithSupportedTokensFormBEType[];
    selectedProtocolId: string;
    handlePressProtocol: (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
    ) => void;
};

export type CurrenciesBottomSheetProps = {
    refModal: React.RefObject<BottomSheetModal>;
    onClose: () => void;
    currencies: CurrencyChangeNow[];
    currencySelected: CurrencyChangeNow | null;
    onPressCurrency: (currency: CurrencyChangeNow) => void;
    searchCrypto: string;
    onChangeSearchCrypto: (value: string) => void;
};

export type CurrencyItemProps = {
    item: CurrencyChangeNow;
    onPress: () => void;
    isSelected: boolean;
};
export type MinimalExchangeAmountViewProps = {
    minimum?: string;
    symbol: string;
};
export type SwapConfirmationBottomSheetProps = {
    refModal: React.RefObject<BottomSheetModal>;
    onCloseModal: () => void;
    youSend: {
        amount: string;
        amountFollowCurrency: string;
        logo: string;
        walletAddress: string;
    };
    youGet: {
        amount: string;
        amountFollowCurrency: string;
        logo: string;
        walletAddress: string;
    };
    forecast: string;
    networkFee: string;
    totalAmount: string;
    onConfirm: () => void;
    isLoading: boolean;
};
export type ConfirmationInfoBoxProps = {
    amount: string;
    amountFollowCurrency: string;
    logo: string;
    title: string;
    walletAddress: string;
};
export type RowProps = {
    title: string;
    value: string;
};
export type RatePreviewProps = {
    rate: string;
};

export type WalletBottomSheetProps = {
    refModal: React.RefObject<BottomSheetModal>;
    onClose: () => void;
    walletList: AddressListItemType[];
    walletListId: string;
    handlePressWallet: (wallet: AddressListItemType) => void;
};
