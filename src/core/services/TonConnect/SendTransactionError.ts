import {
    SEND_TRANSACTION_ERROR_CODES,
    SendTransactionRpcResponseError,
} from '@tonconnect/protocol';
import { TonConnectKey } from 'src/features/tonConnect/enum/TonConnectKey';

export class SendTransactionError implements SendTransactionRpcResponseError {
    id: SendTransactionRpcResponseError[TonConnectKey.id];
    error: SendTransactionRpcResponseError[TonConnectKey.error];

    constructor(
        requestId: string,
        code: SEND_TRANSACTION_ERROR_CODES,
        message: string,
        data?: any,
    ) {
        this.id = requestId;
        this.error = {
            code,
            message,
            data,
        };
    }
}
