import { ListCryptoDataType } from 'src/features/home/home.type';
import { CoinType } from '../enum/CoinType';
import { TransactionType } from '../enum/TransactionType';
import {
    NativeTokenType,
    ProtocolDataWithSupportedTokensFormBEType,
} from '../redux/slice/account.type';
import {
    ERC20Transfer,
    InternalTransaction,
    MethodLabel,
    Transaction,
    Transfer,
} from '../services/Moralis/type';
import { TransactionHistoryDataType } from '../type/TransactionHistoryDataType';
import Utils from './commonUtils';
import { compareAddressesEVM } from './evmUtils';

export const convertValue = (val: string | bigint, decimals: number) =>
    +Utils.convertBigIntFollowDecimals(val, decimals);

const getBaseTransactionData = (
    transaction: Transaction,
    typeTransaction: TransactionType,
    isReceived: boolean,
    protocolBaseData: ProtocolDataWithSupportedTokensFormBEType,
): TransactionHistoryDataType => ({
    txHash: transaction.hash,
    createdAt: transaction.block_timestamp,
    toAddress: isReceived ? transaction.from_address : transaction.to_address,
    coinType: CoinType.Ethereum,
    confirmations: +transaction.receipt_status,
    type: typeTransaction,
    amountSend: 0,
    protocolData: protocolBaseData,
    estimatedGasFee: isReceived ? 0 : +transaction.transaction_fee,
    fee: 0,
});
const handleNativeTransactionsMoralis = (
    data: TransactionHistoryDataType,
    internalTxs: InternalTransaction[],
    isReceived: boolean,
    protocolDecimals: number,
    from_address: string,
    protocolBaseData: ProtocolDataWithSupportedTokensFormBEType,
    transaction: Transaction,
    baseTokenInfo: Omit<ListCryptoDataType, 'id'>,
    nativeToken: NativeTokenType,
    currentWalletUser: string,
) => {
    const nativeValueConverted = transactionHistoryUtils.convertValue(
        transaction.value,
        protocolDecimals,
    );

    data = {
        ...data,
        totalAmount: nativeValueConverted,
        amountSend: nativeValueConverted,
        token: baseTokenInfo,
        tokenSymbol: nativeToken?.symbol,
        isNative: true,
    };
    if (internalTxs.length) {
        const [first, second] = internalTxs;

        data.toAddress = isReceived ? from_address : first.to;

        const convertedValue = convertValue(first.value, protocolDecimals);
        data.amountSend = convertedValue;
        if (!isReceived) {
            data.totalAmount =
                nativeValueConverted + +transaction.transaction_fee;
        }
        if (second) {
            let index;

            const filterAdmin = internalTxs.slice(0, 1).filter((e, i) => {
                if (
                    compareAddressesEVM(
                        e.to,
                        protocolBaseData?.beneficiary?.walletAddress,
                    )
                ) {
                    index = i;
                    return true;
                }
                return false;
            });
            if (!filterAdmin.length) {
                data.isShowDefaults = true;
                return data;
            }
            const receiverIndex = index === 0 ? 1 : 0;

            const receiver = internalTxs[receiverIndex];

            const convertedAdminFee = convertValue(
                filterAdmin[0].value,
                protocolDecimals,
            );
            const convertedReceiverValue = convertValue(
                receiver.value,
                protocolDecimals,
            );
            if (!isReceived) {
                data.adminFee = convertedAdminFee;
            }
            data.amountSend = convertedReceiverValue;

            data.totalAmount =
                nativeValueConverted + +transaction.transaction_fee;
            data.toAddress = receiver.to;
            if (isReceived) {
                data.toAddress = from_address;
                data.totalAmount = convertedReceiverValue;
                if (
                    compareAddressesEVM(
                        currentWalletUser,
                        protocolBaseData?.beneficiary?.walletAddress,
                    )
                ) {
                    data.totalAmount = convertedAdminFee;
                    data.amountSend = convertedAdminFee;
                }
            }
        }
    }

    return data;
};

const handleAirdropOrMint = (
    data: TransactionHistoryDataType,
    value: string,
    baseTokenInfo: Omit<ListCryptoDataType, 'id'>,
) => ({
    ...data,
    isShowDefaults: true,
    amountSend: +value,
    token: baseTokenInfo,
});
const handleSetDataDefault = (
    data: TransactionHistoryDataType,
    isReceived: boolean,
    walletAddress: string,
    internalTxs: any[],
    protocolDecimals: number,
    isCoin: boolean,
    transaction: Transaction,
) => {
    if (isCoin) {
        if (isReceived) {
            const findItemReceived = findCoinSendByWalletAddress(
                internalTxs,
                walletAddress,
            );
            if (findItemReceived) {
                const convertedReceivedValue = convertValue(
                    findItemReceived.value,
                    protocolDecimals,
                );
                data.amountSend = convertedReceivedValue;
                data.totalAmount = convertedReceivedValue;
            }
        } else {
            const convertedReceivedValue = convertValue(
                transaction.value,
                protocolDecimals,
            );
            data.amountSend = convertedReceivedValue;
            data.totalAmount =
                convertedReceivedValue + +transaction.transaction_fee;
            data.estimatedGasFee = +transaction.transaction_fee;
        }
    } else {
        if (internalTxs.length) {
            if (isReceived) {
                const findItemReceived = findTokenSendByWalletAddress(
                    internalTxs,
                    walletAddress,
                );
                if (findItemReceived) {
                    const convertedReceivedValue = convertValue(
                        findItemReceived.value,
                        protocolDecimals,
                    );
                    data.amountSend = convertedReceivedValue;
                    data.totalAmount = convertedReceivedValue;
                }
            }
            const totalValue = internalTxs?.reduce(
                (total, { value }) => total + BigInt(value),
                BigInt(0),
            );
            const convertedTotalValue = convertValue(
                totalValue,
                +internalTxs[0].token_decimals,
            );
            data.amountSend = convertedTotalValue;
        }
    }
    return data;
};
const handleNFTTransfer = (
    data: TransactionHistoryDataType,
    nftTransfer: Transfer,
    isReceived: boolean,
    transaction: Transaction,
    nativeToken: NativeTokenType,
    protocolDecimals: number,
) => {
    const { token_id, to_address: nftToAddress, from_address } = nftTransfer;
    const tokenFormat = `#${token_id}`;
    const convertedValue = convertValue(transaction.value, protocolDecimals);

    const totalNFT = `${tokenFormat} / ${Utils.formattedBalanceCurrency(
        convertedValue + +transaction.transaction_fee,
    )} ${nativeToken?.symbol}`;

    return {
        ...data,
        isSendNFT: true,
        tokenId: +token_id,
        adminFee: isReceived
            ? 0
            : convertValue(transaction.value, protocolDecimals),
        totalNFT: isReceived ? tokenFormat : totalNFT,
        from: from_address,
        to: nftToAddress,
        toAddress: isReceived ? from_address : nftToAddress,
    };
};

const handleERC20Transfers = (
    data: TransactionHistoryDataType,
    erc20_transfers: ERC20Transfer[],
    typeTransaction: TransactionType,
    from_address: string,
    isReceived: boolean,
    protocolBaseData: ProtocolDataWithSupportedTokensFormBEType,
) => {
    const [firstTransfer, secondTransfer] = erc20_transfers;
    const totalValue = erc20_transfers.reduce(
        (total, { value }) => total + BigInt(value),
        BigInt(0),
    );
    const convertedTotalValue = convertValue(
        totalValue,
        +firstTransfer.token_decimals,
    );
    data = {
        ...data,
        totalAmount: convertedTotalValue,
        amountSend: convertValue(
            firstTransfer.value,
            +firstTransfer.token_decimals,
        ),
        token: {
            name: firstTransfer.token_name,
            logo: firstTransfer.token_logo,
            symbol: firstTransfer.token_symbol,
        },
        tokenSymbol: firstTransfer.token_symbol,
        toAddress:
            typeTransaction === TransactionType.Receive
                ? from_address
                : firstTransfer.to_address,
    };
    if (secondTransfer) {
        let index;
        const filterAdmin = erc20_transfers.slice(0, 1).filter((e, i) => {
            if (
                compareAddressesEVM(
                    e.to_address,
                    protocolBaseData?.beneficiary?.walletAddress,
                )
            ) {
                index = i;
                return true;
            }
            return false;
        });
        if (!filterAdmin.length) {
            data.isShowDefaults = true;
            return data;
        }
        const receiverIndex = index === 0 ? 1 : 0;

        const receiver = erc20_transfers[receiverIndex];

        data.adminFee = convertValue(
            filterAdmin[0].value,
            +secondTransfer.token_decimals,
        );

        const convertedValue = convertValue(
            receiver.value,
            +firstTransfer.token_decimals,
        );
        data.amountSend = convertedValue;
        if (isReceived) {
            data.totalAmount = convertedValue;
        }
        data.toAddress = receiver.to_address;
    }
    return data;
};

const isSmartContractCallTransactionHistory = (transaction: Transaction) => {
    if (
        transaction.method_label === MethodLabel.airdrop ||
        transaction.category === 'mint' ||
        transaction.category === 'airdrop' ||
        transaction.category === 'approve' ||
        transaction.method_label === MethodLabel.approve ||
        transaction.category === 'contract interaction' ||
        (!transaction.erc20_transfers.length &&
            !transaction.native_transfers.length &&
            !transaction.nft_transfers.length)
    ) {
        return true;
    }
    return false;
};
const findCoinSendByWalletAddress = (
    internalTransactions: InternalTransaction[],
    from_address: string,
) => {
    return internalTransactions.find(e =>
        compareAddressesEVM(e.to, from_address),
    );
};
const findTokenSendByWalletAddress = (
    erc20_transfers: ERC20Transfer[],
    from_address: string,
) => {
    return erc20_transfers.find(e =>
        compareAddressesEVM(e.to_address, from_address),
    );
};

export const transactionHistoryUtils = {
    handleNativeTransactionsMoralis,
    getBaseTransactionData,
    handleAirdropOrMint,
    handleNFTTransfer,
    convertValue,
    handleERC20Transfers,
    isSmartContractCallTransactionHistory,
    findCoinSendByWalletAddress,
    handleSetDataDefault,
    findTokenSendByWalletAddress,
};
