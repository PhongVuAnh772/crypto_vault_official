import { useIsFocused } from '@react-navigation/native';
import { openSettings } from 'expo-linking';
import { useEffect, useState } from 'react';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import {
    Code,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';
import * as Clipboard from 'expo-clipboard';
import { useDispatch } from 'react-redux';

import { useAppTheme } from 'src/core/hooks/useAppTheme';
import {
    setActionFailedNeedToContact,
    setEnablePassword,
    setRequirePinCode,
    setShowCommonErrorModal
} from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';
import { TonConnectKey } from 'src/features/tonConnect/enum/TonConnectKey';
import {
    setModalConnect,
    setType,
    setURL,
} from 'src/features/tonConnect/slice/tonConnect.slice';
import { decodeURl } from 'src/features/tonConnect/slice/tonConnect.type';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

export const useScan = ({ navigation }: RootNavigationType) => {
    const dispatch = useDispatch();
    const theme = useAppTheme();
    const device = useCameraDevice('back');
    const [showCamera, setShowCamera] = useState(false);
    const [
        isShowModalRequestCameraPermission,
        setIsShowModalRequestCameraPermission,
    ] = useState(false);
    const [uri, setUri] = useState<string | undefined>();
    const isActive = useIsFocused();
    const requestCameraPermission = async () => {
        const permission = Utils.isIos
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
        request(permission).then(result => {
            if (result === RESULTS.GRANTED) {
                setShowCamera(true);
            } else {
                setIsShowModalRequestCameraPermission(true);
            }
        });
    };
    const checkCameraPermission = async () => {
        const permission = Utils.isIos
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
        await check(permission)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.log(
                            'This feature is not available (on this device / in this context)',
                        );
                        break;
                    case RESULTS.DENIED:
                        console.log(
                            'The permission has not been requested / is denied but requestable',
                        );
                        requestCameraPermission();
                        break;
                    case RESULTS.LIMITED:
                        console.log(
                            'The permission is limited: some actions are possible',
                        );
                        break;
                    case RESULTS.GRANTED:
                        setShowCamera(true);
                        break;
                    case RESULTS.BLOCKED:
                        console.log(
                            'The permission is denied and not requestable anymore',
                        );
                        setIsShowModalRequestCameraPermission(true);
                        break;
                }
            })
            .catch(error => {
                console.log('checkCameraPermission error', error);
            });
    };
    const onCodeScanned = (codes: Code[]) => {
        const uri = codes[0].value;
        setUri(uri);
    };

    useEffect(() => {
        if (uri) {
            checkUrl(uri);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri]);
    useEffect(() => {
        dispatch(setEnablePassword(false));
        checkCameraPermission();
        return () => {
            dispatch(setEnablePassword(true));
            dispatch(setRequirePinCode(false));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned,
    });

    const decode = (url: string): decodeURl => {
        const queryParams = url.split('?')[1];
        if (!queryParams) {
            throw new Error('url error');
        }
        const params = new URLSearchParams(queryParams);
        const id = params.get('id') ?? '';
        const r = params.get('r');
        const v = params.get('v');
        return {
            id: id,
            request: JSON.parse(decodeURIComponent(r ?? '')),
            version: Number(v),
        };
    };
    const checkUrl = (url: string) => {
        const protocol = url.split('?')[0];
        if (protocol === 'tc://' || protocol === 'io.ledgerify.wallet://') {
            dispatch(setModalConnect(true));
            dispatch(setType(TonConnectKey.eventConnect));
            dispatch(setURL(decode(url)));
            navigation.goBack();
        } else {
            setUri(undefined);
        }
    };
    const goBack = () => {
        setIsShowModalRequestCameraPermission(false);
        navigation.goBack();
    };
    const openSettingsAction = async () => {
        try {
            await openSettings();
            goBack();
        } catch (error) {
            console.error('openSettingsAction error', error);
            dispatch(setShowCommonErrorModal(true));
            dispatch(setActionFailedNeedToContact(' ' + error));
        }
    };

    const onPasteURI = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            checkUrl(text);
        }
    };

    return {
        theme,
        device,
        showCamera,
        isActive,
        codeScanner,
        requestCameraPermission,
        goBack,
        openSettingsAction,
        isShowModalRequestCameraPermission,
        onPasteURI,
        isSimulator: Utils.checkingEmulator(),
    };
};
