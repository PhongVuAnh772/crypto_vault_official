// @ts-nocheck
import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrencyRateConversion,
    useCurrentWallet,
    useProtocolSelected,
    useSelectedCurrencySetting,
} from 'src/core/redux/slice/account.selector';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Slip0044 from 'src/core/enum/Slip0044';
import { getProtocolDataLists } from 'src/core/redux/slice/account.slice';
import {
    filterTokenAvailable,
    updateBalanceToken,
} from 'src/core/redux/slice/customToken/addCustomToken.slice';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import {
    APIResponseMoralis,
    GetWalletHistoryMoralisParamType,
    MethodLabel,
    TokenBalance,
    Transaction,
} from 'src/core/services/Moralis/type';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import {
    compareAddressesEVM,
    convertChainByProtocol,
} from 'src/core/utils/evmUtils';
import {
    convertValue,
    transactionHistoryUtils,
} from 'src/core/utils/transactionsHistoryUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { setTransferSlip0044 } from 'src/features/transfer/transfer.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ReceiveParamListType } from 'src/navigation/stacks/type/ReceiveParamListType';
import { TransferParamListType } from 'src/navigation/stacks/type/TransferParamListType';
import { getTransactionsHistoryEVM } from '../../../transfer/evm/send.evm.slice';
import { TokensObject } from '../../home.type';
import {
    getBalanceNativeEVM,
    getBalanceTokensEVM,
} from '../../slice/home.slice';

type TokenInformation = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.TokenDetailEVM
>;

const SHOW_MAX = 100;

const useTokenDetailEVM = ({ navigation }: RootNavigationType) => {
    // Hook to access translation functions from react-i18next
    const { t } = useTranslation();

    // Get the navigation parameters for the Token Detail screen.
    const tokenParams = useRoute<TokenInformation>().params;

    //State State variable to track if the page is loading.
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

    // State variable to track if the page is refreshing.
    const [refreshing, setRefreshing] = useState(false);

    // State variable to track the current transaction type.
    const [transactionType, setTransactionType] = useState<TransactionType>(
        TransactionType.All,
    );

    // State variable to track if the type bottom sheet is shown.
    const showTypeBottomSheetRef = useRef<BottomSheetModal>(null);

    // State variable to track the list of transaction history data.
    const [tokenHistories, setTokenHistories] = useState<
        HistorySectionDataType[]
    >([]);

    // State variable to track the cursor for pagination.
    const [cursor, setCursor] = useState<string | null>('');
    // State variable to track if the component is loading more data.
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    // -> interact with redux
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const protocolBaseData = useProtocolSelected();
    const wallet = useCurrentWallet();
    const dispatch = useAppDispatch();
    const listProtocol = useAppSelector(getProtocolDataLists);
    const listToken = useAppSelector(filterTokenAvailable);
    const currencyRateConversion = useCurrencyRateConversion();

    // -> interact with redux

    // -> interact with bottom sheet
    const onCloseBottomSheetSelectType = () =>
        showTypeBottomSheetRef.current?.dismiss();
    const onShowTypeBottomSheet = () =>
        showTypeBottomSheetRef.current?.present();
    // -> interact with bottom sheet

    // -> change type shows of list history
    const changeTypeTransaction = (type: TransactionType) => {
        setTransactionType(type);
    };
    // -> change type shows of list history

    // ->  check type of transaction
    const checkTypeTransaction = (transaction: Transaction) => {
        if (
            compareAddressesEVM(transaction.from_address, wallet?.address) &&
            transaction.method_label !== MethodLabel.mint
        ) {
            return TransactionType.Sent;
        }
        return TransactionType.Receive;
    };
    // ->  check type of transaction

    // -> handle navigate to SendTokenEVM Screen
    const onSendPress = () => {
        const findToken = listToken.find(token => {
            const tokenItem = token as SupportedTokenItemWithProtocol;
            const coinItem = token as SupportedNativeTokenWithProtocol;
            if (tokenParams.isNative && coinItem.isNativeToken) {
                return true;
            } else if (
                tokenParams.contractAddress === tokenItem.contractAddress
            ) {
                return true;
            }
        });
        if (findToken) {
            const params: TransferParamListType = {
                tokenData: findToken,
                isFromHome: true,
            };
            dispatch(setTransferSlip0044(Slip0044.Ethereum));
            navigation.navigate(HomeStackScreenKey.Transfer, params);
        }
    };
    // -> handle navigate to SendTokenEVM Screen

    // -> handle navigate to TransactionDetails Screen
    const onDetailTransactionHistory = (item: TransactionHistoryDataType) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, {
                transactionData: item,
            }),
        );
    };
    // -> handle navigate to TransactionDetails Screen

    // -> handle navigate to Receive Screen
    const onReceivePress = () => {
        const symbol = protocolBaseData?.symbol;
        const address = wallet?.address;
        if (symbol != null && address != null) {
            const receiveProp: ReceiveParamListType = {
                currency: tokenParams.symbol ?? '',
                address: address,
            };
            navigation.dispatch(
                StackActions.push(HomeStackScreenKey.Receive, receiveProp),
            );
        } else {
            Utils.showToast({
                msg: t(LanguageKey.send_push_error_title),
                type: AppToastType.error,
            });
        }
    };
    // -> handle navigate to Receive Screen

    // -> handle to if smart contract is system
    const checkIfSmartContractOfSystem = (address: string): boolean => {
        const isSystem = listProtocol?.some(protocol =>
            compareAddressesEVM(protocol.commissionContractAddress, address),
        );
        return !!isSystem;
    };
    // -> handle to if smart contract is system

    // -> transform data for token
    const convertTransactionsTokenData = useCallback(
        (walletHistory: APIResponseMoralis, refresh?: boolean) => {
            if (walletHistory && protocolBaseData) {
                let listDataConverted: TransactionHistoryDataType[] = [];
                for (const transaction of walletHistory.result) {
                    const {
                        from_address,
                        native_transfers,
                        erc20_transfers,
                        nft_transfers,
                        method_label,
                        category,
                    } = transaction;

                    // Skip native and NFT transfers
                    if (native_transfers.length || nft_transfers.length) {
                        continue;
                    }

                    const typeTransaction = checkTypeTransaction(transaction);
                    const isReceive =
                        typeTransaction === TransactionType.Receive;

                    // Get base transaction data
                    let data = transactionHistoryUtils.getBaseTransactionData(
                        transaction,
                        typeTransaction,
                        isReceive,
                        protocolBaseData,
                    );

                    if (erc20_transfers.length) {
                        const [firstTransfer] = erc20_transfers;

                        const baseTokenInfo = {
                            name: firstTransfer.token_name,
                            logo: firstTransfer.token_logo,
                            symbol: firstTransfer.token_symbol,
                        };

                        const totalValue = erc20_transfers.reduce(
                            (total, { value }) => total + BigInt(value),
                            BigInt(0),
                        );
                        if (
                            !compareAddressesEVM(
                                erc20_transfers[0].address ?? '',
                                tokenParams.contractAddress,
                            )
                        ) {
                            continue;
                        }
                        data = {
                            ...data,
                            totalAmount: convertValue(
                                totalValue,
                                +firstTransfer.token_decimals,
                            ),
                            amountSend: convertValue(
                                firstTransfer.value,
                                +firstTransfer.token_decimals,
                            ),
                            token: baseTokenInfo,
                            tokenSymbol: firstTransfer.token_symbol,
                            toAddress:
                                typeTransaction === TransactionType.Receive
                                    ? from_address
                                    : firstTransfer.to_address,
                        };

                        // Handle ERC20 transfers
                        data = transactionHistoryUtils.handleERC20Transfers(
                            data,
                            erc20_transfers,
                            typeTransaction,
                            transaction.from_address,
                            isReceive,
                            protocolBaseData,
                        );

                        // Check if it's a system contract
                        if (erc20_transfers.length > 1) {
                            const isSystem = checkIfSmartContractOfSystem(
                                transaction.to_address,
                            );
                            if (!isSystem) {
                                data.isShowDefaults = true;
                            }
                        }

                        if (
                            method_label === MethodLabel.airdrop ||
                            category === 'mint' ||
                            category === 'airdrop'
                        ) {
                            data.isShowDefaults = true;
                        }
                        listDataConverted.push(data);
                    }
                }

                // Update histories based on refresh flag
                if (refresh) {
                    setTokenHistories(
                        WalletUtils.transactionHistoryTransformToSectionsData(
                            listDataConverted,
                        ),
                    );
                } else {
                    setTokenHistories(prev => [
                        ...prev,
                        ...WalletUtils.transactionHistoryTransformToSectionsData(
                            listDataConverted,
                        ),
                    ]);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    // -> transform data for token

    // -> transform data for Coin (Native token)
    const convertTransactionsCoinData = useCallback(
        (walletHistory: APIResponseMoralis, refresh?: boolean) => {
            if (walletHistory && protocolBaseData) {
                const protocolDecimals =
                    protocolBaseData?.nativeToken.decimal || 18;
                const nativeToken = protocolBaseData?.nativeToken;
                const baseTokenInfo = {
                    name: nativeToken?.name,
                    logo: protocolBaseData?.logo,
                    symbol: nativeToken?.symbol,
                };
                let listDataConverted: TransactionHistoryDataType[] = [];

                for (const transaction of walletHistory.result) {
                    const typeTransaction = checkTypeTransaction(transaction);
                    const isReceive =
                        typeTransaction === TransactionType.Receive;
                    const isNotNative =
                        transaction.erc20_transfers.length ||
                        transaction.nft_transfers.length;

                    // Skip non-native receive transactions
                    if (isNotNative && isReceive) {
                        continue;
                    }

                    // Get base transaction data
                    let data = transactionHistoryUtils.getBaseTransactionData(
                        transaction,
                        typeTransaction,
                        isReceive,
                        protocolBaseData,
                    );
                    data.token = baseTokenInfo;

                    if (!isNotNative && transaction.native_transfers.length) {
                        // Handle native token transfers

                        // Handle internal transactions
                        if (transaction.internal_transactions.length) {
                            const isSystem = checkIfSmartContractOfSystem(
                                transaction.to_address,
                            );
                            if (!isSystem) {
                                data = {
                                    ...data,
                                    isShowDefaults: true,
                                    token: baseTokenInfo,
                                };
                            }
                        }
                        data =
                            transactionHistoryUtils.handleNativeTransactionsMoralis(
                                data,
                                transaction.internal_transactions,
                                isReceive,
                                protocolDecimals,
                                transaction.from_address,
                                protocolBaseData,
                                transaction,
                                baseTokenInfo,
                                nativeToken,
                                wallet?.address || '',
                            );
                    } else {
                        // Handle smart contract interactions
                        data.isShowDefaults = true;
                    }
                    if (data.isShowDefaults) {
                        const result =
                            transactionHistoryUtils.handleSetDataDefault(
                                data,
                                isReceive,
                                wallet?.address || '',
                                transaction.internal_transactions,
                                protocolDecimals,
                                true,
                                transaction,
                            );
                        data = result;
                    }
                    listDataConverted.push(data);
                }

                // Update token histories based on refresh flag
                if (refresh) {
                    setTokenHistories(
                        WalletUtils.transactionHistoryTransformToSectionsData(
                            listDataConverted,
                        ),
                    );
                } else {
                    setTokenHistories(prev => [
                        ...prev,
                        ...WalletUtils.transactionHistoryTransformToSectionsData(
                            listDataConverted,
                        ),
                    ]);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    // -> transform data for Coin (Native token)

    // -> handle filter for history transactions
    const filterHistoryByType = useCallback(() => {
        if (transactionType === TransactionType.All) {
            return tokenHistories;
        } else {
            let newTransactionHistory: HistorySectionDataType[] = [];
            for (const section of tokenHistories) {
                const result = section.data.filter(transaction => {
                    return transaction.type === transactionType;
                });
                if (result.length) {
                    newTransactionHistory.push({
                        title: section.title,
                        data: result,
                    });
                }
            }
            return newTransactionHistory;
        }
    }, [transactionType, tokenHistories]);
    // -> handle filter for history transactions

    // -> handle fetch transactions
    const handleFetchData = async (cursor?: string, refresh?: boolean) => {
        try {
            if (protocolBaseData && wallet) {
                const chain = convertChainByProtocol(
                    protocolBaseData?.slip0044,
                );
                if (!chain) {
                    Utils.showToast({
                        msg: t(LanguageKey.common_server_busy),
                        type: AppToastType.error,
                    });
                    return;
                }
                const data: GetWalletHistoryMoralisParamType = {
                    walletAddress: wallet?.address,
                    data: {
                        chain: chain,
                        order: 'DESC',
                        include_internal_transactions: true,
                        limit: SHOW_MAX,
                    },
                };
                if (cursor) {
                    data.data.cursor = cursor;
                }
                const response = await dispatch(
                    getTransactionsHistoryEVM(data),
                );

                if (getTransactionsHistoryEVM.fulfilled.match(response)) {
                    const data = response.payload;
                    setCursor(data.cursor);
                    if (tokenParams.isNative) {
                        convertTransactionsCoinData(data, refresh);
                    } else {
                        convertTransactionsTokenData(data, refresh);
                    }
                }
                if (getTransactionsHistoryEVM.rejected.match(response)) {
                    throw new Error('Error getting transaction history');
                }
            }
        } catch {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
                visibilityTime: 2000,
            });
            setIsLoadingPage(false);
        }
    };
    // -> handle fetch transactions

    // -> handle Page transactions
    const onRefreshPage = useCallback(async () => {
        setRefreshing(true);
        await updateBalance();
        await handleFetchData(undefined, true);
        setRefreshing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // -> handle Page transactions

    // -> handle load more transactions
    const onLoadMore = async () => {
        // If the component is not already loading more data,
        // fetch more data from the Moralis API.
        if (!isLoadingMore && cursor) {
            setIsLoadingMore(true);
            await handleFetchData(cursor);
            setIsLoadingMore(false);
        }
    };
    // -> handle load more transactions

    // -> handle Update Balance
    const updateBalance = async () => {
        let token = findTokenInDatabase();
        let listTokenResponse: TokenBalance[] = [];
        if (
            !wallet?.address ||
            !tokenParams.contractAddress ||
            !protocolBaseData
        ) {
            return;
        }
        const getChain = convertChainByProtocol(protocolBaseData.slip0044);

        if (!getChain) {
            return;
        }

        if (!token) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            return;
        }
        const isNative = tokenParams.isNative;
        if (isNative) {
            const nativeBalance = await dispatch(
                getBalanceNativeEVM({
                    walletAddress: wallet.address,
                    params: {
                        chain: getChain,
                        cursor: null,
                        limit: 2,
                    },
                    contractAddress: protocolBaseData.nativeToken.address,
                }),
            ).unwrap();
            if (nativeBalance) {
                listTokenResponse = [nativeBalance];
            }
        } else {
            const tokenResponse = await dispatch(
                getBalanceTokensEVM({
                    walletAddress: wallet.address,
                    params: {
                        chain: getChain,
                        limit: 1,
                        tokenAddresses: [tokenParams.contractAddress],
                    },
                }),
            ).unwrap();
            if (tokenResponse?.result) {
                listTokenResponse = tokenResponse.result;
            }
        }

        const result: TokensObject = listTokenResponse.reduce(
            (acc: TokensObject, token: TokenBalance) => {
                acc[token.token_address] = token;
                return acc;
            },
            {},
        );

        dispatch(
            updateBalanceToken({
                walletAddress: wallet.address,
                protocolData: protocolBaseData,
                tokens: result,
            }),
        );
    };
    // -> handle Update Balance

    // -> handle Press View More
    const onPressViewMore = () => {
        // If the user's wallet address and the protocol data are available,
        // open the user's wallet address on the block explorer in a web browser.

        if (wallet?.address && protocolBaseData) {
            Linking.openURL(
                `${protocolBaseData?.blockExplorerUrl}/address/${wallet?.address}`,
            );
        }
    };
    // -> handle Press View More

    // -> handle InitData
    const handleInitData = async () => {
        setIsLoadingPage(true);
        await handleFetchData();
        setIsLoadingPage(false);
    };
    // -> handle InitData
    // Filter the transaction history based on the selected transaction type.
    const listShow = filterHistoryByType();

    const findTokenInDatabase = useCallback(() => {
        const findToken = listToken.find(token =>
            compareAddressesEVM(
                tokenParams.contractAddress,
                token.contractAddress,
            ),
        );
        return findToken;
    }, [tokenParams, listToken]);

    const balanceToken = useCallback(() => {
        const token = findTokenInDatabase();
        if (!token || !token.decimal) {
            return '0';
        }
        const balanceConverted = Utils.convertBigIntFollowDecimals(
            token.balance + '',
            token.decimal,
        );
        return balanceConverted;
    }, [findTokenInDatabase]);

    const balanceConverted = balanceToken();

    const balanceParse = parseFloat(balanceConverted.replace(/,/g, ''));

    const rate = tokenParams.rateCurrency || 1;

    const rateBase = Utils.truncateToNumberDecimals(
        currencyRateConversion * selectedCurrencySetting?.rate * rate,
        2,
    );
    const balanceCurrency = `≈ ${Utils.formattedCurrency(balanceParse * rateBase)} ${selectedCurrencySetting?.symbol ?? ''}`;

    const balanceTitle = tokenParams.rateCurrency ? balanceCurrency : '';

    const balanceShow = `${Utils.formattedBalanceCurrency(+balanceConverted)} ${tokenParams.symbol || ''}`;

    useEffect(() => {
        handleInitData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        tokenParams,
        isLoadingPage,
        refreshing,
        transactionType,
        onRefreshPage,
        onShowTypeBottomSheet,
        onSendPress,
        onReceivePress,
        balanceTitle,
        changeTypeTransaction,
        onDetailTransactionHistory,
        onCloseBottomSheetSelectType,
        tokenHistories: listShow,
        balanceShow,
        onLoadMore,
        isLoadingMore,
        onPressViewMore,
        showTypeBottomSheetRef,
    };
};
export default useTokenDetailEVM;
