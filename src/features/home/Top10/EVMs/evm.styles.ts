import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType) => {
    return StyleSheet.create({
        headerContainer: {
            ...appStyles.flex1,
            ...appStyles.fullWidth,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            backgroundColor: appColors.neutral.white,
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 12,
            borderBottomWidth: 0.6,
            borderBottomColor: theme.colors.outline_outine,
        },
        marketCapHeader: {
            paddingHorizontal: 16,
        },
        tokenItem: {
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 12,
            backgroundColor: appColors.neutral.white,
        },
        tokenLoadingItem: {
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 12,
            backgroundColor: appColors.neutral.white,
        },
        pdH12: {
            paddingHorizontal: 12,
        },
        name: {
            marginHorizontal: 12,
            marginBottom: 2,
        },
        fiat: {
            marginTop: 2,
            marginHorizontal: 12,
        },
        imageToken: {
            width: 24,
            height: 24,
            borderRadius: 24,
        },
        symbol: {
            backgroundColor: appColors.neutral.n200,
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4,
        },
        loadingContainer: {
            ...appStyles.pV15,
            ...appStyles.pH10,
            ...appStyles.flex1,
            backgroundColor: appColors.neutral.white,
        },
        listContentContainer: {
            borderRadius: 8,
            paddingTop: 16,
            flexGrow: 1,
        },
        container: {
            // ...appStyles.pV15,
            ...appStyles.pH25,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};

export default useStyle;
