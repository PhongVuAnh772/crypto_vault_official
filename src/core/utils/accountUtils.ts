import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { Address } from '@ton/core';
import appConstants from '../constants/AppConstants';
import EnvConfig from '../constants/EnvConfig';
import { DefaultProtocolDataList } from '../constants/ProtocolDefaultData';
import Slip0044 from '../enum/Slip0044';
import TonWalletVersion from '../enum/TonWalletVersion';
import VMType from '../enum/VMType';
import NativeWalletCoreModule from '../modules/WalletCoreModules/NativeWalletCoreModule';
import { WalletCoreCoinDataType } from '../modules/WalletCoreModules/NativeWalletCoreModule.type';
import {
    AccountSliceType,
    AccountType,
    AddressListItemType,
    ProtocolDataType,
    ProtocolDataWithSupportedTokensFormBEType,
} from '../redux/slice/account.type';
import {
    AccountTonWithAndAddress,
    AddressDataWithWalletConnectChainIdType,
    IdAccountWithChainIdAndAddress,
} from '../redux/slice/type';
import TonWallet from '../services/TonWallet';
import BitcoinUtils from './bitcoinUtils';
import Utils from './commonUtils';
import TonUtils from './tonUtils';

const getTonAddress = async (version: TonWalletVersion, publicKey: string, isTestNet?: boolean) => {
    const tonWallet = new TonWallet();
    const tonWalletData = await tonWallet.createWallet(
        version ?? TonWalletVersion.V5,
        publicKey,
        isTestNet,
    );
    return tonWalletData.address.toString({
        bounceable: false,
    });
};

const getAvtColor = (index: number) => {
    const listColorsLength = appConstants.listColorsForAccountAndWallet.length;

    const validIndex =
        index > listColorsLength ? index - listColorsLength : index;

    return appConstants.listColorsForAccountAndWallet[validIndex];
};

const generateProtocolData = async ({
    generateDataProtocolListsFromBE,
    mnemonic,
    dispatch,
    isTestNet,
}: {
    generateDataProtocolListsFromBE: ProtocolDataWithSupportedTokensFormBEType[];
    mnemonic: string;
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>;
    isTestNet?: boolean;
}): Promise<ProtocolDataType[] | undefined> => {
    const protocolDataLists: ProtocolDataType[] = [];
    const nativeWalletCoreModule = new NativeWalletCoreModule();

    for (const protocol of generateDataProtocolListsFromBE) {
        const { slip0044, VM, _id } = protocol;
        let version;
        let derivationPath: string | undefined;
        const isTon = slip0044 === Slip0044.Ton;

        if (isTon) {
            version = TonWalletVersion.V5;
            derivationPath = appConstants.defaultTonDerivationPath;
        } else if (VM === VMType.EVM) {
            derivationPath = appConstants.defaultDerivationPath;
        }

        let walletCoreCoinData: WalletCoreCoinDataType | undefined;
        if (slip0044 != null) {
            walletCoreCoinData =
                await nativeWalletCoreModule.getDataFromSlip0044({
                    mnemonic,
                    isTestNet,
                    slip0044,
                    derivationPath,
                });
        }

        if (walletCoreCoinData) {
            const id = Utils.generateUniqueId();

            let finalAddress = walletCoreCoinData.address;
            if (isTon) {
                finalAddress = await getTonAddress(
                    version ?? TonWalletVersion.V5,
                    walletCoreCoinData?.publicKey,
                    isTestNet,
                );
            }

            const addressList: AddressListItemType[] = [
                {
                    address: finalAddress,
                    path: derivationPath,
                    index: 0,
                    name: 'Wallet 1',
                    id,
                    version,
                    publicKey: walletCoreCoinData.publicKey,
                    privateKey: walletCoreCoinData.privateKey,
                    avtColor: getAvtColor(0),
                },
            ];

            protocolDataLists.push({
                selectedAddressId: id,
                addressList,
                _id,
            });
        }
    }

    return protocolDataLists;
};

const changeDerivationPath = (derivationPath: string, index: number) => {
    return derivationPath.substring(0, derivationPath.length - 1) + index;
};

const checkProtocolData = async ({
    protocolListsFromBE,
    mnemonic,
    isTestNet,
}: {
    protocolListsFromBE?: ProtocolDataWithSupportedTokensFormBEType[];
    mnemonic: string;
    isTestNet?: boolean;
}) => {
    const listData: ProtocolDataWithSupportedTokensFormBEType[] = [];
    const nativeWalletCoreModule = new NativeWalletCoreModule();
    if (!protocolListsFromBE) return undefined;
    for (const protocol of protocolListsFromBE) {
        const slip0044 = protocol?.slip0044;
        const isTon = slip0044 === Slip0044.Ton;
        let walletCoreCoinData: WalletCoreCoinDataType | undefined;
        let isCheckBeneficiaryWalletAddress: boolean | undefined;

        // Check slip 0044
        if (slip0044 != null) {
            try {
                walletCoreCoinData =
                    await nativeWalletCoreModule.getDataFromSlip0044({
                        mnemonic,
                        isTestNet,
                        slip0044,
                        derivationPath: isTon
                            ? appConstants.defaultTonDerivationPath
                            : appConstants.defaultDerivationPath,
                    });
            } catch (error: unknown) {
                console.error('checkProtocolData Error:', error);
                walletCoreCoinData = undefined;
            }
            // Check beneficiary wallet address

            const beneficiary = protocol.beneficiary;

            const beneficiaryWalletAddress = beneficiary?.walletAddress;
            const beneficiaryStatus = beneficiary?.status;

            if (beneficiaryWalletAddress && beneficiaryStatus === 'approved') {
                isCheckBeneficiaryWalletAddress = true;
                if (slip0044 === Slip0044.Bitcoin) {
                    const resCheckBitcoinAddress =
                        await BitcoinUtils.isValidAddress(
                            beneficiaryWalletAddress,
                        );
                    isCheckBeneficiaryWalletAddress = resCheckBitcoinAddress;
                }
                if (slip0044 === Slip0044.Ton) {
                    const resCheckTonAddress = TonUtils.validAddress(
                        beneficiaryWalletAddress,
                    );
                    isCheckBeneficiaryWalletAddress = resCheckTonAddress;
                }
                if (
                    slip0044 === Slip0044.Ethereum ||
                    slip0044 === Slip0044.Polygon
                ) {
                    isCheckBeneficiaryWalletAddress = true;
                }
                if (slip0044 === Slip0044.Binance) {
                    isCheckBeneficiaryWalletAddress = true;
                }
                if (slip0044 === Slip0044.SmartChain) {
                    isCheckBeneficiaryWalletAddress = true;
                }
            } else {
                isCheckBeneficiaryWalletAddress = false;
            }
        }

        if (walletCoreCoinData && isCheckBeneficiaryWalletAddress) {
            listData.push(protocol);
        }
    }
    return listData;
};

const checkAccountProtocolDataAndGenerateAccountData = async (
    accountState: AccountSliceType,
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    protocolDataFromBe: ProtocolDataWithSupportedTokensFormBEType[] | undefined,
    isTestNet?: boolean,
): Promise<AccountType[] | undefined> => {
    const accountList = accountState?.accountLists;

    if (!accountList || !protocolDataFromBe) return;
    const firstAccount = accountList[0];

    const findResult = protocolDataFromBe?.filter(
        (protocolItem: ProtocolDataWithSupportedTokensFormBEType) => {
            const check = firstAccount?.protocolData?.some(
                e => e?._id === protocolItem?._id,
            );
            return !check;
        },
    );

    if (findResult && findResult?.length > 0) {
        const newAccountList: AccountType[] = [];
        for (const e of accountList) {
            const mnemonic = e.mnemonic;
            const protocolData = await AccountUtils.generateProtocolData({
                mnemonic,
                generateDataProtocolListsFromBE: findResult,
                dispatch,
                isTestNet,
            });
            if (!protocolData) {
                return undefined;
            }
            const newAccountItem: AccountType = {
                ...e,
                protocolData: [...e.protocolData, ...protocolData],
            };
            newAccountList.push(newAccountItem);
        }
        return newAccountList;
    }
};

const checkProtocolDataWithDefaultData = (
    protocolDataFromBe?: ProtocolDataWithSupportedTokensFormBEType[],
): ProtocolDataWithSupportedTokensFormBEType[] => {
    // If backend returns data, we use it as the source of truth.
    // We no longer merge with hardcoded defaults to allow deactivation via Admin.
    if (protocolDataFromBe && protocolDataFromBe.length > 0) {
        return protocolDataFromBe;
    }
    return DefaultProtocolDataList;
};

const checkAccountType = (value: any): value is AccountType[] => {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every(item => {
        return (
            typeof item === 'object' &&
            typeof item.mnemonic === 'string' &&
            typeof item.name === 'string' &&
            typeof item.id === 'string'
        );
    });
};


export const getAddressDataWithWalletConnectChainId = ({
    chaiId,
    protocolListData,
    currentAccount,
}: AddressDataWithWalletConnectChainIdType) => {
    const coinProtocolData = protocolListData?.find(
        e => e.walletConnectSupportedChain === chaiId,
    );
    const accountProtocolListData = currentAccount?.protocolData;

    const coinAccountData = accountProtocolListData?.find(
        e => e._id === coinProtocolData?._id,
    );
    const polAddressList = coinAccountData?.addressList;
    const selectedAddressId = coinAccountData?.selectedAddressId;
    const currentCoinAddressData = polAddressList?.find(
        e => e.id === selectedAddressId,
    );
    return currentCoinAddressData;
};
export const getAccountTonWithAndAddress = ({
    addressRequest,
    protocolListData,
    allCount,
}: AccountTonWithAndAddress) => {
    const coinProtocolData = protocolListData?.find(
        e => e.slip0044 === Slip0044.Ton,
    );
    if (!addressRequest.startsWith('0:')) {
        addressRequest = Address.parse(addressRequest).toRawString();
    }
    if (coinProtocolData && allCount) {
        const account = allCount.find(account =>
            account.protocolData.some(
                protocol =>
                    protocol._id?.includes(coinProtocolData._id) &&
                    protocol.addressList.some(
                        addr =>
                            Address.parse(addr.address).toRawString() ===
                            addressRequest,
                    ),
            ),
        );

        return account;
    }
};

export const getIdAccountWithChainIdAndAddress = ({
    addressRequest,
    chaiId,
    protocolListData,
    allCount,
}: IdAccountWithChainIdAndAddress) => {
    const coinProtocolData = protocolListData?.find(
        e => e.walletConnectSupportedChain === chaiId,
    );
    if (coinProtocolData && allCount) {
        const account = allCount.find(account =>
            account.protocolData.some(protocol =>
                protocol.addressList.some(
                    addr =>
                        addr.address.toUpperCase() ===
                            addressRequest.toUpperCase() &&
                        protocol._id?.includes(coinProtocolData?._id),
                ),
            ),
        );
        return account;
    }
};
const AccountUtils = {
    generateProtocolData,
    changeDerivationPath,
    getAvtColor,
    checkProtocolData,
    checkAccountProtocolDataAndGenerateAccountData,
    checkAccountType,
    checkProtocolDataWithDefaultData,
    getAddressDataWithWalletConnectChainId,
    getAccountTonWithAndAddress,
    getIdAccountWithChainIdAndAddress
};

export default AccountUtils;
