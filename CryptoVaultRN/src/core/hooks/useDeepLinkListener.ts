import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { TonConnectKey } from 'src/features/tonConnect/enum/TonConnectKey';
import {
    setModalConnect,
    setType,
    setURL,
} from 'src/features/tonConnect/slice/tonConnect.slice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getRequirePinCode } from '../redux/slice/app.slice';
const useDeepLinkListener = () => {
    const dispatch = useAppDispatch();
    const requirePinCode = useAppSelector(getRequirePinCode) ?? false;
    const handleDeepLink = (url: string | null) => {
        if (!url) return;
        try {
            console.log('🚀 ~ handleDeepLink ~ url:', url);
            const parsed = Linking.parse(url);
            console.log('🚀 ~ handleDeepLink ~ parsed:', parsed);
            if (parsed.queryParams?.id && parsed.queryParams?.r) {
                const r = parsed.queryParams.r as string;
                const id = parsed.queryParams.id as string;
                const request = JSON.parse(decodeURIComponent(r));
                const version = Number(parsed.queryParams.v);
                dispatch(setType(TonConnectKey.eventConnect));
                dispatch(setURL({ id, request, version }));
                dispatch(setModalConnect(true));
            }
        } catch (error) {
            console.log('🚀 ~ handleDeepLink ~ error:', error);
        }
    };
    useEffect(() => {
        const subscription = Linking.addEventListener('url', event => {
            handleDeepLink(event.url);
        });

        return () => {
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requirePinCode]);
};

export default useDeepLinkListener;
