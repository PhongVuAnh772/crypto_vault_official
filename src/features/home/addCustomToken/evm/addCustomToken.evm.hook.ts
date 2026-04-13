import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
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
import {
    AddTokenParamsType,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import MoralisService from 'src/core/services/Moralis';
import {
    default as commonUtils,
    default as Utils,
} from 'src/core/utils/commonUtils';
import {
    compareAddressesEVM,
    convertChainByProtocol,
} from 'src/core/utils/evmUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { tokenService } from 'src/core/services/api.service';

const useAddCustomToken = ({ navigation }: RootNavigationType) => {
    const moralis = useMemo(() => new MoralisService(), []);
    const { t } = useTranslation();
    const [contractAddress, setContractAddress] = useState<string>('');
    const [symbolToken, setSymbolToken] = useState<string>('');
    const [nameToken, setNameToken] = useState<string>('');
    const [decimalsToken, setDecimalsToken] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>(true);

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
          symbolToken?.trim()?.length &&
          decimalsToken?.trim()?.length &&
          contractAddress?.trim()?.length &&
          nameToken?.trim()?.length
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
            if (!protocolBaseData) {
                console.error("Couldn't find current protocol");
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const chain = convertChainByProtocol(protocolBaseData.slip0044);
            if (!chain) {
                console.error("Couldn't find chain");
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const response = await moralis.getTokenDetailByWallet({
                chain: chain,
                token_address: contractAddress.trim(),
            });
            if (!response || !response[0]) {
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const responseToken = response[0];
            setSymbolToken(responseToken.symbol);
            setDecimalsToken(responseToken.decimals);
            setNameToken(responseToken.name);
            setEditable(false);
            setIsLoadingPage(false);
        } catch (error) {
            setError(true);
            console.log('🚀 ~ handleCheckToken ~ error:', error);
        } finally {
            setIsLoadingPage(false);
        }
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
            const data = listToken?.filter(item => {
                const convertedItem = item as SupportedTokenItemWithProtocol;
                return compareAddressesEVM(
                    convertedItem?.contractAddress,
                    contractAddress,
                );
            });
            return !!data.length;
        } else {
            return false;
        }
    };
    const handleAddToken = async () => {
        setIsLoadingPage(true);
        try {
            if (!wallet || !protocolBaseData) {
                console.error(
                    "Couldn't find current protocol | wallet | metadata",
                );
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const chain = convertChainByProtocol(protocolBaseData.slip0044);
            if (!chain) {
                console.error("Couldn't find chain");
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const response = await moralis.getTokenDetailByWallet({
                chain: chain,
                token_address: contractAddress.trim(),
            });
            if (!response || !response[0]) {
                throw new Error(t(LanguageKey.common_server_busy));
            }
            const responseToken = response[0];

            const data: AddTokenParamsType = {
                token: {
                    name: responseToken.name,
                    symbol: responseToken.symbol,
                    logo: responseToken?.logo,
                    active: true,
                    contractAddress: contractAddress,
                    idProtocol: protocolBaseData._id,
                    isNativeToken: false,
                    decimal: Number(responseToken.decimals),
                    protocol: protocolBaseData,
                    _id: commonUtils.generateUUID(),
                },
                id: `${wallet.address}_${protocolBaseData?.slip0044}`,
            };
            if (checkExist(contractAddress)) {
                Utils.showToast({
                    msg: t(LanguageKey.token_already_added),
                    visibilityTime: 2000,
                    type: AppToastType.error,
                });
                throw new Error(t(LanguageKey.token_already_added));
            }
            // Notify backend for Admin management
            try {
                await tokenService.requestCustomToken({
                    chain_id: (protocolBaseData.chainId || protocolBaseData._id).toString(),
                    symbol: responseToken.symbol,
                    name: responseToken.name,
                    decimals: Number(responseToken.decimals),
                    contract_address: contractAddress.trim(),
                    metadata: {
                        logo: responseToken?.logo,
                        user_address: wallet.address
                    }
                });
            } catch (apiErr) {
                console.warn('Failed to sync custom token to backend', apiErr);
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
