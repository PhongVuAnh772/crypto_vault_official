import { Address } from '@ton/core';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import { appImages } from 'src/core/constants/AppImages';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    addCustomToken,
    getFullListTokens,
} from 'src/core/redux/slice/customToken/addCustomToken.slice';
import { SupportedTokenItemWithProtocol } from 'src/core/redux/slice/customToken/addCustomToken.type';
import TonServices from 'src/core/services/TonServices';
import {
    default as commonUtils,
    default as Utils,
} from 'src/core/utils/commonUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    AddTokenParamsType,
    DetailJettonByAddressData,
} from './addCustomToken.ton.type';

const useAddCustomToken = ({ navigation }: RootNavigationType) => {
    const { t } = useTranslation();
    const tonServices = new TonServices();
    const [contractAddress, setContractAddress] = useState<string>('');
    const [symbolToken, setSymbolToken] = useState<string>('');
    const [nameToken, setNameToken] = useState<string>('');
    const [decimalsToken, setDecimalsToken] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>(true);
    const [metadataToken, setMetadataToken] =
        useState<DetailJettonByAddressData | null>(null);

    const wallet = useCurrentWallet();

    const protocolBaseData = useProtocolSelected();

    const listToken = useAppSelector(getFullListTokens);

    const dispatch = useAppDispatch();

    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            setContractAddress(text);
            handleCheckToken(text);
        } catch (error) {
            console.error(error);
        }
    };

    const [showScanQRCamera, setShowScanQRCamera] = useState(false);

    const handleCallBackScanQR = (value: string) => {
        setShowScanQRCamera(false);
        setContractAddress(value);
        handleCheckToken(value);
    };

    const onShowScanQRCamera = () => {
        setShowScanQRCamera(true);
        Keyboard.dismiss();
    };

    const validateInput = () => {
        if (
            symbolToken.trim().length &&
            decimalsToken.trim().length &&
            contractAddress.trim().length &&
            nameToken.trim().length
        ) {
            return false;
        }
        return true;
    };

    const onKeyboardDismiss = () => {
        if (contractAddress.trim().length) {
            handleCheckToken(contractAddress);
        }
    };
    const handleCheckToken = async (contractAddress: string) => {
        setIsLoadingPage(true);
        try {
            const addressParse = Address.parse(contractAddress);
            const resDetailJetton = await tonServices.getDetailJettonByAddress({
                address: addressParse.toRawString(),
            });
            if (resDetailJetton) {
                setNameToken(resDetailJetton.metadata.name);
                setSymbolToken(resDetailJetton.metadata.symbol);
                setDecimalsToken(resDetailJetton.metadata.decimals);
                setMetadataToken(resDetailJetton);
                setEditable(false);
            }
        } catch (error) {
            setEditable(true);
            setError(true);
            console.log('🚀 ~ handleCheckToken ~ error:', error);
        }
        setIsLoadingPage(false);
    };

    const getValidIcon = async (metadataToken: DetailJettonByAddressData) => {
        const iconUrls = [metadataToken.preview, metadataToken.metadata.image];

        for (const url of iconUrls) {
            if (url && (await Utils.checkImageUrlImage(url))) {
                return url;
            }
        }
        return appImages.logo;
    };
    const handleClearData = () => {
        if (!editable) {
            setNameToken('');
            setDecimalsToken('');
            setSymbolToken('');
            setEditable(true);
        }
    };
    const checkExist = (contractAddress: string) => {
        if (listToken?.length) {
            const listTokenConverted = listToken.map(item => {
                const addressParsed = Address.parse(
                    item.contractAddress,
                ).toRawString();
                return {
                    ...item,
                    contractAddress: addressParsed,
                };
            });
            const data = listTokenConverted.filter(item => {
                const convertedItem = item as SupportedTokenItemWithProtocol;
                return convertedItem?.contractAddress === contractAddress;
            });
            return !!data.length;
        } else {
            return false;
        }
    };

    const handleAddToken = async () => {
        setIsLoadingPage(true);
        try {
            if (!protocolBaseData || !wallet || !metadataToken) {
                throw new Error(
                    "Couldn't find current protocol | wallet | metadataToken",
                );
            }
            const icon = await getValidIcon(metadataToken);
            const parsedRawAddress =
                Address.parse(contractAddress).toRawString();
            const data: AddTokenParamsType = {
                token: {
                    name: nameToken,
                    symbol: symbolToken,
                    logo: icon,
                    active: true,
                    contractAddress: parsedRawAddress,
                    idProtocol: protocolBaseData._id,
                    isNativeToken: false,
                    decimal: Number(decimalsToken),
                    protocol: protocolBaseData,
                    _id: commonUtils.generateUUID(),
                },
                id: `${wallet.address}_${protocolBaseData?.slip0044}`,
            };
            if (checkExist(parsedRawAddress)) {
                Utils.showToast({
                    msg: t(LanguageKey.token_already_added),
                    visibilityTime: 2000,
                    type: AppToastType.error,
                });
                throw new Error(t(LanguageKey.token_already_added));
            }
            dispatch(addCustomToken(data));
            navigation.goBack();
        } catch (error) {
            console.log('🚀 ~ handleAddToken ~ error:', error);
        }
        setIsLoadingPage(false);
    };
    useEffect(() => {
        setError(false);
        const keyboardHideListener = Keyboard.addListener(
            'keyboardDidHide',
            onKeyboardDismiss,
        );

        return () => {
            keyboardHideListener.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractAddress]);

    const onCloseScanQr = () => {
        setShowScanQRCamera(false);
    };

    return {
        t,
        nameToken,
        symbolToken,
        decimalsToken,
        contractAddress,
        showScanQRCamera,
        setNameToken,
        setSymbolToken,
        setDecimalsToken,
        setContractAddress,
        handleCopyToClipboard,
        isLoadingPage,
        validateInput,
        editable,
        error,
        handleAddToken,
        handleCallBackScanQR,
        onShowScanQRCamera,
        onCloseScanQr,
        handleClearData,
    };
};
export default useAddCustomToken;
