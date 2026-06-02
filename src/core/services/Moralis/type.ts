import { UnAddedNFTListType } from 'src/core/redux/slice/NFT/NFTImport.type';

export type Transfer = {
    log_index: number;
    value: string;
    contract_type: string;
    transaction_type: 'Single' | 'Batch';
    token_address: string;
    token_id: string;
    from_address_entity: string | null;
    from_address_entity_logo: string | null;
    from_address: string;
    from_address_label: string | null;
    to_address_entity: string | null;
    to_address_entity_logo: string | null;
    to_address: string;
    to_address_label: string | null;
    amount?: string;
    operator?: string | null;
    possible_spam: boolean;
    verified_collection: boolean;
    direction: 'receive' | 'send';
    security_score?: number | null;
    value_formatted?: string;
    address: string | null;
};

export type ERC20Transfer = Omit<Transfer, 'amount' | 'contract_type'> & {
    token_name: string;
    token_symbol: string;
    token_logo: string | null;
    token_decimals: string;
    verified_contract: boolean;
};

export type Transaction = {
    hash: string;
    nonce: string;
    transaction_index: string;
    from_address: string;
    from_address_entity: string | null;
    from_address_entity_logo: string | null;
    from_address_label: string | null;
    to_address: string;
    to_address_entity: string | null;
    to_address_entity_logo: string | null;
    to_address_label: string | null;
    value: string;
    gas: string;
    gas_price: string;
    receipt_cumulative_gas_used: string;
    receipt_gas_used: string;
    receipt_contract_address: string | null;
    receipt_status: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
    transaction_fee: string;
    method_label: string | null;
    nft_transfers: Transfer[];
    erc20_transfers: ERC20Transfer[];
    native_transfers: Transfer[];
    summary: string;
    possible_spam: boolean;
    category:
        | 'airdrop'
        | 'token receive'
        | 'contract interaction'
        | 'transfer'
        | 'receive'
        | 'nft receive'
        | 'send'
        | 'nft send'
        | 'mint'
        | 'approve'
        | 'contract interaction';
    input?: string | null;
    receipt_root?: string | null;
    // transfer_index: number[];
    internal_transactions: InternalTransaction[];
};

export enum MethodLabel {
    send = 'Send',
    receive = 'Receive',
    airdrop = 'airdrop',
    tokenReceive = 'Token Receive',
    contractInteraction = 'Contract Interaction',
    nftReceive = 'NFT Receive',
    nftSend = 'NFT Send',
    approve = 'approve',
    mint = 'mint',
}
type KeyConditionExpression = {
    walletAddress: { eq: string };
    timestamp_blockNumber_txIndex: { between: string[] };
};

export type MoralisCommonly<T> = {
    cursor: string | null;
    page_size: number;
    limit: string;
    result: T;
};
export type APIResponseMoralis = MoralisCommonly<Transaction[]> & {
    pageNumber: number;
    keyConditionExpression: KeyConditionExpression;
    order: 'ascending' | 'descending';
};

export type APIResponseMoralisCollections = MoralisCommonly<
    UnAddedNFTListType[]
> & {
    pageNumber: number;
    keyConditionExpression: KeyConditionExpression;
    order: 'ascending' | 'descending';
};

export type ErrorMessage = {
    message: string;
};

export type DetailToken = {
    address: string;
    address_label: string;
    name: string;
    symbol: string;
    decimals: string;
    logo: string;
    logo_hash: string;
    thumbnail: string;
    total_supply: string;
    total_supply_formatted: string;
    fully_diluted_valuation: string;
    block_number: string;
    validated: string;
    created_at: string;
    possible_spam: string;
    verified_contract: string;
    categories: string[];
    links: Links;
};

export type DetailTokenResponse = DetailToken[];

interface Links {
    discord: string;
    medium: string;
    reddit: string;
    telegram: string;
    twitter: string;
    website: string;
    github: string;
    bitbucket: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
}

export enum ChainMoralis {
    eth = 'eth',
    polygon = 'polygon',
    bsc = 'bsc',
}
export type GetHistoryMoralisParamType = {
    chain?: ChainMoralis;
    from_block?: number;
    to_block?: number;
    from_date?: Date | string;
    to_date?: Date | string;
    include_internal_transactions?: boolean;
    nft_metadata?: boolean;
    cursor?: string;
    order?: 'ASC' | 'DESC';
    limit?: number;
    include?: 'internal_transactions';
    normalizeMetadata?: boolean;
    media_items?: boolean;
};

export type GetNFTDetailByWalletParamsType = {
    chain: string;
    token_address: string;
};

export type GetCollectionsMoralisParamType = {
    chain?: ChainMoralis;
    address: string;
    limit?: number;
    cursor?: string;
    exclude_spam?: boolean;
    token_counts?: boolean;
};

export type NFTsDetailByCollectionsMoralisParamType = {
    chain: ChainMoralis;
    address: string;
    token_addresses?: string[];
    cursor?: string;
    limit?: number;
    range?: number;
    normalizeMetadata?: boolean;
    media_items?: boolean;
};

export type GetWalletHistoryMoralisParamType = {
    walletAddress: string;
    data: GetHistoryMoralisParamType;
};
export type TransactionSectionType = {
    title: string;
    data: Transaction[];
};
export type InternalTransaction = {
    transaction_hash: string;
    block_number: string;
    block_hash: string;
    type: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gas_used: string;
    input: string;
    output: string;
};
export type TokenBalance = {
    token_address: string;
    symbol: string;
    name: string;
    logo: string;
    thumbnail: string;
    decimals: string;
    balance: string;
    possible_spam: string;
    verified_contract: boolean;
    balance_formatted: string;
    usd_price: number;
    usd_price_24hr_percent_change: number;
    usd_price_24hr_usd_change: number;
    usd_value: number;
    usd_value_24hr_usd_change: number;
    native_token: boolean;
    portfolio_percentage: number;
};

export type ResponseGetTokenBalances = MoralisCommonly<TokenBalance[]>;

export interface GetBalanceTokensParams {
    cursor?: string | null;
    tokenAddresses?: string[];
    limit: number;
    chain: ChainMoralis;
}

export type TokensGetPrice = {
    token_address: string;
};

export type GetPriceTokenParams = {
    tokenAddresses: TokensGetPrice[];
    chain: ChainMoralis;
};
export type GetPriceTokenResponse = {
    tokenName: string;
    tokenSymbol: string;
    tokenLogo: string;
    tokenDecimals: string;
    usdPrice: number;
    usdPriceFormatted: string;
};
