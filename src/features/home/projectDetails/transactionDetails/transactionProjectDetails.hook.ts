import { StackActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import { Feature } from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    usePolAddressData,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import createContextError from 'src/core/services/ContextError';
import Utils from 'src/core/utils/commonUtils';
import AppErrorUtils from 'src/core/utils/errorUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import {
    getDataClaimable,
    getDataGetOwned,
    getDataTokenTransactionDetail,
    getStatusLoadingYouGot,
    handleClaimTokenTransactionDetail,
} from '../../bottomTab/explore/explore.slice';
import { NFTHistoryType } from '../../bottomTab/explore/explore.type';
import { TransactionClaimDetailProps } from './transactionDetails.type';

export const useTransactionProjectClaimDetails = ({
    navigation,
    data,
}: TransactionClaimDetailProps) => {
    const dispatch = useAppDispatch();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme = useAppTheme();
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const { t } = useTranslation();
    const dataGetOwned = useAppSelector(getDataGetOwned);
    const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
    const dataTransactionDetail = useAppSelector(getDataTokenTransactionDetail);
    const polygonWalletAddress = usePolAddressData();
    const [statusLoading, setStatusLoading] = useState(true);
    const [totalClaim, setTotalClaim] = useState(0);
    const [totalClaimWithAllProject, setTotalClaimWithAllProject] =
        useState<number>(0);
    const dataClaimable = useAppSelector(getDataClaimable);
    const insets = useAppSafeAreaInsets();
    const protocolBaseData = useProtocolSelected();

    const backAction = () => {
        navigation.goBack();
    };

    const onViewOnScan = () => {
        Linking.openURL(
            `${dataTransactionDetail?.tokenProtocol?.transactionScanURL}/${dataTransactionDetail?.history?.transactionHash}`,
        );
    };

    const commonBackAction = () => {
        navigation.goBack();
    };

    const handleDataTotalWithAllNFT = (data: NFTHistoryType[]) => {
        if (data) {
            const totalValue = data?.reduce((total: number, nft) => {
                return total + (nft.amount || 0);
            }, 0);
            setTotalClaimWithAllProject(totalValue);
        }
    };

    useEffect(() => {
        if (dataTransactionDetail?.history?.nfts) {
            handleDataTotalWithAllNFT(dataTransactionDetail?.history?.nfts);
        }
    }, [dataTransactionDetail]);

    const contextSupportClaimTokenError = (
        functionError: string,
        reason: string,
        id?: number,
    ) => {
        const error = createContextError({
            feature: Feature.ClaimToken,
            fileError: `transactionProjectDetails.hook.ts (tabs)`,
            functionError: functionError,
            reason: reason,
            protocol: protocolBaseData?.symbol ?? ProtocolType.All,
            id: id,
        });
        // Auto log => push error to server
        AppErrorUtils.sendContactWhenError(dispatch, error);
        return error;
    };

    useEffect(() => {
        setStatusLoading(true);
        const getDataDetail = async () => {
            try {
                await dispatch(
                    handleClaimTokenTransactionDetail({
                        claimableTokenProjectId: dataClaimable?.project?._id,
                        polygonWalletAddress: polygonWalletAddress as string,
                        claimGroupId: data?._id as string,
                    }),
                );
                setStatusLoading(false);
            } catch (error: any) {
                commonBackAction();
                console.log('error', error);
                contextSupportClaimTokenError(`getDataDetail`, error, 117);
                Utils.showToast({
                    msg: t(LanguageKey.common_server_busy),
                    type: AppToastType.error,
                });
            }
        };

        getDataDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = async () => {
        if (dataTransactionDetail?.history?.transactionHash) {
            await Clipboard.setStringAsync(
                dataTransactionDetail?.history?.transactionHash,
            );
        }

        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };

    const navigateToClaimNFTList = () => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.ClaimDetailList, {
                data: data.nfts,
            }),
        );
    };

    return {
        theme,
        backAction,
        lightMode,
        dataClaimable,
        dataGetOwned,
        statusLoadingYouGot,
        commonBackAction,
        totalClaim,
        setTotalClaim,
        handleCopy,
        onViewOnScan,
        totalClaimWithAllProject,
        dataTransactionDetail,
        statusLoading,
        newUI,
        insets,
        navigateToClaimNFTList,
    };
};
