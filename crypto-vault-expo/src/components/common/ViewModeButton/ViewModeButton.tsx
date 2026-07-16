import React from 'react';
import { View } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { ArrowSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import AppButton from '../AppButton';

type ViewModeButtonType = {
    viewMoreHistory?: () => void;
};

const ViewModeButton: React.FC<ViewModeButtonType> = ({ viewMoreHistory }) => {
    const theme = useAppTheme();

    return (
        <View
            style={[
                appStyles.mt15,
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentAround,
            ]}>
            <AppButton
                onPress={viewMoreHistory}
                titleWithI18n={
                    LanguageKey.common_text_view_full_history_on_scan
                }
                textVariant={TextVariantKeys.titleSmall}
                textColor={
                    theme.colors.surface_surface_brand
                }
                rightIcon={
                    <View style={appStyles.ml10}>
                        <ArrowSvgIcon
                            color={
                               appColors.main.tokyoRed
                            }
                        />
                    </View>
                }
            />
        </View>
    );
};

export default ViewModeButton;
