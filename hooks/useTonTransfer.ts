import { Seqno } from '@ton-api/client';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { internal, SendMode, toNano } from '@ton/ton';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import LanguageKey from '../locales/LanguageKey';
import {
    ProtocolData,
    WalletInfo,
    WalletKey,
} from '../redux/slice/account/account.type';
import {
    SettingCurrencyType,
    TokenDataType,
} from '../redux/slice/crypto/crypto.types';
import TonServices from '../services/TonServices';
import {
    TonAccountsType,
    TransactionDataType,
} from '../services/TonServices/type';
import { EstimateMaxParamType, TransferDataType } from '../types/ton';
import Utils from '../utils/commonUtils';
import { default as TonUtils, default as tonUtils } from '../utils/tonUtils';
import { useWalletBalanceCustomize } from './useBalance';
import { useCurrencyRateConversion } from './useCrypto';
import { useCurrentProtocolSelected } from './useProtocols';
import { useCurrentWalletSelected } from './useWallet';

export const useTonTransfer = () => {
    const protocolBaseData = useCurrentProtocolSelected();
    const { tokenInfo } = useWalletBalanceCustomize();
    const [getMaxAmountLoading, setGetMaxAmountLoading] =
        useState<boolean>(false);

    const tonAddressData = useCurrentWalletSelected();
    const [transferData, setTransferData] = useState<TransferDataType>();

    const currencySelected = useCurrencyRateConversion() as SettingCurrencyType;
    const [transactionData, setTransactionData] =
        useState<TransactionDataType>();

    const adminFeeValue = Utils.formatBigNumber(
        transactionData?.adminFee?.toString() ?? '0',
        protocolBaseData?.nativeToken.decimal,
    );

    const adminFee = useMemo(() => {
        return `${TonUtils.formatTonBalance(adminFeeValue)} ${tokenInfo.symbol}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminFeeValue]);

    const adminFeeCurrency = useMemo(() => {
        return TonUtils.getTonBalanceToCurrency(
            adminFeeValue,
            currencySelected,
            protocolBaseData?.price,
        );
    }, [adminFeeValue, currencySelected, protocolBaseData?.price]);

    const subAdminFee = useMemo(() => {
        return currencySelected?.sign && adminFeeCurrency.balance != null
            ? `≈ ${currencySelected.sign}${adminFeeCurrency.balance}`
            : '';
    }, [currencySelected?.sign, adminFeeCurrency.balance]);

    const networkFeeValue = useMemo(() => {
        return Utils.formatBigNumber(
            transactionData?.fee?.toString() ?? '0',
            protocolBaseData?.nativeToken.decimal,
        );
    }, [transactionData?.fee, protocolBaseData?.nativeToken.decimal]);

    const networkFeeCurrency = useMemo(() => {
        return TonUtils.getTonBalanceToCurrency(
            networkFeeValue,
            currencySelected,
            protocolBaseData?.price,
        );
    }, [networkFeeValue, currencySelected, protocolBaseData?.price]);

    const networkFee = useMemo(() => {
        return `${TonUtils.formatTonBalance(networkFeeValue)} ${tokenInfo.symbol}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkFeeValue]);

    const subNetworkFee = useMemo(() => {
        return `≈ ${currencySelected?.sign}${networkFeeCurrency.balance}`;
    }, [currencySelected.sign, networkFeeCurrency.balance]);

    const getReceiveAddressData = async (toAddress: string) => {
        const tonServices = new TonServices();
        const getTonAccountsRes = await tonServices.getAccounts(toAddress);
        if (getTonAccountsRes.isSuccess) {
            const tonAccountData = getTonAccountsRes.data as TonAccountsType;
            return tonAccountData;
        } else {
            return undefined;
        }
    };

    const validateProtocolData = (
        protocol: ProtocolData | undefined,
        wallet: WalletInfo | undefined,
        tokenInfo: TokenDataType | undefined,
    ) => {
        const adminAddress = protocol?.beneficiary?.walletAddress;
        const senderAddress = wallet?.address;
        const walletBalance = tokenInfo?.balance;
        const adminPercent = protocolBaseData?.coinTransferFee ?? 0;

        if (
            !adminAddress ||
            !senderAddress ||
            walletBalance === undefined ||
            walletBalance === null
        ) {
            throw new Error(t(LanguageKey.common_text_error_title));
        }

        return {
            adminAddress,
            senderAddress,
            walletBalance,
            adminPercent,
        };
    };
    const estimateMax = async ({
        publicKey,
        recipientAddress,
        adminAddress,
        adminPercent,
        walletAddress,
        balance,
    }: EstimateMaxParamType): Promise<
        { maxAmount: number; maxAdminFee: number; totalFee: number } | undefined
    > => {
        try {
            // Create transaction with 2 messages: 1 message for admin fee and 1 message to transfer all remaining balance.
            // Increase original balance by 20% for emulate transaction params.
            // Then emulate this transaction and get the fee.
            // Finally calculate maxAmount = original balance - fee - adminFee
            const initializeWallet = await TonUtils.initializeWallet(publicKey);
            const tonServices = new TonServices();
            const emulatePercent = 1.05;

            const { secretKey } = await mnemonicToPrivateKey(
                await mnemonicNew(),
            );
            const adminFeeNano = Number(balance) * adminPercent;

            const adminFee = BigInt(Math.floor(adminFeeNano));
            const sendAmount = BigInt(balance);

            console.log('=========================================');
            console.log('adminFee', adminFee);
            console.log('sendAmount', sendAmount);

            const internalMessages = [
                internal({
                    to: recipientAddress,
                    bounce: true,
                    value: sendAmount,
                }),
            ];

            if (adminFee > 0) {
                internalMessages.push(
                    internal({
                        to: adminAddress,
                        bounce: true,
                        value: adminFee,
                        body: 'Admin fee',
                    }),
                );
            }

            const tonSeqnoData = (await tonServices.getAccountSeqno({
                address: walletAddress,
            })) as Seqno;
            if (!tonSeqnoData) return undefined;

            const transferData = await TonUtils.createExternalTransfer({
                internalMessages,
                sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
                contract: initializeWallet.contract,
                seqno: tonSeqnoData.seqno,
                secretKey,
            });

            const fee = await TonUtils.estimateFee({
                boc: transferData.messageBOCString,
                address: walletAddress,
                balance: Number(toNano(100)),
            });

            if (!fee) {
                console.error('estimateFee error', fee);
                return undefined;
            }

            const baseBalance = Number(balance);
            const networkFee = Math.abs(fee.event?.extra) * emulatePercent;
            const remainBalance = baseBalance - networkFee;
            const adminFeeNumber = remainBalance * adminPercent;

            const totalFee = networkFee + adminFeeNumber;

            const maxAmount = remainBalance - adminFeeNumber;

            return { maxAmount, maxAdminFee: adminFeeNumber, totalFee };
        } catch (error) {
            console.error('createTransfer error:', error);
            return undefined;
        }
    };

    const formatFeeAndCurrency = () => {
        const networkFeeValue = Utils.formatBigNumber(
            transactionData?.fee?.toString() ?? '0',
            protocolBaseData?.nativeToken.decimal,
        );
        const networkFeeCurrency = TonUtils.getTonBalanceToCurrency(
            networkFeeValue,
            currencySelected,
            protocolBaseData?.price,
        );

        const networkFee = `${tonUtils.formatTonBalance(networkFeeValue)} ${tokenInfo.symbol}`;

        const subNetworkFee = `≈ ${currencySelected?.sign}${networkFeeCurrency.balance}`;

        return {
            networkFee,
            subNetworkFee,
        };
    };

    const createToTransactionAfterCheckAddress = async (
        recipientAccountData: TonAccountsType,
        toAddress: string,
        amountSend: number,
        maxAmountWithDecimal: number,
        memo: string,
        maxAdminFee: number,
        tonAdminBounce: boolean,
    ) => {
        try {
            const convertAmountWithDecimal = TonUtils.toBigNumber(
                amountSend,
                tokenInfo.decimals,
            );
            const isSendMaxAmount = amountSend === Number(maxAmountWithDecimal);
            const adminAddress = protocolBaseData?.beneficiary?.walletAddress;
            const adminPercent = protocolBaseData?.coinTransferFee ?? 0;
            if (
                !adminAddress ||
                !tonAddressData ||
                !tonAddressData?.publicKey
            ) {
                throw new Error(t(LanguageKey.common_text_error_title));
            }
            const tonServices = new TonServices();

            const { secretKey } = await mnemonicToPrivateKey(
                await mnemonicNew(),
            );

            const adminValueNano = isSendMaxAmount
                ? maxAdminFee
                : BigInt(
                      Math.ceil(
                          parseFloat(convertAmountWithDecimal) * adminPercent,
                      ),
                  );
            const getAccountRes = await tonServices.getAccounts(
                tonAddressData?.address,
            );

            if (getAccountRes.isSuccess && recipientAccountData) {
                const tonTransactionDataRes = await tonUtils.createTransfer({
                    valueNano: convertAmountWithDecimal,
                    recipientAddress: toAddress,
                    adminAddress: adminAddress,
                    adminValueNano: adminValueNano.toString(),
                    publicKey: tonAddressData?.publicKey,
                    estimateFee: true,
                    fromAccountData: getAccountRes.data as TonAccountsType,
                    recipientAccountData: recipientAccountData,
                    memo: memo,
                    tonAdminBounce: tonAdminBounce,
                    secretKey,
                });
                if (!tonTransactionDataRes) {
                    throw new Error(t(LanguageKey.common_text_error_title));
                }
                const { transferData, fee } = tonTransactionDataRes;

                setTransferData(transferData);

                const networkFee = fee ? fee?.event?.extra : 0;

                const tonTransactionData: TransactionDataType = {
                    toAddress: toAddress,
                    fromAddress: tonAddressData.address ?? '',
                    amountSend: parseFloat(convertAmountWithDecimal),
                    fee: Number(networkFee),
                    adminAddress: adminAddress,
                    adminFee: Number(adminValueNano),
                    adminPercent: adminPercent,
                    base64EncodedTransaction: transferData.messageBOCString,
                };
                setTransactionData(tonTransactionData);
            } else {
                throw new Error(t(LanguageKey.common_text_error_title));
            }
        } catch {
            throw new Error(t(LanguageKey.common_text_error_title));
        }
    };

    const getMaxAmount = async (toAddress: string) => {
        try {
            const adminAddress = protocolBaseData?.beneficiary?.walletAddress;
            const adminPercent = protocolBaseData?.coinTransferFee ?? 0;

            if (
                !adminAddress ||
                !tonAddressData ||
                !tonAddressData?.publicKey ||
                !tokenInfo
            ) {
                throw new Error(t(LanguageKey.common_text_error_title));
            }
            setGetMaxAmountLoading(true);
            const maxAmountRes = await estimateMax({
                publicKey: tonAddressData?.publicKey,
                recipientAddress: toAddress,
                adminAddress: adminAddress,
                adminPercent: adminPercent,
                balance: Number(tokenInfo?.balance),
                walletAddress: tonAddressData.address,
            });
            if (!maxAmountRes) {
                throw new Error(t(LanguageKey.common_text_error_title));
            }
            return maxAmountRes;
        } catch (error) {
            console.error('getMaxAmount error', error);
        } finally {
            setGetMaxAmountLoading(false);
        }
    };

    const handleConfirmTransfer = async (
        amountSend: string,
        walletKey: WalletKey,
        toAddress: string,
        memo: string,
        maxAdminFee: number,
        tonAdminBounce = false,
        isSendMaxAmount = false,
    ) => {
        const tonServices = new TonServices();
        const { adminAddress, adminPercent } = validateProtocolData(
            protocolBaseData,
            tonAddressData,
            tokenInfo,
        );
        const convertAmountWithDecimal = TonUtils.toBigNumber(
            amountSend,
            protocolBaseData?.nativeToken.decimal,
        );
        const secretKey = TonUtils.getSecretKey({
            publicKey: walletKey.publicKey,
            privateKey: walletKey.privateKey,
        });

        const adminValueNano = isSendMaxAmount
            ? maxAdminFee
            : BigInt(
                  Math.ceil(
                      (parseFloat(convertAmountWithDecimal) * adminPercent) /
                          100,
                  ),
              );

        if (!secretKey) {
            return undefined;
        }
        const getAccountRes = await tonServices.getAccounts(
            tonAddressData?.address ?? '',
        );
        const getTonAccountsRes = await tonServices.getAccounts(toAddress);
        if (!getTonAccountsRes.isSuccess || !getAccountRes) {
            return undefined;
        }
        const tonTransactionDataRes = await tonUtils.createTransfer({
            valueNano: convertAmountWithDecimal,
            recipientAddress: toAddress,
            adminAddress: adminAddress,
            adminValueNano: adminValueNano.toString(),
            publicKey: tonAddressData?.publicKey ?? '',
            estimateFee: true,
            fromAccountData: getAccountRes.data as TonAccountsType,
            recipientAccountData: getTonAccountsRes.data as TonAccountsType,
            memo: memo,
            tonAdminBounce: tonAdminBounce,
            secretKey: secretKey,
        });
        if (!tonTransactionDataRes) {
            return undefined;
        }
        const { transferData } = tonTransactionDataRes;
        if (transferData?.messageBOCString) {
            const sendMessageToBlockchainRes =
                await tonServices.sendMessageToBlockchain({
                    boc: transferData?.messageBOCString,
                });
            if (sendMessageToBlockchainRes.isSuccess) {
                const params = {
                    toAddress,
                    networkFee: networkFee,
                    adminFee: adminFee,
                    totalAmount: amountSend,
                    txHash: transferData.txHash,
                };
                return params;
            } else {
                return undefined;
            }
        }
    };

    return {
        estimateMax,
        getMaxAmount,
        getReceiveAddressData,
        getMaxAmountLoading,
        balance: tokenInfo?.balanceFormatted,
        createToTransactionAfterCheckAddress,
        transactionData,
        transferData,
        fromAddress: tonAddressData?.address,
        formatFeeAndCurrency,
        handleConfirmTransfer,
        currencySelected,
        protocolBaseData,
        adminFee,
        adminFeeCurrency,
        subAdminFee,
        networkFee,
        networkFeeCurrency,
        networkFeeValue,
        subNetworkFee,
        tonAddressData,
        adminFeeValue,
        tokenInfo,
    };
};
