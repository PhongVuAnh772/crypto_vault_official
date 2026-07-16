import { getSdkError } from '@walletconnect/utils';
import { useState } from 'react';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { SessionDapp } from './evmConnected.component';

const useEvmConnected = () => {
    const [activeSessions, setActiveSessions] = useState(walletKit.getActiveSessions());
    const theme = useAppTheme();
    const [infoDappRemove, setInfoDappRemove] = useState<SessionDapp>();
    const [isShowModalRemove, setIsShowModalRemove] = useState(false);

    const showModalRemove = (item: SessionDapp) => {
        setInfoDappRemove(item);
        setIsShowModalRemove(true);
    };

    const closeModalRemove = () => {
        setIsShowModalRemove(false);
    };

    const confirmRemoveSession = async () => {
        if (!infoDappRemove) return;
        try {
            await walletKit.disconnectSession({
                topic: infoDappRemove.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            });
            setActiveSessions(walletKit.getActiveSessions());
        } catch (error) {
            console.error('Failed to disconnect session:', error);
        }
        closeModalRemove();
    };

    return {
        theme,
        activeSessions,
        infoDappRemove,
        isShowModalRemove,
        showModalRemove,
        closeModalRemove,
        confirmRemoveSession,
    };
};

export default useEvmConnected;
