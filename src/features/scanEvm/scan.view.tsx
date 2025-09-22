import React from 'react';
import { View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import ScanArena from 'src/components/homeComponents/ScanArena';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { useScan } from './scan.hook';
import useStyles from './scan.stye';

const ScanEvmScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { theme, device, showCamera, isActive, codeScanner } = useScan({
        navigation,
    });

    const style = useStyles(theme);
    return (
        <ScreenWrapper
            enableDismissKeyboard
            backgroundColor={theme.colors.surface_surface_default}>
            {showCamera && device && (
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
                        />
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
};

export default ScanEvmScreen;
