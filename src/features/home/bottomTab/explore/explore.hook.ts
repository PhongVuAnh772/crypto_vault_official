import { StackActions } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Feature } from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import createContextError from 'src/core/services/ContextError';
import { AppThemeType } from 'src/core/type/ThemeType';
import AppErrorUtils from 'src/core/utils/errorUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    getDataPage,
    getDataPerPage,
    getDataTokenClaim,
    getFirstLoadingList,
    getStatusFirstLoading,
    handleGetTokenClaimsListData,
    handleGetTokenClaimsListDataFirst,
} from './explore.slice';
import { ProjectList, ProjectListItem } from './explore.type';

export const useExplore = ({ navigation }: RootNavigationType) => {
    const { t } = useTranslation();
    const loadMoreThreshold = 100;
    const isAtTop = useRef(true);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme: AppThemeType = useAppTheme();
    const dataListProject = useAppSelector(getDataTokenClaim);
    const page = useAppSelector(getDataPage);
    const perPage = useAppSelector(getDataPerPage);
    const firstLoadingList = useAppSelector(getFirstLoadingList);
    const firstLoading = useAppSelector(getStatusFirstLoading);
    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [enableLoadMore, setEnableLoadMore] = useState(true);
    const [isOnGoingState, setIsOnGoingState] = useState(false);
    const protocolSelected = useProtocolSelected();

    const navigateToProjectDetail = (props: ProjectListItem) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.ProjectDetail, {
                props: props,
            }),
        );
    };

    const navigatingToTop5EVMs = () => {
        navigation.dispatch(StackActions.push(HomeStackScreenKey.Top10EVMs));
    };

    const navigatingToTop5Tokens = () => {
        navigation.dispatch(StackActions.push(HomeStackScreenKey.Top10Tokens));
    };
    const contextSupportClaimTokenError = (
        functionError: string,
        reason: string,
        id?: number,
    ) => {
        const error = createContextError({
            feature: Feature.ClaimToken,
            fileError: `explore.hook.ts`,
            functionError: functionError,
            reason: reason,
            protocol: protocolSelected?.symbol ?? ProtocolType.All,
            id: id,
        });
        // Auto log => push error to server
        AppErrorUtils.sendContactWhenError(dispatch, error);
        return error;
    };

    const fetchData = async () => {
        try {
            await dispatch(handleGetTokenClaimsListDataFirst());
        } catch (err: any) {
            contextSupportClaimTokenError(`fetchData`, err, 1);
        }
    };

    const handleLoadMore = async () => {
        try {
            if (!enableLoadMore) {
                setLoadMore(false);
                return;
            }
            setLoadMore(true);
            const response = await dispatch(
                handleGetTokenClaimsListData({ page, perPage }),
            );
            const dataLoadMore = response.payload as unknown as ProjectList;

            setLoadMore(false);
            if (dataLoadMore?.items.length === 0) {
                setEnableLoadMore(false);
            }
        } catch (err: any) {
            contextSupportClaimTokenError(`handleLoadMore`, err, 2);
        }
    };

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;
        const offsetY = event.nativeEvent.contentOffset.y;

        if (contentHeight - layoutHeight - offsetY - 10 < loadMoreThreshold) {
            setLoadMore(true);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onRefreshAction = async () => {
        setRefreshing(true);
        try {
            await dispatch(handleGetTokenClaimsListDataFirst());
            setEnableLoadMore(true);
        } catch (err: any) {
            // Auto log => push error to server
            contextSupportClaimTokenError(`onRefreshAction`, err, 2);
            console.log('err useExplore', err);
        }

        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        onRefreshAction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        theme,
        navigateToProjectDetail,
        dataListProject,
        setIsOnGoingState,
        isOnGoingState,
        refreshing,
        onRefresh,
        loadMore,
        handleLoadMore,
        setLoadMore,
        onScroll,
        isAtTop,
        firstLoading,
        firstLoadingList,
        t,
        newUI,
        navigatingToTop5EVMs,
        navigatingToTop5Tokens,
        enableLoadMore,
        setEnableLoadMore,
    };
};
