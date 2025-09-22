export type BitcoinGetMaxAmountPropType = {
    byteFee: number;
    utxoDataFormRN: UtxoDataType[];
    adminFee: number;
    spendSizeBytes: number;
};
export type UtxoDataType = {
    tx_hash?: string;
    tx_output_n?: number;
    value?: number;
};
export type BitcoinTransactionPropType = {
    env: string;
    mnemonic: string;
    toAddress: string;
    amountSend: number;
    byteFee: number;
    adminAddress: string;
    adminFee: number;
    utxoDataFormRN: UtxoDataType[];
    spendSizeBytes: number;
};
export type SuccessCallbackCreateTransaction = ({
    base64EncodedTransaction,
    fee,
}: BitcoinTransactionType) => void;
export type BitcoinTransactionType = {
    base64EncodedTransaction: string;
    fee: number;
};
