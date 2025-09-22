import { useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getForceUpdate,
    getRemoteConfigAppVersion,
    getShowForceUpdateModal,
    setShowForceUpdateModal
} from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';

const useForceUpdate = () => {
    const dispatch = useAppDispatch();
    const remoteConfigAppVersion = useAppSelector(getRemoteConfigAppVersion);
    const forceUpdate = useAppSelector(getForceUpdate);
    const showForceUpdateModal = useAppSelector(getShowForceUpdateModal);

    useEffect(() => {
        if (forceUpdate) {
            const deviceAppVersion = DeviceInfo.getVersion();
            const compareResult = Utils.compareAppVersions({
                deviceVersion: deviceAppVersion ?? '1.0.0',
                forceVersion: remoteConfigAppVersion ?? '1.0.0',
            });
            if (compareResult !== showForceUpdateModal) {
                dispatch(setShowForceUpdateModal(compareResult));
            }
        } else if (showForceUpdateModal) {
            dispatch(setShowForceUpdateModal(false));
        }
    }, [remoteConfigAppVersion, forceUpdate, showForceUpdateModal, dispatch]);
};

export default useForceUpdate;
