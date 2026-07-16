import { useMemo } from "react";
import { useMachine } from "@xstate/react";
import { transactionStateMachine } from "../../domain/state-machines/transactionStateMachine";

export const useDexTrade = () => {
  const [state, send] = useMachine(transactionStateMachine);

  const controls = useMemo(
    () => ({
      start: () => send({ type: "START" }),
      retry: () => send({ type: "RETRY" }),
      reset: () => send({ type: "RESET" }),
      onQuoteSuccess: () => send({ type: "QUOTE_SUCCESS" }),
      onQuoteFailure: () => send({ type: "QUOTE_FAILURE" }),
      onSimSuccess: () => send({ type: "SIM_SUCCESS" }),
      onSimFailure: () => send({ type: "SIM_FAILURE" }),
      onSigned: () => send({ type: "SIGNED" }),
      onRejected: () => send({ type: "REJECTED" }),
      onSubmitted: () => send({ type: "SUBMITTED" }),
      onBroadcastFailure: () => send({ type: "BROADCAST_FAILURE" }),
      onConfirmed: () => send({ type: "CONFIRMED" }),
      onDropped: () => send({ type: "DROPPED" }),
      onReorged: () => send({ type: "REORGED" }),
    }),
    [send]
  );

  return {
    state: state.value,
    isFinalized: state.matches("finalized"),
    isLoading:
      state.matches("quoting") ||
      state.matches("simulating") ||
      state.matches("awaitingSignature") ||
      state.matches("broadcasting") ||
      state.matches("confirming"),
    controls,
  };
};

