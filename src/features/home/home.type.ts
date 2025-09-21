import { ErrorContextKey } from 'src/core/enum/ContactFailedAction';
import Slip0044 from 'src/core/enum/Slip0044';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { TokenBalance } from 'src/core/services/Moralis/type';
import { BalanceItem } from 'src/core/services/TonServices/type';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';

export type ListCryptoDataType = {
    id: string;
    name?: string;
    symbol?: string;
    logo?: string | null;
    balance?: number;
    balanceToken?: number;
    tokenRateCurrency?: number | null;
    baseData?: ProtocolDataWithSupportedTokensFormBEType;
    rateCurrency?: number | null;
    active?: boolean;
    contractAddress?: string;
    isNative?: boolean;
    decimal?: number;
    coinToCurrency?: string;
    balanceToCurrency?: string;
    navigationKey?: HomeStackScreenKey | string;
    navigationParams?: {
        jettonData?: BalanceItem;
        cryptoData: ListCryptoDataType;
    };
    slip0044?: Slip0044;
    tokenAddress?: string;
    isRedXToken?: boolean;
};
export type TokensObject = {
    [key: string]: TokenBalance;
};
export type ErrorContext = {
    [key in ErrorContextKey]?: string | number;
};
