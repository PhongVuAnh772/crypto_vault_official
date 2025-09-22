import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { Address } from '@ton/core';
import { AppRequest, ConnectRequest, RpcMethod } from '@tonconnect/protocol';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnvConfig from 'src/core/constants/EnvConfig';
import {
    CURRENT_PROTOCOL_VERSION,
    tonConnectDeviceInfo,
} from 'src/core/constants/TonConnectDevice';
import AppToastType from 'src/core/enum/AppToastType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import {
    changeAccount,
    getAllAccount,
    getProtocolDataLists,
} from 'src/core/redux/slice/account.slice';
import TonConnectService from 'src/core/services/TonConnect/TonConnectService';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import TonServices from 'src/core/services/TonServices';
import { TonAccountsType } from 'src/core/services/TonServices/type';
import { getAccountTonWithAndAddress } from 'src/core/utils/accountUtils';
import Utils from 'src/core/utils/commonUtils';
import {
    _handleMultipleActionsTonConnect,
    getConnectedAppByUrl,
} from 'src/core/utils/tonConnect';
import WalletUtils from 'src/core/utils/walletUtils';
import {
    getAppConnection,
    removeInjectConnection,
    saveAppConnection,
    saveDAppBrowse,
} from 'src/features/tonConnect/slice/tonConnect.slice';
import {
    DAppManifest,
    Request,
    TonTransactionAction,
} from 'src/features/tonConnect/slice/tonConnect.type';
import { TonConnectKey } from '../../enum/TonConnectKey';
import {
    TonConnectDAppBrowserProp,
    WebViewBridgeMessageType,
} from '../jsBridge/types';
import { useWebViewBridge } from '../jsBridge/useWebViewBridge';
import { getInjectableJSMessage } from '../jsBridge/utils';
import { TonConnectInjectedBridge } from './models';
export const useDAppBridge = () => {
    const url = useRoute<TonConnectDAppBrowserProp>().params.url;
    const [titleDApp, setTitleDApp] = useState(url);
    const [webViewUrl] = useState(url);
    const tonService = new TonServices();
    const isTestNet = EnvConfig.ENV === 'development';
    const tonConnect = new TonConnectService();
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const allAccount = useAppSelector(getAllAccount);
    const listProtocol = useAppSelector(getProtocolDataLists);
    const [requestConnect, setRequestConnect] = useState<ConnectRequest>();
    const [requestTransaction, setRequestTransaction] =
        useState<AppRequest<RpcMethod>>();
    const [invocationId, setInvocationId] = useState<string>('');
    const [infoDapp, setInfoDapp] = useState<DAppManifest>();
    const [params, setParams] = useState<Request>();
    const [visibleLoading, setVisibleLoading] = useState(false);
    const bottomSheetConnectRef = useRef<BottomSheetModal>(null);
    const bottomSheetTransactionRef = useRef<BottomSheetModal>(null);
    const getAllConnect = useAppSelector(getAppConnection);
    const tonAddressData = useTonAddressData();
    const [requirePinCode, setRequirePinCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckEmulate, setIsCheckEmulate] = useState(false);
    const [insufficientBalance, setInsufficientBalance] = useState(false);
    const [lisTransaction, setLisTransaction] =
        useState<TonTransactionAction[]>();
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);
    const [addressDapp, setAddressDapp] = useState('');
    const [showCommonErrorModal, setShowCommonErrorModal] = useState(false);
    const titleCurrentAddress = WalletUtils.getShortAddress(
        tonAddressData?.address,
        8,
    );
    const titleAddressRequest =
        addressDapp &&
        WalletUtils.getShortAddress(
            Address.parse(addressDapp).toString({
                bounceable: false,
                testOnly: false,
            }),
            8,
        );
    const onShowModalTonConnect = () =>
        bottomSheetConnectRef.current?.present();
    const onCloseModalTonConnect = () => bottomSheetConnectRef.current?.close();
    const onShowModalTransaction = () => {
        bottomSheetTransactionRef.current?.present();
    };

    const onCloseModalTransaction = () => {
        bottomSheetTransactionRef.current?.close();
    };
    const bridgeObject = useMemo((): TonConnectInjectedBridge => {
        return {
            deviceInfo: tonConnectDeviceInfo,
            protocolVersion: CURRENT_PROTOCOL_VERSION,
            isWalletBrowser: true,
            connect: async message => {
                setInvocationId(message.invocationId);
                setRequestConnect(message.args[1]);
                onShowModalTonConnect();
            },
            restoreConnection: async () => {
                const event = await tonConnect.autoConnect(
                    titleDApp,
                    isTestNet,
                    tonAddressData?.publicKey,
                    tonAddressData?.address,
                    getAllConnect,
                );
                if (event.appConnection) {
                    dispatch(saveAppConnection(event.appConnection));
                }
                return event.event;
            },
            disconnect: async () => {
                dispatch(
                    removeInjectConnection({
                        chainName: isTestNet
                            ? TonConnectKey.testnet
                            : TonConnectKey.mainnet,
                        address: addressDapp,
                        url: titleDApp,
                    }),
                );
            },
            send: async message => {
                setInvocationId(message.invocationId);
                setRequestTransaction(message.args[0]);
                setParams(JSON.parse(message.args[0].params));
            },
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleDApp, addressDapp]);
    const [ref, injectedJavaScriptBeforeContentLoaded, onMessage] =
        useWebViewBridge<TonConnectInjectedBridge>(bridgeObject);
    const postMessage = useCallback((message: any) => {
        ref.current?.injectJavaScript(
            getInjectableJSMessage(JSON.stringify(message)),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const closeShowModal = () => {
        postMessage({
            type: WebViewBridgeMessageType.functionResponse,
            invocationId: invocationId,
            status: 'error',
            data: 'user reject transaction',
        });
        setShowCommonErrorModal(false);
    };
    const getManifest = async () => {
        if (requestConnect) {
            const data = await TonConnectUtils.getManifest(requestConnect);
            setInfoDapp(data);
        }
    };
    const confirmConnect = async () => {
        onCloseModalTonConnect();
        setVisibleLoading(true);
        try {
            if (tonAddressData && requestConnect) {
                const event = await tonConnect.connect(
                    2,
                    requestConnect,
                    tonAddressData.privateKey,
                    tonAddressData.publicKey,
                    tonAddressData.address,
                    isTestNet,
                    undefined,
                    undefined,
                    titleDApp,
                );
                if (event.appConnection) {
                    dispatch(saveAppConnection(event.appConnection));
                    dispatch(saveDAppBrowse(titleDApp))
                }
                postMessage({
                    type: WebViewBridgeMessageType.functionResponse,
                    invocationId: invocationId,
                    status: 'fulfilled',
                    data: event.event,
                });
                setAddressDapp(
                    Address.parse(tonAddressData?.address ?? '').toRawString(),
                );
            }
        } catch (error) {
            postMessage({
                type: WebViewBridgeMessageType.functionResponse,
                invocationId: invocationId,
                status: 'rejected',
                data: (error as any)?.message,
            });
        }
        setVisibleLoading(false);
        onCloseModalTonConnect();
    };
    const confirmTransaction = async () => {
        setRequirePinCode(false);
        setVisibleLoading(true);
        try {
            const response =
                await TonConnectUtils.handleTransactionFromInjectBridge(
                    getAllConnect,
                    titleDApp,
                    isTestNet,
                    tonAddressData,
                    requestTransaction,
                );
            if (response) {
                postMessage({
                    type: WebViewBridgeMessageType.functionResponse,
                    invocationId: invocationId,
                    status: 'fulfilled',
                    data: response,
                });
            }
        } catch (error) {
            postMessage({
                type: WebViewBridgeMessageType.functionResponse,
                invocationId: invocationId,
                status: 'error',
                data: (error as any)?.message,
            });
        }
        setIsEnableDismissOnClose(true);
        setVisibleLoading(false);
        onCloseModalTransaction();
    };
    const rejectTransaction = async () => {
        setInsufficientBalance(false);
        onCloseModalTransaction();
        postMessage({
            type: WebViewBridgeMessageType.functionResponse,
            invocationId: invocationId,
            status: 'error',
            data: 'user reject transaction',
        });
    };
    const closeRequirePinCode = () => setRequirePinCode(false);
    const showRequirePinCode = () => {
        setIsEnableDismissOnClose(false);
        onCloseModalTransaction();
        setRequirePinCode(true);
    };
    const checkEmulate = async () => {
        try {
            const currentWalletAddress = Address.parse(
                tonAddressData?.address ?? '',
            ).toRawString();
            if (currentWalletAddress !== addressDapp) {
                setShowCommonErrorModal(true);
            } else {
                onShowModalTransaction();
                setIsLoading(true);
                const amountRequest =
                    params?.messages.reduce(
                        (sum, item) => sum + Number(item.amount),
                        0,
                    ) ?? 0;
                const getAccountRes = await tonService.getAccounts({
                    address: Address.parse(tonAddressData?.address ?? ''),
                });
                const account = getAccountRes.data as TonAccountsType;
                if (account.balance <= amountRequest) {
                    setInsufficientBalance(true);
                    setIsCheckEmulate(false);
                } else {
                    const response =
                        (await TonConnectUtils.handleTransactionFromInjectBridge(
                            getAllConnect,
                            titleDApp,
                            isTestNet,
                            tonAddressData,
                            requestTransaction,
                            true,
                        )) as any;

                    if (response) {
                        setIsCheckEmulate(true);
                        const dataListTransaction =
                            await _handleMultipleActionsTonConnect({
                                extra: response.event.extra,
                                actionsList: response.event.actions,
                                risk: response.risk,
                            });

                        setLisTransaction(dataListTransaction);
                    }
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.log('check transaction fall : ' + error);
            setIsLoading(false);
        }
    };
    const addressOnlyDapp = () => {
        const address = getConnectedAppByUrl(
            titleDApp,
            getAllConnect,
            isTestNet,
        )?.walletAddress;
        setAddressDapp(address ?? '');
    };
    const accountChange = async () => {
        const account = getAccountTonWithAndAddress({
            addressRequest: addressDapp,
            protocolListData: listProtocol,
            allCount: allAccount,
        });
        if (account) {
            const res = await dispatch(changeAccount(account));
            if (changeAccount.fulfilled.match(res)) {
                onShowModalTransaction();
                Utils.showToast({
                    msg: t(LanguageKey.common_switch_to_name_successfully, {
                        name: account.name,
                    }),
                    type: AppToastType.success,
                });
                const payload = res.payload;
                if (!payload) {
                    Utils.showToast({
                        type: AppToastType.error,
                        msg: t(LanguageKey.common_switch_to_name_error, {
                            name: account.name,
                        }),
                    });
                    await rejectTransaction();
                }
            } else {
                Utils.showToast({
                    type: AppToastType.error,
                    msg: t(LanguageKey.common_switch_to_name_error, {
                        name: account.name,
                    }),
                });
                await rejectTransaction();
            }
        }
        setShowCommonErrorModal(false);
    };
    useEffect(() => {
        getManifest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestConnect]);
    useEffect(() => {
        if (requestTransaction) {
            checkEmulate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestTransaction, tonAddressData]);
    useEffect(() => {
        addressOnlyDapp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleDApp]);

    return {
        t,
        ref,
        theme,
        injectedJavaScriptBeforeContentLoaded,
        bottomSheetConnectRef,
        bottomSheetTransactionRef,
        infoDapp,
        tonAddressData,
        visibleLoading,
        requirePinCode,
        webViewUrl,
        isCheckEmulate,
        isLoading,
        lisTransaction,
        insufficientBalance,
        isEnableDismissOnClose,
        showCommonErrorModal,
        titleAddressRequest,
        titleCurrentAddress,
        titleDApp,
        closeShowModal,
        onMessage,
        onShowModalTonConnect,
        onCloseModalTonConnect,
        onCloseModalTransaction,
        confirmConnect,
        confirmTransaction,
        rejectTransaction,
        closeRequirePinCode,
        showRequirePinCode,
        accountChange,
        setTitleDApp,
    };
};
