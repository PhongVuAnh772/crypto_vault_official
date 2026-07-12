import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

export const useStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
        },
        project: {
            width: '100%',
            padding: 16,
            marginTop: 15,
            ...appStyles.flex1,
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
        shadowContainer: {
            shadowColor: appColors.neutral.n800,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        imageToken: {
            width: 20,
            height: 20,
            borderRadius: 50,
        },
        input: {
            height: 44,
        },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        container: {
            ...appStyles.pH25,
            ...appStyles.flex1,
            ...appStyles.pT15,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};
