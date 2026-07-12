import { NativeModules } from 'react-native';
import {
    BitcoinGetMaxAmountPropType,
    BitcoinTransactionPropType,
    BitcoinTransactionType,
} from './NativeBitcoinModules.type';
class NativeBitcoinModules {
    private readonly _bitcoinModule;

    constructor() {
        this._bitcoinModule = NativeModules.BitcoinModule;
    }

    public bitcoinGetMaxAmount({
        byteFee,
        utxoDataFormRN,
        adminFee,
        spendSizeBytes
    }: BitcoinGetMaxAmountPropType): Promise<number | undefined> {
        return new Promise<number>((resolve, reject) => {
            this._bitcoinModule.bitcoinGetMaxAmount(
                byteFee,
                utxoDataFormRN,
                adminFee,
                spendSizeBytes,
                (res: number) => {
                    resolve(res);
                },
                (error: any) => {
                    console.log('Get Bitcoin Max Amount native error: ', error);
                    reject(new Error(error));
                },
            );
        });
    }
    public bitcoinTransaction({
        env,
        mnemonic,
        toAddress,
        amountSend,
        byteFee,
        adminAddress,
        adminFee,
        utxoDataFormRN,
        spendSizeBytes,
    }: BitcoinTransactionPropType): Promise<
        BitcoinTransactionType | undefined
    > {
        return new Promise<BitcoinTransactionType>((resolve, reject) => {
            this._bitcoinModule.bitcoinTransaction(
                env,
                mnemonic,
                toAddress,
                amountSend,
                byteFee,
                adminAddress,
                adminFee,
                utxoDataFormRN,
                spendSizeBytes,
                (data: BitcoinTransactionType) => {
                    resolve(data);
                },
                (error: any) => {
                    reject(error);
                },
            );
        });
    }
    public isValidBitcoinAddress({
        isTestNet,
        address,
    }: {
        isTestNet: boolean;
        address: string;
    }): Promise<boolean | undefined> {
        return new Promise<boolean>((resolve, reject) => {
            this._bitcoinModule.isValidBitcoinAddress(
                isTestNet,
                address,

                (result: boolean) => {
                    resolve(result);
                },
                (error: any) => {
                    reject(error);
                },
            );
        });
    }
}

export default NativeBitcoinModules;
