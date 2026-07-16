import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        buttonHeader: {
            width: 32,
        },
        input: {
            height: 44,
        },
        image: { width: 28, height: 28, borderRadius: 100 },
        switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
        ...appStyles,
        tokenItem: {
            padding: 16,
            backgroundColor: appColors.neutral.white,
        },
        name: {
            marginHorizontal: 16,
        },
        markIcon: {
            color: appColors.functional.green,
        },
        imageToken: {
            width: 28,
            height: 28,
            borderRadius: 28,
        },
        size24: {
            width: 24,
            height: 24,
            borderRadius: 100,
        },
        size28: {
            width: 28,
            height: 28,
            borderRadius: 100,
        },
        size16: {
            width: 16,
            height: 16,
            borderRadius: 100,
        },
        listContentContainer: {
            borderRadius: 8,
            paddingTop: 16,
            flexGrow: 1,
        },
        symbol: {
            backgroundColor: appColors.neutral.n200,
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4,
        },
        container: {
            ...appStyles.pV15,
            ...appStyles.pH25,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
        headerContainer: {
            ...appStyles.pH25,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyles;
