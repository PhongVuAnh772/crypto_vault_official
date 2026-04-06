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
    if (status !== 200 || (data && "message" in data)) {
      const error = data as ErrorMessage;
      pushErrorEventToAnalytics({
        error: error.message,
        thirdPartyName: ThirdPartyService.Moralis,
      });
    }
  }

  async getTransactionsHistory(
    walletAddress: string,
    params: GetHistoryMoralisParamType
  ) {
    const result = await sendGet<APIResponseMoralis | ErrorMessage>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/history`,
      params,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);
    return result;
  }

  async getTransactionsCoin(
    walletAddress: string,
    params: GetHistoryMoralisParamType
  ) {
    return await sendGet<APIResponseMoralis | ErrorMessage>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/${walletAddress}`,
      params,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });
  }

  async getNFTCollectionsByWallet(
    walletAddress: string,
    params: GetHistoryMoralisParamType
  ) {
    const result = await sendGet<APIResponseMoralisCollections>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft/collections`,
      params,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);
    return result;
  }

  async getTokenDetailByWallet(params: GetNFTDetailByWalletParamsType) {
    const result = await sendGet<DetailTokenResponse>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/erc20/metadata`,
      params: {
        addresses: [params.token_address],
        chain: params.chain,
      },
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);
    return result.data;
  }

  async getDetailNFTsByCollection(
    walletAddress: string,
    params: GetHistoryMoralisParamType
  ) {
    const result = await sendGet<CollectionDetailMoralisResponse>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft`,
      params,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);
    return result;
  }

  async getBalanceTokens(
    walletAddress: string,
    { chain, cursor = "", limit, tokenAddresses }: GetBalanceTokensParams
  ) {
    const paramsConverted = new URLSearchParams({
      chain: chain,
      cursor: cursor ?? "",
      limit: limit.toString(),
    });

    //  convert addresses
    if (tokenAddresses) {
      tokenAddresses.forEach((contractAddress, index) =>
        paramsConverted.append(`token_addresses[${index}]`, contractAddress)
      );
    }
    const result = await sendGet<ResponseGetTokenBalances>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?${paramsConverted.toString()}`,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);
    return result;
  }
  async getNativeBalance(walletAddress: string, { chain }: { chain: string }) {
    const result = await sendGet<{ balance: string } | ErrorMessage>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/${walletAddress}/balance`,
      params: { chain },
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
    });

    await this.handleError(result);

    if ("balance" in result.data) {
      console.log("getNativeBalance:", result.data.balance);
    }

    return result;
  }

  async getPriceToken({ chain, tokenAddresses }: GetPriceTokenParams) {
    const result = await sendPost<GetPriceTokenResponse[]>({
      customBaseUrl: `https://deep-index.moralis.io/api/v2.2/erc20/prices?chain=${chain}`,
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEwNmUzMWZiLTcyYTUtNDFlNy1iYzllLTA3NDMyODk0ZmEzMiIsIm9yZ0lkIjoiNDg4OTk1IiwidXNlcklkIjoiNTAzMTE0IiwidHlwZUlkIjoiNDIwYTBkNWItYzZkMS00OGQzLWEyNjEtMmJkYjJmM2RhM2JkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Njc3MTIyOTQsImV4cCI6NDkyMzQ3MjI5NH0.I1yWyiMfyRh5V4EOpvariGjTuQZfrwrwIpfVcqIC1xI",
      body: {
        tokens: tokenAddresses,
      },
    });

    await this.handleError(result);
    return result;
  }
}

export default MoralisService;
