import { createMachine } from "xstate";

export const transactionStateMachine = createMachine({
  id: "dexTransaction",
  initial: "idle",
  states: {
    idle: { on: { START: "quoting" } },
    quoting: { on: { QUOTE_SUCCESS: "simulating", QUOTE_FAILURE: "failedRecoverable" } },
    simulating: { on: { SIM_SUCCESS: "awaitingSignature", SIM_FAILURE: "failedTerminal" } },
    awaitingSignature: { on: { SIGNED: "broadcasting", REJECTED: "failedRecoverable" } },
    broadcasting: { on: { SUBMITTED: "confirming", BROADCAST_FAILURE: "failedRecoverable" } },
    confirming: { on: { CONFIRMED: "finalized", REORGED: "failedRecoverable", DROPPED: "failedRecoverable" } },
    finalized: { type: "final" },
    failedRecoverable: { on: { RETRY: "quoting", RESET: "idle" } },
    failedTerminal: { on: { RESET: "idle" } },
  },
});

