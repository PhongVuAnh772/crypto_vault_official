import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import Slip0044 from 'src/core/enum/Slip0044';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useProtocolSelected,
    useSelectedCurrencySetting,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { getBlockTonTransfer } from 'src/core/redux/slice/app.slice';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { getTonViewerUrl } from 'src/core/utils/tonNetwork';
import { setTransferSlip0044 } from 'src/features/transfer/transfer.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { TransactionDetailsProps } from 'src/navigation/stacks/type/HomeParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ReceiveParamListType } from 'src/navigation/stacks/type/ReceiveParamListType';
import {
    getTonData,
    getTonEvents,
    selectorIsGetEventsLoading,
    selectorTonBalance,
    selectorTonEvents,
    setIsGetEventsLoading,
    setMaxTonEventList,
    setTonEvents,
} from './ton.coinDetails.slice';

export const useTon = ({ navigation }: RootNavigationType) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const tonEvents = useAppSelector(selectorTonEvents);
    const tonBalance = useAppSelector(selectorTonBalance) ?? 0;
    const blockTonTransfer = useAppSelector(getBlockTonTransfer);
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

    const tonBalanceCurrency = TonUtils.getTonBalanceToCurrency(
        tonBalance,
        currencySetting,
        protocolBaseData?.price,
    );

    const tonBalanceString = `${TonUtils.formatTonBalance(tonBalance)} ${t(LanguageKey.currency_ton)}`;

    const balanceCurrencyTitle = `≈ ${tonBalanceCurrency.balance} ${tonBalanceCurrency.currency?.symbol}`;

    const fetchData = async () => {
        dispatch(
            getTonData({
                tonAddressData,
                decimal: protocolBaseData?.nativeToken.decimal,
            }),
        );
        dispatch(getTonEvents({ tonAddressData, isRefreshAction: true }));
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
            setTransactionData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tonEvents, typeSelect]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        fetchData();
        setRefreshing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const onLoadMore = async () => {
        if (!loadMore) {
            setLoadMore(true);
            await dispatch(getTonEvents({ tonAddressData }));
            setLoadMore(false);
        }
    };

    const transformTonEventsHistoryData = async () => {
        if (!tonEvents) return;

        const result = await TonUtils.transformTonEventsHistoryData({
            typeSelect,
            tonEvents,
            decimal: protocolBaseData?.nativeToken?.decimal,
            beneficiary: protocolBaseData?.beneficiary,
        });
        if (result) {
            setTransactionData(result);
        }
    };

    const goToSendScreen = () => {
        if (protocolBaseData?.isDefault || blockTonTransfer) {
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
            `${protocolBaseData?.blockExplorerUrl ?? getTonViewerUrl()}${tonAddressData?.address}`,
        );
    };

    return {
        tonBalanceString,
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
        showTypeBottomSheetRef,
    };
};
