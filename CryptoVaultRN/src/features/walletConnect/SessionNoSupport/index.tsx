import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import Utils from 'src/core/utils/commonUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { getRequestEvent, setModalConnect } from '../slice/walletConnect.slice';
const SessionNoSupport = () => {
    const requestEvent = useAppSelector(getRequestEvent);
    const dispatch = useAppDispatch();
    const closeModalConnect = () => {
        dispatch(setModalConnect(false));
    };
    const { topic, id } = requestEvent!;
    const onReject = useCallback(async () => {
        if (requestEvent) {
            try {
                const response = {
                    id,
                    jsonrpc: '2.0',
                    error: {
                        code: 5000,
                        message: 'User rejected.',
                    },
                };
                await walletKit.respondSessionRequest({
                    topic,
                    response,
                });
            } catch (e) {
                console.log((e as Error).message, 'error');
            }
            closeModalConnect();
            Utils.showToast({
                type: AppToastType.error,
                msg: 'ledgerify does not support session ',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestEvent, topic]);
    useEffect(() => {
        onReject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <View></View>;
};

export default SessionNoSupport;
