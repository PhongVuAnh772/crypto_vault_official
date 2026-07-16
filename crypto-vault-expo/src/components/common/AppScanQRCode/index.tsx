import React from 'react';
import { View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import ScanArena from 'src/components/homeComponents/ScanArena';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import AppText from '../AppText';
import useAppScanQRCode from './hook';
import appQRCodeStyle from './style';

type AppScanQRCodeType = {
    isShowScanQR: boolean;
    onCloseScanQR?: () => void;
    callBackWhenScanQR?: (data: string) => void;
    onShowModalRequestCameraPermission: () => void;
};

const AppScanQRCode = ({
    isShowScanQR,
    callBackWhenScanQR,
    onCloseScanQR,
    onShowModalRequestCameraPermission,
}: AppScanQRCodeType) => {
    const {device, codeScanner, showScanQRCamera} = useAppScanQRCode({
        isShowScanQR,
        callBackWhenScanQR,
        onCloseScanQR,
        onShowModalRequestCameraPermission,
    });

    if (!(isShowScanQR && device && showScanQRCamera)) {
        return null;
    }

    return (
        <>
            <View style={appQRCodeStyle.viewScanQRContainer}>
                <Camera
                    style={appQRCodeStyle.scanQRContainer}
                    device={device}
                    isActive={showScanQRCamera}
                    codeScanner={codeScanner}
                />
                <ScanArena />
                <View style={[appQRCodeStyle.flex1, appQRCodeStyle.center]}>
                    <AppText
                        titleWithI18n={LanguageKey.scan_qr_title}
                        variant={TextVariantKeys.labelLarge}
                        styles={appQRCodeStyle.textAlignCenter}
                        textColor={appColors.neutral.white}
                    />
                    <AppText
                        titleWithI18n={LanguageKey.scan_qr_sub_title}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={appQRCodeStyle.textAlignCenter}
                        textColor={appColors.neutral.n600}
                    />
                </View>
            </View>
        </>
    );
};

export default AppScanQRCode;
