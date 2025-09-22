import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions, useRoute } from '@react-navigation/native';
import { Address } from '@ton/core';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import appErrorMessage from 'src/core/constants/AppErrorMessage';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
    useSelectedCurrencySetting,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import { getMinFeeForJettonTransfer } from 'src/core/redux/slice/app.slice';
import { setSaveStakingHistory } from 'src/core/redux/slice/staking/staking.slice';
import TonServices from 'src/core/services/TonServices';
import { TonAccountsType } from 'src/core/services/TonServices/type';
import JettonTransfer from 'src/core/services/TonTransactions/jettonTransfer';
import { CreateLockTransferParamType } from 'src/core/services/TonTransactions/tonTransactions.type';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import StakingUtils from 'src/core/utils/staking';
import TonUtils from 'src/core/utils/tonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { TransactionDataType } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.type';
import { getJettons } from 'src/features/coinDetails/ton/ton.coinDetails.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { StakingTransactionParams } from '../stakingTransaction/stakingTransaction.type';
import { DayItemType, LoadingPageType, LockProp } from './lock.type';

const useLock = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const stakingPoolData = useRoute<LockProp>().params;
    const { adminAddress } = stakingPoolData;
    const { t } = useTranslation();
    const listPeriod = stakingPoolData?.lockPeriod || [];
    const selectedCryptoData = useProtocolSelected();
    const selectedAccountId = useAppSelector(getAccountId);
    const minFeeFromRemoteConfig = useAppSelector(getMinFeeForJettonTransfer);
    const wallet = useCurrentWallet();

    const dispatch = useAppDispatch();
    const currencySetting = useSelectedCurrencySetting();

    const tonAddressData = useTonAddressData();
    const [currentDays, setCurrentDays] = useState<DayItemType>();
    const [currentLockAmount, setCurrentLockAmount] = useState<string>('');
    const [errorTransaction, setErrorTransaction] = useState<string>('');
    const [isShowPinCode, setIsShowPinCode] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>('');
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [disableScreen, setDisableScreen] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<LoadingPageType>({
        lock: false,
        confirmation: false,
    });
    const refModalConfirmation = useRef<BottomSheetModal>(null);
    const [transactionData, setTransactionData] =
        useState<TransactionDataType>();

    const onShowLoadingLock = () => {
        setPageLoading(prev => ({ ...prev, lock: true }));
    };

    const onHideLoadingLock = () => {
        setPageLoading(prev => ({ ...prev, lock: false }));
    };

    const handleShowPinCode = () => {
        closeBottomConfirmation();
        setIsShowPinCode(true);
    };
    const handleClosePinCode = () => {
        setIsShowPinCode(false);
    };

    const showBottomConfirmation = () => {
        refModalConfirmation.current?.present();
    };

    const closeBottomConfirmation = () => {
        refModalConfirmation.current?.dismiss();
    };

    const handleOnClickLock = async () => {
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
        }
        onShowLoadingLock();
        const isSuccess = await handleLock();
        onHideLoadingLock();

        if (isSuccess) {
            showBottomConfirmation();
        }
    };
    const handleShowErrorLock = () => {
        Utils.showToast({
            msg: t(LanguageKey.staking_text_error),
            type: AppToastType.error,
        });
    };
    const handleShowErrorConfirmation = () => {
        Utils.showToast({
            msg: t(LanguageKey.staking_text_error),
            type: AppToastType.error,
        });
        closeBottomConfirmation();
        onHideLoadingLock();
    };
    const getAdminAddressData = async () => {
        const tonServices = new TonServices();
        const getTonAccountsRes = await tonServices.getAccounts({
            address: Address.parse(adminAddress),
        });

        if (!getTonAccountsRes.isSuccess) {
            return;
        }

        const tonAccountData = getTonAccountsRes.data as TonAccountsType;
        return tonAccountData;
    };

    const handleLock = async () => {
        const adminAddressData = await getAdminAddressData();
        if (!adminAddressData) {
            return;
        }
        return await handleCreateLockTransfer(adminAddressData);
    };

    const createBaseTransaction = async (
        jettonTransferData: CreateLockTransferParamType,
    ) => {
        const jettonTransferServices = new JettonTransfer();
        const emulateTonTransactionDataRes =
            await jettonTransferServices.createLockTransfer(jettonTransferData);
        if (
            !emulateTonTransactionDataRes ||
            emulateTonTransactionDataRes?.fee?.event?.actions?.some(
                action => action.status === 'failed',
            )
        ) {
            return;
        }
        const { fee } = emulateTonTransactionDataRes;

        const networkFee = fee ? fee?.event?.extra : 0;
        const absNetworkFee = Math.abs(networkFee) * 1.1;

        const minFeeForJettonTransfer =
            TonUtils.getMinFeeForJettonTransaction(2);

        const finalNetworkFee =
            minFeeForJettonTransfer > absNetworkFee
                ? minFeeForJettonTransfer
                : absNetworkFee;

        const fromAccountData = jettonTransferData?.fromAccountData;

        if (
            fromAccountData &&
            fromAccountData?.balance < finalNetworkFee &&
            selectedCryptoData?.nativeToken.decimal
        ) {
            const networkFeeValue = TonUtils.formatBigNumber(
                finalNetworkFee.toString(),
                selectedCryptoData?.nativeToken.decimal,
            );
            setErrorTransaction(
                t(LanguageKey.evm_not_enough_amount_to_cover_transaction_fee, {
                    amount: `≈ ${networkFeeValue}`,
                    coin_name: selectedCryptoData.nativeToken?.symbol,
                }),
            );
        } else {
            return emulateTonTransactionDataRes;
        }
    };

    const handleCreateLockTransfer = async (
        recipientAccountData: TonAccountsType,
    ) => {
        try {
            const tonServices = new TonServices();

            const currentAmount = TonUtils.toBigNumber(
                currentLockAmount,
                stakingPoolData?.decimal,
            );

            const privateKey = tonAddressData?.privateKey;
            if (!privateKey) {
                throw new Error(appErrorMessage.cannotGetPrivateKey);
            }

            const getAccountRes = await tonServices.getAccounts({
                address: Address.parse(tonAddressData?.address ?? ''),
            });

            if (
                !getAccountRes.isSuccess ||
                !recipientAccountData ||
                !currentAddress
            ) {
                throw new Error(appErrorMessage.cannotCreateBaseTransaction);
            }

            const fromAccountData = getAccountRes.data as TonAccountsType;

            let jettonTransferData: CreateLockTransferParamType = {
                valueNano: BigInt(currentAmount),
                recipientAddress: adminAddress,
                privateKey: privateKey,
                version: tonAddressData?.version,
                publicKey: tonAddressData?.publicKey ?? '',
                estimateFee: true,
                fromAccountData: fromAccountData,
                recipientAccountData: recipientAccountData,
                memo: `Lock Period: ${currentDays?.title} - ${overviewStaking?.apr}% - ${Utils.formatNumber(overviewStaking?.reward)}`,
                jettonAddress: currentAddress,
                minFeeFromRemoteConfig: minFeeFromRemoteConfig,
            };

            const emulateJettonTransactionDataRes =
                await createBaseTransaction(jettonTransferData);

            if (!emulateJettonTransactionDataRes) {
                return;
            }

            const currentFeeData = emulateJettonTransactionDataRes.fee;

            const currentNetworkFee = BigInt(
                Math.ceil(Math.abs(currentFeeData?.event.extra ?? 0) * 1.1),
            );

            jettonTransferData = {
                ...jettonTransferData,
                networkFee: currentNetworkFee,
                currentSeqno: emulateJettonTransactionDataRes.currentSeqno,
            };

            const jettonTransactionDataRes =
                await createBaseTransaction(jettonTransferData);
            if (!jettonTransactionDataRes) {
                throw new Error(appErrorMessage.cannotCreateBaseTransaction);
            }

            const { transferData, fee } = jettonTransactionDataRes;

            const finalNetworkFee = BigInt(Math.abs(fee?.event.extra ?? 0));

            const tonTransactionData: TransactionDataType = {
                toAddress: adminAddress,
                fromAddress: tonAddressData.address ?? '',
                amountSend: parseFloat(currentAmount),
                fee: Number(finalNetworkFee),
                adminAddress: adminAddress,
                adminFee: 0,
                adminPercent: 0,
                base64EncodedTransaction: transferData.messageBOCString,
            };
            setTransactionData(tonTransactionData);
            return true;
        } catch (error) {
            console.log('🚀 ~ useLock ~ error:', error);
            handleShowErrorLock();
        } finally {
            onHideLoadingLock();
        }
    };

    const createStakingTransactionData = () => {
        const gasFeeCurrency = TonUtils.getTonBalanceToCurrency(
            parseFloat(gasFee),
            currencySetting,
            selectedCryptoData?.price,
        );
        const gasFeeCurrencyTitle = `≈ ${gasFeeCurrency.currency?.sign}${gasFeeCurrency.balance}`;

        const stakingTransactionData: StakingTransactionParams = {
            data1: [
                {
                    title: LanguageKey.common_text_rewards,
                    value: `${Utils.formattedBalanceCurrency(overviewStaking.reward)} ${stakingPoolData.earn.symbol}`,
                },
                {
                    title: LanguageKey.common_text_wallet,
                    value: WalletUtils.getShortAddress(
                        tonAddressData?.address ?? '',
                    ),
                },
                {
                    title: LanguageKey.transaction_detail_date,
                    value: moment().format('YYYY/MM/DD'),
                },
                {
                    title: LanguageKey.common_text_unlock_on,
                    value: moment()
                        .add(currentDays?.value ?? 0, 'days')
                        .format('YYYY/MM/DD'),
                },
            ],
            data2: [
                {
                    title: LanguageKey.nft_estimate_gas_fee,
                    value: gasFee,
                    value2: gasFeeCurrencyTitle,
                },
            ],
            lockAmount: `${Utils.formattedBalanceCurrency(parseFloat(currentLockAmount))} ${stakingPoolData.lock.symbol}`,
            lockAmountCurrency: '',
        };
        return stakingTransactionData;
    };
    const progressMakeTransaction = async () => {
        onShowLoadingLock();
        handleClosePinCode();
        closeBottomConfirmation();
        if (!transactionData?.base64EncodedTransaction) {
            handleShowErrorConfirmation();
            return;
        }
        const tonServices = new TonServices();
        const sendMessageToBlockchainRes =
            await tonServices.sendMessageToBlockchain({
                boc: transactionData?.base64EncodedTransaction,
            });
        if (sendMessageToBlockchainRes.isSuccess) {
            handleSaveDataLocal();
            const transactionData = createStakingTransactionData();
            navigation.dispatch(
                StackActions.replace(
                    HomeStackScreenKey.StakingTransaction,
                    transactionData,
                ),
            );
        } else {
            handleShowErrorConfirmation();
        }
    };
    const handleSaveDataLocal = () => {
        if (!wallet || !selectedAccountId) {
            return;
        }
        const data = calculateOverviewStaking();

        dispatch(
            setSaveStakingHistory({
                idAccount: selectedAccountId,
                walletAddressAndSlip0044: `${wallet.address}_${selectedCryptoData?.slip0044}`,
                data: {
                    reward: `${Utils.formattedBalanceCurrency(overviewStaking.reward)} ${stakingPoolData.earn.symbol}`,
                    estimateGasFee: gasFee,
                    lockAmount: `${Utils.formattedBalanceCurrency(+currentLockAmount)} ${stakingPoolData.lock.symbol}`,
                    unClockOn: moment()
                        .add(currentDays?.value ?? 0, 'days')
                        .format('YYYY/MM/DD'),
                    lockedDate: moment().toString(),
                    walletAddress: tonAddressData?.address ?? '',
                    apr: `${data.apr}%`,
                    adminAddress: stakingPoolData.adminAddress,
                    lockPeriod: currentDays?.title || '',
                },
            }),
        );
    };
    const handleGetBalance = async () => {
        try {
            const res = await dispatch(getJettons(tonAddressData)).unwrap();

            if (!res.balances.length) {
                handleShowErrorGetBalance();
                return;
            }

            const jettonAddress = Address.parse(
                stakingPoolData.tokenContractAddress,
            ).toRawString();
            const jettonBalance = res.balances.find(
                item => item.jetton.address === jettonAddress,
            );

            if (jettonBalance) {
                const balanceValue = TonUtils.formatBigNumber(
                    jettonBalance.balance.toString(),
                    stakingPoolData.decimal,
                );
                setCurrentAddress(jettonBalance?.wallet_address.address);
                setBalance(balanceValue + '');
            } else {
                handleShowErrorGetBalance();
            }
        } catch (error) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            console.log('🚀 ~ handleGetBalance ~ error:', error);
        }
    };
    const handleShowErrorGetBalance = () => {
        setErrorTransaction(
            t(LanguageKey.error_finish_insufficient_jetton_balance),
        );
        setDisableScreen(true);
    };
    const handleGetMaxBalance = () => {
        setCurrentLockAmount(balance);
    };
    const handleChangeAmount = (value: string) => {
        let normalizedAmount = value.replace(/,/g, '.');
        setCurrentLockAmount(normalizedAmount);
    };
    const handleValidateInputRealtime = () => {
        setErrorTransaction('');
        if (+currentLockAmount > +balance) {
            setErrorTransaction(t(LanguageKey.send_input_error));
            return;
        }
        if (
            +currentLockAmount > 0 &&
            +currentLockAmount < stakingPoolData.minimum
        ) {
            setErrorTransaction(
                t(LanguageKey.stake_minimum_error, {
                    amount: stakingPoolData.minimum,
                }),
            );
        }
    };
    const calculateOverviewStaking = useCallback(() => {
        if (!currentDays || !currentLockAmount) {
            return {
                reward: 0,
                apr: 0,
            };
        }
        const overviewStaking = StakingUtils.calculateOverviewStaking({
            interestRate: currentDays.apr,
            principal: Number(currentLockAmount),
            days: currentDays.value,
        });
        return overviewStaking;
    }, [currentDays, currentLockAmount]);

    const isShowLockOverview = Number(currentLockAmount) > 0 && !!currentDays;
    const networkFeeValue = TonUtils.formatBigNumber(
        transactionData?.fee?.toString() ?? '0',
        selectedCryptoData?.nativeToken?.decimal || 9,
    );
    const gasFee = `${networkFeeValue} ${selectedCryptoData?.symbol}`;
    const networkFeeValueString = `≈ ${gasFee}`;
    const overviewStaking = calculateOverviewStaking();
    const isDisabledLock = isShowLockOverview;
    const showBalance = `${Utils.formattedBalanceCurrency(
        Number(balance),
    )} ${stakingPoolData.lock.name}`;

    useEffect(() => {
        handleGetBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        handleValidateInputRealtime();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLockAmount]);

    return {
        currentDays,
        setCurrentDays,
        refModalConfirmation,
        currentLockAmount,
        setCurrentLockAmount,
        isShowLockOverview,
        stakingPoolData,
        listPeriod,
        overviewStaking,
        networkFeeValueString,
        handleOnClickLock,
        pageLoading,
        isDisabledLock,
        t,
        errorTransaction,
        isShowPinCode,
        handleShowPinCode,
        handleClosePinCode,
        progressMakeTransaction,
        balance,
        handleGetMaxBalance,
        handleChangeAmount,
        disableScreen,
        newUI,
        showBalance,
    };
};

export default useLock;
