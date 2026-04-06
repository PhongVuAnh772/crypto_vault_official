import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import { CoinStacked01SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';

export type EmptyCollectionProps = {
    refreshing?: boolean;
    onRefresh?: () => void;
};

const EmptyCollection: React.FC<EmptyCollectionProps> = ({
    refreshing,
    onRefresh,
}) => {
    const theme = useAppTheme();
    return (
        <ScrollView
            style={appStyles.flex1}
            refreshControl={
                refreshing && onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }>
            <View
                style={[
                    appStyles.flex1,
                    appStyles.alignItemsCenter,
                    appStyles.pT30,
                ]}>
                <CoinStacked01SvgIcon
                    color={
                        theme.colors.text_on_surface_text_light
                    }
                />
                <View style={appStyles.mv10}>
                    <AppText
                        titleWithI18n={LanguageKey.No_asset_found_title}
                        variant={TextVariantKeys.titleLarge}
                        textColor={
                             theme.colors.text_on_surface_text_medium
                        }
                    />
                </View>
                <AppText
                    titleWithI18n={
                        LanguageKey.we_have_found_any_collections_title
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={
                         theme.colors.text_on_surface_text_light
                    }
                />
            </View>
        </ScrollView>
    );
};
export default EmptyCollection;
