import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    AddCircleSvgIcon,
    AddWalletSvgIcon,
    ArrowDown2SvgIcon,
    Close2SvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

type AddWalletViewType = {
    onClose: () => void;
    onCreate: () => void;
    onRestore: () => void;
    typeWallet?: boolean;
};

const AddWalletView: React.FC<AddWalletViewType> = ({
    onClose,
    onCreate,
    onRestore,
    typeWallet,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);
    return (
        <View style={appStyles.pH25}>
            <View style={[appStyles.justifyContentEnd, appStyles.flexRow]}>
                <TouchableOpacity onPress={onClose}>
                    <Close2SvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                </TouchableOpacity>
            </View>
            <View style={appStyles.center}>
                <AddWalletSvgIcon />
            </View>
            <View style={appStyles.pV25}>
                <AppText
                    titleWithI18n={
                        typeWallet
                            ? LanguageKey.wallet_connect_title
                            : LanguageKey.account_connect_account_title
                    }
                    variant={TextVariantKeys.titleLarge}
                    styles={appStyles.textAlignCenter}
                    textColor={theme.colors.text_on_surface_text_high}
                />
            </View>
            <View style={appStyles.mbt15}>
                <TouchableOpacity
                    onPress={onCreate}
                    style={styles.addWalletActionButton}>
                    <AddCircleSvgIcon />
                    <View style={[appStyles.flex1, appStyles.ml15]}>
                        <AppText
                            titleWithI18n={
                                typeWallet
                                    ? LanguageKey.wallet_create_title
                                    : LanguageKey.account_create_title
                            }
                            variant={TextVariantKeys.titleMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                        {!typeWallet && (
                            <AppText
                                titleWithI18n={
                                    LanguageKey.account_create_sub_title
                                }
                                variant={TextVariantKeys.bodyRMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={onRestore}
                style={styles.addWalletActionButton}>
                <ArrowDown2SvgIcon />
                <View style={[appStyles.flex1, appStyles.ml15]}>
                    <AppText
                        titleWithI18n={
                            typeWallet
                                ? LanguageKey.wallet_exist_title
                                : LanguageKey.account_exist_title
                        }
                        variant={TextVariantKeys.titleMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                    {!typeWallet && (
                        <AppText
                            titleWithI18n={LanguageKey.account_exist_sub_title}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_medium}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        addWalletActionButton: {
            ...appStyles.pd15,
            ...appStyles.flexRow,
            ...appStyles.center,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 4,
            borderWidth: 0.5,
            borderColor: theme.colors.outline_outine_lightest,
            ...Platform.select({
                android: { elevation: 6 },
                ios: {
                    shadowColor: appColors.neutral.n300,
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 4 },
                },
            }),
        },
    });

export default AddWalletView;
