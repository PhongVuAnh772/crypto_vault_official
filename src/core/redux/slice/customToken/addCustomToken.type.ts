import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
    SupportedNativeTokenType,
    SupportedTokenItemType,
} from 'src/core/redux/slice/account.type';
import { TokensObject } from 'src/features/home/home.type';

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

export type UpdateNativeBalancePayload = {
  walletAddress: string;
  protocolData: {
    _id: string;
    slip0044: number;
  };
  balance: string; // raw bigint string
  usd_price: number;
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
    BE = 'BE',
    LOCAL = 'LOCAL',
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
