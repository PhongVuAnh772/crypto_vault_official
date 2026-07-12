import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import ScanArena from 'src/components/homeComponents/ScanArena';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { useScan } from './scan.hook';
import useStyles from './scan.stye';

const ScanEvmScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { theme, device, showCamera, isActive, codeScanner, onPasteURI, isSimulator, goBack, manualUri, setManualUri, onConnectManual } = useScan({
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
                        title="Simulator Mode"
                        variant={TextVariantKeys.titleLarge}
                        textColor={theme.colors.text_on_surface_text_brand}
                    />
                    <AppText
                        title="Camera is not available on simulator. Please paste your WalletConnect URI below."
                        variant={TextVariantKeys.bodyMMedium}
                        styles={[{ marginTop: 10, marginBottom: 30 }, appStyles.textAlignCenter]}
                        textColor={theme.colors.text_on_surface_text_brand_2}
                    />
                    <View style={{ width: '100%', marginBottom: 15 }}>
                        <AppTextInput
                            placeholder="Paste or type wc: URI here"
                            value={manualUri}
                            onChangeText={setManualUri}
                        />
                    </View>
                    <AppButton
                        title="Connect"
                        onPress={onConnectManual}
                        styles={{ width: '100%', marginBottom: 10 }}
                    />
                    <AppButton
                        title="Paste from Clipboard"
                        onPress={onPasteURI}
                        styles={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: theme.colors.primary
                        }}
                        textColor={theme.colors.primary}
                    />
                    <AppButton
                        titleWithI18n={LanguageKey.transaction_history_close}
                        onPress={goBack}
                        styles={{ marginTop: 20, backgroundColor: 'transparent' }}
                        textColor={theme.colors.text_on_surface_text_brand}
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

                        <View style={style.overlay}>
                            <View style={{ width: '80%', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 15 }}>
                                <View style={{ marginBottom: 10 }}>
                                    <AppTextInput
                                        placeholder="Paste or type wc: URI"
                                        value={manualUri}
                                        onChangeText={setManualUri}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[style.pasteButton, { width: '100%', marginBottom: 10, backgroundColor: theme.colors.primary }]}
                                    onPress={onConnectManual}>
                                    <Feather name="link" size={20} color="#fff" />
                                    <Text style={style.pasteText}>Connect Manual</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={style.pasteButton} onPress={onPasteURI}>
                                    <Feather name="clipboard" size={20} color="#fff" />
                                    <Text style={style.pasteText}>Paste URI</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

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
        </ScreenWrapper>
    );
};

export default ScanEvmScreen;
