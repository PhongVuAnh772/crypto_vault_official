import { useCallback, useEffect, useState } from 'react';

interface UseLoadMoreProps<T> {
    fetchData: (page: number) => Promise<T[]>;
    initialPage?: number;
    limit: number;
}

export const useLoadMore = <T>({
    fetchData,
    initialPage = 1,
    limit,
}: UseLoadMoreProps<T>) => {
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchData(initialPage);
            setData(result);
            setHasMore(result.length >= limit);
        } catch (error) {
            console.error('Fetch data error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, initialPage, limit]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const result = await fetchData(nextPage);
            if (result.length === 0 || result.length < limit) setHasMore(false);
            setData(prev => [...prev, ...result]);
            setPage(nextPage);
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [fetchData, page, isLoadingMore, hasMore, limit]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const result = await fetchData(initialPage);
            setData(result);
            setPage(initialPage);
            setHasMore(result.length > 0);
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchData, initialPage]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return {
        data,
        isLoading,
        isLoadingMore,
        isRefreshing,
        loadMore,
        onRefresh,
        hasMore,
    };
};
