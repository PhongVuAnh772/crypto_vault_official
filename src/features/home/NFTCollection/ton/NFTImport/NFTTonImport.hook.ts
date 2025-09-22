import { Address } from '@ton/core';
import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import Canvas from 'react-native-canvas';
import AppToastType from 'src/core/enum/AppToastType';
import { BurntAddress } from 'src/core/enum/BurntAddress';
import { NFTImportError } from 'src/core/enum/NFTCollectionTab';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import {
    importNFTTonThunk,
    setTabCollectionIndex,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import TonServices from 'src/core/services/TonServices';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useAppSafeAreaInsets from '../../../../../core/hooks/useAppSafeAreaInsets';

const useNFTImport = ({ navigation }: RootNavigationType) => {
    const tonServices = new TonServices();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const wallet = useCurrentWallet();
    const selectAccountId = useAppSelector(getAccountId);
    const currentProtocol = useProtocolSelected();
    const [loading, setLoading] = useState<boolean>(false);
    const [contractAddress, setContractAddress] = useState<string>('');
    const [idNFT, setIdNFT] = useState<string>('');
    const [burntNFTModal, setBurntNFTModal] = useState<boolean>(false);
    const canvasRef = useRef<Canvas>(null);
    const [showScanQRCamera, setShowScanQRCamera] = useState(false);
    const insets = useAppSafeAreaInsets();
    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            setContractAddress(text);
        } catch (error) {
            console.error(error);
        }
    };
    const navigatingToMyCollection = () => {
        navigation.goBack();
        dispatch(setTabCollectionIndex(0));
    };
    const closeBurntWarningModal = () => {
        setBurntNFTModal(false);
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

    const handlingError = (error: any) => {
        if (error && typeof error === 'object' && 'message' in error) {
            switch (error.message) {
                case NFTImportError.ItemNFTNotFound:
                    Utils.showToast({
                        msg: t(LanguageKey.common_invalid_contract_address),
                        type: AppToastType.error,
                    });
                    break;

                default:
                    Utils.showToast({
                        msg: error.message,
                        type: AppToastType.error,
                    });
                    break;
            }
        } else {
            Utils.showToast({
                msg: error,
                type: AppToastType.error,
            });
        }
    };
    const handleSubmitImport = async () => {
        setLoading(true);
        Keyboard.dismiss();
        try {
            const protocol = currentProtocol;

            if (!protocol || !wallet || !selectAccountId) {
                console.log('protocol or wallet is null');
                Utils.showToast({
                    msg: t(LanguageKey.common_server_busy),
                    type: AppToastType.error,
                });

                return;
            }
            const walletParse = Address.parse(wallet.address);

            if (!contractAddress || !checkValidTonAddress(contractAddress)) {
                Utils.showToast({
                    msg: t(LanguageKey.common_invalid_contract_address),
                    type: AppToastType.error,
                });

                throw new Error(t(LanguageKey.common_invalid_contract_address));
            }
            const addressParse = Address.parse(contractAddress);
            const resDetailNFT =
                await tonServices.getDetailNFTByAddressUsingAPI({
                    address: addressParse.toRawString(),
                });
            if (!resDetailNFT.data?.owner?.address || !resDetailNFT.data) {
                Utils.showToast({
                    msg: t(LanguageKey.common_invalid_contract_address),
                    type: AppToastType.error,
                });
                throw new Error(t(LanguageKey.common_invalid_contract_address));
            }
            if (
                compareExactOwnerAddress(
                    resDetailNFT.data.owner.address,
                    BurntAddress.DummyAddressTon,
                ) ||
                compareExactOwnerAddress(
                    resDetailNFT.data.owner.address,
                    BurntAddress.ZeroAddressTon,
                )
            ) {
                setLoading(false);
                setBurntNFTModal(true);
                return;
            }
            if (
                !compareExactOwnerAddress(
                    resDetailNFT.data.owner.address,
                    walletParse.toRawString(),
                )
            ) {
                Utils.showToast({
                    msg: t(LanguageKey.import_nft_not_owned),
                    type: AppToastType.error,
                });
                throw new Error(t(LanguageKey.import_nft_not_owned));
            }
            const data = {
                contractAddress: resDetailNFT.data.address,
                id: `${wallet.address}_${protocol.slip0044}`,
                protocolData: protocol,
                accountId: selectAccountId ?? '',
                dataTonNFT: resDetailNFT.data,
            };
            await dispatch(importNFTTonThunk(data)).unwrap();
            navigatingToMyCollection();
            setLoading(false);
            setTimeout(() => {
                Utils.showToast({
                    msg: t(LanguageKey.nft_added_successfully),
                    type: AppToastType.success,
                });
            }, 1000);
        } catch (error: any) {
            handlingError(error);
        } finally {
            setLoading(false);
        }
    };

    const checkValidTonAddress = (address: string) => {
        try {
            Address.parse(address);
            return true;
        } catch (error) {
            console.log('checkValidTonAddress error', error);
            return false;
        }
    };

    const onScanQR = () => {
        setShowScanQRCamera(true);
    };

    const validate = () => {
        if (currentProtocol && contractAddress.trim().length) {
            return true;
        }
        return false;
    };

    const handleCallBackScanQR = (value: string) => {
        setShowScanQRCamera(false);
        setContractAddress(value);
    };

    const handleBack = () => {
        if (showScanQRCamera) {
            setShowScanQRCamera(false);
        } else {
            navigation.goBack();
        }
    };
    const onCloseScanQr = () => {
        setShowScanQRCamera(false);
    };
    return {
        t,
        showScanQRCamera,
        contractAddress,
        idNFT,
        loading,
        canvasRef,
        setContractAddress,
        handleCopyToClipboard,
        setIdNFT,
        handleSubmitImport,
        onScanQR,
        validate,
        handleCallBackScanQR,
        handleBack,
        currentProtocol,
        setBurntNFTModal,
        burntNFTModal,
        newUI,
        insets,
        closeBurntWarningModal,
        onCloseScanQr,
    };
};
export default useNFTImport;
