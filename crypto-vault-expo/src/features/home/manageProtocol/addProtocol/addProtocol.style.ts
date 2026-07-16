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
        searchWrap: {
            paddingHorizontal: 25,
            paddingBottom: 8,
        },
        searchInput: {
            height: 42,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            paddingHorizontal: 12,
            color: theme.colors.text_on_surface_text_highest,
            backgroundColor: theme.colors.surface_surface_default,
        },
        listContainer: {
            paddingTop: 10,
            paddingBottom: 24,
            gap: 10,
        },
        protocolCard: {
            height: 72,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface_surface_default,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        protocolCardSelected: {
            borderColor: appColors.main.tokyoRed,
            backgroundColor: theme.colors.surface_surface_high,
        },
        protocolLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        protocolLogo: {
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 12,
            backgroundColor: appColors.neutral.n200,
        },
        protocolTextGroup: {
            flex: 1,
        },
        protocolName: {
            color: theme.colors.text_on_surface_text_highest,
            fontSize: 15,
            fontFamily: mPlus1.bold,
        },
        protocolMeta: {
            marginTop: 2,
            color: theme.colors.text_on_surface_text_medium,
            fontSize: 12,
        },
        statusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: appColors.neutral.n300,
        },
        statusDotActive: {
            backgroundColor: appColors.main.tokyoRed,
        },
        emptyText: {
            textAlign: 'center',
            color: theme.colors.text_on_surface_text_light,
            marginTop: 20,
        },
    });
export default addProtocolStyle;
