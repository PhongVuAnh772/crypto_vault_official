import { getSdkError } from '@walletconnect/utils';
import { useState } from 'react';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { SessionDapp } from './evmConnected.component';
const useTonConnected = () => {
    let activeSessions = walletKit.getActiveSessions();
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
        await walletKit.disconnectSession({
            topic: infoDappRemove?.topic!,
            reason: getSdkError('USER_DISCONNECTED'),
        });
        activeSessions = walletKit.getActiveSessions();
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

export default useTonConnected;
