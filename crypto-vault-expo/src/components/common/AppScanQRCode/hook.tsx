import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Utils from 'src/core/utils/commonUtils';

const useAppScanQRCode = ({
    callBackWhenScanQR,
    isShowScanQR,
    onCloseScanQR,
    onShowModalRequestCameraPermission,
}: {
    callBackWhenScanQR?: (data: string) => void;
    isShowScanQR: boolean;
    onCloseScanQR?: () => void;
    onShowModalRequestCameraPermission: () => void;
}) => {
    const navigation = useNavigation();

    const [showScanQRCamera, setShowScanQRCamera] = useState(false);

    const device = useCameraDevice('back');

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: codes => {
            if (codes.length > 0) {
                const scannedValue = Utils.removeQRPrefix(codes[0].value ?? '');

                callBackWhenScanQR?.(scannedValue);
                onCloseScanQR?.();
            }
        },
    });

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isShowScanQR,
        });
        if (isShowScanQR) {
            checkCameraPermission();
        }

        return () => {
            navigation.setOptions({
                gestureEnabled: true,
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShowScanQR]);

    const requestCameraPermission = async () => {
        const permission = Utils.isIos
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
        request(permission).then(result => {
            if (result === RESULTS.GRANTED) {
                setShowScanQRCamera(true);
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
                        setShowScanQRCamera(true);
                        break;
                    case RESULTS.BLOCKED:
                        console.log(
                            'The permission is denied and not requestable anymore',
                        );
                        onShowModalRequestCameraPermission();
                        break;
                }
            })
            .catch(error => {
                console.log('checkCameraPermission error', error);
            });
    };

    return {
        device,
        codeScanner,
        showScanQRCamera,
    };
};

export default useAppScanQRCode;
