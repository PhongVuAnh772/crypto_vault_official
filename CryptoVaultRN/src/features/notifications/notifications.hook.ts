import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from 'src/core/redux/hooks';
import {AppThemeType} from 'src/core/type/ThemeType';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    handleGetNotificationListData,
    handleDeleteNotificationListData,
    getNotificationState,
    COUNTING_PAGE_NOTIFICATIONS,
    handleGetFirstNotificationListData,
} from './notification.slice';
import LanguageKey from 'src/core/locales/LanguageKey';
import {FlatList, LayoutAnimation} from 'react-native';
import {NotificationType} from 'src/core/enum/NotificationType';
import {useAccountProtocolSelected} from 'src/core/redux/slice/account.selector';
import {
    getProtocolDataLists,
    getSelectedProtocolId,
} from 'src/core/redux/slice/account.slice';

export const useNotificationList = (
    navigation: NavigationProp<ParamListBase>,
) => {
    const dispatch = useAppDispatch();
    const theme: AppThemeType = useAppTheme();
    const accountProtocolSelected = useAccountProtocolSelected();
    const addressList = accountProtocolSelected?.addressList;
    const selectedAddressId = accountProtocolSelected?.selectedAddressId;
    const selectedAddress = addressList?.find(e => e.id === selectedAddressId);
    const {page} = useAppSelector(getNotificationState) ?? ('' as any);
    const [refreshing, setRefreshing] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const isMounted = useRef(false);
    const flatListRef = useRef<FlatList<any>>(null);
    const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const protocolSelected = [
        ...(protocolDataLists.length > 0 ? protocolDataLists : []),
    ]?.find(e => e?._id === selectedProtocolId);
    const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
        const callbackRef = useRef(callback);

        useLayoutEffect(() => {
            callbackRef.current = callback;
        });

        let timer: any;

        const naiveDebounce = (
            func: (...args: any[]) => void,
            delayMs: number,
            ...args: any[]
        ) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func(...args);
            }, delayMs);
        };

        return useMemo(
            () =>
                (...args: any) =>
                    naiveDebounce(callbackRef.current, delay, ...args),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [delay],
        );
    };

    const [typeNotificationSelect, setTypeNotificationSelect] =
        useState<string>(NotificationType.All);
    const [showTypeNotificationView, setShowTypeNotificationView] =
        useState(false);
    const gotoNotificationDetail = () => {};
    const handleLoadMore = useDebounce(() => {
        getData(typeNotificationSelect, page);
        setTimeout(() => {
            setLoadMore(false);
        }, 2000);
    }, 1500);

    const getTitleTypeNotification = (type: string) => {
        switch (type) {
            case NotificationType.All:
                return LanguageKey.common_text_all;
            case NotificationType.Read:
                return LanguageKey.common_text_read;
            case NotificationType.Unread:
                return LanguageKey.common_text_unread;
            default:
                return LanguageKey.common_text_all;
        }
    };

    const getData = async (type: string, perPageData?: number) => {
        let notificationType = '';

        switch (type) {
            case NotificationType.All:
                notificationType = 'ALL';
                break;
            case NotificationType.Read:
                notificationType = 'READ';
                break;
            case NotificationType.Unread:
                notificationType = 'UNREAD';
                break;
            default:
                notificationType = type;
                break;
        }
        await dispatch(
            handleGetNotificationListData({
                walletAddress: selectedAddress?.address ?? '',
                type: notificationType,
                page: perPageData ?? 1,
                perPage: 10,
                protocolId: protocolSelected?._id ?? '',
            }),
        );
    };
    const getDataFirst = async (type: string) => {
        let notificationType = '';

        switch (type) {
            case NotificationType.All:
                notificationType = 'ALL';
                break;
            case NotificationType.Read:
                notificationType = 'READ';
                break;
            case NotificationType.Unread:
                notificationType = 'UNREAD';
                break;
            default:
                notificationType = type;
                break;
        }
        await dispatch(
            handleGetFirstNotificationListData({
                walletAddress: selectedAddress?.address ?? '',
                type: notificationType,
                page: 1,
                perPage: 10,
                protocolId: protocolSelected?._id ?? '',
            }),
        );
    };

    useEffect(() => {
        dispatch(COUNTING_PAGE_NOTIFICATIONS(1));
        handleRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeNotificationSelect, dispatch]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        }
    }, []);

    const handleRefresh = useCallback(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({animated: true, offset: 0});
        }
        setRefreshing(true);
        getDataFirst(typeNotificationSelect);
        dispatch(COUNTING_PAGE_NOTIFICATIONS(1));
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeNotificationSelect, dispatch]);

    const handleDeleteNotificationWithId = async (id: string) => {
        const response = await dispatch(handleDeleteNotificationListData(id));
        if (handleDeleteNotificationListData.fulfilled.match(response)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        }
    };

    return {
        gotoNotificationDetail,
        theme,
        setTypeNotificationSelect,
        typeNotificationSelect,
        setShowTypeNotificationView,
        showTypeNotificationView,
        handleDeleteNotificationWithId,
        refreshing,
        handleRefresh,
        getTitleTypeNotification,
        handleLoadMore,
        isMounted,
        setLoadMore,
        loadMore,
        getDataFirst,
        flatListRef,
    };
};
