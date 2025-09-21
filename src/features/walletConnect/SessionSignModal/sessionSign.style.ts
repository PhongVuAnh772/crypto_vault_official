import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType,insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 24,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.flex1,
            paddingBottom:insets.bottom
        },
        close: {
            position: 'absolute',
            left: 15,
        },
        information: {
            justifyContent: 'space-between',
            marginBottom: 15,
            flexDirection: 'row',
        },
        header: {
            textAlign: 'center',
            marginBottom: 30,
        },
        buttonApprove: {
            marginTop: 16,
            backgroundColor: theme.colors.label_surface_button_primary,
            paddingVertical: 10,
            borderRadius: 10,
        },
        warning: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            padding: 16,
            backgroundColor: theme.colors.warning_container,
            borderWidth: 0.5,
            borderColor: theme.colors.warning_outline,
            marginVertical: 14,
        },
        infoWallet: {
           ...appStyles.pd16,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n400,
            borderWidth: 1,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 10,
        },
        accountIcon: {
            ...appStyles.center,
            width: 36,
            height: 36,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            shadowColor: appColors.neutral.black,
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.2,
            shadowRadius: 30,
            elevation: 4,
            marginRight: 20,
        },
    });
export default useStyles;
