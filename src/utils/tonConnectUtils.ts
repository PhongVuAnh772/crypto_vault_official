import AsyncStorage from "@react-native-async-storage/async-storage";
import { Address } from "@ton/core";
import queryParser from "query-string";

import TonUtils from "./tonUtils";
import { TonConnectKey } from "src/core/enum/TonConnectKey";
import Slip0044 from "src/core/enum/Slip0044";
import {
  IConnectedApp,
  IConnectedAppConnection,
  IConnectedAppConnectionRemote,
  MetadataNftType,
  RiskType,
  TonConnectBridgeType,
  TonConnectType,
  TonTransactionAction,
  WithWalletIdentifier,
} from "type/TonConnect";
import {
  AccountType,
  ProtocolDataWithSupportedTokensFormBEType,
} from "src/core/redux/type/account.type";
import tonConnectConstants from "src/core/constants/TonConnect";
import TonEventType from "src/core/enum/TonEventType";
import { TonEventsAction, TonTransfer } from "type/TonService";
import TonServices from "src/core/services/TonService";
import { sha256 } from "@noble/hashes/sha256";
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils";
import queryString from "query-string";
export const getDomainFromUrl = (url?: string) => {
  try {
    if (url) {
      const domain = new URL(url).hostname;
      return domain;
    }
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
};

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const getFixedLastSlashUrl = (url: string) => {
  return url.replace(/\/$/, "");
};
export const generateAppHashFromUrl = (url: string) => {
  const { url: parsedUrl } = queryString.parseUrl(url);
  const fixedUrl = getFixedLastSlashUrl(parsedUrl);
  const urlBytes = utf8ToBytes(fixedUrl);
  const hash = sha256(urlBytes);
  return bytesToHex(hash);
};
export const findConnectedAppByClientSessionId = (
  clientSessionId: string,
  state: TonConnectType,
  address: string,
  isTestNet: boolean
): {
  connectedApp: IConnectedApp | null;
  connection: IConnectedAppConnection | null;
} => {
  address = Address.parse(address).toRawString();
  const connectedAppsList = Object.values(
    state.connectedApps[
      isTestNet ? TonConnectKey.testnet : TonConnectKey.mainnet
    ][address] || {}
  );
  let connection: IConnectedAppConnection | null = null;
  const connectedApp = connectedAppsList.find((app) =>
    app.connections.find((item) => {
      if (
        item.type === TonConnectBridgeType.Remote &&
        item.clientSessionId === clientSessionId
      ) {
        connection = item;
        return true;
      }
      return false;
    })
  );

  return { connectedApp: connectedApp ?? null, connection };
};

export const getConnectedAppByUrl = (
  url: string,
  state: TonConnectType,
  isTestNet: boolean
): { connectedApp: IConnectedApp; walletAddress: string } | null => {
  const networkKey = isTestNet ? TonConnectKey.testnet : TonConnectKey.mainnet;
  const connectedApps = state.connectedApps[networkKey] || {};
  const fixedUrl = getFixedLastSlashUrl(url);

  for (const walletAddress in connectedApps) {
    const apps = Object.values(connectedApps[walletAddress] || {});

    const matchedApp = apps.find(
      (app) =>
        fixedUrl.startsWith(getFixedLastSlashUrl(app.url ?? "")) &&
        app.connections.some(
          (conn) => conn.type === TonConnectBridgeType.Injected
        )
    );

    if (matchedApp) {
      return { connectedApp: matchedApp, walletAddress: walletAddress };
    }
  }

  return null;
};

export const getAllAddressTon = (
  protocolListData?: ProtocolDataWithSupportedTokensFormBEType[],
  accountLists?: AccountType[]
) => {
  if (accountLists) {
    const coinProtocolData = protocolListData?.find(
      (e) => e.slip0044 === Slip0044.Ton
    );
    return accountLists.flatMap((account) =>
      account.protocolData
        .filter((protocol) => protocol._id === coinProtocolData?._id)
        .flatMap((protocol) =>
          protocol.addressList.map((addressObj) => addressObj.address)
        )
    );
  }
};
export const filteredConnection = (
  connections: WithWalletIdentifier<IConnectedAppConnection>[]
) => {
  return connections.filter(
    (item) => item.type === TonConnectBridgeType.Remote
  ) as WithWalletIdentifier<IConnectedAppConnectionRemote>[];
};
export const setLastEventId = async (lastEventId: string) => {
  try {
    await AsyncStorage.setItem(tonConnectConstants.storeKey, lastEventId);
  } catch {}
};
export const getLastEventId = async () => {
  try {
    return await AsyncStorage.getItem(tonConnectConstants.storeKey);
  } catch {
    return null;
  }
};
export const _handleMultipleActionsTonConnect = async ({
  actionsList,
  risk,
}: {
  extra: number;
  actionsList: TonEventsAction[];
  risk: RiskType;
}): Promise<TonTransactionAction[] | undefined> => {
  try {
    const multipleTransactionData: TonTransactionAction[] = [];
    const tonService = new TonServices();
    for (const [index, action] of actionsList.entries()) {
      const dataTransfer: TonTransfer | undefined =
        action.JettonTransfer ||
        action.JettonBurn ||
        action.JettonMint ||
        action.NftItemTransfer ||
        action.TonTransfer ||
        action.SmartContractExec;
      if (dataTransfer) {
        const metadataNft: MetadataNftType = {} as MetadataNftType;
        const riskNftIndex = risk.nfts.findIndex(
          (item) => dataTransfer.nft === item.address
        );
        if (actionsList[index].type === TonEventType.NftItemTransfer) {
          if (riskNftIndex !== -1) {
            metadataNft.name = risk.nfts[riskNftIndex].metadata.name;
            metadataNft.image = risk.nfts[riskNftIndex].metadata.image;
            metadataNft.description =
              risk.nfts[riskNftIndex].metadata.description;
          } else {
            const nftDetails = await tonService.getDetailNFTByAddressUsingAPI({
              address: dataTransfer.nft ?? "",
            });
            metadataNft.name = nftDetails.data.metadata.name;
            metadataNft.image = nftDetails.data.metadata.image;
            metadataNft.description = nftDetails.data.metadata.description;
          }
        }
        let amount = dataTransfer?.amount;
        if (typeof amount === "string") {
          amount = parseFloat(amount);
        }
        const otherAddress = dataTransfer?.contract?.address ?? "";
        const recipientAddress = TonUtils.parseRawAddress(
          (dataTransfer?.recipient?.address ?? otherAddress) || ""
        );
        const multipleTransactionDataItem: TonTransactionAction = {
          type: actionsList[index].type,
          amount: dataTransfer.amount ?? dataTransfer.ton_attached,
          recipientAddress: recipientAddress,
          dataNft: metadataNft,
          dataJetton: {
            symbol: dataTransfer.jetton?.symbol ?? "",
            image: dataTransfer.jetton?.image ?? "",
          },
        };

        multipleTransactionData?.push(multipleTransactionDataItem);
      }
    }

    return multipleTransactionData;
  } catch (error) {
    console.error("Error in _handleMultipleActions", error);
    return undefined;
  }
};
