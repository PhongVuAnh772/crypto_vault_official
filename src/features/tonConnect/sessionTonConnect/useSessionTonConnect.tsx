import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SessionCrypto } from '@tonconnect/protocol';
import { useEffect, useRef, useState } from 'react';
import EnvConfig from 'src/core/constants/EnvConfig';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import TonConnectService from 'src/core/services/TonConnect/TonConnectService';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import TonServices from 'src/core/services/TonServices';
import {
    getURL,
    saveAppConnection,
    setModalConnect,
} from '../slice/tonConnect.slice';
import { DAppManifest } from '../slice/tonConnect.type';

const useSessionTonConnect = () => {
    const tonConnect = new TonConnectService();
    const showBottomSheetConnect = useRef<BottomSheetModal>(null);
    const dispatch = useAppDispatch();
    const url = useAppSelector(getURL);
    const [infoDapp, setInfoDapp] = useState<DAppManifest>();
    const tonAddressData = useTonAddressData();
    const sessionCrypto = new SessionCrypto();
    const tonService = new TonServices();
    const [visibleLoading, setVisibleLoading] = useState(false);
    const isTestNet = EnvConfig.ENV === 'development';
    const getManifest = async () => {
        if (url) {
            const data = await TonConnectUtils.getManifest(url.request);
            setInfoDapp(data);
        }
    };
    useEffect(() => {
        showBottomSheetConnect.current?.present();
        getManifest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const closeModal = () => {
        dispatch(setModalConnect(false));
    };

    const confirm = async () => {
        showBottomSheetConnect.current?.close();
        setVisibleLoading(true);
        try {
            if (tonAddressData && url) {
                const event = await tonConnect.connect(
                    2,
                    url.request,
                    tonAddressData.privateKey,
                    tonAddressData.publicKey,
                    tonAddressData.address,
                    isTestNet,
                    sessionCrypto,
                    url.id,
                    
                );
                if (event.appConnection) {
                    dispatch(saveAppConnection(event.appConnection));
                }
                await tonService.sendConnectDapp(
                    event.event,
                    sessionCrypto,
                    url.id,
                );
            }
        } catch (error) {
            console.log(error);
        }
        setVisibleLoading(false);
        closeModal();
    };
    return {
        infoDapp,
        tonAddressData,
        showBottomSheetConnect,
        visibleLoading,
        closeModal,
        confirm,
        
    };
};

export default useSessionTonConnect;
