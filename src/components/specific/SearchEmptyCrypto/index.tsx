import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import AppText from 'src/components/common/AppText';
import { CoinStacked01SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';

type SearchEmptyType = {
    styles?: StyleProp<ViewStyle>;
};

const SearchEmptyCrypto: React.FC<SearchEmptyType> = ({ styles }) => {
    const theme = useAppTheme();
    return (
        <View style={[appStyles.alignItemsCenter, styles]}>
            <CoinStacked01SvgIcon
                color={theme.colors.text_on_surface_text_medium}
            />
            <View style={appStyles.mv10}>
                <AppText
                    titleWithI18n={LanguageKey.No_asset_found_title}
                    variant={TextVariantKeys.titleLarge}
                    textColor={theme.colors.text_on_surface_text_medium}
                />
            </View>
            <AppText
                titleWithI18n={LanguageKey.we_have_found_any_token_title}
                variant={TextVariantKeys.bodyRMedium}
                textColor={theme.colors.text_on_surface_text_light}
            />
        </View>
    );
};

export default SearchEmptyCrypto;
