import { SignClientTypes } from "@walletconnect/types";
import { useCallback, useEffect } from "react";
import { WalletConnectKey } from "src/core/enum/WalletConnectKey";
import { useAppDispatch } from "src/core/redux/hooks";
import {
  setModalConnect,
  setProposal,
  setRequestEvent,
  setType,
} from "src/core/redux/slices/walletConnect.slice";
import { walletKit } from "src/utils/walletKitUtils";

export default function useWalletKitEventsManager(initialized: boolean) {
  const dispatch = useAppDispatch();
  const onSessionProposal = useCallback(
    (
      proposal: SignClientTypes.EventArguments[WalletConnectKey.sessionProposal]
    ) => {
      dispatch(setType(WalletConnectKey.sessionProposal));
      dispatch(setProposal(proposal));
      dispatch(setModalConnect(true));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onSessionRequest = useCallback(
    async (
      requestEvent: SignClientTypes.EventArguments[WalletConnectKey.sessionRequest]
    ) => {
      console.log("requestEvent", requestEvent);

      dispatch(setRequestEvent(requestEvent));
      dispatch(setType(requestEvent.params.request.method));
      dispatch(setModalConnect(true));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (initialized) {
      walletKit.on(WalletConnectKey.sessionProposal, onSessionProposal);
      walletKit.on(WalletConnectKey.sessionRequest, onSessionRequest);
    }
  }, [initialized, onSessionProposal, onSessionRequest]);
}
