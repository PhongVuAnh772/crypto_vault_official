import React from 'react';
import { View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import ScanArena from 'src/components/homeComponents/ScanArena';
import appColors from 'src/core/constants/AppColors';
import { WarnSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { useScan } from './scan.hook';
import useStyles from './scan.stye';

const ScanScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        device,
        showCamera,
        isActive,
        codeScanner,
        isShowModalRequestCameraPermission,
        goBack,
        openSettingsAction,
        isSimulator,
        onPasteURI,
    } = useScan({
        navigation,
    });

    const style = useStyles(theme);
    return (
        <ScreenWrapper
            enableDismissKeyboard
            backgroundColor={theme.colors.surface_surface_default}>
            {isSimulator ? (
                <View style={[appStyles.flex1, appStyles.center, { padding: 20 }]}>
                    <AppText
                        text="Simulator Mode"
                        variant={TextVariantKeys.titleLarge}
                        textColor={theme.colors.text_on_surface_text_brand}
                    />
                    <AppText
                        text="Camera is not available on simulator. Please paste your connection URL below."
                        variant={TextVariantKeys.bodyMMedium}
                        styles={[{ marginTop: 10, marginBottom: 30 }, appStyles.textAlignCenter]}
                        textColor={theme.colors.text_on_surface_text_brand_2}
                    />
                    <AppButton
                        title="Paste Connection URL"
                        onPress={onPasteURI}
                        styles={{ width: '100%' }}
                    />
                    <AppButton
                        titleWithI18n={LanguageKey.transaction_history_close}
                        onPress={goBack}
                        type="clear"
                        styles={{ marginTop: 20 }}
                    />
                </View>
            ) : (
                showCamera && device && (
                    <View style={style.viewScanQRContainer}>
                        <Camera
                            style={style.scanQRContainer}
                            device={device}
                            isActive={isActive}
                            codeScanner={codeScanner}
                        />

                        <ScanArena />
                        <View style={[appStyles.flex1, appStyles.center]}>
                            <AppText
                                titleWithI18n={LanguageKey.scan_qr_title}
                                variant={TextVariantKeys.labelLarge}
                                styles={appStyles.textAlignCenter}
                                textColor={appColors.neutral.white}
                            />
                            <AppText
                                titleWithI18n={LanguageKey.scan_qr_sub_title}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={appStyles.textAlignCenter}
                                textColor={appColors.neutral.n600}
                            />
                            <AppButton
                                textVariant={TextVariantKeys.labelLarge}
                                titleWithI18n={
                                    LanguageKey.transaction_history_close
                                }
                                textColor={theme.colors.text_on_surface_text_brand}
                                styles={style.closeButton}
                                onPress={goBack}
                            />
                        </View>
                    </View>
                )
            )}
            <AppModal
                showRequirePinCode={false}
                onTouchOutside={goBack}
                titleWithI18n={LanguageKey.scan_qr_sub_denied_title}
                subTitleWithI18n={LanguageKey.scan_qr_sub_denied_sub_title}
                visible={isShowModalRequestCameraPermission}
                onPress={goBack}
                buttonTitleWithI18n={LanguageKey.transaction_history_close}
                onPress2={openSettingsAction}
                twoOptions={true}
                buttonTitleWithI18n2={LanguageKey.common_open_settings}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                icon={<WarnSvgIcon />}
            />
        </ScreenWrapper>
    );
};

export default ScanScreen;
