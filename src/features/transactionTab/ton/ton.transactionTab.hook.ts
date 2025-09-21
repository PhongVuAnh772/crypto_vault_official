import { StackActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import EnvConfig from 'src/core/constants/EnvConfig';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useAccount,
    useAccountProtocolSelected,
    useProtocolSelected,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { getNFTMetadata } from 'src/core/redux/slice/NftData.slice';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import GlobalUtils from 'src/core/utils/globalUtils';
import TonUtils from 'src/core/utils/tonUtils';
import {
    getTonEvents,
    selectorTonEvents,
    setIsGetEventsLoading,
} from 'src/features/coinDetails/ton/ton.coinDetails.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useTonTransactionTab = ({
    navigation,
    typeSelect,
}: RootNavigationType & {
    typeSelect: TransactionType;
}) => {
    const dispatch = useAppDispatch();
    const currentWallet = useAccount();
    const accountProtocolSelected = useAccountProtocolSelected();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const addressList = accountProtocolSelected?.addressList;
    const selectedAddressId = accountProtocolSelected?.selectedAddressId;
    const selectedAddress = addressList?.find(e => e.id === selectedAddressId);
    const [isPressDisabled, setIsPressDisabled] = useState(false);
    const tonEvents = useAppSelector(selectorTonEvents);
    const tonAddressData = useTonAddressData();
    const protocolBaseData = useProtocolSelected();
    const protocolLogo = protocolBaseData?.logo;
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [transactionHistory, setTransactionHistory] = useState<
        HistorySectionDataType[]
    >([]);
    const cacheDataNFT = useAppSelector(getNFTMetadata);
    const changeTypeSelect = async () => {
        if (tonEvents) {
            const result = await TonUtils.transformTonEventsHistoryData({
                typeSelect,
                tonEvents,
                decimal: protocolBaseData?.nativeToken?.decimal,
                beneficiary: protocolBaseData?.beneficiary,
                cacheDataNFT: cacheDataNFT,
                dispatch: dispatch,
            });
            if (result) {
                setTransactionHistory(result);
            }
        } else {
            setTransactionHistory([]);
        }
    };

    useEffect(() => {
        changeTypeSelect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeSelect]);

    const handlingFetchDataTon = async (
        currentTypeTransaction: TransactionType,
    ) => {
        if (tonEvents && tonEvents.length > 0) {
            const result = await TonUtils.transformTonEventsHistoryData({
                typeSelect: currentTypeTransaction,
                tonEvents,
                decimal: protocolBaseData?.nativeToken?.decimal,
                beneficiary: protocolBaseData?.beneficiary,
                cacheDataNFT: cacheDataNFT,
                dispatch: dispatch,
            });
            if (result) {
                setTransactionHistory(result);
            } else {
                setTransactionHistory([]);
            }
            setLoading(false);
            dispatch(setIsGetEventsLoading(true));
        } else {
            setTransactionHistory([]);
            setLoading(false);
            dispatch(setIsGetEventsLoading(true));
        }
    };

    useEffect(() => {
        fetchDataWithProtocolTon(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [protocolBaseData, currentWallet]);

    const fetchData = async (currentTypeTransaction: TransactionType) => {
        try {
            await handlingFetchDataTon(currentTypeTransaction);
            setRefreshing(false);
        } catch (error) {
            console.error('fetchData Error:', error);
            setTransactionHistory([]);
            setRefreshing(false);
        } finally {
            setRefreshing(false);
        }
    };

    const typeSelectTitle =
        typeSelect === TransactionType.All
            ? LanguageKey.transaction_all_type
            : typeSelect;

    const goToDetails = (item: TransactionHistoryDataType) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, {
                transactionData: { ...item, protocolData: protocolBaseData },
            }),
        );
    };

    const onGoToDetails = (item: TransactionHistoryDataType) => {
        if (!isPressDisabled) {
            goToDetails(item);
            setIsPressDisabled(true);
            setTimeout(() => {
                setIsPressDisabled(false);
            }, 200);
        }
    };

    const fetchDataWithProtocolTon = async (enableRefresh: boolean) => {
        if (enableRefresh) {
            setRefreshing(true);
        }
        try {
            const resTonEvents = await dispatch(
                getTonEvents({
                    tonAddressData,
                    isRefreshAction: true,
                    isAllEvents: true,
                }),
            );

            const hasEvents =
                getTonEvents.fulfilled.match(resTonEvents) &&
                resTonEvents.payload.events.length > 0;

            if (hasEvents) {
                const result = await TonUtils.transformTonEventsHistoryData({
                    typeSelect,
                    tonEvents: resTonEvents.payload.events,
                    decimal: protocolBaseData?.nativeToken?.decimal,
                    beneficiary: protocolBaseData?.beneficiary,
                    cacheDataNFT: cacheDataNFT,
                    dispatch: dispatch,
                });
                if (result) {
                    setTransactionHistory(result);
                } else {
                    setTransactionHistory([]);
                }
                dispatch(setIsGetEventsLoading(true));
            }
        } catch (error) {
            console.error('fetchDataWithProtocolTon Error:', error);
            setTransactionHistory([]);
            dispatch(setIsGetEventsLoading(true));
        } finally {
            setRefreshing(false);
            dispatch(setIsGetEventsLoading(true));
        }
    };

    const viewMoreHistory = () => {
        const defaultBaseUrl = EnvConfig.TON_VIEWER_TRANSACTION_URL;
        const blockExplorerUrl = protocolBaseData?.blockExplorerUrl;

        Linking.openURL(
            `${blockExplorerUrl ?? defaultBaseUrl}${tonAddressData?.address}`,
        );
    };

    useEffect(() => {
        fetchData(typeSelect);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [protocolBaseData, currentWallet]);

    const onRefresh = async () => {
        fetchDataWithProtocolTon(true);
    };

    return {
        transactionHistory,
        typeSelectTitle,
        refreshing,
        onRefresh,
        onGoToDetails,
        loading,
        viewMoreHistory,
        protocolLogo,
        currentWallet,
        selectedAddress: selectedAddress?.address,
        newUI,
    };
};

export default useTonTransactionTab;
