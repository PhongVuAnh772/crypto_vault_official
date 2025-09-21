import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import Canvas, { Image as CanvasImage } from 'react-native-canvas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import {
    importNFTThunk,
    setUpdateNFT,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import {
    ImportNFTParams,
    NFTData,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import Web3Service from 'src/core/services/Web3';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useNFTImport = ({ navigation }: RootNavigationType) => {
    const insets = useSafeAreaInsets();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const { t } = useTranslation();

    const dispatch = useAppDispatch();
    const currentProtocol = useProtocolSelected();
    const wallet = useCurrentWallet();
    const selectAccountId = useAppSelector(getAccountId);

    const [loading, setLoading] = useState<boolean>(false);
    const [contractAddress, setContractAddress] = useState<string>('');
    const [idNFT, setIdNFT] = useState<string>('');
    const canvasRef = useRef<Canvas>(null);

    const convertImageByCanvas = async (image: string) => {
        return new Promise<string>(resolve => {
            const canvas = canvasRef.current;

            if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new CanvasImage(canvas);

                img.src = image;

                img.addEventListener('load', async () => {
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    const maxCanvasWidth = canvas.width || 300;
                    const aspectRatio = imgWidth / imgHeight;
                    const canvasHeight = maxCanvasWidth / aspectRatio;

                    canvas.width = maxCanvasWidth;
                    canvas.height = canvasHeight;

                    ctx.drawImage(img, 0, 0, maxCanvasWidth, canvasHeight);

                    const data = await canvas.toDataURL('image/png');

                    const cleanedBase64 = data?.replace(/^"|"$/g, '');
                    resolve(cleanedBase64);
                });

                img.addEventListener('error', () => {
                    resolve('');
                });
            } else {
                resolve('');
            }
        });
    };
    // MARK: Handle Copy To Clipboard
    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            setContractAddress(text);
        } catch (error) {
            console.error(error);
        }
    };
    const handleSubmitImport = async () => {
        Keyboard.dismiss();
        setLoading(true);
        const protocol = currentProtocol;

        try {
            if (protocol && wallet && selectAccountId) {
                const web3 = new Web3Service({
                    urpUrl: protocol.rpcUrl || '',
                });
                const resImport = await web3.importNFT({
                    contractAddress: contractAddress,
                    nftId: Number(idNFT),
                    walletAddress: wallet.address,
                });
                if (!resImport) {
                    Utils.showToast({
                        msg: t(LanguageKey.nft_import_error),
                        type: AppToastType.error,
                    });
                    return;
                }
                const data: ImportNFTParams = {
                    contractAddress: contractAddress,
                    nftId: Number(idNFT),
                    id: `${wallet.address}_${protocol.slip0044}`,
                    protocolData: protocol,
                    accountId: selectAccountId,
                    nftData: resImport,
                };

                const result = await dispatch(importNFTThunk(data));
                if (importNFTThunk.fulfilled.match(result) && result.payload) {
                    const imageData = result.payload.detail?.image_data;
                    if (imageData) {
                        const imageUri = await convertImageByCanvas(imageData);
                        const nftData: NFTData = {
                            ...result.payload,
                            detail: {
                                ...result.payload.detail,
                                image_data: imageUri,
                            },
                        };
                        dispatch(setUpdateNFT(nftData));
                    }
                    navigation.goBack();
                    Utils.showToast({
                        msg: t(LanguageKey.nft_imported_successfully),
                        type: AppToastType.success,
                    });
                }
            }
        } catch (error: any) {
            console.log('🚀 ~ handleSubmitImport ~ error:', error);
            Utils.showToast({
                msg: error?.message || t(LanguageKey.nft_import_error),
                type: AppToastType.error,
                visibilityTime: 2000,
            });
        }
        setLoading(false);
    };

    const [showScanQRCamera, setShowScanQRCamera] = useState(false);

    const onScanQR = () => {
        setShowScanQRCamera(true);
        Keyboard.dismiss();
    };

    const validate = () => {
        if (
            currentProtocol &&
            contractAddress.trim().length &&
            idNFT.trim().length
        ) {
            return true;
        }
        return false;
    };

    const handleCallBackScanQR = (value: string) => {
        setShowScanQRCamera(false);
        setContractAddress(value);
    };

    const onCloseScanQr = () => {
        setShowScanQRCamera(false);
    };
    const handleBack = () => {
        navigation.goBack();
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
        convertImageByCanvas,
        currentProtocol,
        onCloseScanQr,
        handleBack,
        newUI,
        insets,
    };
};
export default useNFTImport;
