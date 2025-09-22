import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import { Address } from '@ton/core';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, TextInput } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
    useSelectedCurrencySetting,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import {
    getBlockTonNftTransfer,
    getTonAdminBounce,
    setShowCommonErrorModal,
} from 'src/core/redux/slice/app.slice';
import { setDeleteTonNFT } from 'src/core/redux/slice/NFT/NFTImport.slice';
import TonServices from 'src/core/services/TonServices';
import { TonAccountsType } from 'src/core/services/TonServices/type';
import NFTTonTransfer from 'src/core/services/TonTransactions/NFTTransfer';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import TonUtils, { default as tonUtils } from 'src/core/utils/tonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTConfirmParamsType } from './NFTConfirmationSend.type';

export type NFTSendConfirmationRouteProp = RouteProp<
    NFTConfirmParamsType,
    HomeStackScreenKey.NFTTonConfirmationSend
>;

const useNFTTonConfirmationSend = ({ navigation }: RootNavigationType) => {
    const { root, detail, toAddress, nftData, networkFee, bigAdminFee } =
        useRoute<NFTSendConfirmationRouteProp>().params;

    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const nftTonTransfer = new NFTTonTransfer();
    const tonServices = new TonServices();
    const protocolSelected = useProtocolSelected();
    const bottomSheetSendMaximum = useRef<BottomSheetModal>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
    const [showModalConfirmTransaction, setShowModalConfirmTransaction] =
        useState<boolean>(false);
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const blockTonNftTransfer = useAppSelector(getBlockTonNftTransfer);
    const [requirePinCode, setRequirePinCode] = useState(false);
    const showModalGivePermission = useRef<BottomSheetModal>(null);
    const quantityInputRef = useRef<TextInput>(null);
    const [showScanQRCamera, setShowScanQRCamera] = useState(false);
    const protocolBaseData = useProtocolSelected();
    const currentWallet = useCurrentWallet();
    const currentProtocol = useProtocolSelected();
    const tonAddressData = useTonAddressData();
    const tonAdminBounce = useAppSelector(getTonAdminBounce);

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

    const formattedAdminFee = TonUtils.formatBigNumber(
        bigAdminFee.toString(),
        protocolBaseData?.nativeToken.decimal,
    );

    const formattedNetworkFee = TonUtils.formatBigNumber(
        networkFee.toString(),
        protocolBaseData?.nativeToken.decimal,
    );

    const formattedTotalFeeBigAmount = formattedAdminFee + formattedNetworkFee;

    const subNetworkFee = Utils.formattedCurrency(
        (formattedNetworkFee ?? 0) *
            (protocolBaseData?.price ?? 0) *
            (selectedCurrencySetting?.rate ?? 0),
    );

    const subAdminFee = Utils.formattedCurrency(
        (formattedAdminFee ?? 0) *
            (protocolBaseData?.price ?? 0) *
            (selectedCurrencySetting?.rate ?? 0),
    );

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

    const validateData = () => {
        const valueChecked = tonUtils.validAddress(toAddress);
        if (!valueChecked) {
            throw new Error(t(LanguageKey.invalid_wallet_address));
        }
    };

    const confirmAction = () => {
        setRequirePinCode(true);
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

    const handleUnderstood = () => {
        navigation.dispatch(StackActions.popToTop());
    };
    const onSubmitWalletAddress = () => {
        quantityInputRef.current?.focus();
    };
    const continueActionAfterPassPinCode = async () => {
        closeRequirePinCode();
        Keyboard.dismiss();
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
                navigation.goBack();
                dispatch(setShowCommonErrorModal(true));
                return;
            }

            const tonDataRes = await tonServices.getAccounts({
                address: Address.parse(tonAddressData.address),
            });
            const tonAccountDataRes = tonDataRes.data as TonAccountsType;

            let seperateFeeCovering = networkFee;
            if (bigAdminFee > 0) {
                seperateFeeCovering = networkFee / 2;
            }
            const transferEmulateData = await nftTonTransfer.handleNFTTransfer({
                recipientAddress: toAddress,
                nftAddressString: nftData.root.contractAddress,
                senderAddressString: currentWallet?.address,
                privateKey: tonAddressData?.privateKey,
                publicKey: tonAddressData?.publicKey,
                adminAddress: protocolBaseData?.beneficiary?.walletAddress,
                adminFee: bigAdminFee,
                amountSending: BigInt(Math.ceil(seperateFeeCovering)),
                tonDataRes: tonAccountDataRes,
                currentDecimal: protocolBaseData?.nativeToken.decimal,
                isRealisticTransaction: true,
                tonAdminBounce: tonAdminBounce,
            });
            if (!transferEmulateData) {
                Utils.showToast({
                    msg: t(LanguageKey.common_send_failed),
                    type: AppToastType.error,
                    visibilityTime: 2000,
                });
                return;
            }

            const { transferData } = transferEmulateData;

            const blockchainResponseData =
                await tonServices.sendMessageToBlockchain({
                    boc: transferData.messageBOCString,
                });
            if (blockchainResponseData.isSuccess) {
                if (
                    !compareExactOwnerAddress(toAddress, currentWallet.address)
                ) {
                    dispatch(setDeleteTonNFT(nftData));
                }

                navigation.dispatch(
                    StackActions.push(HomeStackScreenKey.NFTTonSendDetail, {
                        txHash: transferData.txHash,
                        fromAddress: currentWallet?.address,
                        toAddress: toAddress,
                        nftData: nftData,
                        adminFee: formattedAdminFee,
                        networkFee: formattedNetworkFee,
                        total: formattedTotalFeeBigAmount,
                    }),
                );
            } else {
                Utils.showToast({
                    msg: t(LanguageKey.common_send_failed),
                    type: AppToastType.error,
                    visibilityTime: 2000,
                });
            }
        } catch (error) {
            console.log('🚀 ~ send ~ error:', error);
            handleCheckError(error + '');
            Utils.showToast({
                msg: t(LanguageKey.common_send_failed),
                type: AppToastType.error,
                visibilityTime: 2000,
            });
        } finally {
            setIsLoadingPage(false);
        }
    };

    useEffect(() => {
        if (blockTonNftTransfer) {
            navigation.dispatch(StackActions.popToTop());
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockTonNftTransfer]);

    return {
        subNetworkFee,
        root,
        detail,
        lastPreview:
            detail.nftDetailAll.previews?.[
                detail.nftDetailAll.previews.length - 1
            ]?.url,
        sign: selectedCurrencySetting?.sign,
        fromAddress: currentWallet?.address,
        toAddress,
        subAdminFee,
        t,
        walletAddress,
        setWalletAddress,
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
        quantityInputRef,
        onSubmitWalletAddress,
        quantity,
        setQuantity,
        currentProtocol,
        requirePinCode,
        setRequirePinCode,
        closeRequirePinCode,
        continueActionAfterPassPinCode,
        bottomSheetSendMaximum,
        onCloseBottomSheetSendMaximum,
        dismissModalConfirm,
        confirmAction,
        protocolSelected,
        selectedCurrencySetting,
        formattedTotalFeeBigAmount,
        formattedNetworkFee: Number(formattedNetworkFee),
        formattedAdminFee: Number(formattedAdminFee),
        newUI,
    };
};
export default useNFTTonConfirmationSend;
