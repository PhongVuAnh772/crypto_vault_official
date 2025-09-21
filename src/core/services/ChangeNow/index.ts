import EnvConfig from 'src/core/constants/EnvConfig';
import { sendGet, sendPost } from 'src/core/network/requests';
import {
    AvailablePairsResponse,
    CreateTransactionRequest,
    CreateTransactionResponse,
    ErrorResponseChangeNow,
    EstimateExchangeAmountRequest,
    EstimateExchangeAmountResponse,
    ExchangeInfo,
    GetListOfAvailableCurrenciesResponse,
    MinimalExchangeAmountResponse,
    SwapHistoryParams,
    SwapHistoryResponse,
} from './types';

class ChangeNowError extends Error {
    constructor(
        message: string,
        public errorCode: number,
    ) {
        super(message);
        this.name = 'ChangeNowError';
    }
}

class ChangeNowService {
    private static readonly ENDPOINTS = {
        CURRENCIES: '/exchange/currencies',
        MIN_AMOUNT: '/exchange/min-amount',
        ESTIMATE: '/exchange/estimated-amount',
        EXCHANGE: '/exchange',
        SWAP_HISTORY: '/exchanges',
        AVAILABLE_PAIRS: '/exchange/available-pairs',
    } as const;

    private async _get<T>(
        endPoint: string,
        params?: Record<string, unknown>,
        key?: string,
    ): Promise<T> {
        const result = await sendGet<T | ErrorResponseChangeNow>({
            endPoint,
            customBaseUrl: EnvConfig.CHANGE_NOW_BASE_URL,
            customHeaders: {
                'x-changenow-api-key': key || EnvConfig.CHANGE_NOW_API_KEY,
            },
            params,
        });

        if (!result.isSuccess || result.status !== 200) {
            const errorData = result.data as ErrorResponseChangeNow;
            throw new ChangeNowError(errorData.message, errorData.error);
        }

        return result.data as T;
    }

    private async _post<T>(endPoint: string, body: any): Promise<T> {
        const result = await sendPost<T | ErrorResponseChangeNow>({
            endPoint,
            customBaseUrl: EnvConfig.CHANGE_NOW_BASE_URL,
            customHeaders: {
                'x-changenow-api-key': EnvConfig.CHANGE_NOW_API_KEY,
            },
            body,
        });
        if (!result.isSuccess || result.status !== 200) {
            const errorData = result.data as ErrorResponseChangeNow;
            throw new ChangeNowError(errorData.message, errorData.error);
        }

        return result.data as T;
    }
    async listOfAvailableCurrencies(): Promise<GetListOfAvailableCurrenciesResponse> {
        return this._get(ChangeNowService.ENDPOINTS.CURRENCIES, {
            flow: 'standard',
        });
    }

    async minimalExchangeAmount(
        params: ExchangeInfo,
    ): Promise<MinimalExchangeAmountResponse> {
        return this._get(ChangeNowService.ENDPOINTS.MIN_AMOUNT, params);
    }

    async estimateExchangeAmount(
        params: EstimateExchangeAmountRequest,
    ): Promise<EstimateExchangeAmountResponse> {
        return this._get(ChangeNowService.ENDPOINTS.ESTIMATE, params);
    }
    async createTransaction(
        body: CreateTransactionRequest,
    ): Promise<CreateTransactionResponse> {
        return this._post(ChangeNowService.ENDPOINTS.EXCHANGE, body);
    }
    async getSwapHistory(
        params: SwapHistoryParams,
    ): Promise<SwapHistoryResponse> {
        return this._get(
            ChangeNowService.ENDPOINTS.SWAP_HISTORY,
            params,
            EnvConfig.CHANGE_NOW_PARTNER_KEY,
        );
    }
    async availablePair(
        params: ExchangeInfo,
    ): Promise<AvailablePairsResponse[]> {
        return this._get(ChangeNowService.ENDPOINTS.AVAILABLE_PAIRS, params);
    }
}

export default ChangeNowService;
export { ChangeNowError };
