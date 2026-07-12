import {
    AccountType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';

export type OptionalNamespacesType = {
    key: string[];
    chains: string[][];
    method: string[][];
    event: string[][];
};
export type informationChainType = {
    name: string;
    logo: string;
};
export type ListChainRequireType = {
    listChain: string[];
    protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[];
    currentAccount: AccountType;
};
