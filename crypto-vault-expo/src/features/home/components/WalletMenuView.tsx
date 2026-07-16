import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { Edit2SvgIcon, RemoveSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

type WalletMenuType = {
    menuPosition: {
        x: number;
        y: number;
    };
    onEditAction: () => void;
    onRemoveAction: () => void;
    typeWallet?: boolean;
    hideRemove?: boolean;
};

const WalletMenuView: React.FC<WalletMenuType> = ({
    menuPosition,
    onEditAction,
    onRemoveAction,
    typeWallet,
    hideRemove = false,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);

    return (
        <View
            style={[
                styles.menu,
                {
                    top: menuPosition.y,
                    left: menuPosition.x - 160,
                },
            ]}>
            <View>
                <TouchableOpacity
                    onPress={onEditAction}
                    style={[
                        appStyles.flexRow,
                        appStyles.pd10,
                        appStyles.alignItemsCenter,
                    ]}>
                    <View style={appStyles.mr10}>
                        <Edit2SvgIcon />
                    </View>
                    <AppText
                        titleWithI18n={
                            typeWallet
                                ? LanguageKey.wallet_menu_edit_title
                                : LanguageKey.account_menu_edit_title
                        }
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={theme.colors.text_on_surface_text_highest}
                    />
                </TouchableOpacity>
                {!hideRemove && (
                    <TouchableOpacity
                        onPress={onRemoveAction}
                        style={[
                            appStyles.flexRow,
                            appStyles.pd10,
                            appStyles.alignItemsCenter,
                        ]}>
                        <View style={appStyles.mr10}>
                            <RemoveSvgIcon />
                        </View>
                        <AppText
                            titleWithI18n={
                                typeWallet
                                    ? LanguageKey.wallet_menu_remove_title
                                    : LanguageKey.account_menu_remove_title
                            }
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        menu: {
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            borderRadius: 4,
            width: 160,
        },
    });

export default WalletMenuView;
