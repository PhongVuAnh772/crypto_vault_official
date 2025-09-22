import remoteConfig from '@react-native-firebase/remote-config';
import { useEffect } from 'react';
import { useAppDispatch } from 'src/core/redux/hooks';
import RemoteUtils from '../utils/remoteUtils';

const useRemoveConfig = () => {
    const dispatch = useAppDispatch();

    const fetchConfig = async () => {
        console.log('==============================================');
        RemoteUtils.appVersionConfig(dispatch);
        RemoteUtils.forceUpdateConfig(dispatch);
        RemoteUtils.transferConfig(dispatch);
        RemoteUtils.blockTransferConfig(dispatch);
        RemoteUtils.themeConfig();
        RemoteUtils.stakingConfig(dispatch);
        console.log('==============================================');
    };

    const configSetup = async () => {
        setTimeout(async () => {
            try {
                // MARK: Refresh data
                await remoteConfig().fetchAndActivate();

                remoteConfig().onConfigUpdated(async update => {
                    // MARK: Refresh data
                    await remoteConfig().fetchAndActivate();

                    const allConfig = remoteConfig().getAll();
                    console.log(
                        '==============================================',
                    );
                    console.log('Remote config update', update);
                    console.log('All config', allConfig);
                    console.log(
                        '==============================================',
                    );
                    fetchConfig();
                });

                fetchConfig();
            } catch (error) {
                console.log('🚀 ~ configSetup ~ error:', error);
            }
        }, 3000);
    };

    useEffect(() => {
        configSetup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export default useRemoveConfig;
