import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import EnvConfig from 'src/core/constants/EnvConfig';
import AppToastType from 'src/core/enum/AppToastType';
import Slip0044 from 'src/core/enum/Slip0044';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useBitcoinAddressData,
    useProtocolSelected,
    useSelectedCurrencySetting,
} from 'src/core/redux/slice/account.selector';
import { getBlockBitcoinTransfer } from 'src/core/redux/slice/app.slice';
import { Itxs } from 'src/core/services/BitcoinServices/type';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import { setTransferSlip0044 } from 'src/features/transfer/transfer.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { TransactionDetailsProps } from 'src/navigation/stacks/type/HomeParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ReceiveParamListType } from 'src/navigation/stacks/type/ReceiveParamListType';
import {
    getBitcoinFullData,
    getNetworkFee,
    selectorBitcoinFullData,
    selectorIsTransactionHistoryLoading,
    selectorReloadBitcoinData,
    setIsTransactionHistoryLoading,
    setReloadBitcoinData,
} from './bitcoin.coinDetails.slice';

export const useBitcoin = ({ navigation }: RootNavigationType) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [isPressDisabled, setIsPressDisabled] = useState(false);
    const bitcoinFullData = useAppSelector(selectorBitcoinFullData);
    const reloadBitcoinData = useAppSelector(selectorReloadBitcoinData);
    const currencySetting = useSelectedCurrencySetting();
    const protocolBaseData = useProtocolSelected();
    const blockBitcoinTransfer = useAppSelector(getBlockBitcoinTransfer);
    const bitcoinFullDataTxs = bitcoinFullData?.txs ?? [];
    const btcBalance = bitcoinFullData?.balance ?? 0;

    const showTypeBottomSheetRef = useRef<BottomSheetModal>(null);
    const onCloseTypeBottomSheet = () =>
        showTypeBottomSheetRef.current?.dismiss();
    const onShowTypeBottomSheet = () =>
        showTypeBottomSheetRef.current?.present();

    const btcBalanceCurrency = BitcoinUtils.getBitcoinBalanceToCurrency(
        btcBalance,
        currencySetting,
        protocolBaseData?.price,
    );

    const bitCoinBalanceTitle = `${Utils.formattedBalanceCurrency(
        parseFloat(BitcoinUtils.getBitcoinFromSatoshi(btcBalance)),
    )} ${t(LanguageKey.currency_bitcoin)}`;

    const btcBalanceCurrencyString = `≈ ${btcBalanceCurrency.balance} ${btcBalanceCurrency.currency?.symbol}`;

    const isTransactionHistoryLoading = useAppSelector(
        selectorIsTransactionHistoryLoading,
    );

    const [refreshing, setRefreshing] = useState(false);
    const bitcoinData = useBitcoinAddressData();
    const btcAddress = bitcoinData?.address ?? '';

    const [typeSelect, setTypeSelect] = useState<TransactionType>(
        TransactionType.All,
    );

    const [btcTransactionHistory, setBTCTransactionHistory] = useState<any[]>(
        [],
    );

    const fetchData = async (currentTypeSelect: TransactionType) => {
        dispatch(getNetworkFee());
        const res = await dispatch(
            getBitcoinFullData({ bitcoinAddress: btcAddress }),
        );
        if (reloadBitcoinData) {
            dispatch(setReloadBitcoinData(false));
        }
        if (getBitcoinFullData.fulfilled.match(res)) {
            transformBitcoinTransactionHistory({
                txsData: res.payload?.txs,
                currentType: currentTypeSelect,
            });
        }
    };

    useEffect(() => {
        fetchData(TransactionType.All);
        transformBitcoinTransactionHistory({
            txsData: bitcoinFullData?.txs,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (reloadBitcoinData) {
            fetchData(TransactionType.All);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadBitcoinData]);

    const goToSendScreen = () => {
        if (protocolBaseData?.isDefault || blockBitcoinTransfer) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
        } else {
            dispatch(setTransferSlip0044(Slip0044.Bitcoin));
            navigation.navigate(HomeStackScreenKey.Transfer);
        }
    };
    const goToReceiveScreen = () => {
        const receiveProp: ReceiveParamListType = {
            currency: t(LanguageKey.currency_bitcoin),
            address: btcAddress,
        };
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.Receive, receiveProp),
        );
    };

    const transformBitcoinTransactionHistory = async ({
        currentType,
        txsData,
    }: {
        currentType?: TransactionType;
        txsData?: Itxs[];
    }) => {
        const adminAddress = protocolBaseData?.beneficiary?.walletAddress;

        const result = await BitcoinUtils.transformBitcoinTransactionHistory({
            currentType,
            txsData,
            typeSelect,
            bitcoinFullDataTxs,
            btcAddress,
            adminAddress: adminAddress,
        });
        setBTCTransactionHistory(result);
    };

    const changeTypeSelect = (type: TransactionType) => {
        setTypeSelect(type);
        transformBitcoinTransactionHistory({ currentType: type });
    };

    const goToDetails = (item: TransactionHistoryDataType) => {
        const params: TransactionDetailsProps = {
            transactionData: item,
            blockExplorerUrl: protocolBaseData?.transactionScanURL,
        };
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, params),
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

    const viewMoreHistory = () => {
        Linking.openURL(`${EnvConfig.BLOCK_CYPHER_ADDRESS_ULR}${btcAddress}`);
    };

    const onBack = () => {
        dispatch(setIsTransactionHistoryLoading(true));
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(typeSelect);
        setRefreshing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, typeSelect]);

    return {
        bitCoinBalanceTitle,
        goToSendScreen,
        goToReceiveScreen,
        btcTransactionHistory,
        typeSelect,
        changeTypeSelect,
        refreshing,
        onRefresh,
        isTransactionHistoryLoading,
        onCloseTypeBottomSheet,
        onShowTypeBottomSheet,
        btcBalanceCurrencyString,
        onGoToDetails,
        viewMoreHistory,
        onBack,
        showTypeBottomSheetRef,
    };
};
