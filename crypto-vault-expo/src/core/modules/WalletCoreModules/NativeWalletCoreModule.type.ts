export type WalletCoreCoinDataType = {
    address: string;
    publicKey: string;
    privateKey: string;
};

export type GetDataFromSlip0044PropType = {
    mnemonic: string;
    isTestNet: boolean;
    slip0044: number;
    derivationPath?: string;
};
export type GetDataEVMKeyAndAddressFromSlip0044PropType = {
    mnemonic: string;
    slip0044: number;
    derivationPath: string;
};
