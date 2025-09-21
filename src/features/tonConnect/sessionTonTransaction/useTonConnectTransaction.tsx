import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Address } from '@ton/core';
import { SEND_TRANSACTION_ERROR_CODES } from '@tonconnect/protocol';
import { t } from 'i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import EnvConfig from 'src/core/constants/EnvConfig';
import { AppContext } from 'src/core/context/appContext';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import {
    changeAccount,
    getAccountId,
    getAllAccount,
    getProtocolDataLists,
} from 'src/core/redux/slice/account.slice';
import { AccountType } from 'src/core/redux/slice/account.type';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import TonServices from 'src/core/services/TonServices';
import { TonAccountsType } from 'src/core/services/TonServices/type';
import { getAccountTonWithAndAddress } from 'src/core/utils/accountUtils';
import Utils from 'src/core/utils/commonUtils';
import { _handleMultipleActionsTonConnect } from 'src/core/utils/tonConnect';
import {
    getAppConnection,
    getMessageSSE,
    setMessageSSE,
    setModalConnect,
} from '../slice/tonConnect.slice';
import { Request, TonTransactionAction } from '../slice/tonConnect.type';

const useTonConnectTransaction = () => {
    const isTestNet = EnvConfig.ENV === 'development';
    const insets = useAppSafeAreaInsets();
    const tonService = new TonServices();
    const data = useAppSelector(getMessageSSE);
    const state = useAppSelector(getAppConnection);
    const { sessionCrypto } = useContext(AppContext);
    const [params, setParams] = useState<Request>();
    const dispatch = useAppDispatch();
    const tonAddressData = useTonAddressData();
    const allAccount = useAppSelector(getAllAccount);
    const listProtocol = useAppSelector(getProtocolDataLists);
    const selectAccountId = useAppSelector(getAccountId);
    const [validateAccount, setValidateAccount] = useState(false);
    const [account, setAccount] = useState<AccountType>();
    const [visibleLoading, setVisibleLoading] = useState(false);
    const [requirePinCode, setRequirePinCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckEmulate, setIsCheckEmulate] = useState(false);
    const showBottomSheetTransaction = useRef<BottomSheetModal>(null);
    const [lisTransaction, setLisTransaction] =
        useState<TonTransactionAction[]>();
    const theme = useAppTheme();
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);
    const [insufficientBalance, setInsufficientBalance] = useState(false);
    const checkTransaction = async () => {
        try {
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
            } else {
                const response = (await TonConnectUtils.handleTransaction(
                    data,
                    state,
                    isTestNet,
                    params,
                    tonAddressData,
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
        } catch (error) {
            console.log('check transaction fall : ' + error);
            setIsLoading(false);
        }
    };
    const continueActionAfterPassPinCode = async () => {
        setRequirePinCode(false);
        setVisibleLoading(true);
        try {
            const response = await TonConnectUtils.handleTransaction(
                data,
                state,
                isTestNet,
                params,
                tonAddressData,
            );
            if (response && sessionCrypto && data.from) {
                await tonService.sendConnectDapp(
                    response,
                    sessionCrypto,
                    data.from,
                );
            }
        } catch (error) {
            console.log(error);
        }
        setVisibleLoading(false);
        dispatch(setMessageSSE({ activeRequest: false }));
        dispatch(setModalConnect(false));
    };
    const showRequirePinCode = () => {
        setIsEnableDismissOnClose(false);
        showBottomSheetTransaction.current?.close();
        setRequirePinCode(true);
    };
    const reject = async () => {
        if (sessionCrypto && data.from) {
            await tonService.sendConnectDapp(
                {
                    error: {
                        code: SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR,
                        message: 'User reject action ',
                    },
                    id: data.request?.id ?? '',
                },
                sessionCrypto,
                data.from,
            );
            setValidateAccount(false);
            dispatch(setMessageSSE({ activeRequest: false }));
            dispatch(setModalConnect(false));
        }
    };

    const accountChange = async () => {
        if (account) {
            const res = await dispatch(changeAccount(account));
            if (changeAccount.fulfilled.match(res)) {
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
                    await reject();
                }
                setValidateAccount(false);
            } else {
                Utils.showToast({
                    type: AppToastType.error,
                    msg: t(LanguageKey.common_switch_to_name_error, {
                        name: account.name,
                    }),
                });
                await reject();
            }
        }
    };
    const closeRequirePinCode = () => setRequirePinCode(false);
    useEffect(() => {
        showBottomSheetTransaction.current?.present();
        const request = JSON.parse(data.request?.params as any);
        setParams(request);
        const account = getAccountTonWithAndAddress({
            addressRequest: request.from,
            protocolListData: listProtocol,
            allCount: allAccount,
        });
        setValidateAccount(account?.id !== selectAccountId);
        setAccount(account);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!validateAccount && params) {
            checkTransaction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateAccount, params]);
    return {
        insets,
        lisTransaction,
        validateAccount,
        theme,
        visibleLoading,
        requirePinCode,
        isCheckEmulate,
        continueActionAfterPassPinCode,
        reject,
        accountChange,
        showRequirePinCode,
        closeRequirePinCode,
        showBottomSheetTransaction,
        loading: !validateAccount && !isLoading,
        isEnableDismissOnClose,
        tonAddressData,
        params,
        insufficientBalance,
    };
};

export default useTonConnectTransaction;
