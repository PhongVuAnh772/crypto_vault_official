import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            marginTop: 10,
            paddingBottom: insets.bottom,
        },
        reject: {
            position: 'absolute',
            right: 10,
            zIndex: 100,
        },
        buttonConfirm: {
            ...appStyles.flex1,
            justifyContent: 'flex-end',
        },
        itemTransaction: {
            ...appStyles.flexRow,
            ...appStyles.pd15,
            ...appStyles.mbt20,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n600,
            borderWidth: 0.6,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
            borderRadius: 6,
        },
        buttonTransactionConfirm: {
            backgroundColor: theme.colors.primary,
            flex: 1,
            marginHorizontal: 10,
        },
        buttonTransactionReject: {
            flex: 1,
            marginHorizontal: 10,
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
        infoWallet: {
            ...appStyles.pH15,
            ...appStyles.pV25,
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
        warning: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            padding: 16,
            backgroundColor: theme.colors.warning_container,
            borderWidth: 0.5,
            borderColor: theme.colors.warning_outline,
            marginTop: 24,
        },
        image: {
            width: 50,
            height: 50,
            borderRadius: 20,
        },
        icon_default: {
            width: 36,
            height: 36,
            backgroundColor: theme.colors.surface_surface_default,
            ...appStyles.center,
        },
        view_emulate: {
            backgroundColor: '#FFF2F5',
            borderWidth: 0.5,
            borderColor: '#FFC6C5',
            borderRadius: 4,
            ...appStyles.pd16,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
        },
    });
export default useStyles;
