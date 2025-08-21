import Slip0044 from "src/core/enum/Slip0044";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import {
  JettonBalancePriceType,
  JettonBalanceWalletAddress,
  RiskType,
} from "src/navigation/stack/type/TonServiceType";
import { TokenBalance } from "src/type/MoralisType";
import {
  AddressListItemType,
  ProtocolDataWithSupportedTokensFormBEType,
  SupportedNativeTokenType,
  SupportedTokenItemType,
} from "./account.type";

export type ListTokenLocalType = {
  listTokenByProtocol: {
    [id: string]: SupportedTokenItemWithProtocol[];
  };
};
export type AddTokenParamsType = {
  id: string;
  token: SupportedTokenItemWithProtocol;
};
export type LocalTokenReducerType = ListTokenLocalType & {
  listTokenFromBE: Record<string, SupportTokenDataType>;
  currentTokenSelected?:
    | SupportedTokenItemWithProtocol
    | SupportedNativeTokenWithProtocol;
};

export type ChangeActiveTokenType = {
  id: string;
  contractAddress: string;
  value: boolean;
};

export type ConvertTokenFromBEParamDataType =
  ProtocolDataWithSupportedTokensFormBEType;

export type SupportedTokenItemWithProtocol = SupportedTokenItemType & {
  idProtocol: string;
  active?: boolean;
  balance?: number;
  originTokenType?: OriginTokenType;
  balanceCurrency?: number;
};

export type SupportedNativeTokenWithProtocol = SupportedNativeTokenType & {
  idProtocol: string;
  active?: boolean;
  balance?: number;
  originTokenType?: OriginTokenType;
  balanceCurrency?: number;
};
export enum OriginTokenType {
  BE = "BE",
  LOCAL = "LOCAL",
}
export type SupportTokenDataType = (
  | SupportedTokenItemWithProtocol
  | SupportedNativeTokenWithProtocol
)[];

export type TokenType =
  | SupportedTokenItemWithProtocol
  | SupportedNativeTokenWithProtocol;
export type UpdateBalanceForTokenType = {
  walletAddress: string;
  data: TokenType;
};
export type GetCurrentWalletAndProtocolType = {
  currentWallet: AddressListItemType;
  currentProtocol: ProtocolDataWithSupportedTokensFormBEType;
};
export type UpdateTokenBalances = {
  walletAddress: string;
  tokens: TokensObject;
  protocolData: ProtocolDataWithSupportedTokensFormBEType;
};

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
  [key in any]?: string | number;
};

export type BalanceItem = {
  balance: string;
  price: JettonBalancePriceType;
  wallet_address: JettonBalanceWalletAddress;
  jetton: RiskType;
};
