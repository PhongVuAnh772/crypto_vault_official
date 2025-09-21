import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import { Itxrefs } from 'src/core/services/BitcoinServices/type';
import { CurrencyChangeNow } from 'src/core/services/ChangeNow/types';
import { TonAccountsType } from 'src/core/services/TonServices/type';

export enum SwapSelector {
    YouSend = 'YouSend',
    YouGet = 'YouGet',
}

export type CurrencyController = {
    youGetCurrency: CurrencyChangeNow | null;
    youSendCurrency: CurrencyChangeNow | null;
};

export enum CurrencyControllerEnum {
    youGetCurrency = 'youGetCurrency',
    youSendCurrency = 'youSendCurrency',
}

export type WalletManagement = {
    fromWallet: AddressListItemType | null;
    toWallet: AddressListItemType | null;
};

export enum SwapTypeFrom {
    From = 'from',
    To = 'to',
}
export type ProtocolController = {
    youGetCurrency: ProtocolDataWithSupportedTokensFormBEType | undefined;
    youSendCurrency: ProtocolDataWithSupportedTokensFormBEType | undefined;
};
export type SwapController = {
    balanceYouGet: string;
    balanceYouSend: string;
    balanceFormattedYouGet: string;
    balanceFormattedYouSend: string;
    amountYouGet: string;
    amountYouSend: string;
    amountYouSendToCurrency: string;
    amountYouGetToCurrency: string;
    minimalExchangeAmount: string;
    searchCrypto: string;
    youGetPrice: number;
    youSendPrice: number;
    errorMessage: string;
    decimalsCurrencyYouSend: number;
    estimateNetworkFee: string;
    totalAmount: string;
    forecast: string;
    rate: string;
};

export type LoadingManagement = {
    init: boolean;
    buttonLoading: boolean;
    youGetBalance: boolean;
    youSendBalance: boolean;
};
export type BalanceType = {
    balance: string;
    decimals: number;
    balanceFormatted: string;
    price: number;
};

export type TonTransactionInformation = {
    accountData: TonAccountsType | undefined;
    jettonWalletAddress: string | undefined;
    currentNetworkFee: string | undefined;
};

export type BitCoinTransactionInformation = {
    itxRefs: Itxrefs[] | undefined;
    feePerKb: number | undefined;
};
