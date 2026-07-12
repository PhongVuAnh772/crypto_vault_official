import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Address } from '@ton/core';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import Slip0044 from 'src/core/enum/Slip0044';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    useProtocolSelected,
    useSelectedCurrencySetting,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { getBlockJettonTransfer } from 'src/core/redux/slice/app.slice';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { getTonViewerUrl } from 'src/core/utils/tonNetwork';
import { updateCryptoBalance } from 'src/features/home/slice/home.slice';
import { setTransferSlip0044 } from 'src/features/transfer/transfer.slice';
import { TransactionDetailsProps } from 'src/navigation/stacks/type/HomeParamListType';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import { ReceiveParamListType } from 'src/navigation/stacks/type/ReceiveParamListType';
import {
    getJettons,
    getTonEvents,
    selectorIsGetEventsLoading,
    selectorTonEvents,
    setIsGetEventsLoading,
    setMaxTonEventList,
    setTonEvents,
} from '../ton/ton.coinDetails.slice';

type JettonParamType = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.Jetton
>;

export const useJetton = ({ navigation }: RootNavigationType) => {
    const route = useRoute<JettonParamType>();
    const jettonData = route.params.jettonData;
    const cryptoData = route.params.cryptoData;

    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const headerTitle = cryptoData?.name;
    const logo = cryptoData?.logo;

    const tonEvents = useAppSelector(selectorTonEvents);
    const blockJettonTransfer = useAppSelector(getBlockJettonTransfer);

    const isTonGetTransactionsLoading = useAppSelector(
        selectorIsGetEventsLoading,
    );
    const protocolBaseData = useProtocolSelected();
    const [typeSelect, setTypeSelect] = useState<TransactionType>(
        TransactionType.All,
    );
    const [refreshing, setRefreshing] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [transactionData, setTransactionData] = useState<
        HistorySectionDataType[]
    >([]);
    const tonAddressData = useTonAddressData();
    const currencySetting = useSelectedCurrencySetting();
    const [balanceToken, setBalanceToken] = useState<number | undefined>(
        cryptoData?.balanceToken,
    );

    const { balanceFiatString } = TonUtils.convertBalanceWithFiat({
        balance: cryptoData?.balance,
        balanceToken: balanceToken,
        isNative: cryptoData?.isNative ?? false,
        tokenRate: cryptoData?.tokenRateCurrency,
        protocolRate: cryptoData?.rateCurrency,
        settingCurrencyRate: currencySetting.rate,
        isledgerifyToken: cryptoData?.isledgerifyToken,
    });

    const jettonBalanceString = `${Utils.formattedBalanceCurrency(balanceToken ?? 0)} ${cryptoData?.symbol ?? ''}`;

    const balanceCurrencyTitle = cryptoData?.tokenRateCurrency
        ? `≈ ${balanceFiatString} ${currencySetting.symbol ?? ''}`
        : '-';

    const fetchData = async () => {
        dispatch(
            getTonEvents({
                tonAddressData,
                isRefreshAction: true,
                isJetton: true,
                jettonId: cryptoData?.contractAddress,
            }),
        );
    };
    useEffect(() => {
        fetchData();
        return () => {
            dispatch(setTonEvents(undefined));
            dispatch(setMaxTonEventList(false));
            dispatch(setIsGetEventsLoading(true));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (
            tonEvents &&
            tonEvents?.length > 0 &&
            !isTonGetTransactionsLoading
        ) {
            transformTonEventsHistoryData();
        } else {
            console.log('Clear data');
            setTransactionData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tonEvents, typeSelect]);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            await Promise.all([
                dispatch(getJettons(tonAddressData)).then(res => {
                    if (getJettons.fulfilled.match(res)) {
                        const jettonDataList = res.payload.balances;
                        const selectedAddress =
                            jettonData?.wallet_address?.address;
                        if (selectedAddress) {
                            const newJettonData = jettonDataList.find(e => {
                                const currentAddress = e.wallet_address.address;

                                return (
                                    Address.parse(
                                        currentAddress,
                                    ).toRawString() ===
                                    Address.parse(selectedAddress).toRawString()
                                );
                            });

                            const newBalanceWithDecimals =
                                TonUtils.formatBigNumber(
                                    newJettonData?.balance ?? '',
                                    cryptoData?.decimal,
                                );

                            setBalanceToken(newBalanceWithDecimals);

                            dispatch(
                                updateCryptoBalance(newBalanceWithDecimals),
                            );
                        }
                    }
                }),
                dispatch(
                    getTonEvents({
                        tonAddressData,
                        isRefreshAction: true,
                        isJetton: true,
                        jettonId: jettonData?.jetton?.address,
                    }),
                ),
            ]);

            setRefreshing(false);
        } catch (error) {
            console.log('error onRefresh jetton coin details', error);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const onLoadMore = async () => {
        if (refreshing) {
            return;
        }
        if (!loadMore) {
            setLoadMore(true);
            await dispatch(
                getTonEvents({
                    tonAddressData,
                    isJetton: true,
                    jettonId: jettonData?.jetton?.address,
                }),
            );
            setLoadMore(false);
        }
    };

    const transformTonEventsHistoryData = async () => {
        if (!tonEvents || tonEvents.length === 0) return;
        const nativeDecimal = protocolBaseData?.nativeToken.decimal;

        const result = await TonUtils.transformTonEventsHistoryData({
            typeSelect,
            tonEvents,
            customSymbol: cryptoData?.symbol,
            decimal: cryptoData?.decimal,
            nativeDecimal,
            beneficiary: protocolBaseData?.beneficiary,
        });
        setTransactionData(result);
    };

    const goToSendScreen = () => {
        if (protocolBaseData?.isDefault || blockJettonTransfer) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
        } else {
            dispatch(setTransferSlip0044(Slip0044.Ton));
            navigation.navigate(HomeStackScreenKey.Transfer);
        }
    };

    const changeTypeSelect = (currentType: TransactionType) => {
        setTypeSelect(currentType);
    };

    const goToReceiveScreen = () => {
        const receiveProp: ReceiveParamListType = {
            currency: t(LanguageKey.currency_ton),
            address: tonAddressData?.address ?? '',
        };
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.Receive, receiveProp),
        );
    };

    const goToDetails = (item: TransactionHistoryDataType) => {
        const params: TransactionDetailsProps = {
            transactionData: { ...item, protocolData: protocolBaseData },
            blockExplorerUrl: protocolBaseData?.transactionScanURL,
        };

        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, params),
        );
    };

    const showTypeBottomSheetRef = useRef<BottomSheetModal>(null);
    const onCloseTypeBottomSheet = () =>
        showTypeBottomSheetRef.current?.dismiss();
    const onShowTypeBottomSheet = () =>
        showTypeBottomSheetRef.current?.present();

    const viewMoreHistory = () => {
        Linking.openURL(
            `${getTonViewerUrl()}${tonAddressData?.address}`,
        );
    };

    return {
        jettonBalanceString,
        goToSendScreen,
        refreshing,
        transactionData,
        isTonGetTransactionsLoading,
        onRefresh,
        typeSelect,
        changeTypeSelect,
        goToDetails,
        onCloseTypeBottomSheet,
        onShowTypeBottomSheet,
        goToReceiveScreen,
        loadMore,
        onLoadMore,
        balanceCurrencyTitle,
        viewMoreHistory,
        headerTitle,
        logo,
        jettonData,
        showTypeBottomSheetRef,
    };
};
