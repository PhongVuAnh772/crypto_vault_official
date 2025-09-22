import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { Remove2SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

type RemoveModalType = {
    typeWallet?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const RemoveModalView: React.FC<RemoveModalType> = ({
    onCancel,
    onConfirm,
    typeWallet,
}) => {
    const theme: AppThemeType = useAppTheme();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const styles = useStyles(theme);
    return (
        <View style={styles.removeContainer}>
            <View style={styles.removeSubContainer}>
                <Remove2SvgIcon />
                <View style={appStyles.pV15}>
                    <AppText
                        titleWithI18n={
                            typeWallet
                                ? LanguageKey.wallet_menu_remove_title
                                : LanguageKey.account_menu_remove_title
                        }
                        variant={TextVariantKeys.titleLarge}
                        textColor={theme.colors.text_on_surface_text_highest}
                    />
                </View>
                <AppText
                    titleWithI18n={
                        typeWallet
                            ? LanguageKey.wallet_menu_remove_sub_title
                            : LanguageKey.account_menu_remove_sub_title
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    styles={appStyles.textAlignCenter}
                    textColor={theme.colors.text_on_surface_text_high}
                />
                <View style={appStyles.flexRow}>
                    {newUI ? (
                        <AppButtonSVG
                            onPress={onCancel}
                            titleWithI18n={LanguageKey.common_text_cancel}
                            textVariant={TextVariantKeys.bodyMMedium}
                            forceStyles={[
                                styles.buttonModal,
                                styles.buttonCancel,
                            ]}
                            backgroundColor={theme.colors.surface_surface_high}
                            borderColor={
                                theme.colors.text_on_surface_text_brand_2
                            }
                            borderWidth={1}
                            textStyles={appStyles.textAlignCenter}
                            textColor={appColors.main.tokyoRed}
                            SvgView={SvgView.ButtonCustomSvg}
                        />
                    ) : (
                        <AppButton
                            onPress={onCancel}
                            titleWithI18n={LanguageKey.common_text_cancel}
                            textVariant={TextVariantKeys.bodyMMedium}
                            forceStyles={[
                                styles.buttonModal,
                                styles.buttonCancel,
                            ]}
                            textStyles={appStyles.textAlignCenter}
                            textColor={appColors.main.tokyoRed}
                        />
                    )}
                    {newUI ? (
                        <AppButtonSVG
                            onPress={onConfirm}
                            titleWithI18n={LanguageKey.common_text_confirm}
                            textVariant={TextVariantKeys.bodyMMedium}
                            forceStyles={[
                                styles.buttonModal,
                                styles.buttonConfirm,
                            ]}
                            textStyles={appStyles.textAlignCenter}
                            textColor={appColors.neutral.white}
                            SvgView={SvgView.ButtonCustomSvg}
                        />
                    ) : (
                        <AppButton
                            onPress={onConfirm}
                            titleWithI18n={LanguageKey.common_text_confirm}
                            textVariant={TextVariantKeys.bodyMMedium}
                            forceStyles={[
                                styles.buttonModal,
                                styles.buttonConfirm,
                            ]}
                            textStyles={appStyles.textAlignCenter}
                            textColor={appColors.neutral.white}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        removeContainer: {
            ...appStyles.flex1,
            ...appStyles.center,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        removeSubContainer: {
            ...appStyles.pd25,
            ...appStyles.mh25,
            ...appStyles.center,
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
        },
        buttonModal: {
            height: 48,
            borderRadius: 4,
            ...appStyles.mt25,
        },
        buttonCancel: {
            ...appStyles.center,
            borderWidth: GlobalUtils.getEnableRedXNewTheme() ? 0 : 1,
            borderColor: appColors.main.tokyoRed,
            flex: 1,
            marginRight: 10,
        },
        buttonConfirm: {
            ...appStyles.center,
            backgroundColor: appColors.main.tokyoRed,
            flex: 1,
            marginLeft: 10,
        },
    });

export default RemoveModalView;
