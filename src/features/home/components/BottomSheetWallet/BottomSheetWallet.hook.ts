import { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';

import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import appConstants from 'src/core/constants/AppConstants';
import AppToastType from 'src/core/enum/AppToastType';
import Slip0044 from 'src/core/enum/Slip0044';
import ThemeKey from 'src/core/enum/ThemeKey';
import LanguageKey from 'src/core/locales/LanguageKey';
import NativeWalletCoreModule from 'src/core/modules/WalletCoreModules/NativeWalletCoreModule';
import { WalletCoreCoinDataType } from 'src/core/modules/WalletCoreModules/NativeWalletCoreModule.type';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useMnemonic } from 'src/core/redux/slice/account.selector';
import { addWallet } from 'src/core/redux/slice/account.slice';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import { checkValidAddressEVM } from 'src/core/services/Web3';
import AccountUtils from 'src/core/utils/accountUtils';
import Utils from 'src/core/utils/commonUtils';
type BottomSheetWalletViewType = {
    addressList: AddressListItemType[] | undefined;
    selectedAddressId: string | undefined;
    protocolBaseData?: ProtocolDataWithSupportedTokensFormBEType;
    isAddView: boolean;
    setIsAddView: React.Dispatch<React.SetStateAction<boolean>>;
    closeParentBottomSheetModal?: () => void;
};

const useBottomSheetWallet = ({
    addressList,
    selectedAddressId,
    protocolBaseData,
    isAddView,
    setIsAddView,
    closeParentBottomSheetModal,
}: BottomSheetWalletViewType) => {
    const { t } = useTranslation();
    const insets = useAppSafeAreaInsets();
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const mnemonic = useMnemonic();
    const [isFocus, setIsFocus] = useState(false);
    const [showModalImportWallet, setShowModalImportWallet] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [walletAddressError, setWalletAddressError] = useState('');
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [foundIndex, setFoundIndex] = useState<number>(
        addressList?.length ?? 0,
    );
    const flatListRef = useRef<FlatList>(null);
    useEffect(() => {
        if (selectedAddressId && addressList) {
            const selectedIndex = addressList.findIndex(
                item => item.id === selectedAddressId,
            );
            if (selectedIndex !== -1 && flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: selectedIndex,
                    animated: true,
                });
            }
        }
        if (!showModalImportWallet && abortController) {
            if (abortController) {
                abortController.abort();
            }
            if (isScanning) {
                setIsScanning(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAddressId, isAddView, showModalImportWallet]);

    const action = async (
        index: number,
        signal: AbortSignal,
    ): Promise<string | undefined> => {
        const nativeWalletCoreModule = new NativeWalletCoreModule();
        const newDerivationPath = AccountUtils.changeDerivationPath(
            appConstants.defaultDerivationPath,
            index,
        );
        const slip0044 = protocolBaseData?.slip0044 ?? Slip0044.Ethereum;

        let walletCoreCoinData: WalletCoreCoinDataType | undefined;

        if (slip0044 != null && mnemonic) {
            walletCoreCoinData =
                await nativeWalletCoreModule.getDataFromSlip0044({
                    mnemonic,
                    isTestNet: false,
                    slip0044,
                    derivationPath: newDerivationPath,
                });
        }
        return !signal.aborted ? walletCoreCoinData?.address : undefined;
    };

    const scanForAddress = async (
        expectAddress: string,
        signal: AbortSignal,
    ) => {
        let index = 0;
        try {
            while (!signal.aborted && index < 20000) {
                const address = await action(index, signal);
                if (signal.aborted) {
                    console.log('Scan cancelled.');
                    break;
                }
                if (address === expectAddress) {
                    console.log(`Address found at index ${index}: ${address}`);
                    const res = await dispatch(addWallet(index));
                    if (addWallet.fulfilled.match(res)) {
                        setShowModalImportWallet(false);
                        setIsAddView(false);
                        setIsScanning(false);
                        setWalletAddress('');
                        setTimeout(() => {
                            if (closeParentBottomSheetModal) {
                                closeParentBottomSheetModal();
                                Utils.showToast({
                                    msg: t(LanguageKey.import_wallet_success),
                                    type: AppToastType.success,
                                });
                            }
                        }, 500);
                    }

                    break;
                } else {
                    console.log(
                        `Address at index ${index} did not match: ${address}`,
                    );
                }
                index++;
                setFoundIndex(index);
                if (signal.aborted) {
                    console.log('Scan cancelled.');
                    break;
                }
            }
        } catch (error) {
            if (signal.aborted) {
                console.log('Scan was aborted');
            } else {
                console.log('Error during scan:', error);
            }
        } finally {
            setIsScanning(false);
            if (!signal.aborted) {
                console.log('Address not found');
                setWalletAddressError(LanguageKey.invalid_wallet_address);
            }
        }
    };

    const handleStartScan = () => {
        const findAddress = addressList?.some(e => e.address === walletAddress);
        if (findAddress) {
            setWalletAddressError(LanguageKey.address_existed);
            return;
        }
        const checkAddress = checkValidAddressEVM(walletAddress);
        if (!checkAddress) {
            setWalletAddressError(LanguageKey.invalid_wallet_address);
            return;
        }
        const controller = new AbortController();
        setAbortController(controller);
        setWalletAddressError('');
        setIsScanning(true);
        setFoundIndex(0);
        scanForAddress(walletAddress, controller.signal);
    };

    const handleCancelScan = () => {
        if (abortController) {
            abortController.abort();
        }
        setIsScanning(false);
    };

    const onChangeText = (value: string) => {
        setWalletAddress(value);
        setWalletAddressError('');
    };
    const createWalletAction = async () => {
        const resAddWallet = await dispatch(addWallet());
        if (addWallet.fulfilled.match(resAddWallet)) {
            if (closeParentBottomSheetModal) {
                closeParentBottomSheetModal();
                Utils.showToast({
                    msg: t(LanguageKey.add_wallet_success),
                    type: AppToastType.success,
                });
            } else {
                setShowModalImportWallet(false);
            }
        }
    };
    const onFoCus = () => {
        setIsFocus(false);
    };
    const onBlur = () => {
        setIsFocus(true);
    };
    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            onChangeText(text);
        } catch (error) {
            console.error(error);
        }
    };
    const closeModalImport = () => {
        setShowModalImportWallet(false);
    };
    return {
        theme,
        insets,
        showModalImportWallet,
        isScanning,
        t,
        handleCancelScan,
        handleStartScan,
        setShowModalImportWallet,
        walletAddress,
        setWalletAddress,
        setWalletAddressError,
        walletAddressError,
        foundIndex,
        flatListRef,
        onChangeText,
        createWalletAction,
        isFocus,
        onFoCus,
        onBlur,
        handleCopyToClipboard,
        closeModalImport,
        lightMode,
    };
};

export default useBottomSheetWallet;
