import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
export const useTransactionDetailsStyle = (
    theme: AppThemeType,
    insets: EdgeInsets,
) => {
    return StyleSheet.create({
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
            marginBottom: insets.bottom,
            height: 48,
        },
        closeButtonDetails: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
            ...appStyles.mt10,
            marginBottom: insets.bottom,
        },
        decoration: {
            textDecorationLine: 'underline',
        },
        projet: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 30,
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
        projectInitialHeight: {
            height: '30%',
        },
        imageToken: {
            width: 20,
            height: 20,
            borderRadius: 50,
        },
        helpButton: {
            alignSelf: 'flex-end',
        },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        transactionChildContainer: {
            maxHeight: '50%',
            ...appStyles.fullWidth,
        },
        projectDetailHistory: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 10,
        },
        container: {
            ...appStyles.pH25,
            ...appStyles.justifyContentBetween,
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_default,
            ...appStyles.pT15,
        },
        bgDefault: {
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};
