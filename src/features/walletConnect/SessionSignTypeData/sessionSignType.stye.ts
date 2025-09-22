import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

const useStyles = (theme: AppThemeType,insets: EdgeInsets) =>
    StyleSheet.create({
        listChain: {
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 8,
            borderWidth: 2,
            backgroundColor:'white',
            marginBottom:10,
            borderColor: theme.colors.outline_outine_lightest,
            shadowColor:appColors.neutral.n400,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.3,
            shadowRadius: 1,
            elevation: 10,
        },
        nameProtocol: {
            marginHorizontal: 16,
        },
        iconChains: {
            ...appStyles.center,
            width: 32,
            height: 32,
            backgroundColor: appColors.neutral.white,
            borderRadius: 100,
            shadowColor: appColors.neutral.n300,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },
        buttonConnect: {
            flex: 1,
            backgroundColor: theme.colors.label_surface_button_primary,
            marginLeft: 10,
            paddingVertical: 16,
            borderRadius: 24,
        },
        buttonClose: {
            flex: 1,
            backgroundColor: theme.colors.label_surface_button_light,
            marginRight: 10,
            paddingVertical: 16,
            borderRadius: 24,
        },
        errorContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        viewScanQRContainer: {
            height: Utils.screenHeight,
            width: Utils.screenWidth,
            backgroundColor: appColors.neutral.n800,
            position: 'absolute',
        },
        scanQRContainer: {
            width: Utils.screenWidth,
            height: Utils.screenHeight * 0.7,
        },
        closeButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '40%',
            ...appStyles.mt25,
        },
        view_connect: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            paddingBottom:insets?.bottom
        },
        image: {
            width: 50,
            height: 50,
            borderRadius: 20,
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
            backgroundColor: theme.colors.surface_surface_high,
            paddingHorizontal:16,
            paddingVertical:24,
            shadowColor: appColors.neutral.n400,
            borderWidth: 1,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 40,
            elevation: 10,
        },
        titleWithValueContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
        },
        borderBottom:{
            borderBottomColor:theme.colors.outline_outine_lightest,
            borderBottomWidth:1
        },
        view_switch_address: {
            ...appStyles.flexRow,
            ...appStyles.pd16,
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
            width: '100%',
            ...appStyles.center
        },
    });
export default useStyles;
