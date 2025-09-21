import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import EnvConfig from 'src/core/constants/EnvConfig';
import AppToastType from 'src/core/enum/AppToastType';
import { CoinType } from 'src/core/enum/CoinType';
import Slip0044 from 'src/core/enum/Slip0044';
import {
    TransactionDetailType,
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    useCurrentWallet,
    useProtocolSelected,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import TonServices from 'src/core/services/TonServices';
import { EventDetail, NftTonNewItem } from 'src/core/services/TonServices/type';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import {
    default as commonUtils,
    default as Utils,
} from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

type TransactionDetailsProp = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.TransactionDetails
>;
const useTransactionDetails = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const { t } = useTranslation();
    const theme = useAppTheme();
    const params = useRoute<TransactionDetailsProp>().params;
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const tonServices = new TonServices();
    const [tonNFTMetadata, setTonNFTMetadata] = useState<NftTonNewItem>();
    const [loading, setLoading] = useState<boolean>(true);
    const transactionData = params?.transactionData;
    const currentWallet = useCurrentWallet();
    const tonAddressData = useTonAddressData();
    const [detailTransaction, setDetailTransaction] =
        useState<EventDetail | null>(null);
    const [networkFeeTon, setNetworkFeeTon] = useState<{
        fee: number;
        totalChange: number;
        ton_attached: number;
    } | null>(null);
    const isCommonTransactionSmartContract =
        transactionData.type === TransactionType.SmartContractExec;
    const [isTransactionCallSmartContract, setIsTransactionCallSmartContract] =
        useState<boolean>(false);
    const isReceive = params.transactionData.type === TransactionType.Receive;

    const backAction = () => {
        if (params.transactionData?.backToTop) {
            navigation.dispatch(StackActions.popToTop());
        } else {
            navigation.goBack();
        }
    };
    const isEVM = transactionData?.coinType === CoinType.Ethereum;
    const currentProtocol = useProtocolSelected();

    const getStatusEVM = () => {
        switch (transactionData.confirmations) {
            case 0:
                return TransactionStatusType.Failed;
            case 1:
                return TransactionStatusType.Completed;
            case 2:
                return TransactionStatusType.Pending;
            default:
                return TransactionStatusType.Pending;
        }
    };

    const status = isEVM ? getStatusEVM() : transactionData?.status;

    const isSuccess = status !== TransactionStatusType.Pending;

    const isSent = transactionData?.type === TransactionType.Sent;
    const networkFee = transactionData.fee ? transactionData?.fee : 0;
    const adminFee = transactionData.adminFee
        ? Number(transactionData?.adminFee)
        : 0;
    const amountSend = Number(transactionData.amountSend);
    const estimatedGasFee =
        isEVM && transactionData?.isNative
            ? Number(transactionData?.estimatedGasFee)
            : 0;
    const totalAmount =
        (transactionData.isNative ? networkFee : 0) +
        (isReceive ? 0 : adminFee) +
        amountSend +
        estimatedGasFee;

    const getTonFinalAmount = (
        amount: number,
        finalDecimal: number | undefined,
        finalSymbol: string,
        isNative?: boolean,
    ) => {
        const amountWithDecimal = TonUtils.formatBigNumber(
            amount.toString(),
            finalDecimal,
        );
        if (isNative) {
            return `${TonUtils.formatTonBalance(
                amountWithDecimal,
            )} ${finalSymbol}`;
        } else {
            if (amountWithDecimal < 1) {
                return `${amountWithDecimal.toFixed(finalDecimal ?? 9)} ${finalSymbol}`;
            } else {
                return `${Utils.formattedBalanceCurrency(
                    amountWithDecimal,
                )} ${finalSymbol}`;
            }
        }
    };

    const handleFeeValueFlow = (detail: EventDetail | null) => {
        if (!detail || !detail.value_flow || !tonAddressData?.address) {
            return null;
        }
        const addressWallet = TonUtils.getRawAddress(tonAddressData?.address);
        const fee = detail.value_flow.find(
            item => item.account.address === addressWallet,
        );

        const isCalledContractTx = detail.actions.find(
            item => item.type === TransactionDetailType.SmartContractExec,
        );

        if (!fee) {
            return null;
        }

        return {
            fee: fee?.fees,
            totalChange: fee?.ton,
            ton_attached:
                isCalledContractTx?.SmartContractExec.ton_attached ?? 0,
        };
    };

    const convertTitle = ({
        amount,
        gasFee,
        isNetworkFee,
    }: {
        amount: number;
        gasFee?: boolean;
        isNetworkFee?: boolean;
    }) => {
        if (!transactionData?.coinType) return '';

        const getSymbol = () => {
            if (gasFee || isSendEVMNFT)
                return transactionData.protocolData?.symbol;
            return (
                transactionData?.tokenSymbol ??
                transactionData.protocolData?.symbol
            );
        };
        let finalDecimal = transactionData.nativeDecimal;
        let finalSymbol = t(LanguageKey.currency_ton);

        switch (transactionData.coinType) {
            case CoinType.Bitcoin:
                return `${Utils.formattedBalanceCurrency(
                    parseFloat(BitcoinUtils.getBitcoinFromSatoshi(amount)),
                )} ${t(LanguageKey.currency_bitcoin)}`;

            case CoinType.Ton:
                if (!transactionData.isNative) {
                    if (isNetworkFee) {
                        finalDecimal = transactionData.nativeDecimal;
                        finalSymbol = t(LanguageKey.currency_ton);
                    } else {
                        finalDecimal = transactionData.decimal;
                        finalSymbol = transactionData.tokenSymbol ?? '';
                    }
                }
                return getTonFinalAmount(
                    amount,
                    finalDecimal,
                    finalSymbol,
                    isNetworkFee === true
                        ? isNetworkFee
                        : transactionData.isNative,
                );

            case CoinType.Ethereum:
                return `${Utils.formattedBalanceCurrency(amount)} ${getSymbol()}`;

            default:
                return '';
        }
    };

    const onViewOnScan = () => {
        if (transactionData.coinType === CoinType.Ethereum) {
            Linking.openURL(
                `${transactionData.protocolData?.blockExplorerUrl}/tx/${transactionData.txHash}`,
            );
        } else {
            const defaultBaseUrl =
                params.transactionData.coinType === CoinType.Ton
                    ? EnvConfig.TON_VIEWER_TRANSACTION_URL
                    : EnvConfig.BLOCK_CYPHER_PUSH_TRANSACTION_DETAIL_ULR;
            Linking.openURL(
                `${transactionData.protocolData?.transactionScanURL ?? defaultBaseUrl}${transactionData?.txHash}`,
            );
        }
    };

    const handleTransactionCallSmartContract = (detail: EventDetail | null) => {
        if (!detail || !detail.actions) {
            return false;
        }
        const isCalledContractTx = detail.actions.find(
            item => item.type === TransactionDetailType.SmartContractExec,
        );

        if (isCalledContractTx) {
            return true;
        }

        return false;
    };

    const copyAction = () => {
        Clipboard.setStringAsync(transactionData?.txHash ?? '');
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };
    const isTonNFTTransfer =
        !!transactionData.amountNFT &&
        (transactionData.type === TransactionType.SendNFT ||
            transactionData.type === TransactionType.ReceiveNFT);
    const isSendEVMNFT =
        transactionData?.isSendNFT ||
        transactionData.type === TransactionType.SendNFT ||
        transactionData.type === TransactionType.ReceiveNFT;
    const isReceiveTonNFT =
        isTonNFTTransfer && transactionData.type === TransactionType.ReceiveNFT;
    const convertNFTFeeTon = (gasFee: string) => {
        if (!currentProtocol) {
            return gasFee;
        }
        const convertEstimateGasFee = commonUtils.convertBigIntFollowDecimals(
            gasFee,
            currentProtocol.nativeToken.decimal,
        );
        return convertEstimateGasFee;
    };

    let totalAmountDisplay = '';

    if (isTonNFTTransfer) {
        const nftIndex = tonNFTMetadata?.index ?? 0;

        if (isReceiveTonNFT) {
            totalAmountDisplay = `#${nftIndex}`;
        } else {
            const nftFee = transactionData.fee
                ? convertNFTFeeTon(
                      (transactionData.fee + adminFee || 0).toString(),
                  )
                : '';
            totalAmountDisplay = `#${nftIndex} / ${nftFee} ${CoinType.Ton.toUpperCase()}`;
        }
    } else if (isSendEVMNFT) {
        totalAmountDisplay = transactionData?.totalNFT ?? '';
    } else {
        totalAmountDisplay = convertTitle({ amount: totalAmount });
    }

    useEffect(() => {
        const getDataNFTTonTransfer = async () => {
            console.log(transactionData.type);
            try {
                if (
                    currentProtocol &&
                    currentProtocol.slip0044 === Slip0044.Ton
                ) {
                    if (transactionData?.nftAddress && isTonNFTTransfer) {
                        setLoading(true);
                        const getNFTMetadataResult =
                            await tonServices.getDetailNFTByAddressUsingAPI({
                                address: transactionData?.nftAddress,
                            });

                        if (getNFTMetadataResult.isSuccess) {
                            const nftMetadataData = getNFTMetadataResult.data;
                            setTonNFTMetadata(nftMetadataData);
                        }
                    }
                    const getDetailTransactionResult =
                        await tonServices.getDetailEventsUsingAPI({
                            eventId: transactionData?.txHash ?? '',
                        });
                    if (getDetailTransactionResult) {
                        setDetailTransaction(getDetailTransactionResult);

                        const networkFeeValueFlow = handleFeeValueFlow(
                            getDetailTransactionResult,
                        );
                        const transactionCallSmartContract =
                            handleTransactionCallSmartContract(
                                getDetailTransactionResult,
                            );

                        setNetworkFeeTon(networkFeeValueFlow ?? null);
                        setIsTransactionCallSmartContract(
                            transactionCallSmartContract,
                        );
                    }
                }
                return;
            } catch (error) {
                console.log('fetch getDataNFTTonTransfer error', error);
            } finally {
                setLoading(false);
            }
        };
        getDataNFTTonTransfer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionData]);

    return {
        theme,
        transactionData,
        isSent,
        status,
        fee: networkFee,
        adminFee,
        amountSend,
        convertTitle,
        onViewOnScan,
        backAction,
        copyAction,
        isSendEVMNFT,
        isEVM,
        isSuccess,
        isTonNFTTransfer,
        isReceiveTonNFT,
        totalAmountDisplay,
        currentWallet,
        newUI,
        insets,
        tonNFTMetadata,
        loading,
        detailTransaction,
        setDetailTransaction,
        networkFeeTon,
        isTransactionCallSmartContract,
        isCommonTransactionSmartContract,
    };
};

export default useTransactionDetails;
