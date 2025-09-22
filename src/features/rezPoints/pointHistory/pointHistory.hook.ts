import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch } from 'src/core/redux/hooks';
import { getPointHistoryByAccessToken } from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import {
    ErrorCode,
    GetTransactionHistoryResponse,
    TransactionHistory,
    TransactionRecord,
} from 'src/core/redux/slice/rezPoint/rezPoint.type';
import Utils from 'src/core/utils/commonUtils';

const usePointHistory = () => {
    const dispatch = useAppDispatch();
    const [pointHistory, setPointHistory] = useState<TransactionRecord[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [page, setPage] = useState<number>(1);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [disableLoadMore, setDisableLoadMore] = useState<boolean>(false);
    const { t } = useTranslation();
    const mergePointHistory = (
        newItems: TransactionRecord[],
        prevItem: TransactionRecord[],
    ): TransactionRecord[] => {
        let existingMap: Record<string, TransactionHistory[]> = newItems.reduce(
            (map, item) => {
                map[item.title] = item.data;
                return map;
            },
            {} as Record<string, TransactionHistory[]>,
        );
        const merHistory = prevItem.map(prev => {
            if (existingMap[prev.title]) {
                prev.data = [...prev.data, ...existingMap[prev.title]];
                delete existingMap[prev.title];
            }
            return prev;
        });
        const convertedNewItemsLeft = Object.entries(existingMap)
            .map(([title, data]) => ({
                title,
                data,
            }))
            .sort(
                (a, b) =>
                    new Date(a.title).getTime() - new Date(a.title).getTime(),
            );

        return [...merHistory, ...convertedNewItemsLeft];
    };

    const fetchData = async (page: number = 1, refresh: boolean = false) => {
        try {
            if (refresh) setRefreshing(true);
            if (!refresh && page > 1) setLoadingMore(true);

            const response = await dispatch(
                getPointHistoryByAccessToken({ page, perPage: 10 }),
            ).unwrap();

            if (!response) {
                throw new Error('Could not get point history');
            }

            const parseData =
                response as unknown as GetTransactionHistoryResponse;

            if (parseData.items.length === 0) {
                setDisableLoadMore(true);
            }

            if (refresh) {
                setPointHistory(parseData.items);
                setDisableLoadMore(false);
            } else {
                setPointHistory(prev =>
                    mergePointHistory(parseData.items, prev),
                );
            }
        } catch (error: any) {
            if (
                error?.errorCode === ErrorCode.ACCOUNT_DEACTIVATED ||
                error?.errorCode === ErrorCode.ACCOUNT_DELETED ||
                error?.errorCode ===
                    ErrorCode.ACCOUNT_DELETED_ONLY_CREATE_ACCOUNT_UTIL_30_DAYS
            ) {
                return;
            }

            Utils.showToast({
                type: AppToastType.error,
                msg: t(LanguageKey.common_text_error_title),
            });
        } finally {
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setPage(1);
        fetchData(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadMore = () => {
        if (!loadingMore && !disableLoadMore && pointHistory.length > 0) {
            setPage(prevPage => {
                const nextPage = prevPage + 1;
                fetchData(nextPage);
                return nextPage;
            });
        }
    };
    const handleInitialData = async () => {
        await fetchData();
        setLoading(false);
    };
    useEffect(() => {
        handleInitialData(); // Initial load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        pointHistory,
        refreshing,
        handleRefresh,
        handleLoadMore,
        loadingMore,
        loading,
    };
};
export default usePointHistory;
