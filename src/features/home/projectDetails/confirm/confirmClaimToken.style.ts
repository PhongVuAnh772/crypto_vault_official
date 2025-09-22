import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

export const useStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
        },
        confirmButtonContainer: {
            ...appStyles.fullWidth,
        },
        project: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.mt10,
            maxHeight: '75%',
        },
        projectDetailConfirm: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.mt10,
            maxHeight: 300,
        },
        projectDetailHistory: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 10,
        },
        projectDetails: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 10,
            maxHeight: 250,
        },
        details: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 30,
        },
        projectContainer: {
            width: '100%',
        },
        imageToken: {
            width: 20,
            height: 20,
            borderRadius: 50,
        },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        titleWithValueContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            width: '100%',
            paddingTop: 20,
            backgroundColor: appColors.neutral.white,
        },
        titleViewMoreContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            width: '100%',
            paddingTop: 5,
            backgroundColor: appColors.neutral.white,
        },
        warningContainer: {
            paddingVertical: 12,
            borderRadius: 4,
            ...appStyles.alignItemsCenter,
            borderColor: theme.colors.warning_outline,
            paddingHorizontal: 15,
            marginVertical: 10,
            borderWidth: 0.5,
            backgroundColor: theme.colors.warning_container,
        },
        decoration: {
            textDecorationLine: 'underline',
        },
        cancelActionSwitching: {
            backgroundColor: appColors.neutral.white,
            borderColor: appColors.main.tokyoRed,
            borderWidth: GlobalUtils.getEnableRedXNewTheme() ? 0 : 0.6,
        },
        modalContainer: {
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.pB15,
            ...appStyles.fullWidth,
        },
        texterea: {
            height: 100,
        },
        loadingListContainer: {
            height: 250,
            width: '100%',
            backgroundColor: appColors.neutral.white,
            padding: 16,
        },
        containerLoading: {
            backgroundColor: appColors.neutral.white,
        },
        logoLoading: {
            borderRadius: 50,
            ...appStyles.ml10,
        },
        containerEmpty: {
            ...appStyles.pT60,
            ...appStyles.pH25,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
        container: {
            ...appStyles.pH25,
            ...appStyles.justifyContentBetween,
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};
