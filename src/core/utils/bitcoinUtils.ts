import moment from 'moment';
import bitcoinConstants from '../constants/BitCoinConstants';
import EnvConfig from '../constants/EnvConfig';
import { CoinType } from '../enum/CoinType';
import {
    TransactionStatusType,
    TransactionType,
} from '../enum/TransactionType';
import NativeBitcoinModules from '../modules/BitcoinModules/NativeBitcoinModules';
import {
    BitcoinTransactionType,
    UtxoDataType,
} from '../modules/BitcoinModules/NativeBitcoinModules.type';
import { SettingCurrencyType } from '../redux/slice/type';
import {
    InputsType,
    Itxrefs,
    Itxs,
    OutputsType,
} from '../services/BitcoinServices/type';
import { TransactionHistoryDataType } from '../type/TransactionHistoryDataType';
import Utils from './commonUtils';
import WalletUtils from './walletUtils';

const getAdminFee = ({
    amountSend,
    adminPercent,
    byteFee,
}: {
    amountSend: number;
    adminPercent: number;
    byteFee: number;
}) => {
    // Note: A typical spendable segwit P2WPKH txout is 31 bytes big, and will
    // need a CTxIn of at least 67 bytes to spend:
    // so dust is a spendable txout less than
    // 98*dustRelayFee/1000 (in satoshis).
    // 294 satoshis at the default rate of 3000 sat/kvB.
    // Ref: https://github.com/bitcoin/bitcoin/blob/ab0b5706b254ed914f94b41940a946d84ac8dd6d/src/policy/policy.cpp#L28
    let currentAdminFee = amountSend * adminPercent;
    const minAdminFee = bitcoinConstants.spendSizeBytes.P2PKH * byteFee;
    return currentAdminFee < minAdminFee ? minAdminFee : currentAdminFee;
};

const getBitcoinFromSatoshi = (amount: string | number) => {
    let currentAmount;
    if (amount as string) {
        currentAmount = parseFloat(amount as string);
    } else {
        currentAmount = amount;
    }
    const result = (currentAmount as number) / 100000000;
    return Utils.formatNumber(result);
};

const getSatoshiFromBitcoin = (amount: string | number) => {
    let currentAmount;
    if (amount as string) {
        currentAmount = parseFloat(amount as string);
    } else {
        currentAmount = amount;
    }
    const result = (currentAmount as number) * 100000000;
    return result;
};

const convertUtxoData = (utxos: Itxrefs[]): UtxoDataType[] => {
    const convertData: UtxoDataType[] = [];

    const utxosUnspentOnly = utxos.filter(e => e.spent === false);

    utxosUnspentOnly.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    utxosUnspentOnly.forEach(e => {
        convertData.push({
            tx_hash: e.tx_hash,
            tx_output_n: e.tx_output_n,
            value: e.value,
        });
    });

    return convertData;
};

const getBitcoinBalanceToCurrency = (
    btcBalanceSatoshi: number,
    selectedCurrencySetting: SettingCurrencyType,
    price?: number | null,
) => {
    const balanceBTC = parseFloat(getBitcoinFromSatoshi(btcBalanceSatoshi));

    const balanceToCurrencyBase = balanceBTC * (price ?? 1);

    const balanceToCurrencySetting =
        balanceToCurrencyBase * (selectedCurrencySetting?.rate ?? 0);

    const data = {
        balance: Utils.fiatFormat(balanceToCurrencySetting),
        currency: selectedCurrencySetting,
    };

    return data;
};

const extractTransactionHash = (errorMessage: string): string | null => {
    const regex = /Transaction with hash (\w{64}) already exists/;
    const match = RegExp(regex).exec(errorMessage);

    if (match) {
        return match[1];
    }

    return null;
};

const extractLongestHash = (errorMessage: string): string | null => {
    const regex = /\b\w+\b/g;
    const matches = errorMessage.match(regex);

    if (matches) {
        let longestHash = '';
        matches.forEach(match => {
            if (match.length > longestHash.length) {
                longestHash = match;
            }
        });
        return longestHash;
    }
    return null;
};

const checkErrorIncludesHashAndExist = (errorMessage: string) => {
    return (
        errorMessage.includes('transaction with hash') &&
        errorMessage.includes('already exists')
    );
};

const checkErrorIncludesDust = (errorMessage: string) => {
    return errorMessage.includes('dust');
};

const checkPushExistErrorAndGetHash = (errorMessage: string): string | null => {
    const lowerCaseError = errorMessage.toLocaleLowerCase();
    const check1 = checkErrorIncludesHashAndExist(lowerCaseError);
    if (check1) {
        const check2 = extractTransactionHash(lowerCaseError);
        const check3 = extractLongestHash(lowerCaseError);

        return check2 ?? check3;
    } else {
        return null;
    }
};
const checkPushDustErrorAndGetHash = (errorMessage: string): string | null => {
    const lowerCaseError = errorMessage.toLocaleLowerCase();
    const check1 = checkErrorIncludesDust(lowerCaseError);
    if (check1) {
        const check2 = extractLongestHash(lowerCaseError);

        return check2;
    } else {
        return null;
    }
};

const transformBitcoinTransactionHistory = async ({
    currentType,
    txsData,
    typeSelect,
    bitcoinFullDataTxs,
    btcAddress,
    adminAddress,
}: {
    currentType?: TransactionType;
    txsData?: Itxs[];
    typeSelect: TransactionType;
    bitcoinFullDataTxs: Itxs[];
    btcAddress: string;
    adminAddress?: string;
}) => {
    const typeFilter = currentType ?? typeSelect;

    const btcTransactionHistoryData: TransactionHistoryDataType[] = [];

    const data = txsData ?? bitcoinFullDataTxs;
    for await (const txs of data) {
        const inputs: InputsType[] = txs.inputs;
        const outputs: OutputsType[] = txs.outputs;
        const isSent = inputs[0].addresses[0] === btcAddress;

        if (
            isSent &&
            (typeFilter === TransactionType.All ||
                typeFilter === TransactionType.Sent)
        ) {
            let adminOutput: OutputsType | undefined;
            let otherOutputs: OutputsType[] = [];

            for await (const output of outputs) {
                const currentAddress = output.addresses[0];
                if (currentAddress === adminAddress) {
                    adminOutput = output;
                } else if (currentAddress !== btcAddress) {
                    otherOutputs.push(output);
                }
            }

            const totalAmountSend = otherOutputs?.reduce(
                (acc, curr) => acc + curr?.value,
                0,
            );

            const isMultipleTransaction = otherOutputs.length > 1;
            const toAddress = otherOutputs[0]?.addresses[0];
            const data: TransactionHistoryDataType = {
                fee: txs.fees,
                txHash: txs.hash,
                amountSend: totalAmountSend,
                toAddress: toAddress,
                adminFee: adminOutput ? adminOutput.value : 0,
                adminAddress: adminOutput ? adminOutput.addresses[0] : '',
                createdAt: txs.received,
                type: TransactionType.Sent,
                status:
                    txs.confirmations > 6
                        ? TransactionStatusType.Completed
                        : TransactionStatusType.Pending,
                coinType: CoinType.Bitcoin,
                isMultipleTransaction: isMultipleTransaction,
                isNative: true,
            };

            btcTransactionHistoryData.push(data);
        }

        if (
            !isSent &&
            (typeFilter === TransactionType.All ||
                typeFilter === TransactionType.Receive)
        ) {
            const mainOutput = outputs.find(e => e.addresses[0] === btcAddress);
            if (mainOutput !== undefined) {
                const toInput = inputs[0];
                btcTransactionHistoryData.push({
                    txHash: txs.hash,
                    amountSend: mainOutput.value,
                    toAddress: toInput.addresses[0],
                    createdAt: txs.received,
                    type: TransactionType.Receive,
                    status:
                        txs.confirmations > 6
                            ? TransactionStatusType.Completed
                            : TransactionStatusType.Pending,
                    coinType: CoinType.Bitcoin,
                    isNative: true,
                });
            }
        }
    }

    btcTransactionHistoryData.sort((a, b) => {
        const aCreatedAt = a.createdAt;
        const bCreatedAt = b.createdAt;
        const dateA = moment(aCreatedAt ?? 0).valueOf();
        const dateB = moment(bCreatedAt ?? 0).valueOf();
        return dateB - dateA;
    });

    const result = WalletUtils.transactionHistoryTransformToSectionsData([
        ...btcTransactionHistoryData,
    ]);

    return result;
};

const isValidAddress = async (address: string, isTestNetParam?: boolean) => {
    const bitcoinModule = new NativeBitcoinModules();
    const isTestNet = isTestNetParam ?? (EnvConfig.ENV === 'development');

    console.log('=============================================');
    console.log('CheckBitcoinAddress');
    console.log('address', address);
    console.log('=============================================');

    try {
        const resCheck = await bitcoinModule.isValidBitcoinAddress({
            isTestNet: isTestNet,
            address: address,
        });
        if (resCheck) {
            return true;
        }
        return false;
    } catch (error) {
        console.log('checkBitcoinAddress error', error);
        return false;
    }
};

const getMaxBalanceCompareWithUTXOandNetworkFee = async (
    bitcoinUTXO: Itxrefs[],
    networkFee?: number,
): Promise<number> => {
    try {
        const bitcoinModule = new NativeBitcoinModules();

        const utxoDataFormRN = BitcoinUtils.convertUtxoData(bitcoinUTXO);

        if (utxoDataFormRN.length === 0) {
            return 0;
        }

        const byteFee = WalletUtils.getByteFeeFromFeePerKb(networkFee);

        const adminFee = 0;

        const maxAmount = await bitcoinModule.bitcoinGetMaxAmount({
            byteFee,
            utxoDataFormRN,
            adminFee,
            spendSizeBytes: bitcoinConstants.spendSizeBytes.P2PKH,
        });

        if (!maxAmount || maxAmount < 0) {
            return 0;
        }

        return maxAmount;
    } catch (error) {
        console.log('🚀 ~ error:', error);
        return 0;
    }
};

const createBitcoinTransactionNoAdmin = async ({
    toAddress,
    amountSend,
    bitcoinUTXO,
    feePerKb,
    mnemonic,
    envParam,
}: {
    toAddress: string;
    amountSend: number;
    bitcoinUTXO: Itxrefs[];
    feePerKb?: number;
    mnemonic: string;
    envParam?: string;
}): Promise<BitcoinTransactionType | undefined> => {
    try {
        const bitcoinModule = new NativeBitcoinModules();

        const utxoDataFormRN = BitcoinUtils.convertUtxoData(bitcoinUTXO);

        const byteFee = WalletUtils.getByteFeeFromFeePerKb(feePerKb);
        const env = envParam ?? EnvConfig.ENV;

        const successCreateTransaction = await bitcoinModule.bitcoinTransaction(
            {
                env: env,
                mnemonic,
                toAddress,
                amountSend,
                byteFee,
                utxoDataFormRN,
                adminAddress: '',
                adminFee: 0,
                spendSizeBytes: bitcoinConstants.spendSizeBytes.P2PKH,
            },
        );
        if (!successCreateTransaction) {
            return;
        }

        return successCreateTransaction;
    } catch (error) {
        console.log('Bitcoin Transaction catch error', error);
        return;
    }
};
const BitcoinUtils = {
    getBitcoinFromSatoshi,
    getSatoshiFromBitcoin,
    convertUtxoData,
    getBitcoinBalanceToCurrency,
    checkPushExistErrorAndGetHash,
    checkPushDustErrorAndGetHash,
    getAdminFee,
    transformBitcoinTransactionHistory,
    isValidAddress,
    getMaxBalanceCompareWithUTXOandNetworkFee,
    createBitcoinTransactionNoAdmin,
};

export default BitcoinUtils;
