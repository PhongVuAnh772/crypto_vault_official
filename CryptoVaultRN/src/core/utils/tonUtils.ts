import { Address, beginCell, Cell, toNano } from '@ton/core';
import BigNumber from 'bignumber.js';
import appTokens from '../constants/AppTokens';
import { CoinType } from '../enum/CoinType';
import {
    TransactionStatusType,
    TransactionType,
} from '../enum/TransactionType';
import { BeneficiaryType } from '../redux/slice/account.type';
import {
    ImportNFTTonParams,
    NFTTonData,
} from '../redux/slice/NFT/NFTImport.type';
import { SettingCurrencyType } from '../redux/slice/type';
import { AppDispatch, RootState } from '../redux/store';
import {
    NftTonNewItem,
    TonEvent,
    TonEventsAction,
    TonTransfer,
} from '../services/TonServices/type';
import { TransactionHistoryDataType } from '../type/TransactionHistoryDataType';
import Utils from './commonUtils';
import DateTimeUtils from './dateTimeUtils';
import WalletUtils from './walletUtils';

const getTonFromNanograms = (amount: string | number) => {
    let currentAmount;
    if (amount as string) {
        currentAmount = parseFloat(amount as string);
    } else {
        currentAmount = amount;
    }
    let result = (currentAmount as number) / 1000000000;
    let resultString = result.toString();
    if (resultString.startsWith('-')) {
        resultString = resultString.slice(1);
    }
    return parseFloat(resultString);
};

const getNanogramsFromTon = (amount: string | number) => {
    let currentAmount;
    if (amount as string) {
        currentAmount = parseFloat(amount as string);
    } else {
        currentAmount = amount;
    }
    return (currentAmount as number) * 1000000000;
};

export const parseRawAddress = (rawAddress: string) => {
    try {
        return Address.parseRaw(rawAddress).toString({
            bounceable: false,
        });
    } catch (error) {
        console.log('parseRawAddress error', error);
        return rawAddress;
    }
};

function encodeStringToCell(str: string): Cell {
    const encoded = Buffer.from(str, 'utf-8');

    return beginCell().storeBuffer(encoded).endCell();
}

const validAddress = (address: string) => {
    try {
        Address.parse(address);
        return true;
    } catch (error) {
        console.error('validAddress error', error);
        return false;
    }
};
const compareExactOwnerAddress = (
    address1: string,
    address2: string,
): boolean => {
    if (address1.length !== address2.length) {
        return false;
    }

    for (let i = 0; i < address1.length; i++) {
        if (address1[i] !== address2[i]) {
            return false;
        }
    }
    return true;
};

const getRawAddress = (address: string) => {
    try {
        return Address.parse(address).toRawString();
    } catch (error) {
        console.error('getRawAddress error', error);
        return address;
    }
};

const getTonBalanceToCurrency = (
    tonBalance: number,
    selectedCurrencySetting: SettingCurrencyType,
    price?: number | null,
) => {
    const tonBalanceConvert = Utils.truncateToThreeDecimals(tonBalance);
    const baseRate = Utils.fiatFormat(
        (price ?? 1) * (selectedCurrencySetting?.rate ?? 0),
    );

    const balanceToCurrencySetting =
        tonBalanceConvert * Number(baseRate.replace(/,/g, ''));

    const balance = Utils.fiatFormat(balanceToCurrencySetting);

    const data = {
        balance,
        currency: selectedCurrencySetting,
    };
    return data;
};

const getJettonBalanceToCurrency = (
    jettonBalance: number,
    selectedCurrencySetting: SettingCurrencyType,
    price?: number | null,
    isledgerifyToken?: boolean,
) => {
    const jettonBalanceConvert = Utils.truncateToThreeDecimals(jettonBalance);
    const baseRate = Utils.fiatFormat(
        (price ?? 1) * (selectedCurrencySetting?.rate ?? 0),
        isledgerifyToken ? 4 : undefined,
        isledgerifyToken,
    );

    const balanceToCurrencySetting =
        jettonBalanceConvert * Number(baseRate.replace(/,/g, ''));

    const balance = Utils.fiatFormat(
        balanceToCurrencySetting,
        isledgerifyToken ? 4 : undefined,
        isledgerifyToken,
    );

    const data = {
        balance,
        currency: selectedCurrencySetting,
    };
    return data;
};

const _handleMultipleActions = async ({
    mainAddress,
    actionsList,
    tonEvent,
    typeSelect,
    customSymbol,
    decimal,
    nativeDecimal,
    beneficiary,
}: {
    mainAddress: string;
    actionsList: TonEventsAction[];
    tonEvent: TonEvent;
    typeSelect: TransactionType;
    customSymbol?: string;
    decimal?: number;
    nativeDecimal?: number;
    beneficiary?: BeneficiaryType;
}): Promise<TransactionHistoryDataType | undefined> => {
    try {
        const multipleTransactionData: TransactionHistoryDataType[] = [];
        let adminFee: number | undefined;

        const isInProgress = tonEvent.in_progress;

        for await (const action of actionsList) {
            const isJettonAction =
                action.JettonTransfer || action.JettonBurn || action.JettonMint;
            const dataTransfer: TonTransfer | undefined =
                action.JettonTransfer ||
                action.JettonBurn ||
                action.JettonMint ||
                action.NftItemTransfer ||
                action.TonTransfer ||
                action.SmartContractExec;

            if (dataTransfer) {
                if (
                    dataTransfer?.sender?.address &&
                    dataTransfer?.recipient?.address !== mainAddress &&
                    dataTransfer.sender.address !== mainAddress
                )
                    continue;
                const isAdminAction =
                    dataTransfer.recipient && beneficiary?.walletAddress
                        ? action.status === 'ok' &&
                        (dataTransfer?.comment?.toLocaleLowerCase() ===
                            'admin fee' ||
                            Address.parse(
                                dataTransfer.recipient.address,
                            ).toString() ===
                            Address.parse(
                                beneficiary?.walletAddress ?? '',
                            ).toString())
                        : false;

                let amount = dataTransfer?.amount;

                if (typeof amount === 'string') {
                    amount = parseFloat(amount);
                }

                if (isAdminAction) {
                    adminFee = amount;
                }

                const isSentAction =
                    dataTransfer?.sender?.address === mainAddress;

                const otherAddress = dataTransfer?.contract?.address ?? '';

                const recipientAddress = TonUtils.parseRawAddress(
                    (dataTransfer?.recipient?.address ?? otherAddress) || '',
                );

                const senderAddress = TonUtils.parseRawAddress(
                    (dataTransfer?.sender?.address ?? otherAddress) || '',
                );

                const id = Utils.generateUniqueId();
                let transactionType;

                if (action?.NftItemTransfer) {
                    if (
                        action.NftItemTransfer.sender.address ===
                        action.NftItemTransfer.recipient.address
                    ) {
                        transactionType = TransactionType.ReceiveNFT;
                    } else {
                        transactionType = isSentAction
                            ? TransactionType.SendNFT
                            : TransactionType.ReceiveNFT;
                    }
                } else if (action?.SmartContractExec) {
                    transactionType = TransactionType.SmartContractExec;
                } else {
                    transactionType = isSentAction
                        ? TransactionType.Sent
                        : TransactionType.Receive;
                }
                let statusType;
                if (isInProgress) {
                    statusType = TransactionStatusType.Pending;
                } else {
                    statusType =
                        action.status === 'ok'
                            ? TransactionStatusType.Completed
                            : TransactionStatusType.Failed;
                }
                const multipleTransactionDataItem: TransactionHistoryDataType =
                {
                    id: id,
                    isAdminFee: isAdminAction,
                    toAddress: isSentAction
                        ? recipientAddress
                        : senderAddress,
                    txHash: tonEvent.event_id,
                    coinType: CoinType.Ton,
                    createdAt: DateTimeUtils.convertTimestampToISO(
                        parseInt(
                            tonEvent?.timestamp?.toString() ?? '0',
                            10,
                        ),
                    ),

                    isNative: !isJettonAction,
                    memo: dataTransfer?.comment,
                    amountSend: amount,
                    status: statusType,
                    type: transactionType,
                    tokenTransferType: isJettonAction
                        ? action.type
                        : undefined,
                    decimal: isJettonAction
                        ? dataTransfer?.jetton?.decimals
                        : decimal,
                    nativeDecimal: nativeDecimal,
                    amountNFT: action?.simple_preview.value,
                    nftAddress: dataTransfer?.nft,
                    logoUri: isJettonAction
                        ? dataTransfer?.jetton?.image
                        : undefined,
                    tokenSymbol: isJettonAction
                        ? dataTransfer?.jetton?.symbol
                        : customSymbol,
                    amountTonAttachedSmartExc: dataTransfer?.ton_attached,
                };

                multipleTransactionData?.push(multipleTransactionDataItem);
            }
        }

        if (
            multipleTransactionData[0] &&
            multipleTransactionData[0]?.isAdminFee
        ) {
            const firstItem = multipleTransactionData.shift();
            if (firstItem) {
                multipleTransactionData.push(firstItem);
            }
        }

        if (adminFee) {
            multipleTransactionData[0].adminFee = adminFee;
        }

        if (!isInProgress) {
            multipleTransactionData[0].fee = Math.abs(tonEvent?.extra);
        }

        const id = Utils.generateUniqueId();

        const tonTransactionHistoryDataItem: TransactionHistoryDataType = {
            id: id,
            ...multipleTransactionData[0],

            multipleTransactionData: multipleTransactionData,
        };
        const isSentFirstAction =
            tonTransactionHistoryDataItem.type === TransactionType.Sent ||
            tonTransactionHistoryDataItem.type === TransactionType.SendNFT;

        if (
            typeSelect === TransactionType.All ||
            (isSentFirstAction &&
                (typeSelect === TransactionType.Sent ||
                    typeSelect === TransactionType.SendNFT)) ||
            (!isSentFirstAction &&
                !(
                    tonTransactionHistoryDataItem.type ===
                    TransactionType.SmartContractExec
                ) &&
                (typeSelect === TransactionType.Receive ||
                    typeSelect === TransactionType.ReceiveNFT))
        ) {
            return tonTransactionHistoryDataItem;
        }
    } catch (error) {
        console.error('Error in _handleMultipleActions', error);
        return undefined;
    }
};

const getFeeStatus = (fee: string | number | undefined): boolean => {
    const parsed = Number(fee);
    if (parsed > 0) return true;
    return false;
};

const _handleOnlyAction = async ({
    mainAddress,
    action,
    tonEvent,
    typeSelect,
    customSymbol,
    decimal,
    nativeDecimal,
}: {
    mainAddress: string;
    action: TonEventsAction;
    tonEvent: TonEvent;
    typeSelect: TransactionType;
    customSymbol?: string;
    decimal?: number;
    nativeDecimal?: number;
}): Promise<TransactionHistoryDataType | undefined> => {
    const isInProgress = tonEvent.in_progress;

    const isJettonAction =
        action.JettonTransfer || action.JettonBurn || action.JettonMint;

    const dataTransfer: TonTransfer | undefined =
        action.JettonTransfer ||
        action.JettonBurn ||
        action.JettonMint ||
        action.NftItemTransfer ||
        action.TonTransfer ||
        action.SmartContractExec;

    const isSentAction = dataTransfer?.sender?.address === mainAddress;
    const otherAddress = dataTransfer?.contract?.address ?? '';
    const recipientAddress = TonUtils.parseRawAddress(
        (dataTransfer?.recipient?.address ?? otherAddress) || '',
    );
    const senderAddress = TonUtils.parseRawAddress(
        (dataTransfer?.sender?.address ?? otherAddress) || '',
    );
    const id = Utils.generateUniqueId();

    let amount = dataTransfer?.amount;

    if (typeof amount === 'string') {
        amount = parseFloat(amount);
    }
    let transactionType;

    if (action?.NftItemTransfer) {
        // check nft transaction conditions send to yourself
        if (
            action.NftItemTransfer.sender.address ===
            action.NftItemTransfer.recipient.address
        ) {
            transactionType = TransactionType.ReceiveNFT;
        } else {
            transactionType = isSentAction
                ? TransactionType.SendNFT
                : TransactionType.ReceiveNFT;
        }
    } else if (action?.SmartContractExec) {
        transactionType = TransactionType.SmartContractExec;
    } else {
        transactionType = isSentAction
            ? TransactionType.Sent
            : TransactionType.Receive;
    }
    let statusProgress;

    let fee = isSentAction ? Math.abs(tonEvent?.extra) : tonEvent?.extra;

    if (isInProgress) {
        statusProgress = TransactionStatusType.Pending;
        fee = 0;
    } else {
        statusProgress =
            action.status === 'ok'
                ? TransactionStatusType.Completed
                : TransactionStatusType.Failed;
    }

    const tonTransactionHistoryDataItem: TransactionHistoryDataType = {
        id: id,
        toAddress: isSentAction ? recipientAddress : senderAddress,
        txHash: tonEvent.event_id,
        coinType: CoinType.Ton,
        isNative: !isJettonAction,
        status: statusProgress,
        createdAt: DateTimeUtils.convertTimestampToISO(
            parseInt(tonEvent?.timestamp?.toString() ?? '0', 10),
        ),
        fee: fee,
        memo: dataTransfer?.comment,
        amountSend: amount ?? 0,
        type: transactionType,
        tokenSymbol: isJettonAction
            ? dataTransfer?.jetton?.symbol
            : customSymbol,
        tokenTransferType: isJettonAction ? action.type : undefined,
        decimal: isJettonAction ? dataTransfer?.jetton?.decimals : decimal,
        nativeDecimal,
        logoUri: isJettonAction ? dataTransfer?.jetton?.image : undefined,
        amountNFT: action?.simple_preview.value,
        nftAddress: dataTransfer?.nft,
        amountTonAttachedSmartExc: dataTransfer?.ton_attached,
    };
    if (
        typeSelect === TransactionType.All ||
        (isSentAction &&
            !(transactionType === TransactionType.ReceiveNFT) &&
            typeSelect === TransactionType.Sent) ||
        (!isSentAction &&
            typeSelect === TransactionType.Receive &&
            !(transactionType === TransactionType.SmartContractExec))
    ) {
        return tonTransactionHistoryDataItem;
    }
};

const checkExists = (
    nftData: NFTTonData,
    params: ImportNFTTonParams,
    getState: () => unknown,
) => {
    const state = getState() as RootState;
    const { nftImport } = state;

    if (nftImport.tonCollection === undefined) {
        return false;
    }
    if (params.id && nftImport.tonCollection[params.accountId]) {
        const findCollection = nftImport.tonCollection[params.accountId]?.[
            params.id
        ]?.find(
            item => item?.contractAddress === nftData.root.tonCollectionAddress,
        );
        if (findCollection) {
            const { data } = findCollection;
            try {
                const nftExists = data?.some(item => {
                    const convertedAddress = Address.parse(
                        item.root.contractAddress,
                    );
                    return (
                        convertedAddress.toRawString() ===
                        nftData.detail.nftDetailAll.address
                    );
                });
                return nftExists || false;
            } catch (error) {
                console.error('Error processing NFT collection:', error);
                return false;
            }
        } else {
            return false;
        }
    }
    return false;
};

const transformTonEventsHistoryData = async ({
    typeSelect,
    tonEvents,
    customSymbol,
    decimal,
    nativeDecimal,
    beneficiary,
    cacheDataNFT,
    dispatch,
}: {
    typeSelect: TransactionType;
    tonEvents: TonEvent[];
    customSymbol?: string;
    decimal?: number;
    nativeDecimal?: number;
    beneficiary?: BeneficiaryType;
    cacheDataNFT?: Record<string, NftTonNewItem>;
    dispatch?: AppDispatch;
}) => {
    const tonTransactionHistoryData: TransactionHistoryDataType[] = [];

    for await (const e of tonEvents) {
        const mainAddress = e?.account?.address;
        const actionsList = e?.actions;
        const isMultipleEvents = actionsList?.length > 1;

        if (isMultipleEvents) {
            let tonTransactionHistoryDataItem;
            try {
                tonTransactionHistoryDataItem = await _handleMultipleActions({
                    mainAddress,
                    actionsList,
                    tonEvent: e,
                    typeSelect,
                    customSymbol,
                    decimal,
                    beneficiary,
                    nativeDecimal,
                });
            } catch (error) {
                console.error('Error in _handleMultipleActions', error);
            }
            if (tonTransactionHistoryDataItem) {
                tonTransactionHistoryData.push(tonTransactionHistoryDataItem);
            }
        } else {
            let tonTransactionHistoryDataItem;
            try {
                tonTransactionHistoryDataItem = await _handleOnlyAction({
                    mainAddress,
                    action: actionsList[0],
                    tonEvent: e,
                    typeSelect,
                    customSymbol,
                    decimal,
                    nativeDecimal,
                });
            } catch (error) {
                console.error('Error in _handleOnlyAction', error);
            }
            if (tonTransactionHistoryDataItem) {
                tonTransactionHistoryData.push(tonTransactionHistoryDataItem);
            }
        }
    }

    const result = WalletUtils.transactionHistoryTransformToSectionsData([
        ...tonTransactionHistoryData,
    ]);

    return result;
};

/**
 * Convert string to decimal number with specified number of decimals
 * @param value - String value to convert
 * @param decimals - Number of decimal places (default is 18)
 * @returns string - Result as string to ensure precision
 */
const formatBigNumber = (value: string, decimals: number = 9): number => {
    try {
        const bigNumber = new BigNumber(value);
        const result = bigNumber
            .div(new BigNumber(10).pow(decimals))
            .abs()
            .toNumber();
        return result;
    } catch (error) {
        console.error('Error formatting big number:', error);
        return 0;
    }
};

const formatTonBalance = (tonBalance: number) => {
    const convertBalance = Utils.truncateToThreeDecimals(tonBalance);
    return convertBalance === 0 ? 0 : Utils.fiatFormat(convertBalance, 3);
};

const convertWithDecimal = (value: string, decimals: number = 9): string => {
    try {
        const bigNumber = new BigNumber(value);
        const result = bigNumber
            .div(new BigNumber(10).pow(decimals))
            .abs()
            .toString();
        return result;
    } catch (error) {
        console.error('Error formatting big number:', error);
        return '0';
    }
};

/**
 * Convert decimal number to big number string with specified number of decimals
 * @param value - Number value to convert
 * @param decimals - Number of decimal places (default is 9)
 * @returns string - Result as string with specified decimals
 */
const toBigNumber = (value: number | string, decimals: number = 9): string => {
    try {
        const bigNumber = new BigNumber(value);
        const result = bigNumber
            .times(new BigNumber(10).pow(decimals))
            .toFixed(0);
        return result;
    } catch (error) {
        console.error('Error converting to big number:', error);
        return '0';
    }
};

const getMinFeeForJettonTransaction = (
    numberOfTransactions: number,
    minFeeFromRemoteConfig?: number,
) => {
    // Minimum fee for a jetton transaction 0.05 TON

    const minFeeForJettonTransfer = toNano(minFeeFromRemoteConfig ?? 0.05);

    return minFeeForJettonTransfer * BigInt(numberOfTransactions);
};

/**
 * Merges a private key and a public key into a single buffer.
 *
 * This function takes a private key and a public key, both encoded in base64,
 * converts them into buffers, and concatenates them. This can be useful for
 * cryptographic operations where both keys are needed in a single structure.
 *
 * @param privateKey - The private key in base64 format.
 * @param publicKey - The public key in base64 format.
 * @returns Buffer - A buffer containing the concatenated private and public keys.
 */
const merKeyToGetSecretKey = (privateKey: string, publicKey: string) => {
    const publicKeyConverted = Buffer.from(publicKey, 'base64');
    const privateKeyConverted = Buffer.from(privateKey, 'base64');

    return Buffer.concat([privateKeyConverted, publicKeyConverted]);
};

const convertBalanceWithFiat = ({
    balance,
    balanceToken,
    protocolRate,
    tokenRate,
    settingCurrencyRate,
    isNative,
    isledgerifyToken = false,
}: {
    balance?: number;
    balanceToken?: number;
    protocolRate?: number | null;
    tokenRate?: number | null;
    settingCurrencyRate: number;
    isNative: boolean;
    isledgerifyToken?: boolean;
}) => {
    // TON:
    // Base rate = Protocol rate * setting currency rate.
    // Base rate Fiat (1) = x.xx
    // Balance Ton (2) = x.xxx
    // Balance Ton Fiat = (1) * (2) = x.xx * x.xxx

    // JETTON:
    // Base rate = Protocol rate * setting currency rate * token rate.
    // Base rate Fiat (1) = x.xx
    // Balance Jetton (2) = x.xxxxxxxxx || x.xx
    // Balance Ton Fiat = (1) * (2) = x.xx * (x.xxxxxxxxx || x.xx)
    let balanceString: string = '0';
    let balanceConverted: number = 0;
    if (isNative) {
        const currentBalance = balance ?? 0;
        balanceConverted = Utils.truncateToThreeDecimals(currentBalance);
        balanceString = Utils.fiatFormat(balanceConverted, 3);
    } else {
        const currentBalance = balanceToken ?? 0;
        balanceString = Utils.formattedBalanceCurrency(currentBalance);
        balanceConverted = Number(balanceString.replace(/,/g, ''));
    }

    const baseRate =
        settingCurrencyRate *
        (protocolRate ?? 1) *
        (isNative ? 1 : (tokenRate ?? 0));

    const baseRateFiatString = Utils.fiatFormat(
        baseRate,
        isledgerifyToken ? 4 : undefined,
        isledgerifyToken,
    );
    const baseRateFiat = Number(baseRateFiatString.replace(/,/g, ''));

    let balanceFiatString;

    if (isledgerifyToken) {
        balanceFiatString = Utils.fiatFormat(
            balanceConverted * baseRateFiat,
            isledgerifyToken ? 4 : undefined,
            isledgerifyToken,
        );
    } else {
        balanceFiatString = Utils.formattedCurrency(
            balanceConverted * baseRateFiat,
        );
    }

    const balanceFiat = Number(balanceFiatString.replace(/,/g, ''));

    return {
        balanceString,
        baseRateFiat,
        baseRateFiatString,
        balanceFiat,
        balanceFiatString,
    };
};

const checkledgerifyToken: (address: string) => boolean = (address: string) => {
    const compareAddress = getRawAddress(address);
    const ledgerifyTokenParsed = getRawAddress(appTokens.ledgerify_TOKEN);
    return compareAddress === ledgerifyTokenParsed;
};

const TonUtils = {
    getTonFromNanograms,
    getNanogramsFromTon,
    parseRawAddress,
    getTonBalanceToCurrency,
    transformTonEventsHistoryData,
    getRawAddress,
    validAddress,
    formatBigNumber,
    toBigNumber,
    getMinFeeForJettonTransaction,
    compareExactOwnerAddress,
    merKeyToGetSecretKey,
    encodeStringToCell,
    checkExists,
    convertWithDecimal,
    convertBalanceWithFiat,
    formatTonBalance,
    getJettonBalanceToCurrency,
    checkledgerifyToken,
    getFeeStatus,
};

export default TonUtils;
