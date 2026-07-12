import { SupportedTokenItemWithProtocol } from 'src/core/redux/slice/customToken/addCustomToken.type';

export type DetailJettonByAddressParam = {
    address: string;
};

export type DetailJettonByAddressResponse = {
    data: DetailJettonByAddressData;
    error: null | string;
    isSuccess: boolean;
};

export type DetailJettonByAddressData = {
    mintable: boolean;
    total_supply: string;
    admin: Admin;
    metadata: MetadataTonToken;
    preview: string;
    verification: string;
    holders_count: number;
    score: number;
};

export type AddTokenParamsType = {
    id: string;
    token: SupportedTokenItemWithProtocol;
};

export interface MetadataTonToken {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    image: string;
    description: string;
    social: string[][];
    websites: string[][];
    catalogs: string[][];
    custom_payload_api_uri: string;
}

interface Admin {
    address: string;
    name: string;
    is_scam: boolean;
    icon: string;
    is_wallet: boolean;
}
export interface RawTimeResponse {
    data: DataRawTime;
    error: null | string;
    isSuccess: boolean;
}
export interface DataRawTime {
    time: number;
}
