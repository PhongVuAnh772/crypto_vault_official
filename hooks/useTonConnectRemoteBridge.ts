import { Address } from "@ton/core";
import {
  AppRequest,
  Base64,
  hexToByteArray,
  RpcMethod,
  SEND_TRANSACTION_ERROR_CODES,
  SessionCrypto,
  TonAddressItemReply,
} from "@tonconnect/protocol";
import { useContext, useEffect, useRef } from "react";
import EventSource, {
  EventSourceListener,
  MessageEvent,
} from "react-native-sse";
import EnvConfig from "src/core/constants/EnvConfig";
import tonConnectConstants from "src/core/constants/TonConnect";
import { TonConnectKey } from "src/core/enum/TonConnectKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  getAllAccount,
  getProtocolDataLists,
} from "src/core/redux/slices/app.slice";
import {
  getActiveRequest,
  getAppConnection,
  removeRemoteConnection,
  setMessageSSE,
  setModalConnect,
  setType,
} from "src/core/redux/slices/tonConnect.slice";
import TonServices from "src/core/services/TonService";
import { AppContext } from "src/providers/SessionCryptoProvider";
import {
  filteredConnection,
  findConnectedAppByClientSessionId,
  getAllAddressTon,
  getLastEventId,
  setLastEventId,
} from "src/utils/tonConnectUtils";
import {
  IConnectedAppConnection,
  TonConnectType,
  WithWalletIdentifier,
} from "type/TonConnect";

export const getAllConnections = (
  state: TonConnectType,
  isTestNet: boolean,
  address?: string[]
) => {
  const allConnections: WithWalletIdentifier<IConnectedAppConnection>[] = [];

  if (address) {
    for (const addr of address) {
      const walletAddress = Address.parse(addr).toRawString();
      const apps =
        state.connectedApps[
          isTestNet ? TonConnectKey.testnet : TonConnectKey.mainnet
        ]?.[walletAddress] ?? {};

      const connections = Object.values(apps).flatMap((app) =>
        app.connections.map((connection) => ({
          ...connection,
          walletIdentifier: "",
        }))
      );

      allConnections.push(...connections);
    }
  }

  return allConnections;
};

export const useTonConnectRemoteBridge = () => {
  const tonService = new TonServices();
  const isTestNet = EnvConfig.ENV === "development";
  const getAllConnect = useAppSelector(getAppConnection);
  const activeRequest = useAppSelector(getActiveRequest);

  const dispatch = useAppDispatch();
  const lists = useAppSelector(getProtocolDataLists);
  const allAccount = useAppSelector(getAllAccount);
  const initialConnections = getAllConnections(
    getAllConnect,
    isTestNet,
    getAllAddressTon(lists, allAccount)
  );

  const eventSource = useRef<EventSource | null>(null);
  const context = useContext(AppContext);

  const { setSessionCrypto } = context;

  const open = async (
    connections: WithWalletIdentifier<IConnectedAppConnection>[]
  ) => {
    close();
    const filteredConnections = filteredConnection(connections);
    if (filteredConnections.length === 0) {
      return;
    }
    const walletSessionIds = filteredConnections
      .map((item) => new SessionCrypto(item.sessionKeyPair).sessionId)
      .join(",");

    let url = `${tonConnectConstants.bridgeUrl}/events?client_id=${walletSessionIds}`;

    const lastEventId = await getLastEventId();

    if (lastEventId) {
      url += `&last_event_id=${lastEventId}`;
    }

    console.log("sse connect", url);

    const newEventSource = new EventSource(url);

    newEventSource.addEventListener(
      "message",
      handleMessage as EventSourceListener
    );

    newEventSource.addEventListener("open", () => {
      console.log("sse connect: opened");
    });

    newEventSource.addEventListener("error", (event) => {
      console.log("sse connect: error", event);
    });

    eventSource.current = newEventSource;
  };

  const close = () => {
    if (eventSource.current) {
      eventSource.current.removeAllEventListeners();
      eventSource.current.close();
      eventSource.current = null;
      console.log("sse close");
    }
  };

  const handleMessage = async (event: MessageEvent) => {
    try {
      if (event.lastEventId) {
        await setLastEventId(event.lastEventId);
      }

      const { from, message } = JSON.parse(event.data!);
      const connections = filteredConnection(initialConnections);

      const connection = connections.find(
        (item) => item.clientSessionId === from
      );
      const replyItem = connection?.replyItems[0] as TonAddressItemReply;

      if (!connection) {
        console.log(`connection with clientId "${from}" not found!`);
        return;
      }

      const sessionCrypto = new SessionCrypto(connection.sessionKeyPair);

      const request: AppRequest<RpcMethod> = JSON.parse(
        sessionCrypto.decrypt(
          Base64.decode(message).toUint8Array(),
          hexToByteArray(from)
        )
      );
      setSessionCrypto(sessionCrypto);

      if (activeRequest) {
        await tonService.sendConnectDapp(
          {
            error: {
              code: SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR,
              message: "User has already opened the previous request",
            },
            id: request.id,
          },
          sessionCrypto,
          from
        );
      } else if (request.method === TonConnectKey.disconnect) {
        const { connectedApp } = findConnectedAppByClientSessionId(
          from,
          getAllConnect,
          replyItem.address,
          isTestNet
        );

        dispatch(
          removeRemoteConnection({
            chainName: isTestNet
              ? TonConnectKey.testnet
              : TonConnectKey.mainnet,
            address: replyItem.address,
            url: connectedApp?.url ?? "",
            clientSessionId: from,
          })
        );
      } else {
        dispatch(
          setMessageSSE({
            from,
            activeRequest: true,
            request,
          })
        );
        dispatch(setType(TonConnectKey.eventTransaction));
        dispatch(setModalConnect(true));
      }
    } catch (e) {
      console.log("handleMessage error : " + e);
    }
  };

  useEffect(() => {
    open(initialConnections);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllConnect.connectedApps, allAccount]);
};
