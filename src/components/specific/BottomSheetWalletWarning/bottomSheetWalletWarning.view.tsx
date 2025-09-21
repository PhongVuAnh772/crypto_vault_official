import React from 'react';
import { View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import SvgView from 'src/components/SvgBox';
import { BigLockSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useBottomSheetWallet from './bottomSheetWalletWarning.hook';
import useStyles from './bottomSheetWalletWarning.style';
interface BottomSheetProps {
    closeModalCreateNewWallet: () => void;
    isVisible: boolean;
    continueAction: () => void;
    onDismiss: () => void;
}

const BottomSheetWarningWallet: React.FC<BottomSheetProps> = ({
    closeModalCreateNewWallet,
    isVisible,
    continueAction,
    onDismiss,
}) => {
    const { listBottomSheetPhrase, theme, insets, newUI } =
        useBottomSheetWallet();
    const styles = useStyles(theme, insets);
    return (
        <BottomSheetModal
            onDismiss={onDismiss}
            showModal={isVisible}
            closeModalAction={closeModalCreateNewWallet}
            scrollView
            bottomChild={
                <View
                    style={{
                        backgroundColor: theme.colors.surface_surface_default,
                    }}>
                    {newUI ? (
                        <AppButtonSVG
                            onPress={continueAction}
                            titleWithI18n={LanguageKey.common_text_continue}
                            textVariant={TextVariantKeys.titleSmall}
                            textColor={theme.colors.text_on_surface_text_invert}
                            styles={styles.buttonNewTheme}
                            SvgView={SvgView.button}
                        />
                    ) : (
                        <AppButton
                            onPress={continueAction}
                            titleWithI18n={LanguageKey.common_text_continue}
                            styles={styles.button}
                            textVariant={TextVariantKeys.titleSmall}
                            textColor={theme.colors.text_on_surface_text_invert}
                        />
                    )}
                </View>
            }
            child={
                <View style={appStyles.pH25}>
                    <View style={appStyles.flex1}>
                        <View style={appStyles.center}>
                            <BigLockSvgIcon />
                            <View style={appStyles.mv25}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.never_show_secret_phrase_title
                                    }
                                    variant={TextVariantKeys.titleLarge}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                            </View>
                            {listBottomSheetPhrase.map(item => (
                                <View
                                    key={item.title}
                                    style={[
                                        appStyles.center,
                                        appStyles.flexRow,
                                        appStyles.mbt15,
                                    ]}>
                                    <View style={appStyles.mr25}>
                                        <item.icon
                                            width={32}
                                            height={32}
                                            color={
                                                theme.colors
                                                    .label_surface_button_primary
                                            }
                                        />
                                    </View>
                                    <AppText
                                        titleWithI18n={item.title}
                                        variant={TextVariantKeys.bodyRMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            }
        />
    );
};

export default BottomSheetWarningWallet;
