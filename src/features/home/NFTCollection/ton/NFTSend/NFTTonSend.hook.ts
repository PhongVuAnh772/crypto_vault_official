import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions, useRoute } from '@react-navigation/native';
import { Address, toNano } from '@ton/core';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, TextInput } from 'react-native';
import { useCodeScanner } from 'react-native-vision-camera';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
    useSelectedCurrencySetting,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { setDeleteTonNFT } from 'src/core/redux/slice/NFT/NFTImport.slice';
import TonServices from 'src/core/services/TonServices';
import {
    EmulateMessageToWalletResType,
    TonAccountsType,
} from 'src/core/services/TonServices/type';
import NFTTonTransfer from 'src/core/services/TonTransactions/NFTTransfer';
import { default as Utils } from 'src/core/utils/commonUtils';

import {
    CommonContextMessage,
    Feature,
} from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import {
    getBlockTonNftTransfer,
    getTonAdminBounce,
    setActionFailedNeedToContact,
    setShowCommonErrorModal,
} from 'src/core/redux/slice/app.slice';
import createContextError from 'src/core/services/ContextError';

import {
    default as tonUtils,
    default as TonUtils,
} from 'src/core/utils/tonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTTonData } from '../NFTImport/NFTTonImport.type';
import { NFTSendParams } from './NFTTonSend.type';

const useNFTSend = ({ navigation }: RootNavigationType) => {
    const dispatch = useAppDispatch();
    const nftTonTransfer = new NFTTonTransfer();
    const tonServices = new TonServices();
    const nftData = useRoute<NFTSendParams>().params;
    const { detail, root } = nftData;
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const { t } = useTranslation();
    const bottomSheetSendMaximum = useRef<BottomSheetModal>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
    const [isLoadingSkeleton, setIsLoadingSkeleton] = useState<boolean>(true);
    const [showModalConfirmTransaction, setShowModalConfirmTransaction] =
        useState<boolean>(false);
    const [toAddress, setToAddress] = useState('');
    const [inputRecipientAddress, setInputRecipientAddress] = useState(false);
    const [requirePinCode, setRequirePinCode] = useState(false);
    const showModalGivePermission = useRef<BottomSheetModal>(null);
    const quantityInputRef = useRef<TextInput>(null);
    const [showScanQRCamera, setShowScanQRCamera] = useState(false);
    const protocolBaseData = useProtocolSelected();
    const currentWallet = useCurrentWallet();
    const currentProtocol = useProtocolSelected();
    const tonAddressData = useTonAddressData();
    const [toAddressError, setToAddressError] = useState(false);
    const [errorBalance, setErrorBalance] = useState(false);
    const [errorBalanceCover] = useState(false);
    const [networkFeeValueRequire, setNetworkFeeValueRequire] = useState(0);
    const blockTonNftTransfer = useAppSelector(getBlockTonNftTransfer);
    const tonAdminBounce = useAppSelector(getTonAdminBounce);

    const onCloseScanQr = () => {
        setShowScanQRCamera(false);
    };
    const onCloseBottomSheetSendMaximum = () => {
        bottomSheetSendMaximum.current?.close();
    };
    const closeRequirePinCode = () => setRequirePinCode(false);

    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            setWalletAddress(text);
            quantityInputRef.current?.focus();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCallBackScanQR = (value: string) => {
        setShowScanQRCamera(false);
        setWalletAddress(value);
        quantityInputRef.current?.focus();
    };

    const onShowScanQRCamera = () => {
        setShowScanQRCamera(true);
        Keyboard.dismiss();
    };
    const handleCheckError = (error: string) => {
        const errorMessage = error + '';
        const checkError = errorMessage.includes('insufficient funds');
        if (checkError) {
            setError(t(LanguageKey.send_input_error_2));
        }
    };

    const showToastTimeout = (type: AppToastType, msg: string) => {
        setTimeout(() => {
            Utils.showToast({
                msg: msg,
                type: type,
                visibilityTime: 2000,
            });
        }, 700);
    };

    const validateData = () => {
        const valueChecked = tonUtils.validAddress(walletAddress);
        if (!valueChecked) {
            throw new Error(t(LanguageKey.invalid_wallet_address));
        }
    };
    const handleErrorToast = (error: any, contextError: string) => {
        switch (error?.message) {
            case t(LanguageKey.invalid_wallet_address):
                showToastTimeout(
                    AppToastType.error,
                    t(LanguageKey.invalid_wallet_address),
                );
                break;
            case t(LanguageKey.common_send_failed):
                showToastTimeout(
                    AppToastType.error,
                    t(LanguageKey.common_send_failed),
                );
                break;
            default:
                dispatch(setShowCommonErrorModal(true));
                dispatch(setActionFailedNeedToContact(contextError));
                break;
        }
    };

    const handleOnClickContinue = async () => {
        Keyboard.dismiss();
        hidingErrorBalance();
        setIsLoadingPage(true);
        try {
            validateData();

            if (
                !currentWallet ||
                !currentWallet.address ||
                !tonAddressData ||
                !protocolBaseData ||
                !protocolBaseData?.beneficiary ||
                !currentProtocol
            ) {
                const errorConTextMissingData = createContextError({
                    feature: Feature.NFTCollection,
                    fileError: `NFTTonSend.hook.ts`,
                    functionError: `handleOnClickContinue`,
                    lineError: 256,
                    reason: CommonContextMessage.errorMissingData,
                    protocol: ProtocolType.Ton,
                });
                dispatch(setShowCommonErrorModal(true));
                dispatch(setActionFailedNeedToContact(errorConTextMissingData));
                return;
            }

            const tonDataRes = await tonServices.getAccounts({
                address: Address.parse(tonAddressData.address),
            });

            const tonAccountDataRes = tonDataRes.data as TonAccountsType;
            if (!tonAccountDataRes) {
                const errorConTextMissingData = createContextError({
                    feature: Feature.NFTCollection,
                    fileError: `NFTTonSend.hook.ts`,
                    functionError: `handleOnClickContinue`,
                    lineError: 181,
                    reason: `${CommonContextMessage.errorMissingData}: tonAccountDataRes`,
                    protocol: ProtocolType.Ton,
                });
                dispatch(setShowCommonErrorModal(true));
                dispatch(setActionFailedNeedToContact(errorConTextMissingData));
                return;
            }
            const currentAdminFee = currentProtocol?.nftTransferFee;
            const bigAdminFee = BigInt(
                tonUtils.toBigNumber(
                    currentAdminFee,
                    protocolBaseData?.nativeToken.decimal,
                ),
            );
            const emulateTransferData = await nftTonTransfer.handleNFTTransfer({
                recipientAddress: walletAddress,
                nftAddressString: nftData.root.contractAddress,
                senderAddressString: currentWallet?.address,
                privateKey: tonAddressData?.privateKey,
                publicKey: tonAddressData?.publicKey,
                adminAddress: protocolBaseData?.beneficiary?.walletAddress,
                adminFee: bigAdminFee,
                amountSending: toNano(0.2),
                tonDataRes: tonAccountDataRes,
                currentDecimal: protocolBaseData?.nativeToken.decimal,
                isRealisticTransaction: false,
                tonAdminBounce: tonAdminBounce,
            });
            if (!emulateTransferData) {
                const errorConTextMissingData = createContextError({
                    feature: Feature.NFTCollection,
                    fileError: `NFTTonSend.hook.ts`,
                    functionError: `handleOnClickContinue`,
                    lineError: 181,
                    reason: `${CommonContextMessage.errorMissingData}: emulateTransferData`,
                    protocol: ProtocolType.Ton,
                });
                dispatch(setShowCommonErrorModal(true));
                dispatch(setActionFailedNeedToContact(errorConTextMissingData));
                return;
            }

            const { emulateTransfer } = emulateTransferData;

            const tonBalance = TonUtils.formatBigNumber(
                tonAccountDataRes?.balance.toString(),
                protocolBaseData?.nativeToken.decimal,
            );

            const emulateTransferDataResult: EmulateMessageToWalletResType =
                emulateTransfer;
            const emulatedNetworkFee = Math.ceil(
                Math.abs(emulateTransferDataResult?.event.extra ?? 0) * 1.05,
            );
            const emulatedNetworkFeeWithDecimal = TonUtils.formatBigNumber(
                emulatedNetworkFee.toString(),
                protocolBaseData?.nativeToken.decimal,
            );

            const totalFeeBigAmountWithDecimal =
                emulatedNetworkFeeWithDecimal + currentAdminFee;

            if (totalFeeBigAmountWithDecimal > tonBalance) {
                setNetworkFeeValueRequire(totalFeeBigAmountWithDecimal);
                setErrorBalance(true);
                return;
            }

            navigation.dispatch(
                StackActions.push(HomeStackScreenKey.NFTTonConfirmationSend, {
                    root,
                    detail,
                    toAddress: walletAddress,
                    nftData: nftData,
                    bigAdminFee: bigAdminFee,
                    networkFee: emulatedNetworkFee,
                }),
            );
        } catch (error: any) {
            const errorConTextMissingData = createContextError({
                feature: Feature.NFTCollection,
                fileError: `NFTTonSend.hook.ts`,
                functionError: `handleOnClickContinue`,
                lineError: 256,
                reason: error?.message ?? error,
                protocol: ProtocolType.Ton,
            });
            console.log('🚀 ~ handleOnClickContinue ~ error:', error);
            handleCheckError(error + '');
            handleErrorToast(error, errorConTextMissingData);
        } finally {
            setIsLoadingPage(false);
        }
    };
    const confirmAction = () => {
        setShowModalConfirmTransaction(false);
        setRequirePinCode(true);
    };
    const checkTonAddress = (currentToAddress?: string) => {
        const currentValue = currentToAddress ?? toAddress;
        return TonUtils.validAddress(currentValue);
    };
    const checkTonAddressAndSetState = (currentToAddress?: string) => {
        const currentValue = currentToAddress ?? toAddress;
        const res = checkTonAddress(currentValue);
        setToAddressError(!res);
        setInputRecipientAddress(res);
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: codes => {
            if (codes.length > 0) {
                const scanValue = codes[0].value ?? '';
                setToAddress(scanValue);
                checkTonAddressAndSetState(scanValue);
                setShowScanQRCamera(false);
            }
        },
    });
    const hidingErrorBalance = () => {
        setErrorBalance(false);
    };
    const handleConfirm = () => {
        setShowModalConfirmTransaction(true);
    };
    const dismissModalConfirm = () => {
        setShowModalConfirmTransaction(false);
    };

    const handleBack = () => {
        if (showScanQRCamera) {
            setShowScanQRCamera(false);
        } else {
            navigation.goBack();
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

    const handleDeleteNFT = (NFT: NFTTonData) => {
        dispatch(setDeleteTonNFT(NFT));
        Utils.showToast({
            msg: t(LanguageKey.nft_remove_successfully),
            type: AppToastType.success,
        });
    };

    const initialData = async () => {
        try {
            setIsLoadingSkeleton(true);
            if (!currentWallet?.address) {
                navigation.goBack();
                throw new Error(t(LanguageKey.error_finish_invalid_nft_info));
            }
            const walletAddressRaw = Address.parse(currentWallet?.address);
            const nftDataRaw = Address.parse(nftData.root.contractAddress);

            const resDetailNFT =
                await tonServices.getDetailNFTByAddressUsingAPI({
                    address: nftDataRaw.toRawString(),
                });

            if (!resDetailNFT.data?.owner?.address) {
                navigation.goBack();
                throw new Error(t(LanguageKey.error_finish_invalid_nft_info));
            }

            if (
                !compareExactOwnerAddress(
                    resDetailNFT.data?.owner?.address,
                    walletAddressRaw.toRawString(),
                )
            ) {
                navigation.dispatch(StackActions.popToTop());
                handleDeleteNFT(nftData);
                throw new Error(t(LanguageKey.import_nft_not_owned));
            }
            setIsLoadingSkeleton(false);
        } catch (error) {
            console.log('error from initialData', error);
            Utils.showToast({
                msg: (error as Error).message,
                type: AppToastType.error,
                visibilityTime: 2000,
            });
        }
    };

    const handleUnderstood = () => {
        navigation.dispatch(StackActions.popToTop());
    };
    const onSubmitWalletAddress = () => {
        quantityInputRef.current?.focus();
    };

    useEffect(() => {
        if (blockTonNftTransfer) {
            navigation.goBack();
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockTonNftTransfer]);

    useEffect(() => {
        initialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        handleOnClickContinue,
        walletAddress,
        setWalletAddress,
        t,
        handleCopyToClipboard,
        showScanQRCamera,
        isLoadingPage,
        showModalGivePermission,
        handleConfirm,
        showModalConfirmTransaction,
        handleCallBackScanQR,
        onShowScanQRCamera,
        handleBack,
        error,
        handleUnderstood,
        isLoadingSkeleton,
        quantityInputRef,
        onSubmitWalletAddress,
        quantity,
        setQuantity,
        currentProtocol,
        nftData,
        requirePinCode,
        setRequirePinCode,
        closeRequirePinCode,
        bottomSheetSendMaximum,
        onCloseBottomSheetSendMaximum,
        codeScanner,
        inputRecipientAddress,
        toAddressError,
        dismissModalConfirm,
        fromAddress: currentWallet?.address,
        toAddress: walletAddress,
        sign: selectedCurrencySetting?.sign,
        confirmAction,
        errorBalance,
        errorBalanceCover,
        onCloseScanQr,
        adminFee: currentProtocol ? currentProtocol.nftTransferFee : 0,
        networkFee: networkFeeValueRequire,
        setNetworkFeeValueRequire,
        hidingErrorBalance,
    };
};
export default useNFTSend;
