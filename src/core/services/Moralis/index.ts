import EnvConfig from 'src/core/constants/EnvConfig';
import { sendGet, sendPost } from 'src/core/network/requests';
import { CollectionDetailMoralisResponse } from 'src/core/redux/slice/NFT/NFTImport.type';
import { pushErrorEventToAnalytics } from '../FirebaseAnalytics';
import { ThirdPartyService } from '../FirebaseAnalytics/type';
import {
    APIResponseMoralis,
    APIResponseMoralisCollections,
    DetailTokenResponse,
    ErrorMessage,
    GetBalanceTokensParams,
    GetHistoryMoralisParamType,
    GetNFTDetailByWalletParamsType,
    GetPriceTokenParams,
    GetPriceTokenResponse,
    ResponseGetTokenBalances,
} from './type';

class MoralisService {
    private async handleError<T>(result: T): Promise<void> {
        const { status, data } = result as unknown as {
            status: number;
            data: ErrorMessage | any;
        };
        if (status !== 200 || (data && 'message' in data)) {
            const error = data as ErrorMessage;
            pushErrorEventToAnalytics({
                error: error.message,
                thirdPartyName: ThirdPartyService.Moralis,
            });
        }
    }

    async getTransactionsHistory(
        walletAddress: string,
        params: GetHistoryMoralisParamType,
    ) {
        const result = await sendGet<APIResponseMoralis | ErrorMessage>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/wallets/${walletAddress}/history`,
            params,
            apiKey: EnvConfig.MORALIS_API_KEY,
        });

        await this.handleError(result);
        return result;
    }

    async getTransactionsCoin(
        walletAddress: string,
        params: GetHistoryMoralisParamType,
    ) {
        return await sendGet<APIResponseMoralis | ErrorMessage>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/${walletAddress}`,
            params,
            apiKey: EnvConfig.MORALIS_API_KEY,
        });
    }

    async getNFTCollectionsByWallet(
        walletAddress: string,
        params: GetHistoryMoralisParamType,
    ) {
        const result = await sendGet<APIResponseMoralisCollections>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/${walletAddress}/nft/collections`,
            params,
            apiKey: EnvConfig.MORALIS_API_KEY,
        });

        await this.handleError(result);
        return result;
    }

    async getTokenDetailByWallet(params: GetNFTDetailByWalletParamsType) {
        const result = await sendGet<DetailTokenResponse>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/erc20/metadata`,
            params: {
                addresses: [params.token_address],
                chain: params.chain,
            },
            apiKey: EnvConfig.MORALIS_API_KEY,
        });

        await this.handleError(result);
        return result.data;
    }

    async getDetailNFTsByCollection(
        walletAddress: string,
        params: GetHistoryMoralisParamType,
    ) {
        const result = await sendGet<CollectionDetailMoralisResponse>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/${walletAddress}/nft`,
            params,
            apiKey: EnvConfig.MORALIS_API_KEY,
        });

        await this.handleError(result);
        return result;
    }

    async getBalanceTokens(
        walletAddress: string,
        { chain, cursor = '', limit, tokenAddresses }: GetBalanceTokensParams,
    ) {
        const paramsConverted = new URLSearchParams({
            chain: chain,
            cursor: cursor ?? '',
            limit: limit.toString(),
        });

        //  convert addresses
        if (tokenAddresses) {
            tokenAddresses.forEach((contractAddress, index) =>
                paramsConverted.append(
                    `token_addresses[${index}]`,
                    contractAddress,
                ),
            );
        }
        const result = await sendGet<ResponseGetTokenBalances>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/wallets/${walletAddress}/tokens?${paramsConverted.toString()}`,
            apiKey: EnvConfig.MORALIS_API_KEY,
        });

        await this.handleError(result);
        return result;
    }
    async getPriceToken({ chain, tokenAddresses }: GetPriceTokenParams) {
        const result = await sendPost<GetPriceTokenResponse[]>({
            customBaseUrl: `${EnvConfig.MORALIS_URL}/erc20/prices?chain=${chain}`,
            apiKey: EnvConfig.MORALIS_API_KEY,
            body: {
                tokens: tokenAddresses,
            },
        });

        await this.handleError(result);
        return result;
    }
}

export default MoralisService;
