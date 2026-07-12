import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        wrap: {
            flexDirection: 'column',
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 4,
            borderWidth: 1,
            shadowColor: appColors.neutral.n800,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        title: {
            color: theme.colors.text_on_surface_text_highest,
            paddingVertical: 8,
        },
        searchContainer: {
            width: '100%',
            gap: 8,
            alignItems: 'center',
            flexDirection: 'row',
            padding: 12,
            height: 54,
            overflow: 'hidden',
        },
        searchBtn: {
            flexDirection: 'row',
            gap: 10,
            padding: 14,
            alignItems: 'center',
            width: 270,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 30,
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.surface_surface_high,
            borderWidth: 0,
            ...theme.fonts.bodyRMedium,
        },

        iconSearch: {
            width: 18,
            height: 18,
        },
        rightIcon: {
            width: 24,
            height: 24,
        },
        right: {
            flex: 0.1,
        },
        searchContent: {
            paddingLeft: 0,
        },
    });

export default useStyles;
