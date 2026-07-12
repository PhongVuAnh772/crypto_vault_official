import { Seqno } from "@ton-api/client";
import { Address } from "@ton/core";
import {
  Base64,
  ConnectEvent,
  DisconnectEvent,
  hexToByteArray,
  RpcMethod,
  SessionCrypto,
  WalletResponse,
} from "@tonconnect/protocol";
import moment from "moment";
import EnvConfig from "src/core/constants/EnvConfig";
import tonConnectConstants from "src/core/constants/TonConnectConstants";
import { IApiResponse } from "src/core/network/apiResponses/IApiResponse";
import { sendGet, sendPost } from "src/core/network/requests";
import { SendGetParamsType } from "src/core/network/requests/sendGet";
import { SendPostParamsType } from "src/core/network/requests/sendPost";
import {
  DataRawTime,
  DetailJettonByAddressData,
  DetailJettonByAddressResponse,
  RawTimeResponse,
} from "src/features/home/addCustomToken/ton/addCustomToken.ton.type";
import { pushErrorEventToAnalytics } from "../FirebaseAnalytics";
import { ThirdPartyService } from "../FirebaseAnalytics/type";
import {
  DetailNFTByAddressUsingAPIType,
  EmulateMessageToWalletResType,
  EmulateMessageToWalletType,
  EventDetail,
  EventDetailProps,
  GetRateTypeParams,
  GetRateTypeResponse,
  GetTonAccountsParamsType,
  GetTonEventsParamsType,
  GetTonTransactionsErrorType,
  ItemsOwnerResponse,
  JettonBalanceDataType,
  Nftitem,
  NftItemResponse,
  NFTItemsOwner,
  SendMessageToBlockchainParamType,
  TonAccountsType,
  TonEventsDataType,
} from "./type";
import { getTonApiBaseUrl } from "src/core/utils/tonNetwork";

// MARK: Ton Services
class TonServices {
  private readonly _handleTonError = <T>(
    result: IApiResponse<GetTonTransactionsErrorType | T>
  ) => {
    if (!result.isSuccess) {
      const error = JSON.stringify(result?.data);
      console.error("====================================");
      console.error("Ton API Error:", error);
      console.error("====================================");
      pushErrorEventToAnalytics({
        error: error,
        thirdPartyName: ThirdPartyService.Ton,
      });
    }
  };

  private readonly _tonGetApi = async <T>(params: SendGetParamsType) => {
    const result = await sendGet<T | GetTonTransactionsErrorType>({
      ...params,
      customBaseUrl: getTonApiBaseUrl(),
      customBearerToken:
        "AHLPTUWXVDR6C7IAAAAMMPI5S5F7NXUEKH6VNHXBRDMHGK5V7KKN73LG3KCULMW5VMMXIXY",
    });
    this._handleTonError(result);

    return result;
  };
  private readonly _tonPostApi = async <T>(params: SendPostParamsType) => {
    const result = await sendPost<T | GetTonTransactionsErrorType>({
      ...params,
      customBaseUrl: getTonApiBaseUrl(),
      customBearerToken:
        "AHLPTUWXVDR6C7IAAAAMMPI5S5F7NXUEKH6VNHXBRDMHGK5V7KKN73LG3KCULMW5VMMXIXY",
    });
    this._handleTonError(result);

    return result;
  };

  // MARK: |- Get Account
  getAccounts = async ({ address }: GetTonAccountsParamsType) => {
    const getAccountsRes = await this._tonGetApi<TonAccountsType>({
      // endPoint: `/v2/accounts/${Address.parse(
      //     '0:1b84c5a8b28c5ea174c98bd4e5c34f4c1233d5bdd25ef63d270ba2baae8d1dd6',
      // ).toString()}`,
      endPoint: `/v2/accounts/${address.toString()}`,
    });

    return getAccountsRes;
  };

  getDetailEventsUsingAPI = async ({ eventId }: EventDetailProps) => {
    const getDetailEventsUsingAPI = await this._tonGetApi<NftItemResponse>({
      endPoint: `/v2/events/${eventId}`,
    });
    return getDetailEventsUsingAPI.data as EventDetail;
  };

  // MARK: |- Get account seqno
  getAccountSeqno = async ({ address }: GetTonAccountsParamsType) => {
    const getAccountSeqnoRes = await this._tonGetApi<Seqno>({
      endPoint: `/v2/wallet/${address}/seqno`,
    });
    return getAccountSeqnoRes;
  };

  // MARK: |- Get Events
  getEvents = async ({ address, limit, beforeLt }: GetTonEventsParamsType) => {
    const getEventsRes = await this._tonGetApi<TonEventsDataType>({
      endPoint: `/v2/accounts/${address}/events?limit=${limit ?? 100}`,
      params: {
        before_lt: beforeLt,
      },
    });
    return getEventsRes?.data;
  };

  // MARK: |- Get Jetton Events
  getJettonEvents = async ({
    address,
    limit,
    beforeLt,
    jettonId,
  }: Omit<GetTonEventsParamsType, "jettonId"> & {
    jettonId: string;
  }) => {
    const getEventsRes = await this._tonGetApi<TonEventsDataType>({
      endPoint: `/v2/accounts/${address}/jettons/${jettonId}/history?limit=${limit ?? 100}`,
      params: {
        before_lt: beforeLt,
      },
    });
    return getEventsRes?.data;
  };

  // MARK: |- Get jetton balance
  getJettons = async ({ address }: GetTonEventsParamsType) => {
    const getJettonRes = await this._tonGetApi<JettonBalanceDataType>({
      // endPoint: `/v2/accounts/0:1b84c5a8b28c5ea174c98bd4e5c34f4c1233d5bdd25ef63d270ba2baae8d1dd6/jettons?currencies=ton,usd`,
      endPoint: `/v2/accounts/${address}/jettons?currencies=ton,usd`,
    });
    return getJettonRes?.data;
  };

  // MARK: |- Get emulate message to wallet
  emulateMessageToWallet = async (body: EmulateMessageToWalletType) => {
    return await this._tonPostApi<EmulateMessageToWalletResType>({
      endPoint: `/v2/wallet/emulate`,
      body,
    });
  };

  // MARK: |- Send message to blockchain
  sendMessageToBlockchain = async (body: SendMessageToBlockchainParamType) => {
    return await this._tonPostApi<string>({
      endPoint: `/v2/blockchain/message`,
      body,
    });
  };
  getNFTItemsInCollectionByOwner = async (
    accountId_Address: string,
    query?: {
      collection?: Address;
      limit?: number;
      offset?: number;
      indirect_ownership?: boolean;
    }
  ): Promise<Nftitem[]> => {
    try {
      const nftItemsInCollectionByOwner =
        await this._tonGetApi<ItemsOwnerResponse>({
          endPoint: `/v2/accounts/${accountId_Address}/nfts`,
          params: query,
        });

      if (
        nftItemsInCollectionByOwner.isSuccess &&
        nftItemsInCollectionByOwner.data &&
        "nft_items" in nftItemsInCollectionByOwner.data &&
        Array.isArray(
          (nftItemsInCollectionByOwner.data as NFTItemsOwner).nft_items
        )
      ) {
        return (nftItemsInCollectionByOwner.data as NFTItemsOwner).nft_items;
      }

      if ("error" in nftItemsInCollectionByOwner) {
        console.error(
          "getNFTItemsInCollectionByOwner error:",
          nftItemsInCollectionByOwner.error
        );
      }
      return [];
    } catch (error) {
      console.error(
        "Unexpected error in getNFTItemsInCollectionByOwner:",
        error
      );
      return [];
    }
  };

  getDetailNFTByAddressUsingAPI = async ({
    address,
  }: DetailNFTByAddressUsingAPIType) => {
    const getDetailNFTByAddressUsingAPI =
      await this._tonGetApi<NftItemResponse>({
        endPoint: `/v2/nfts/${address}`,
      });
    return getDetailNFTByAddressUsingAPI as NftItemResponse;
  };
  getDetailJettonByAddress = async ({
    address,
  }: DetailNFTByAddressUsingAPIType): Promise<DetailJettonByAddressData | null> => {
    try {
      const response = await this._tonGetApi<DetailJettonByAddressResponse>({
        endPoint: `/v2/jettons/${address}`,
      });

      if (!response || !response.data) {
        console.warn("Invalid response or missing metadata:", response);
        return null;
      }
      const resultJettonData = response.data as DetailJettonByAddressData;
      return resultJettonData;
    } catch (error) {
      console.error("Error fetching jetton details:", error);
      return null;
    }
  };
  getRate = async ({ address }: GetRateTypeParams) => {
    const getDetailNFTByAddressUsingAPI =
      await this._tonGetApi<GetRateTypeResponse>({
        endPoint: `/v2/rates?tokens=${address}&currencies=ton`,
      });
    return getDetailNFTByAddressUsingAPI as GetRateTypeResponse;
  };
  sendConnectDapp = async <T extends RpcMethod>(
    response: WalletResponse<T> | ConnectEvent | DisconnectEvent,
    sessionCrypto: SessionCrypto,
    clientSessionId: string,
    ttl?: number
  ): Promise<void> => {
    try {
      const url = `${
        tonConnectConstants.bridgeUrl +
        "/message?client_id=" +
        sessionCrypto.sessionId
      }&to=${clientSessionId}&ttl=${ttl ?? 300}`;
      const encodedResponse = sessionCrypto.encrypt(
        JSON.stringify(response),
        hexToByteArray(clientSessionId)
      );
      await fetch(url, {
        body: Base64.encode(encodedResponse),
        method: "POST",
      });
    } catch (e) {
      console.log("Send to DApp failed : ", e);
    }
  };
  getRawTimeFromLiteserverSafely = async () => {
    try {
      const res = await this._tonGetApi<RawTimeResponse>({
        endPoint: "/v2/liteserver/get_time",
      });
      const dataRawTime = res.data as DataRawTime;
      return dataRawTime.time;
    } catch {
      return moment().unix();
    }
  };
}

export default TonServices;
