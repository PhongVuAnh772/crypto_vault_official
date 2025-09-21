import { StackActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import { IPFSDomain } from 'src/core/enum/IPFSDomain';
import ThemeKey from 'src/core/enum/ThemeKey';
import VMType from 'src/core/enum/VMType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { sendGet } from 'src/core/network/requests';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    getAccountId,
    getProtocolDataLists,
} from 'src/core/redux/slice/account.slice';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import {
    importNFTThunk,
    setTabCollectionIndex,
    setUpdateNFT,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import {
    ImportNFTParams,
    NFTData,
    NFTDetailEVMCollectionType,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import Web3Service from 'src/core/services/Web3';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import {
    DataFetching,
    MetadataNFTEVM,
    NFTUnAddedDetailProp,
} from './NFTUnAddedDetail.type';
const useNFTUnAddedDetailEVM = ({
    navigation,
    detail,
}: NFTUnAddedDetailProp) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const currentProtocol = useProtocolSelected();
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const listProtocol = useAppSelector(getProtocolDataLists);
    const dispatch = useAppDispatch();
    const [dataFetching, setDataFetching] = useState<DataFetching | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const selectAccountId = useAppSelector(getAccountId);
    const wallet = useCurrentWallet();
    const [loadingHandle, setLoadingHandle] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { t } = useTranslation();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const web3 = new Web3Service({
        urpUrl: currentProtocol?.rpcUrl ?? '',
    });

    function convertIpfsToHttp(ipfsLink: string) {
        if (ipfsLink.startsWith(IPFSDomain.commonIPFS)) {
            return ipfsLink.replace(
                IPFSDomain.commonIPFS,
                IPFSDomain.swapingIPFS,
            );
        }
        return ipfsLink;
    }

    const getLink = (chainID: number) => {
        let url = '';
        listProtocol?.forEach(protocol => {
            if (protocol.slip0044 === chainID) {
                url = protocol.blockExplorerUrl;
            }
        });
        return url;
    };

    const url = getLink(currentProtocol?.slip0044 ?? 0);
    const onShowModal = () => {
        setShowModal(true);
    };
    const copyAction = () => {
        Clipboard.setStringAsync(detail.token_address ?? '');
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };
    const navigatingToNFTCollection = () => {
        navigation.dispatch(StackActions.pop(2));
        dispatch(setTabCollectionIndex(0));
    };
    const handleAddNFTWithEVM = async () => {
        setLoadingHandle(true);

        try {
            const protocol = currentProtocol;

            if (!protocol || !wallet) {
                console.log('protocol or wallet is null');
                return;
            }

            const resImport = await web3.importNFT({
                contractAddress: detail.token_address,
                nftId: Number(detail.token_id),
                walletAddress: wallet.address,
            });
            if (!resImport) {
                console.log('resImport is null');
                return;
            }

            if (protocol && wallet) {
                const data: ImportNFTParams = {
                    contractAddress: detail.token_address,
                    nftId: Number(detail.token_id),
                    id: `${wallet.address}_${protocol.slip0044}`,
                    protocolData: protocol,
                    accountId: selectAccountId ?? '',
                    nftData: resImport,
                };
                const result = await dispatch(importNFTThunk(data));
                if (importNFTThunk.fulfilled.match(result) && result.payload) {
                    const imageData = result.payload.detail?.image_data;

                    if (imageData) {
                        const nftData: NFTData = {
                            ...result.payload,
                            detail: {
                                ...result.payload.detail,
                                image_data: imageData,
                            },
                        };
                        dispatch(setUpdateNFT(nftData));
                    }
                    navigatingToNFTCollection();
                    setLoadingHandle(false);
                    Utils.showToast({
                        msg: t(LanguageKey.nft_imported_successfully),
                        type: AppToastType.success,
                    });
                } else {
                    const errorMessage =
                        typeof result.payload === 'string'
                            ? result.payload
                            : t(LanguageKey.nft_import_error);
                    Utils.showToast({
                        msg: errorMessage,
                        type: AppToastType.error,
                    });
                }
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : t(LanguageKey.nft_import_error);
            Utils.showToast({
                msg: message,
                type: AppToastType.error,
            });
            setLoadingHandle(false);
        }
        setLoadingHandle(false);
    };

    const handlePressURL = async () => {
        const addressPath = `/address/${detail.token_address ?? ''}`;

        const address = `${url}${addressPath}`;
        const supported = await Linking.canOpenURL(address);
        if (supported) {
            await Linking.openURL(address);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    const handleAddNFT = async () => {
        handleAddNFTWithEVM();
    };
    const onHideModal = () => {
        setShowModal(false);
    };
    const navigateToNFTUnAddedDetail = (nft: NFTDetailEVMCollectionType) => {
        navigation.navigate(HomeStackScreenKey.NFTUnAddedDetail, {
            detail: nft,
            root: true,
        });
    };

    useEffect(() => {
        setIsInitialLoading(true);
        const fetchData = async () => {
            try {
                if (detail.metadata) {
                    const metadata = JSON.parse(detail.metadata);
                    setDataFetching({
                        resMetadata: metadata,
                    });
                    return;
                }
                if (!wallet) {
                    setDataFetching(null);
                    return;
                }
                const checkNFTResponse = await web3.processCheckNFT({
                    contractAddress: detail.token_address.toString(),
                    nftId: Number(detail.token_id),
                    walletAddress: wallet.address,
                });
                if (checkNFTResponse.nftType === NFTTokenStandard.ERC721) {
                    const { name, symbol, tokenURI } =
                        await web3.getERC721Details({
                            contractAddress: detail.token_address.toString(),
                            nftId: Number(detail.token_id),
                        });
                    const res = await sendGet<MetadataNFTEVM>({
                        customBaseUrl: tokenURI,
                    });

                    if (res && res.data) {
                        const resMetadata: MetadataNFTEVM = {
                            description: res.data.description,
                            image: res.data.image,
                            name: res.data.name,
                        };
                        return setDataFetching({
                            name,
                            symbol,
                            tokenURI,
                            owner: wallet.address,
                            tokenStandard: NFTTokenStandard.ERC721,
                            resMetadata: resMetadata,
                        });
                    }
                } else if (
                    checkNFTResponse.nftType === NFTTokenStandard.ERC1155
                ) {
                    const data = await web3.getERC1155Details({
                        contractAddress: detail.token_address.toString(),
                        nftId: Number(detail.token_id),
                    });

                    const res = await sendGet<MetadataNFTEVM>({
                        customBaseUrl: data.tokenURI,
                    });

                    if (res && res.data) {
                        const resMetadata: MetadataNFTEVM = {
                            description: res.data.description,
                            image: res.data.image,
                            name: res.data.name,
                        };
                        return setDataFetching({
                            tokenURI: data.tokenURI,
                            owner: wallet.address,
                            name: '',
                            symbol: '',
                            tokenStandard: NFTTokenStandard.ERC1155,
                            quantity: checkNFTResponse.balance,
                            resMetadata: resMetadata,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setDataFetching(null);
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        lightMode,
        convertIpfsToHttp,
        onShowModal,
        onHideModal,
        showModal,
        navigateToNFTUnAddedDetail,
        insets,
        handleAddNFT,
        loadingHandle,
        dataFetching,
        isInitialLoading,
        currentProtocol,
        newUI,
        theme,
        handlePressURL,
        setIsInitialLoading,
        copyAction,
        isTon: currentProtocol?.VM === VMType.Ton,
        isEVM: currentProtocol?.VM === VMType.EVM,
        isERC721: detail.contract_type === NFTTokenStandard.ERC721,
        isERC1155: detail.contract_type === NFTTokenStandard.ERC1155,
    };
};

export default useNFTUnAddedDetailEVM;
