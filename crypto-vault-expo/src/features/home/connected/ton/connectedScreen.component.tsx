import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import { RemoveSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { IConnectedAppConnection } from '../../../tonConnect/slice/tonConnect.type';
import useStyles from '../../../tonConnect/tonConnectStyle';

export type IConnectedAppConnectionWithExtra = {
    item: IConnectedAppConnection;
    image: string | undefined;
    name: string | undefined;
    url: string | undefined;
  };
type DappItemType = {
    item:IConnectedAppConnectionWithExtra
    removeDapp: (item: IConnectedAppConnectionWithExtra) => void;
};
const DappItem = ({ item, removeDapp }: DappItemType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme, insets);
    return (
        <TouchableOpacity
            style={[style.itemTransaction, appStyles.mbt10]}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.flex1,
                    appStyles.alignItemsCenter,
                ]}>
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <AppImage uri={item.image} width={40} height={40} />
                    <View style={appStyles.ml12}>
                        <AppText
                            title={item.name}
                            textColor={theme.colors.text_on_surface_text_high}
                            variant={TextVariantKeys.bodyMMedium}
                        />
                        <AppText
                            title={item.url}
                            textColor={theme.colors.text_on_surface_text_light}
                            variant={TextVariantKeys.bodyMSmall}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        removeDapp(item);
                    }}>
                    <RemoveSvgIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};
const ListEmpty = () => {
    const theme = useAppTheme();

    return (
        <View
            style={[
                appStyles.alignItemsCenter,
                appStyles.justifyContentCenter,
                appStyles.flex1,
                appStyles.pH55,
            ]}>
            <AppText
                titleWithI18n={
                    LanguageKey.connected_apps_will_be_shown_here_title
                }
                textColor={theme.colors.text_on_surface_text_highest}
                variant={TextVariantKeys.titleLarge}
                styles={[appStyles.pH25, appStyles.textAlignCenter]}
            />
        </View>
    );
};
export { DappItem, ListEmpty };
