import { ConnectEventError as IConnectEventError } from '@tonconnect/protocol';
import { TonConnectKey } from 'src/features/tonConnect/enum/TonConnectKey';
import { TCEventID } from './EventID';

export class ConnectEventError implements IConnectEventError {
    event: IConnectEventError[TonConnectKey.event];
    payload: IConnectEventError[TonConnectKey.payload];
    id: IConnectEventError[TonConnectKey.id];

    constructor(code: number, message: string) {
        this.event = TonConnectKey.eventErrConnect;
        this.payload = {
            code,
            message,
        };
        this.id = TCEventID.getId();
    }
}
