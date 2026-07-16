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
import { ethers } from 'ethers';
import RpcFallbackProvider from 'src/core/utils/rpcUtils';

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

            let responseToken: any = null;
            const chain = convertChainByProtocol(protocolBaseData.slip0044);
            
            if (chain) {
                try {
                    const response = await moralis.getTokenDetailByWallet({
                        chain: chain,
                        token_address: contractAddress.trim(),
                    });
                    if (response && response[0]) {
                        responseToken = response[0];
                    }
                } catch (e) {
                    console.warn('Moralis check failed, trying RPC...', e);
                }
            }

            if (!responseToken) {
                const urls = protocolBaseData.rpcUrls && protocolBaseData.rpcUrls.length > 0
                    ? protocolBaseData.rpcUrls
                    : [protocolBaseData.rpcUrl];
                const fallback = new RpcFallbackProvider(urls, protocolBaseData.chainId);
                const provider = await fallback.getProvider();
                if (provider) {
                    const contract = new ethers.Contract(
                        contractAddress.trim(),
                        [
                            "function name() view returns (string)",
                            "function symbol() view returns (string)",
                            "function decimals() view returns (uint8)",
                        ],
                        provider
                    );
                    const [rpcName, rpcSymbol, rpcDecimals] = await Promise.all([
                        contract.name().catch(() => ""),
                        contract.symbol().catch(() => ""),
                        contract.decimals().catch(() => 18),
                    ]);
                    if (rpcName && rpcSymbol) {
                        responseToken = {
                            name: rpcName,
                            symbol: rpcSymbol,
                            decimals: rpcDecimals.toString(),
                        };
                    }
                }
            }

            if (!responseToken) {
                throw new Error("Could not fetch token details");
            }

            setSymbolToken(responseToken.symbol);
            setDecimalsToken(responseToken.decimals.toString());
            setNameToken(responseToken.name);
            setEditable(false);
            setError(false);
        } catch (error) {
            setError(true);
            setEditable(true); // Allow manual entry if verification fails
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
            
            // Check if we already have token info in state
            let finalName = nameToken;
            let finalSymbol = symbolToken;
            let finalDecimals = Number(decimalsToken || '18');
            let finalLogo = '';

            if (!finalName || !finalSymbol) {
                // If not in state, try to fetch from Moralis or RPC
                const chain = convertChainByProtocol(protocolBaseData.slip0044);
                let responseToken: any = null;

                if (chain) {
                    try {
                        const response = await moralis.getTokenDetailByWallet({
                            chain: chain,
                            token_address: contractAddress.trim(),
                        });
                        if (response && response[0]) {
                            responseToken = response[0];
                        }
                    } catch (e) {
                        console.warn('Moralis token fetch failed, trying RPC...', e);
                    }
                }

                if (!responseToken) {
                    const urls = protocolBaseData.rpcUrls && protocolBaseData.rpcUrls.length > 0
                        ? protocolBaseData.rpcUrls
                        : [protocolBaseData.rpcUrl];
                    const fallback = new RpcFallbackProvider(urls, protocolBaseData.chainId);
                    const provider = await fallback.getProvider();
                    if (provider) {
                        const contract = new ethers.Contract(
                            contractAddress.trim(),
                            [
                                "function name() view returns (string)",
                                "function symbol() view returns (string)",
                                "function decimals() view returns (uint8)",
                            ],
                            provider
                        );
                        const [rpcName, rpcSymbol, rpcDecimals] = await Promise.all([
                            contract.name().catch(() => ""),
                            contract.symbol().catch(() => ""),
                            contract.decimals().catch(() => 18),
                        ]);
                        if (rpcName && rpcSymbol) {
                            responseToken = {
                                name: rpcName,
                                symbol: rpcSymbol,
                                decimals: rpcDecimals,
                            };
                        }
                    }
                }

                if (!responseToken) {
                    throw new Error(t(LanguageKey.common_server_busy));
                }

                finalName = responseToken.name;
                finalSymbol = responseToken.symbol;
                finalDecimals = Number(responseToken.decimals);
                finalLogo = responseToken?.logo || '';
            }

            const data: AddTokenParamsType = {
                token: {
                    name: finalName,
                    symbol: finalSymbol,
                    logo: finalLogo,
                    active: true,
                    contractAddress: contractAddress.trim(),
                    idProtocol: protocolBaseData._id,
                    isNativeToken: false,
                    decimal: finalDecimals,
                    protocol: protocolBaseData,
                    _id: commonUtils.generateUUID(),
                },
                id: `${wallet.address}_${protocolBaseData?.slip0044}`,
            };

            if (checkExist(contractAddress.trim())) {
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
                    symbol: finalSymbol,
                    name: finalName,
                    decimals: finalDecimals,
                    contract_address: contractAddress.trim(),
                    metadata: {
                        logo: finalLogo,
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
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
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
