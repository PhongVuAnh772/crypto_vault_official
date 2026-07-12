import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';

import { useCallback, useEffect, useRef, useState } from 'react';
import AppToastType from 'src/core/enum/AppToastType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import { getProtocolDataLists } from 'src/core/redux/slice/account.slice';
import Utils from 'src/core/utils/commonUtils';
import Web3Service from 'src/core/services/Web3';
import { rejectTransaction } from 'src/core/utils/walletConnectUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { getRequestEvent, setModalConnect } from '../slice/walletConnect.slice';

const TESTNET_CHAIN_IDS = new Set([5, 97, 80001, 11155111, 421614, 84532, 43113]);
const MAINNET_CHAIN_IDS = new Set([1, 56, 137, 10, 42161, 8453, 43114]);

const detectChainIsTestnet = (walletConnectChain?: string): boolean | undefined => {
    if (!walletConnectChain) return undefined;
    const idPart = walletConnectChain.includes(':')
        ? walletConnectChain.split(':')[1]
        : walletConnectChain;
    const chainId = Number(idPart);
    if (Number.isNaN(chainId)) return undefined;
    if (TESTNET_CHAIN_IDS.has(chainId)) return true;
    if (MAINNET_CHAIN_IDS.has(chainId)) return false;
    return undefined;
};

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
    const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
    const isTestnet = useAppSelector(getIsTestnet);
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
    const protocolRequire = protocolDataLists.find(
        item => item.walletConnectSupportedChain === params.chainId,
    );
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
                    await rejectTransaction(id, topic);
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
        const chainIsTestnet = detectChainIsTestnet(params.chainId);
        const isWrongNetworkByChainId =
            chainIsTestnet !== undefined && chainIsTestnet !== !!isTestnet;
        const isWrongNetworkByProtocol =
            protocolRequire?.isTestnet !== undefined &&
            !!protocolRequire.isTestnet !== !!isTestnet;
        if (!protocolRequire || isWrongNetworkByChainId || isWrongNetworkByProtocol) {
            Utils.showToast({
                type: AppToastType.error,
                msg: !protocolRequire
                    ? 'Unsupported WalletConnect chain'
                    : 'WalletConnect request is not in current Testnet/Mainnet mode',
            });
            rejectTransaction(id, topic);
            closeModalConnect();
            return;
        }
        onShowModalSign();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
