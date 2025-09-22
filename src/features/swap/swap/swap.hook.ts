import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import { NetworkType } from 'src/core/enum/ChangeNow';
import { WalletCoreCoinType } from 'src/core/enum/CoinType';
import { useCurrencyRateConversion } from 'src/core/hooks/useCurrencyRateConversion';
import useDebounce from 'src/core/hooks/useDebounce';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { getProtocolDataLists } from 'src/core/redux/slice/account.slice';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import {
    getListPairAvailable,
    getListPairAvailableThunk,
    getPinCodeForSwap,
    setPinCodeForSwap,
    setShowPinCodeForAuthSwap,
} from 'src/core/redux/slice/swap/swap.slice';
import ChangeNowService from 'src/core/services/ChangeNow';
import {
    CurrencyChangeNow,
    SwapStatus,
} from 'src/core/services/ChangeNow/types';
import {
    default as commonUtils,
    default as Utils,
} from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { HistoryViewDetailTransactionProps } from '../historyDetail/historyDetail.type';
import { getNetworkBySlip0044, getSupportedProtocols } from '../index.utils';
import {
    CurrencyController,
    CurrencyControllerEnum,
    LoadingManagement,
    ProtocolController,
    SwapController,
    SwapSelector,
    SwapTypeFrom,
} from './swap.types';
import useWallet from './swap.wallet.hook';

const _rateDefault = '1';
const bnbNativeCoin = 'bnb';

const useSwap = ({ navigation }: RootNavigationType) => {
    const {
        getBalance,
        transfer,
        estimateNetworkFee,
        getListWalletByCurrency,
        walletManagement,
        setWalletManagement,
        getBalanceCoinForTransferToken,
    } = useWallet();
    const { t } = useTranslation();
    const { getRate } = useCurrencyRateConversion();
    const dispatch = useAppDispatch();

    const pinCode = useAppSelector(getPinCodeForSwap);

    const changeNowService = useMemo(() => new ChangeNowService(), []);
    const refModal = useRef<BottomSheetModal>(null);
    const refCurrencies = useRef<BottomSheetModal>(null);
    const refSwapConfirmation = useRef<BottomSheetModal>(null);
    const refWalletManagement = useRef<BottomSheetModal>(null);
    const refSendMaximum = useRef<BottomSheetModal>(null);

    const protocolData = useAppSelector(getProtocolDataLists);

    const listOfCurrencies = useAppSelector(getListPairAvailable);

    const [loading, setLoading] = useState<LoadingManagement>({
        init: true,
        buttonLoading: false,
        youGetBalance: false,
        youSendBalance: false,
    });

    const [currentTypeProtocolSelected, setCurrentTypeProtocolSelected] =
        useState<SwapSelector | null>(SwapSelector.YouGet);

    // get default protocol for you get
    const [protocolController, setProtocolController] =
        useState<ProtocolController>(() => {
            return {
                youGetCurrency: protocolData?.find(
                    item => item.slip0044 === WalletCoreCoinType.ton,
                ),
                youSendCurrency: protocolData?.find(
                    item => item.slip0044 === WalletCoreCoinType.polygon,
                ),
            };
        });
    const [currencies, setCurrencies] = useState<CurrencyController>({
        youGetCurrency: null,
        youSendCurrency: null,
    });

    const [from, setFrom] = useState<SwapController>({
        balanceYouGet: '0',
        balanceYouSend: '0',
        balanceFormattedYouGet: '0',
        balanceFormattedYouSend: '0',
        amountYouGet: '',
        amountYouSend: '',
        amountYouSendToCurrency: '0',
        amountYouGetToCurrency: '0',
        minimalExchangeAmount: '0',
        searchCrypto: '',
        youGetPrice: 0,
        youSendPrice: 0,
        errorMessage: '',
        decimalsCurrencyYouSend: 0,
        estimateNetworkFee: '0',
        totalAmount: '0',
        forecast: '0',
        rate: '',
    });

    const debouncedAmountSend = useDebounce<string>(from.amountYouSend, 500);
    const debouncedSearchCrypto = useDebounce<string>(from.searchCrypto, 300);

    const protocolList = useMemo(
        () => getSupportedProtocols(protocolData),
        [protocolData],
    );

    const onShowModalProtocol = (type: SwapSelector) => {
        setCurrentTypeProtocolSelected(type);
        refModal.current?.present();
    };

    const onCloseModalProtocol = () => {
        refModal.current?.close();
        setCurrentTypeProtocolSelected(null);
    };

    const onCloseCurrency = () => {
        refCurrencies.current?.close();
        setCurrentTypeProtocolSelected(null);
        setFrom(prev => ({
            ...prev,
            searchCrypto: '',
        }));
    };

    const onShowModalWalletManagement = (type: SwapSelector) => {
        setCurrentTypeProtocolSelected(type);
        refWalletManagement.current?.present();
    };

    const onCloseModalWalletManagement = () => {
        refWalletManagement.current?.close();
        setCurrentTypeProtocolSelected(null);
    };

    const onCloseSwapConfirmation = () => {
        refSwapConfirmation.current?.close();
    };

    const onShowSendMaximumBottomSheet = () => {
        refSendMaximum.current?.present();
    };

    const onCloseSendMaximumBottomSheet = () => {
        refSendMaximum.current?.close();
    };
    const onOpenPinCode = () => {
        onCloseSwapConfirmation();
        dispatch(setShowPinCodeForAuthSwap(true));
    };

    const navigate = (youSend: string, youGet: string) => {
        const data: HistoryViewDetailTransactionProps = {
            rows: [
                {
                    title: LanguageKey.common_text_from,
                    value: youSend,
                },
                {
                    title: LanguageKey.common_text_to,
                    value: youGet,
                },
                {
                    title: LanguageKey.common_text_from_address,
                    value: WalletUtils.getShortAddress(
                        walletManagement.fromWallet?.address ?? '',
                    ),
                },
                {
                    title: LanguageKey.common_text_to_address,
                    value: WalletUtils.getShortAddress(
                        walletManagement.toWallet?.address ?? '',
                    ),
                },
            ],
            status: SwapStatus.WAITING,
            swapTo: currencies.youGetCurrency?.image ?? '',
            swapFrom: currencies.youSendCurrency?.image ?? '',
            isComeFromConfirmation: true,
        };
        navigation.dispatch(
            StackActions.replace(
                HomeStackScreenKey.TransactionHistorySwapDetail,
                data,
            ),
        );
    };

    const sortByTickerAndNetwork = (
        items: CurrencyChangeNow[],
        targetTicker: string,
        targetNetwork: string,
    ) => {
        return items.sort((a, b) => {
            const aMatch =
                a.ticker === targetTicker && a.network === targetNetwork;
            const bMatch =
                b.ticker === targetTicker && b.network === targetNetwork;

            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
    };
    const onClosePinCode = () => {
        dispatch(setShowPinCodeForAuthSwap(false));
    };

    const setPinCode = (pinCode: string) => {
        dispatch(setPinCodeForSwap(pinCode));
    };

    const makeTransaction = async (pinCode: string) => {
        onClosePinCode();
        setPinCode('');
        onSetLoadingButton(true);
        try {
            if (
                currencies.youSendCurrency &&
                currencies.youGetCurrency &&
                from.decimalsCurrencyYouSend
            ) {
                const isSuccess = await transfer(
                    currencies.youSendCurrency,
                    currencies.youGetCurrency,
                    from.amountYouSend,
                    from.decimalsCurrencyYouSend,
                    pinCode,
                );

                if (!isSuccess) {
                    throw new Error('Make transaction failed');
                }

                onCloseSwapConfirmation();
                navigate(
                    `${from.amountYouSend} ${currencies.youSendCurrency?.ticker.toUpperCase() ?? ''}`,
                    `${from.amountYouGet} ${currencies.youGetCurrency?.ticker.toUpperCase() ?? ''}`,
                );
            }
        } catch (error) {
            console.log('🚀 ~ makeTransaction ~ error:', error);
            Utils.showToast({
                msg: t(LanguageKey.common_text_error_title),
                type: AppToastType.error,
            });
        } finally {
            onSetLoadingButton(false);
        }
    };

    const onShowSwapConfirmation = async () => {
        onSetLoadingButton(true);
        try {
            const { youSendCurrency } = currencies;
            const { amountYouSend, decimalsCurrencyYouSend } = from;

            if (
                !youSendCurrency ||
                !amountYouSend ||
                !decimalsCurrencyYouSend ||
                !protocolController.youSendCurrency ||
                !walletManagement.fromWallet
            ) {
                throw new Error('Confirm fail');
            }

            const networkFee = await estimateNetworkFee(
                youSendCurrency,
                amountYouSend,
                protocolController.youSendCurrency.nativeToken.decimal,
                decimalsCurrencyYouSend,
            );

            if (networkFee === 0n) {
                throw new Error('Confirm fail');
            }

            const formattedNetworkFee = Utils.formattedBalanceCurrency(
                Number(networkFee),
            );
            let balance = from.balanceFormattedYouSend;

            if (youSendCurrency.tokenContract) {
                const getBalanceNative = await getBalanceCoinForTransferToken(
                    protocolController.youSendCurrency,
                    walletManagement.fromWallet,
                );
                balance = getBalanceNative.balanceFormatted;
            }

            if (+networkFee > +balance) {
                setFrom(prev => ({
                    ...prev,
                    errorMessage: t(
                        LanguageKey.evm_not_enough_amount_to_cover_transaction_fee,
                        {
                            amount: `≈ ${formattedNetworkFee}`,
                            coin_name:
                                protocolController.youSendCurrency?.nativeToken
                                    .symbol,
                        },
                    ),
                }));
                return;
            }

            const symbolNetwork = youSendCurrency?.network.toUpperCase();
            const isToken = Boolean(youSendCurrency.tokenContract);
            const totalAmount = isToken
                ? `${amountYouSend} ${youSendCurrency.ticker.toUpperCase()}`
                : `${Number(amountYouSend) + Number(formattedNetworkFee)} ${symbolNetwork}`;

            setFrom(prev => ({
                ...prev,
                estimateNetworkFee: `${formattedNetworkFee} ${symbolNetwork}`,
                totalAmount,
            }));

            refSwapConfirmation.current?.present();
        } catch (error) {
            console.log('🚀 ~ onShowSwapConfirmation ~ error:', error);
            Utils.showToast({
                msg: t(LanguageKey.common_text_error_title),
                type: AppToastType.error,
            });
        } finally {
            onSetLoadingButton(false);
        }
    };

    const onShowCurrency = (type: SwapSelector) => {
        setCurrentTypeProtocolSelected(type);
        refCurrencies.current?.present();
    };

    const onConfirmSwap = async () => {
        onOpenPinCode();
    };

    const getSortedCurrenciesByNetwork = useCallback(
        (
            protocol: ProtocolDataWithSupportedTokensFormBEType | undefined,
            oppositeCurrency: CurrencyChangeNow | null,
            listOfCurrencies: CurrencyChangeNow[],
        ): CurrencyChangeNow[] => {
            if (!protocol || !oppositeCurrency) return [];

            const network = getNetworkBySlip0044(protocol?.slip0044);
            if (!network) return [];

            const filteredCurrencies = listOfCurrencies.filter(
                item => item.network === network,
            );

            if (filteredCurrencies.length === 0) return [];

            const isBsc = filteredCurrencies[0].network === NetworkType.BSC;
            const targetTicker = isBsc
                ? bnbNativeCoin
                : filteredCurrencies[0].network;

            return sortByTickerAndNetwork(
                filteredCurrencies,
                targetTicker,
                filteredCurrencies[0].network,
            );
        },
        [],
    );

    const listCurrencyByYouSend = useMemo(() => {
        return getSortedCurrenciesByNetwork(
            protocolController.youSendCurrency,
            currencies.youGetCurrency,
            listOfCurrencies,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        protocolController.youSendCurrency,
        currencies.youGetCurrency,
        listOfCurrencies,
    ]);

    const listCurrencyByYouGet = useMemo(() => {
        return getSortedCurrenciesByNetwork(
            protocolController.youGetCurrency,
            currencies.youSendCurrency,
            listOfCurrencies,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        protocolController.youGetCurrency,
        currencies.youSendCurrency,
        listOfCurrencies,
    ]);

    const onSetLoadingButton = (loading: boolean) => {
        setLoading(prev => ({
            ...prev,
            buttonLoading: loading,
        }));
    };
    const onSetLoadingYouGetBalance = (loading: boolean) => {
        setLoading(prev => ({
            ...prev,
            youGetBalance: loading,
        }));
    };
    const onSetLoadingYouSendBalance = (loading: boolean) => {
        setLoading(prev => ({
            ...prev,
            youSendBalance: loading,
        }));
    };

    const onSetLoadingInit = (loading: boolean) => {
        setLoading(prev => ({
            ...prev,
            init: loading,
        }));
    };

    const onChangeAmountSend = (value: string) => {
        let normalizedAmount = value.replaceAll(/,/g, '.');

        setFrom(prev => {
            return {
                ...prev,
                amountYouSend: normalizedAmount,
                errorMessage: '',
                rate: '',
            };
        });
    };

    const onChangeSearchCrypto = (value: string) => {
        setFrom(prev => {
            return {
                ...prev,
                searchCrypto: value,
            };
        });
    };

    const clearData = useCallback((clearBalanceType: SwapSelector) => {
        setFrom(prev => ({
            ...prev,
            amountYouSend: '',
            amountYouGet: '',
            errorMessage: '',
            totalAmount: '0',
            estimateNetworkFee: '0',
            rate: '',
            ...(clearBalanceType === SwapSelector.YouSend
                ? { balanceYouSend: '0' }
                : {}),
            ...(clearBalanceType === SwapSelector.YouGet
                ? { balanceYouGet: '0' }
                : {}),
        }));
    }, []);

    const onPressProtocol = useCallback(
        (protocol: ProtocolDataWithSupportedTokensFormBEType) => {
            onCloseModalProtocol();
            if (currentTypeProtocolSelected === SwapSelector.YouSend) {
                if (protocol._id === protocolController.youSendCurrency?._id)
                    return;
                setProtocolController(prev => {
                    return {
                        ...prev,
                        youSendCurrency: protocol,
                    };
                });
                setWalletManagement(prev => {
                    return {
                        ...prev,
                        fromWallet: null,
                    };
                });
            } else {
                if (protocol._id === protocolController.youGetCurrency?._id)
                    return;
                setProtocolController(prev => {
                    return {
                        ...prev,
                        youGetCurrency: protocol,
                    };
                });
                setWalletManagement(prev => {
                    return {
                        ...prev,
                        toWallet: null,
                    };
                });
            }
            clearData(currentTypeProtocolSelected!);
        },

        [
            currentTypeProtocolSelected,
            clearData,
            protocolController.youSendCurrency?._id,
            protocolController.youGetCurrency?._id,
            setWalletManagement,
        ],
    );

    const onPressCurrency = useCallback(
        (currency: CurrencyChangeNow) => {
            if (currentTypeProtocolSelected === SwapSelector.YouSend) {
                setCurrencies(prev => {
                    return {
                        ...prev,
                        youSendCurrency: currency,
                    };
                });
            } else {
                setCurrencies(prev => {
                    return {
                        ...prev,
                        youGetCurrency: currency,
                    };
                });
            }
            onCloseCurrency();
            clearData(currentTypeProtocolSelected!);
        },
        [currentTypeProtocolSelected, clearData],
    );

    const protocolSelectedId = useMemo(() => {
        if (currentTypeProtocolSelected === SwapSelector.YouSend) {
            return protocolController.youSendCurrency?._id;
        } else {
            return protocolController.youGetCurrency?._id;
        }
    }, [
        currentTypeProtocolSelected,
        protocolController.youGetCurrency?._id,
        protocolController.youSendCurrency?._id,
    ]);

    const processCheckPair = useCallback(
        async (youGet: CurrencyChangeNow, youSend: CurrencyChangeNow) => {
            try {
                const data = {
                    fromCurrency: youSend.ticker,
                    fromNetwork: youSend.network,
                    toCurrency: youGet.ticker,
                    toNetwork: youGet.network,
                };

                try {
                    const availablePair =
                        await changeNowService.availablePair(data);

                    if (!availablePair[0].flow.standard) {
                        throw new Error('Pair is not available');
                    }
                } catch {
                    setFrom(prev => ({
                        ...prev,
                        errorMessage: t(LanguageKey.swap_pair_not_supported),
                    }));
                    return;
                }

                const resultMinimal =
                    await changeNowService.minimalExchangeAmount({
                        fromCurrency: youSend.ticker,
                        fromNetwork: youSend.network,
                        toCurrency: youGet.ticker,
                        toNetwork: youGet.network,
                    });

                setFrom(prev => ({
                    ...prev,
                    minimalExchangeAmount: resultMinimal.minAmount.toString(),
                }));
            } catch (error) {
                console.log('🚀 processCheckPair ~ error:', error);
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: 'error',
                });
            }
        },
        [changeNowService, t],
    );

    const getEstimateExchangeAmount = useCallback(
        async (
            youGet: CurrencyChangeNow,
            youSend: CurrencyChangeNow,
            fromAmount: string,
        ) => {
            onSetLoadingButton(true);
            try {
                const result = await changeNowService.estimateExchangeAmount({
                    fromCurrency: youSend.ticker,
                    fromNetwork: youSend.network,
                    toCurrency: youGet.ticker,
                    toNetwork: youGet.network,
                    fromAmount,
                });
                const rate = result.toAmount / result.fromAmount;

                setFrom(prev => ({
                    ...prev,
                    amountYouGet: result.toAmount.toString(),
                    forecast: result.transactionSpeedForecast ?? '',
                    rate: `${_rateDefault} ${youSend.ticker.toUpperCase()} ~ ${Utils.formattedBalanceCurrency(rate)} ${youGet.ticker.toUpperCase()}`,
                }));
            } catch (error) {
                console.log('🚀 getEstimateExchangeAmount ~ error:', error);
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: 'error',
                });
            } finally {
                onSetLoadingButton(false);
            }
        },
        [changeNowService, t],
    );

    const handleGetBalanceYouSend = useCallback(
        async (currency: CurrencyChangeNow) => {
            onSetLoadingYouSendBalance(true);
            try {
                const balance = await getBalance(
                    currency,
                    SwapTypeFrom.From,
                    false,
                );
                setFrom(prev => ({
                    ...prev,
                    balanceYouSend: balance.balance,
                    balanceFormattedYouSend: balance.balanceFormatted,
                    youSendPrice: balance.price,
                    decimalsCurrencyYouSend: balance.decimals,
                }));
            } catch (error) {
                console.log('🚀 handleGetBalanceYouSend ~ error:', error);
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: AppToastType.error,
                });
            } finally {
                onSetLoadingYouSendBalance(false);
            }
        },
        [getBalance, t],
    );

    const handleGetBalanceYouGet = useCallback(
        async (currency: CurrencyChangeNow) => {
            onSetLoadingYouGetBalance(true);
            try {
                const balance = await getBalance(
                    currency,
                    SwapTypeFrom.To,
                    true,
                );
                setFrom(prev => ({
                    ...prev,
                    balanceYouGet: balance.balance,
                    balanceFormattedYouGet: balance.balanceFormatted,
                    youGetPrice: balance.price,
                }));
            } catch {
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: AppToastType.error,
                });
            } finally {
                onSetLoadingYouGetBalance(false);
            }
        },
        [getBalance, t],
    );

    const showMinimalExchangeAmount = useMemo(() => {
        try {
            if (+from.amountYouSend === 0) return false;
            return +from.amountYouSend < +from.minimalExchangeAmount;
        } catch {
            return false;
        }
    }, [from.amountYouSend, from.minimalExchangeAmount]);

    const getCurrenciesShow = useMemo(() => {
        if (currentTypeProtocolSelected === SwapSelector.YouSend) {
            return listCurrencyByYouSend;
        } else {
            return listCurrencyByYouGet;
        }
    }, [
        currentTypeProtocolSelected,
        listCurrencyByYouSend,
        listCurrencyByYouGet,
    ]);

    const currencySelected = useMemo(() => {
        if (currentTypeProtocolSelected === SwapSelector.YouSend) {
            return currencies.youSendCurrency;
        } else {
            return currencies.youGetCurrency;
        }
    }, [
        currentTypeProtocolSelected,
        currencies.youGetCurrency,
        currencies.youSendCurrency,
    ]);

    const filterCurrencies = useMemo(() => {
        return getCurrenciesShow.filter(item =>
            item.name
                .toLowerCase()
                .includes(debouncedSearchCrypto.toLowerCase()),
        );
    }, [debouncedSearchCrypto, getCurrenciesShow]);

    const youSendCurrency = useMemo(() => {
        if (!protocolController.youSendCurrency || !from.youSendPrice) return;

        const { rate, sign } = getRate(protocolController.youSendCurrency);
        const amountToCurrency = +from.amountYouSend * rate * from.youSendPrice;

        const formatCurrency =
            commonUtils.formattedBalanceCurrency(amountToCurrency);
        return `${sign} ${formatCurrency}`;
    }, [
        from.amountYouSend,
        from.youSendPrice,
        getRate,
        protocolController.youSendCurrency,
    ]);

    const youGetCurrency = useMemo(() => {
        if (!protocolController.youGetCurrency || !from.youGetPrice) return;

        const { rate, sign } = getRate(protocolController.youGetCurrency);
        const amountToCurrency = +from.amountYouGet * rate * from.youGetPrice;

        const formatCurrency =
            commonUtils.formattedBalanceCurrency(amountToCurrency);
        return `${sign} ${formatCurrency}`;
    }, [
        from.amountYouGet,
        from.youGetPrice,
        getRate,
        protocolController.youGetCurrency,
    ]);

    const onClickMax = useCallback(() => {
        if (!protocolController.youSendCurrency) return;
        setFrom(prev => {
            return {
                ...prev,
                amountYouSend: prev.balanceFormattedYouSend,
            };
        });
    }, [protocolController.youSendCurrency]);

    const disableButton = useMemo(() => {
        if (
            !from.amountYouSend.trim() ||
            !from.balanceFormattedYouSend ||
            +from.amountYouSend <= 0 ||
            showMinimalExchangeAmount ||
            !from.amountYouGet ||
            from.errorMessage
        )
            return true;

        if (+from.amountYouSend > +from.balanceFormattedYouSend) {
            setFrom(prev => ({
                ...prev,
                errorMessage: t(LanguageKey.send_input_error),
            }));
            return true;
        }
        return false;
    }, [
        from.amountYouSend,
        showMinimalExchangeAmount,
        from.balanceFormattedYouSend,
        from.amountYouGet,
        from.errorMessage,
        t,
    ]);

    const updateCurrencyByProtocol = (
        listCurrency: CurrencyChangeNow[] | null,
        key: CurrencyControllerEnum,
    ) => {
        if (!listCurrency?.length) return;

        const isBsc = listCurrency.some(
            item => item.network === NetworkType.BSC,
        );

        const currency = listCurrency.find(item =>
            isBsc
                ? item.ticker === bnbNativeCoin
                : item.network === item.ticker,
        );

        if (!currency) return;

        setCurrencies(prev => {
            return {
                ...prev,
                [key]: currency,
            };
        });
    };

    const listWalletByType = useMemo((): AddressListItemType[] => {
        if (!currencies.youSendCurrency || !currencies.youGetCurrency) {
            return [];
        }
        const type =
            currentTypeProtocolSelected === SwapSelector.YouSend
                ? currencies.youSendCurrency
                : currencies.youGetCurrency;
        const listWallet = getListWalletByCurrency(type);

        if (!listWallet) {
            return [];
        }
        const { walletInfo } = listWallet;
        return walletInfo.addressList;
    }, [
        currencies.youSendCurrency,
        currencies.youGetCurrency,
        currentTypeProtocolSelected,
        getListWalletByCurrency,
    ]);

    const currentWalletSelectedId = useMemo(() => {
        if (currentTypeProtocolSelected === SwapSelector.YouSend) {
            return walletManagement.fromWallet?.id;
        } else {
            return walletManagement.toWallet?.id;
        }
    }, [currentTypeProtocolSelected, walletManagement]);

    const handleYouSendWalletChange = useCallback(
        (wallet: AddressListItemType) => {
            if (wallet.id === walletManagement.fromWallet?.id) return;

            setWalletManagement(prev => ({ ...prev, fromWallet: wallet }));

            //change memory for get balance again
            setCurrencies(prev => ({
                ...prev,
                youSendCurrency: prev.youSendCurrency
                    ? { ...prev.youSendCurrency }
                    : null,
            }));
        },
        [setWalletManagement, walletManagement.fromWallet?.id],
    );
    const handleYouGetWalletChange = useCallback(
        (wallet: AddressListItemType) => {
            if (wallet.id === walletManagement.toWallet?.id) return;

            setWalletManagement(prev => ({ ...prev, toWallet: wallet }));

            //change memory for get balance again
            setCurrencies(prev => ({
                ...prev,
                youGetCurrency: prev.youGetCurrency
                    ? { ...prev.youGetCurrency }
                    : null,
            }));
        },
        [setWalletManagement, walletManagement.toWallet?.id],
    );

    const onSelectWallet = useCallback(
        (wallet: AddressListItemType) => {
            if (
                !currencies.youGetCurrency ||
                !currencies.youSendCurrency ||
                !currentTypeProtocolSelected
            ) {
                return;
            }

            onCloseModalWalletManagement();

            const isYouSend =
                currentTypeProtocolSelected === SwapSelector.YouSend;
            if (isYouSend) {
                handleYouSendWalletChange(wallet);
            } else {
                handleYouGetWalletChange(wallet);
            }

            clearData(currentTypeProtocolSelected);
        },
        [
            currencies.youGetCurrency,
            currencies.youSendCurrency,
            currentTypeProtocolSelected,
            clearData,
            handleYouSendWalletChange,
            handleYouGetWalletChange,
        ],
    );

    useEffect(() => {
        if (currencies.youGetCurrency && currencies.youSendCurrency) {
            processCheckPair(
                currencies.youGetCurrency,
                currencies.youSendCurrency,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencies]);

    useEffect(() => {
        if (
            +debouncedAmountSend > 0 &&
            currencies.youGetCurrency &&
            currencies.youSendCurrency &&
            +debouncedAmountSend >= +from.minimalExchangeAmount
        ) {
            getEstimateExchangeAmount(
                currencies.youGetCurrency,
                currencies.youSendCurrency,
                debouncedAmountSend,
            );
        } else {
            setFrom(prev => ({
                ...prev,
                amountYouGet: '',
                rate: '',
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedAmountSend, currencies]);

    useEffect(() => {
        if (currencies.youSendCurrency) {
            handleGetBalanceYouSend(currencies.youSendCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencies.youSendCurrency]);

    useEffect(() => {
        if (currencies.youGetCurrency) {
            handleGetBalanceYouGet(currencies.youGetCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencies.youGetCurrency]);

    const handleUpdateCurrencyYouSendByProtocol = useCallback(() => {
        updateCurrencyByProtocol(
            listCurrencyByYouSend,
            CurrencyControllerEnum.youSendCurrency,
        );
    }, [listCurrencyByYouSend]);

    useEffect(() => {
        handleUpdateCurrencyYouSendByProtocol();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [protocolController.youSendCurrency]);

    const handleUpdateCurrencyYouGetByProtocol = useCallback(() => {
        updateCurrencyByProtocol(
            listCurrencyByYouGet,
            CurrencyControllerEnum.youGetCurrency,
        );
    }, [listCurrencyByYouGet]);
    useEffect(() => {
        handleUpdateCurrencyYouGetByProtocol();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [protocolController.youGetCurrency]);

    const handleInitData = useCallback(async () => {
        try {
            let listAvailable: CurrencyChangeNow[] = [];
            if (listOfCurrencies.length > 0) {
                listAvailable = listOfCurrencies;
            } else {
                const getParams: string[] = protocolList.map(
                    item => getNetworkBySlip0044(item.slip0044) ?? '',
                );
                const response = await dispatch(
                    getListPairAvailableThunk(getParams),
                ).unwrap();
                listAvailable = response;
            }

            const findCurrencyYouGetByProtocol = listAvailable.find(item => {
                if (protocolController?.youGetCurrency?.slip0044) {
                    const networkName = getNetworkBySlip0044(
                        protocolController?.youGetCurrency?.slip0044,
                    );
                    return (
                        item.ticker === networkName &&
                        item.network === networkName
                    );
                } else {
                    return false;
                }
            });

            const findCurrencyYouSendByProtocol = listAvailable.find(item => {
                if (protocolController?.youSendCurrency?.slip0044) {
                    const networkName = getNetworkBySlip0044(
                        protocolController?.youSendCurrency?.slip0044,
                    );
                    return (
                        item.ticker === networkName &&
                        item.network === networkName
                    );
                } else {
                    return false;
                }
            });

            if (
                !findCurrencyYouSendByProtocol ||
                !findCurrencyYouGetByProtocol
            ) {
                throw new Error('Could not get currency');
            }

            setCurrencies({
                youGetCurrency: findCurrencyYouGetByProtocol,
                youSendCurrency: findCurrencyYouSendByProtocol,
            });
        } catch (error) {
            Utils.showToast({
                msg: t(LanguageKey.common_text_error_title),
                type: AppToastType.error,
            });
            console.log('🚀 ~ handleInitData ~ error:', error);
        } finally {
            onSetLoadingInit(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (pinCode) {
            makeTransaction(pinCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinCode]);

    useEffect(() => {
        handleInitData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        refModal,
        listOfCurrencies: filterCurrencies,
        currencies,
        onShowModalProtocol,
        onCloseModalProtocol,
        protocolList,
        onPressProtocol,
        youSendProtocol: protocolController.youSendCurrency,
        youGetProtocol: protocolController.youGetCurrency,
        protocolSelectedId,
        refCurrencies,
        onCloseCurrency,
        onShowCurrency,
        from,
        onChangeAmountSend,
        loading,
        showMinimalExchangeAmount,
        disableButton,
        currentTypeProtocolSelected,
        currencySelected,
        onPressCurrency,
        onChangeSearchCrypto,
        youSendCurrency,
        youGetCurrency,
        onClickMax,
        refSwapConfirmation,
        onShowSwapConfirmation,
        onCloseSwapConfirmation,
        onConfirmSwap,
        makeTransaction,
        onOpenPinCode,
        onClosePinCode,
        onShowModalWalletManagement,
        onCloseModalWalletManagement,
        refWalletManagement,
        listWalletByType,
        onSelectWallet,
        walletManagement,
        currentWalletSelectedId,
        refSendMaximum,
        onCloseSendMaximumBottomSheet,
        onShowSendMaximumBottomSheet,
    };
};
export default useSwap;
