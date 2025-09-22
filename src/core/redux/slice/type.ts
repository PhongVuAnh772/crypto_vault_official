import AuthAction from 'src/core/enum/AuthAction';
import { CoinShortName } from 'src/core/enum/CoinShortName';
import { CoinType } from 'src/core/enum/CoinType';
import LanguageType from 'src/core/enum/LanguageType';
import ThemeKey from 'src/core/enum/ThemeKey';
import {
    AccountType,
    ProtocolDataWithSupportedTokensFormBEType,
} from './account.type';

export type AppSliceType = {
    themeMode: ThemeKey;
    languageType: LanguageType;
    requirePinCode: boolean;
    maxPinCodeAttempts: number;
    failedPinAttempts: number;
    timeLock?: number;
    showForceUpdateModal: boolean;
    forceUpdate: boolean;
    remoteConfigAppVersion?: string;
    keepSplash: boolean;
    isFirstTime: boolean;
    authAction?: AuthAction;
    settingCurrency?: SettingCurrencyType[];
    cryptosCurrency?: CryptosCurrencyType[];
    selectedCurrencySetting?: SettingCurrencyType;
    baseCurrency?: SettingCurrencyType;
    isModalShow: boolean;
    enableFaceIdOrTouch: boolean;
    showModalConfirmTransaction: boolean;
    pressActionNoti: boolean;
    showModalSelectProtocol: boolean;
    showCommonErrorModal: boolean;
    updateBalance: boolean;
    heightBottomTab?: number;
    webViewIsShowing: boolean;
    minFeeForJettonTransfer: number | undefined;
    blockJettonTransfer: boolean;
    blockTonNftTransfer: boolean;
    blockTonTransfer: boolean;
    blockBitcoinTransfer: boolean;
    actionFailedNeedToContact: string;
    tonAdminBounce: boolean;
    jettonAdminBounce: boolean;
    isLockoutLocalAuthentication: boolean;
    keyboardHeight: number;
    swapGuidingShow?: boolean;
    enablePassword: boolean;
};

export type AccountEncryptedType = {
    cipher: string;
    iv: string;
};

export type CoinData = {
    key?: string;
    address?: string;
};

export type SettingCurrencyType = {
    name: string;
    rate: number;
    symbol: string;
    sign: string;
};

export type CryptosCurrencyType = {
    name: string | CoinType;
    price: number;
    slug: string;
    symbol: CoinShortName | string;
};

export type AddressDataWithWalletConnectChainIdType = {
    chaiId: string;
    protocolListData: ProtocolDataWithSupportedTokensFormBEType[] | undefined;
    currentAccount: AccountType | undefined;
};
export type AccountTonWithAndAddress = {
    addressRequest: string;
    protocolListData: ProtocolDataWithSupportedTokensFormBEType[] | undefined;
    allCount: AccountType[] | undefined;
};
export type IdAccountWithChainIdAndAddress = {
    addressRequest: string;
    chaiId: string;
    protocolListData: ProtocolDataWithSupportedTokensFormBEType[] | undefined;
    allCount: AccountType[] | undefined;
};
