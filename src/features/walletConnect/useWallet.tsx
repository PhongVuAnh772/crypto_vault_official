import React, { useMemo } from 'react';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppSelector } from 'src/core/redux/hooks';

import { WalletConnectKey } from './enum/TonConnectKey';
import SessionNoSupport from './SessionNoSupport';
import SessionProposalModal from './SessionPropsalModal/sessionProposalModal';
import SessionSendTransaction from './SessionSendTransaction/sessionSendTransactionModal';
import SessionSignModal from './SessionSignModal/sessionSignModal';
import SessionSignTypeDataModal from './SessionSignTypeData/sessionSignTypeDataModal';
import { getShowModalConnect, getType } from './slice/walletConnect.slice';
const useWallet = () => {
    const view = useAppSelector(getType);

    const insets = useAppSafeAreaInsets();

    const isShowModalConnect = useAppSelector(getShowModalConnect);

    const componentView = useMemo(() => {
        switch (view) {
            case WalletConnectKey.sessionProposal:
                return <SessionProposalModal />;
            case WalletConnectKey.personalSign:
                return <SessionSignModal />;
            case WalletConnectKey.ethSendTransaction:
                return <SessionSendTransaction />;
            case WalletConnectKey.ethSignTypedDataV4:
                return <SessionSignTypeDataModal />;
            default:
                return <SessionNoSupport />;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    return {
        componentView,
        isShowModalConnect,
        insets,
    };
};

export default useWallet;
