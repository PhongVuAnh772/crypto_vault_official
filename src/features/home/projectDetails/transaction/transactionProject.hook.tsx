import { StackActions, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import { Feature } from 'src/core/enum/ContactFailedAction';
import FetchNFTStatus from 'src/core/enum/FetchNFTStatus';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import Slip0044 from 'src/core/enum/Slip0044';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    usePolAddressData,
    useProtocolSelected,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import createContextError from 'src/core/services/ContextError';
import { AppThemeType } from 'src/core/type/ThemeType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import AppErrorUtils from 'src/core/utils/errorUtils';
import {
    getDataClaimHistory,
    getDataClaimable,
    handleGetHistoryClaimData,
} from 'src/features/home/bottomTab/explore/explore.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { NFTProps, TransactionProps } from './transactionProject.type';

export const useProjectTransactionDetail = (
    { navigation }: any,
    data: TransactionProps,
) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [collapsed, setCollapsed] = useState(true);
    const dataClaimHistory = useAppSelector(getDataClaimHistory);
    const dataClaimable = useAppSelector(getDataClaimable);
    const walletAddressPolygon = usePolAddressData();
    const theme: AppThemeType = useAppTheme();
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();
    const [firstLoading, setFirstLoading] = useState(false);
    const currentProtocol = useProtocolSelected();
    const currentTonAccount = useTonAddressData();

    const contextSupportClaimTokenError = (
        functionError: string,
        reason: string,
        id?: number,
    ) => {
        const error = createContextError({
            feature: Feature.ClaimToken,
            fileError: `transactionProject.hook.ts (tabs)`,
            functionError: functionError,
            reason: reason,
            protocol: currentProtocol?.symbol ?? ProtocolType.All,
            id: id,
        });
        // Auto log => push error to server
        AppErrorUtils.sendContactWhenError(dispatch, error);
        return error;
    };
    const getDataHistory = async () => {
        setFirstLoading(true);
        try {
            const res = await dispatch(
                handleGetHistoryClaimData({
                    walletAddress:
                        currentProtocol?.slip0044 === Slip0044.Ton
                            ? currentTonAccount?.address
                            : walletAddressPolygon,

                    claimableTokenProject: data._id,
                }),
            );
            if (handleGetHistoryClaimData.fulfilled.match(res)) {
                setFirstLoading(false);
            } else {
                handleShowError();
            }
        } catch (error: any) {
            console.log('error getDataHistory', error);
            contextSupportClaimTokenError(`getDataHistory`, error, 85);
            handleShowError();
        }
        setFirstLoading(false);
    };
    const handleShowError = () => {
        navigation.goBack();
        Utils.showToast({
            msg: t(LanguageKey.common_server_busy),
            type: AppToastType.error,
        });
    };

    const fetchNFTStatus = async (nfts: NFTProps[]) => {
        const results = [];

        for (const nft of nfts) {
            const tokenURI = nft.tokenURI;

            try {
                const response = await axios.get(tokenURI);
                results.push({
                    nftId: nft._id,
                    status:
                        response?.data?.status === FetchNFTStatus.success
                            ? FetchNFTStatus.claimed
                            : FetchNFTStatus.failed,
                    response: response.data,
                    ...nft,
                });
            } catch (error: any) {
                console.error(`Error fetching NFT ${nft?._id}:`, error);
                results.push({
                    nftId: nft._id,
                    status: FetchNFTStatus.error,
                    error: error?.message,
                    ...nft,
                });
            }
        }

        return results;
    };

    const onRefreshAction = async () => {
        setRefreshing(true);
        try {
            await dispatch(
                handleGetHistoryClaimData({
                    walletAddress: walletAddressPolygon,
                    claimableTokenProject: data?._id,
                }),
            );
        } catch (error: any) {
            console.log('error onRefreshAction', error);
            navigation.goBack();
            contextSupportClaimTokenError(`onRefreshAction`, error, 144);

            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
        }
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        onRefreshAction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getDataHistory();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getCurrentFormattedDate = () => {
        const now = new Date();
        const options = { month: 'short', year: 'numeric' };
        return now.toLocaleDateString('en-US', options as any);
    };

    const navigateToClaimDetail = (data: TransactionHistoryDataType) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionProjectDetails, {
                data: data,
            }),
        );
    };
    const groupByClaimDate = (
        claims: TransactionHistoryDataType[],
    ): { title: string; data: TransactionHistoryDataType[] }[] => {
        try {
            const groupedClaims = claims?.reduce(
                (acc, claim) => {
                    const formattedDate = moment(claim.createdAt).format(
                        'MMM D, YYYY',
                    );

                    if (!acc[formattedDate]) {
                        acc[formattedDate] = [];
                    }
                    acc[formattedDate].push(claim);
                    return acc;
                },
                {} as Record<string, TransactionHistoryDataType[]>,
            );

            return Object.keys(groupedClaims).map(date => ({
                title: date,
                data: groupedClaims[date],
            }));
        } catch (error) {
            console.log('error groupByClaimDate', error);
            navigation.goBack();
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });

            return [];
        }
    };

    return {
        t,
        theme,
        dataClaimHistory,
        dispatch,
        data,
        collapsed,
        setCollapsed,
        refreshing,
        onRefresh,
        fetchNFTStatus,
        isFocused,
        dataClaimable,
        getCurrentFormattedDate,
        navigateToClaimDetail,
        groupByClaimDate,
        firstLoading,
    };
};
