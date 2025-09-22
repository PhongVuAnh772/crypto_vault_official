import { SignClientTypes } from '@walletconnect/types';
export type WalletConnectType = {
    proposal?: SignClientTypes.EventArguments['session_proposal'];
    requestEvent?: SignClientTypes.EventArguments['session_request'];
    showModalConnect: boolean;
    type: string;
};
