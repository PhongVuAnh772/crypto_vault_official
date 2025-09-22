export type ErrorResponseChangeNow = {
    message: string;
    error: number;
};

export type CurrencyChangeNow = {
    ticker: string;
    name: string;
    image: string;
    hasExternalId: boolean;
    isExtraIdSupported: boolean;
    isFiat: boolean;
    featured: boolean;
    isStable: boolean;
    supportsFixedRate: boolean;
    network: string;
    tokenContract: string | null;
    buy: boolean;
    sell: boolean;
    legacyTicker: string;
};

export type GetListOfAvailableCurrenciesResponse = {
    currencies: CurrencyChangeNow[];
};

export type ExchangeInfo = {
    fromCurrency: string;
    fromNetwork: string;
    toCurrency: string;
    toNetwork: string;
};

export type MinimalExchangeAmountResponse = ExchangeInfo & {
    flow: string;
    minAmount: number;
};

export type EstimateExchangeAmountResponse = ExchangeInfo & {
    flow: string;
    type: string;
    rateId: string;
    validUntil: string;
    transactionSpeedForecast: string | null;
    warningMessage: string | null;
    depositFee: number;
    withdrawalFee: number;
    userId: number | null;
    fromAmount: number;
    toAmount: number;
};
export type EstimateExchangeAmountRequest = ExchangeInfo & {
    fromAmount: string;
};
export type CreateTransactionRequest = EstimateExchangeAmountRequest & {
    address: string;
    userId: string;
};
export type CreateTransactionResponse = {
    fromAmount: number;
    toAmount: number;
    flow: string;
    type: string;
    payinAddress: string;
    payoutAddress: string;
    fromCurrency: string;
    toCurrency: string;
    id: string;
    directedAmount: number;
    fromNetwork: string;
    toNetwork: string;
};

export enum SwapStatus {
    WAITING = 'waiting',
    FINISHED = 'finished',
    CONFIRMING = 'confirming',
    EXCHANGING = 'exchanging',
    SENDING = 'sending',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    VERIFYING = 'verifying',
}

export type SwapHistory = {
    createdAt: string;
    exchangerCreatedAt: string;
    updatedAt: string;
    exchangerUpdatedAt: string;
    exchangeId: string;
    requestId: string;
    status: SwapStatus;
    validUntil: string | null;
    flow: string;
    refund: {
        currency: string;
        address: string | null;
        extraId: string | null;
        hash: string | null;
    };
    depositFee: {
        currency: string;
    };
    withdrawalFee: {
        currency: string;
        amount: number | null;
    };
    estimatedDepositFee: {
        currency: string;
        amount: number | null;
    };
    partnerInfo: {
        commission: {
            currency: string;
            amount: number | null;
            percent: number;
            marketTicker: string;
            network: string;
            tokenContract: string | null;
        };
        userId: string;
        payload: string | null;
    };
    payin: {
        currency: string;
        address: string;
        extraId: string | null;
        amount: number | null;
        expectedAmount: number;
        hash: string | null;
        marketTicker: string;
        network: string;
        tokenContract: string | null;
    };
    payout: {
        currency: string;
        address: string;
        extraId: string | null;
        amount: number | null;
        expectedAmount: number;
        hash: string | null;
        sendingHash: string | null;
        marketTicker: string;
        network: string;
        tokenContract: string | null;
    };
};

export type SwapHistoryParams = {
    userId: string;
    offset?: number;
    limit?: number;
};

export type SwapHistoryResponse = {
    count: number;
    exchanges: SwapHistory[];
};

export enum SortType {
    ascending = 'ASC',
    descending = 'DESC',
}

export type AvailablePairsResponse = ExchangeInfo & {
    flow: {
        standard: boolean;
    };
};
