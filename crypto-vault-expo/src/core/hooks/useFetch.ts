import { useCallback, useEffect, useState } from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useFetch<T>(fetchCallback: () => Promise<T>) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(() => {
        setState({ data: null, loading: true, error: null });

        fetchCallback()
            .then(response => {
                setState({ data: response, loading: false, error: null });
            })
            .catch(error => {
                setState({ data: null, loading: false, error });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refresh: fetchData };
}
