import {NativeModules} from 'react-native';
import {
    GetDataEVMKeyAndAddressFromSlip0044PropType,
    GetDataFromSlip0044PropType,
    WalletCoreCoinDataType,
} from './NativeWalletCoreModule.type';
import {AddressAndKeyResType} from '../type';

class NativeWalletCoreModule {
    private readonly _walletCoreModule;

    constructor() {
        this._walletCoreModule = NativeModules.WalletCoreModule;
    }

    public getDataFromSlip0044({
        mnemonic,
        isTestNet,
        slip0044,
        derivationPath,
    }: GetDataFromSlip0044PropType): Promise<
        WalletCoreCoinDataType | undefined
    > {
        return new Promise<WalletCoreCoinDataType>((resolve, reject) => {
            this._walletCoreModule.getDataFromSlip0044(
                mnemonic,
                isTestNet,
                slip0044,
                derivationPath,
                (data: WalletCoreCoinDataType) => {
                    resolve(data);
                },
                (error: any) => {
                    console.log('getDataFromSlip0044 error1', error, slip0044);
                    reject(new Error(error));
                },
            );
        });
    }
    public getEVMKeyAndAddressFromSlip0044({
        mnemonic,
        slip0044,
        derivationPath,
    }: GetDataEVMKeyAndAddressFromSlip0044PropType): Promise<
        AddressAndKeyResType | undefined
    > {
        return new Promise<AddressAndKeyResType>((resolve, reject) => {
            this._walletCoreModule.getEVMKeyAndAddressFromSlip0044(
                mnemonic,
                slip0044,
                derivationPath,
                (data: AddressAndKeyResType) => {
                    resolve(data);
                },
                (error: any) => {
                    console.log(
                        'getEVMKeyAndAddressFromSlip0044 error1',
                        error,
                    );
                    reject(new Error(error));
                },
            );
        });
    }
    public createWallet(): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve, reject) => {
            this._walletCoreModule.createWallet(
                (mnemonic: string) => {
                    resolve(mnemonic);
                },
                (error: any) => {
                    console.log('mnemonic error', error);
                    reject(new Error(error));
                },
            );
        });
    }
    public importWallet({
        secretPhrase,
    }: {
        secretPhrase: string;
    }): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve, reject) => {
            this._walletCoreModule.importWallet(
                secretPhrase,
                (mnemonic: string) => {
                    resolve(mnemonic);
                },
                (error: any) => {
                    console.log('mnemonic error', error);
                    reject(new Error(error));
                },
            );
        });
    }
}

export default NativeWalletCoreModule;
