import { StackActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import EnvConfig from 'src/core/constants/EnvConfig';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useAccount,
    useBitcoinAddressData,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import { Itxs } from 'src/core/services/BitcoinServices/type';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import {
    getBitcoinFullData,
    selectorBitcoinFullData,
    selectorBitcoinFullDataTxs,
    setIsTransactionHistoryLoading,
} from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice';

import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useBitcoinTransactionTab = ({
    navigation,
    typeSelect,
}: RootNavigationType & {
    typeSelect: TransactionType;
}) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const currentWallet = useAccount();
    const [isPressDisabled, setIsPressDisabled] = useState(false);
    const btcAddress = useBitcoinAddressData()?.address ?? '';
    const bitcoinFullDataTxs = useAppSelector(selectorBitcoinFullDataTxs) ?? [];

    const bitcoinFullData = useAppSelector(selectorBitcoinFullData);
    const protocolBaseData = useProtocolSelected();
    const protocolLogo = protocolBaseData?.logo;
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [transactionHistory, setTransactionHistory] = useState<
        HistorySectionDataType[]
    >([]);

    const changeTypeSelect = async () => {
        transformBitcoinTransactionHistory({ currentType: typeSelect });
    };

    const handlingFetchDataBitcoin = async (
        currentTypeTransaction: TransactionType,
    ) => {
        const res = await dispatch(
            getBitcoinFullData({ bitcoinAddress: btcAddress }),
        );
        if (getBitcoinFullData.fulfilled.match(res)) {
            transformBitcoinTransactionHistory({
                txsData: res?.payload?.txs,
                currentType: currentTypeTransaction,
            });
            setLoading(false);
            dispatch(setIsTransactionHistoryLoading(true));
        } else {
            setLoading(false);
        }
    };

    const fetchData = async (
        handlingRefresh: boolean,
        currentTypeTransaction: TransactionType,
    ) => {
        try {
            if (handlingRefresh) {
                setRefreshing(true);
            }
            await handlingFetchDataBitcoin(currentTypeTransaction);
            setRefreshing(false);
        } catch (error) {
            console.error('fetchData Error:', error);
            setTransactionHistory([]);
            setRefreshing(false);
        } finally {
            setRefreshing(false);
        }
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
        setTransactionHistory(result);
    };

    const typeSelectTitle =
        typeSelect === TransactionType.All
            ? LanguageKey.transaction_all_type
            : typeSelect;

    const goToDetails = (item: TransactionHistoryDataType) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, {
                transactionData: item,
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

    const viewMoreHistory = () => {
        const defaultBaseUrl = EnvConfig.BLOCK_CYPHER_ADDRESS_ULR;
        const blockExplorerUrl = protocolBaseData?.blockExplorerUrl;

        Linking.openURL(`${blockExplorerUrl ?? defaultBaseUrl}${btcAddress}`);
    };
    useEffect(() => {
        changeTypeSelect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeSelect]);
    useEffect(() => {
        transformBitcoinTransactionHistory({ txsData: bitcoinFullData?.txs });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bitcoinFullData]);

    useEffect(() => {
        fetchData(false, typeSelect);
        transformBitcoinTransactionHistory({ txsData: bitcoinFullData?.txs });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [protocolBaseData, currentWallet]);

    const onRefresh = async () => {
        fetchData(true, typeSelect);
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
        newUI,
    };
};

export default useBitcoinTransactionTab;
