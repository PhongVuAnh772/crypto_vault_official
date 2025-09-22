import React, { useMemo } from 'react';

import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppSelector } from 'src/core/redux/hooks';
import { TonConnectKey } from './enum/TonConnectKey';
import SessionTonConnect from './sessionTonConnect/sessionTonConnect';
import SessionTonConnectTransaction from './sessionTonTransaction/sessionTonConnectTransaction';
import { getShowModalConnect, getType } from './slice/tonConnect.slice';

const useTonConnect = () => {
    const view = useAppSelector(getType);
    const insets = useAppSafeAreaInsets();
    const isShowModalConnect = useAppSelector(getShowModalConnect);
    const componentView = useMemo(() => {
        switch (view) {
            case TonConnectKey.eventConnect:
                return <SessionTonConnect />;
            case TonConnectKey.eventTransaction:
                return <SessionTonConnectTransaction />;
        }
    }, [view]);
    const theme = useAppTheme();
    return {
        componentView,
        theme,
        isShowModalConnect,
        insets,
    };
};

export default useTonConnect;
