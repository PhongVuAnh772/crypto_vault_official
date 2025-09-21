import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import Web3Service from 'src/core/services/Web3';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { getRequestEvent, setModalConnect } from '../slice/walletConnect.slice';

const useSessionSign = () => {
    const currentProtocol = useProtocolSelected();
    const initWeb3 = () => {
        const urpUrl = currentProtocol?.rpcUrl ?? '';
        return new Web3Service({
            urpUrl,
        });
    };
    const web3 = initWeb3();
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const requestEvent = useAppSelector(getRequestEvent);
    const insets = useAppSafeAreaInsets();
    const { topic, params, id, verifyContext } = requestEvent!;
    const { request } = params;
    const [requirePinCode, setRequirePinCode] = useState(false);
    const bottomSheetSignRef = useRef<BottomSheetModal>(null);
    const wallet = useCurrentWallet();
    const [visibleLoading, setVisibleLoading] = useState(false);
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);
    const onShowModalSign = () => bottomSheetSignRef.current?.present();
    const onCloseModalSign = () => bottomSheetSignRef.current?.close();

    const closeRequirePinCode = () => {
        setRequirePinCode(false);
        onReject();
    };
    const openRequirePinCode = () => {
        setRequirePinCode(true);
        setIsEnableDismissOnClose(false);
        onCloseModalSign();
    };
    const closeModalConnect = () => {
        dispatch(setModalConnect(false));
        onCloseModalSign();
    };
    const onApprove = useCallback(
        async (pinCode: string) => {
            if (requestEvent) {
                try {
                    setVisibleLoading(true);
                    setRequirePinCode(false);
                    const signedMessage = await web3.signMessage(
                        request.params[0],
                        pinCode,
                        wallet?.path!,
                        currentProtocol?.slip0044!,
                    );
                    const response = {
                        id,
                        result: signedMessage,
                        jsonrpc: '2.0',
                    };
                    await walletKit.respondSessionRequest({
                        topic,
                        response,
                    });
                } catch (e) {
                    console.log((e as Error).message, 'error');
                    return;
                }
                setVisibleLoading(false);
                closeModalConnect();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [requestEvent, topic],
    );
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestEvent, topic]);
    useEffect(() => {
        onShowModalSign();
    }, []);

    return {
        theme,
        insets,
        verifyContext,
        request,
        bottomSheetSignRef,
        isEnableDismissOnClose,
        visibleLoading,
        wallet,
        requirePinCode,
        closeRequirePinCode,
        openRequirePinCode,
        onApprove,
        onReject,
    };
};

export default useSessionSign;
