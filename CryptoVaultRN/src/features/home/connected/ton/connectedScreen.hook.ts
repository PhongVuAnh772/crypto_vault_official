import { Address } from '@ton/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnvConfig from 'src/core/constants/EnvConfig';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import { TonConnectKey } from '../../../tonConnect/enum/TonConnectKey';
import {
    getAppConnection,
    removeInjectConnection,
    removeRemoteConnection
} from '../../../tonConnect/slice/tonConnect.slice';
import { TonConnectBridgeType } from '../../../tonConnect/slice/tonConnect.type';
import { IConnectedAppConnectionWithExtra } from './connectedScreen.component';
const useTonConnected = () => {
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const isTestNet = EnvConfig.ENV === 'development';
    const getAllConnect = useAppSelector(getAppConnection);
    const tonAddressData = useTonAddressData();
    const [infoDappRemove, setInfoDappRemove] =
        useState<IConnectedAppConnectionWithExtra>();
    const [isShowModalRemove, setIsShowModalRemove] = useState(false);
    const { t } = useTranslation();
    const listConnected = TonConnectUtils.convertDataAllConnect(
        isTestNet,
        tonAddressData?.address!,
        getAllConnect,
    );
    const connectArray = listConnected.flatMap(group =>
        group.connections.map(item => ({
            item,
            image: group.iconUrl,
            name: group.name,
            url: group.url,
        })),
    );
    
    const showModalRemove = (item: IConnectedAppConnectionWithExtra) => {
        setInfoDappRemove(item);
        setIsShowModalRemove(true);
    };
    const closeModalRemove = () => {
        setIsShowModalRemove(false);
    };
    const confirmRemoveConnect = () => {
        if (infoDappRemove?.item.type === TonConnectBridgeType.Remote) {
            dispatch(
                removeRemoteConnection({
                    chainName: isTestNet
                        ? TonConnectKey.testnet
                        : TonConnectKey.mainnet,
                    address: Address.parse( tonAddressData?.address!).toRawString(),
                    url: infoDappRemove.url!,
                    clientSessionId: infoDappRemove.item.clientSessionId,
                }),
            );
        } else {
            dispatch(
                removeInjectConnection({
                    chainName: isTestNet
                        ? TonConnectKey.testnet
                        : TonConnectKey.mainnet,
                    address: Address.parse( tonAddressData?.address!).toRawString(),
                    url: infoDappRemove?.url!,
                }),
            );
        }
        setIsShowModalRemove(false)
    };
    return {
        t,
        theme,
        infoDappRemove,
        isShowModalRemove,
        connectArray,
        showModalRemove,
        closeModalRemove,
        confirmRemoveConnect,
    };
};

export default useTonConnected;
