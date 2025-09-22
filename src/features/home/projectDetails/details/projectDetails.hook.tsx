import { StackActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';

import { CoinType } from 'src/core/enum/CoinType';
import { Feature } from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import {
    useCurrentWallet,
    usePolAddressData,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    getProtocolDataLists,
    setSelectedProtocol,
} from 'src/core/redux/slice/account.slice';
import createContextError from 'src/core/services/ContextError';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import AppErrorUtils from 'src/core/utils/errorUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import {
    getDataClaimable,
    getDataGetOwned,
    getDataPriceFeed,
    getDataPriceFeedInDetail,
    getLinkingTonAddressData,
    getStatusLoadingYouGot,
    handleClaimTokenSpecified,
    handleGetInformationLinkTon,
    handleGetPriceFeedFirstDetail,
} from 'src/features/home/bottomTab/explore/explore.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ProjectDetailChildrenPropsType } from './projectDetails.type';

interface UseProjectDetailType extends RootNavigationType {
    data: ProjectDetailChildrenPropsType;
    showRequirePinCode: () => void;
    setContractTonAddress: React.Dispatch<React.SetStateAction<string>>;
    handleShowInstruction: () => void;
    handleShowPinCodeInstruction: () => void;
    contractTonAddress: string;
    showImportLinking: boolean;
    setShowImportLinking: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useProjectDetail = ({
    data,
    navigation,
    showRequirePinCode,
    setContractTonAddress,
    handleShowInstruction,
    handleShowPinCodeInstruction,
    contractTonAddress,
    showImportLinking,
    setShowImportLinking,
}: UseProjectDetailType) => {
    const { t } = useTranslation();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const protocolBaseData = useProtocolSelected();
    const dispatch = useAppDispatch();
    const dataGetOwned = useAppSelector(getDataGetOwned);
    const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
    const protocolListsWithSupportedTokensFromBE =
        useAppSelector(getProtocolDataLists);
    const dataPriceFeedInDetail = useAppSelector(getDataPriceFeedInDetail);
    const [dataInlineProject, setDataInlineProject] = useState([]);
    const currentWallet = useCurrentWallet();
    const theme: AppThemeType = useAppTheme();
    const polygonWalletAddress = usePolAddressData();
    const dataClaimable = useAppSelector(getDataClaimable);
    const linkingTonAddressData = useAppSelector(getLinkingTonAddressData);
    const [comfirmationModal, setComfirmationModal] = useState(false);
    const [collectionModal, setCollectionModal] = useState(false);
    const [totalPrice] = useState(0);
    const [textShown, setTextShown] = useState(false);
    const [lengthMore, setLengthMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resultNFTs, setResultNFTs] = useState([]);
    const [resultNFTInside] = useState([]);
    const [modalGotNFTs, setModalGotNFTs] = useState(false);
    const [itemGotting] = useState([]);
    const [groupData, setGroupData] = useState<any>([]);
    const dataPriceFeed = useAppSelector(getDataPriceFeed);
    const [errorValidAddress, setErrorValidAddress] = useState(false);
    const [itemCollectionCheck, setItemCollectionCheck] = useState<{
        name: string;
    } | null>(null);
    const currentProtocol = useProtocolSelected();

    const [modalSwitchingProtocol, setModalSwitchingProtocol] =
        useState<boolean>(false);
    const handleContractAddress = (value: string) => {
        setContractTonAddress(value);
        setErrorValidAddress(false);
    };
    const [enableViewChart, setEnableViewChart] = useState(false);
    const [loadingSwitch, setLoadingSwitch] = useState(false);
    const onShowViewChart = () => {
        if (
            dataClaimable &&
            dataClaimable.project &&
            dataClaimable.project.tokenPriceChart
        ) {
            Linking.openURL(dataClaimable.project.tokenPriceChart);
        }
    };

    const onHideViewChart = () => {
        setEnableViewChart(false);
    };
    const onShowModalGotNFTs = () => {
        setModalGotNFTs(true);
    };
    const onHideModalGotNFTs = () => {
        setModalGotNFTs(false);
    };

    const onHideModalSwitchingProtocol = () => {
        setModalSwitchingProtocol(false);
        setLoadingSwitch(false);
    };
    const onShowModalSwitchingProtocol = () => {
        setModalSwitchingProtocol(true);
    };

    const toggleNumberOfLines = () => {
        setTextShown(!textShown);
    };

    const onTextLayout = useCallback((e: any) => {
        setLengthMore(e.nativeEvent.lines.length >= 4);
    }, []);
    const onShowComfirmationModal = () => {
        setComfirmationModal(true);
    };
    const onShowCollectionModal = () => {
        setCollectionModal(true);
    };

    const navigateToClaimHistory = () => {
        navigation.navigate(t(LanguageKey.transaction_history_project_details));
    };

    const onCloseComfirmationModal = () => {
        setComfirmationModal(false);
    };
    const onCloseCollectionModal = () => {
        setCollectionModal(false);
    };

    const _handleShowChartAsync = async (url: string) => {
        await WebBrowser.openBrowserAsync(url);
    };

    const handleCopyToClipboard = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            setContractTonAddress(text);
        } catch (error) {
            console.error(error);
        }
    };
    const contextSupportClaimTokenError = (
        functionError: string,
        reason: string,
        id?: number,
    ) => {
        const error = createContextError({
            feature: Feature.ClaimToken,
            fileError: `NFTYouOwn.hook.ts (tabs)`,
            functionError: functionError,
            reason: reason,
            protocol: currentProtocol?.symbol ?? ProtocolType.All,
            id: id,
        });
        // Auto log => push error to server
        AppErrorUtils.sendContactWhenError(dispatch, error);
        return error;
    };

    function formatDateToDDMM(dateString: string) {
        const date = new Date(dateString);

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');

        return `${day}-${month}`;
    }

    const getDataClaim = async () => {
        setLoading(true);
        try {
            const res = await dispatch(
                handleClaimTokenSpecified({
                    claimableTokenProjectId: data?._id,
                    polygonWalletAddress: polygonWalletAddress,
                    t,
                }),
            );
            if (handleClaimTokenSpecified.fulfilled.match(res)) {
                const result = res.payload;
                if (
                    !result ||
                    !result?.project?._id ||
                    !currentWallet?.address
                ) {
                    navigation.goBack();
                    Utils.showToast({
                        msg: t(LanguageKey.claim_data_error_status),
                        type: AppToastType.error,
                    });
                    return;
                }
                await dispatch(
                    handleGetPriceFeedFirstDetail({
                        page: 1,
                        perPage: 10,
                        contractAddress: result.projectNFT.contractAddress,
                        claimableTokenProject: result?.project?._id,
                    }),
                );
                const resultLinkingTon = await dispatch(
                    handleGetInformationLinkTon({
                        nftWalletAddress: currentWallet?.address,
                        claimableTokenProjectId: result?.project?._id,
                    }),
                );

                if (
                    handleGetInformationLinkTon.rejected.match(resultLinkingTon)
                ) {
                    navigation.goBack();
                    Utils.showToast({
                        msg: t(LanguageKey.claim_data_error_status),
                        type: AppToastType.error,
                    });
                }
                setLoading(false);
            }
        } catch (error: any) {
            console.log('error getDataClaim', error);
            navigation.goBack();
            contextSupportClaimTokenError(`getDataClaim`, error, 253);
            Utils.showToast({
                msg: t(LanguageKey.claim_data_error_status),
                type: AppToastType.error,
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        getDataClaim();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateToTransactionDetail = (dataTxHash: string) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionDetails, {
                transactionData: dataTxHash,
            }),
        );
    };

    const handleActionSwitching = (promisingProtocol?: string) => {
        setLoadingSwitch(true);
        const promisingProtocolSelecting =
            protocolListsWithSupportedTokensFromBE?.filter(
                item =>
                    item.slip0044 ===
                    dataClaimable?.projectNftProtocol?.slip0044,
            );
        if (
            promisingProtocolSelecting &&
            promisingProtocolSelecting.length > 0
        ) {
            dispatch(setSelectedProtocol(promisingProtocolSelecting[0]?._id));
            onHideModalSwitchingProtocol();
            setLoadingSwitch(false);

            Utils.showToast({
                msg: t(LanguageKey.successfully_switching, {
                    promisingProtocol: promisingProtocol,
                }),
                type: AppToastType.success,
            });
        } else {
            onHideModalSwitchingProtocol();
            setLoadingSwitch(false);
            Utils.showToast({
                msg: t(LanguageKey.failed_switching, {
                    promisingProtocol: promisingProtocol,
                }),
                type: AppToastType.error,
            });
        }
    };
    const handleWithCollection = () => {
        setCollectionModal(false);
        Utils.showToast({
            msg: t(LanguageKey.nft_added_successfully),
            type: AppToastType.success,
        });
    };
    const isOngoing = (dateString: string): boolean => {
        const currentDate = moment();
        const targetDate = moment(dateString);
        return currentDate.isBefore(targetDate);
    };

    const isUpComing = (startDate: string): boolean => {
        const now = moment();
        const start = moment(startDate);
        return start.isAfter(now);
    };

    const pickingActionWhatYouGot = () => {
        if (
            protocolBaseData?.slip0044 ===
            dataClaimable?.projectNftProtocol?.slip0044
        ) {
            navigation.dispatch(
                StackActions.push(HomeStackScreenKey.NFTYouOwnList),
            );
        } else {
            onShowModalSwitchingProtocol();
        }
    };
    const navigateToPriceList = () => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.PriceFeedList, {
                data: {
                    contractAddress: dataClaimable?.projectNFT?.contractAddress,
                    claimableTokenProject: dataClaimable?.project?._id,
                },
            }),
        );
    };

    const navigateToConfirmScreen = () => {
        if (
            dataClaimable?.projectNftProtocol &&
            dataClaimable?.projectNftProtocol.name &&
            dataClaimable?.projectNftProtocol.name.toLowerCase() !==
                CoinType.Ton.toLowerCase() &&
            !linkingTonAddressData?.tokenReceiverWalletAddress
        ) {
            if (
                protocolBaseData?.slip0044 ===
                dataClaimable?.projectNftProtocol?.slip0044
            ) {
                handleShowPinCodeInstruction();
            } else {
                onShowModalSwitchingProtocol();
            }
            return;
        }
        if (
            protocolBaseData?.slip0044 ===
            dataClaimable?.projectNftProtocol?.slip0044
        ) {
            navigation.dispatch(
                StackActions.push(HomeStackScreenKey.ConfirmClaimToken),
            );
        } else {
            onShowModalSwitchingProtocol();
        }
    };
    return {
        t,
        theme,
        navigateToConfirmScreen,
        onShowComfirmationModal,
        comfirmationModal,
        collectionModal,
        onShowCollectionModal,
        handleWithCollection,
        navigateToTransactionDetail,
        totalPrice,
        onCloseComfirmationModal,
        onCloseCollectionModal,
        toggleNumberOfLines,
        onTextLayout,
        lengthMore,
        textShown,
        setItemCollectionCheck,
        itemCollectionCheck,
        formatDateToDDMM,
        dataClaimable,
        loading,
        isOngoing,
        navigateToClaimHistory,
        resultNFTs,
        setResultNFTs,
        setDataInlineProject,
        dataInlineProject,
        resultNFTInside,
        modalGotNFTs,
        onShowModalGotNFTs,
        onHideModalGotNFTs,
        itemGotting,
        enableViewChart,
        onHideViewChart,
        onShowViewChart,
        groupData,
        setGroupData,
        pickingActionWhatYouGot,
        dataGetOwned,
        statusLoadingYouGot,
        _handleShowChartAsync,
        navigateToPriceList,
        dataPriceFeed,
        modalSwitchingProtocol,
        onShowModalSwitchingProtocol,
        onHideModalSwitchingProtocol,
        protocolBaseData,
        handleActionSwitching,
        dataPriceFeedInDetail,
        isUpComing,
        loadingSwitch,
        setContractTonAddress,
        handleCopyToClipboard,
        linkingTonAddressData,
        errorValidAddress,
        setErrorValidAddress,
        handleContractAddress,
        contractTonAddress,
        newUI,
    };
};
