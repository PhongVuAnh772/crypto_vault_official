import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import {mPlus1} from 'src/core/constants/FontFamily';

const addProtocolStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        tabBarStyle: {
            backgroundColor: theme.colors.surface_surface_default,
            marginHorizontal: 25,
            shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
            backgroundColor: appColors.main.tokyoRed,
            height: 1.8,
        },
        tabBarLabelStyle: {
            textTransform: 'none',
            fontFamily: mPlus1.bold,
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 20,
        },
        container: {
            flex: 1,
            backgroundColor: theme.colors.surface_surface_default,
            paddingHorizontal: 25,
        },
    });
export default addProtocolStyle;
