import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        image_24: {
            width: 30,
            height: 30,
            borderRadius: 30,
            borderWidth: 0.6,
            borderColor: 'black',
            marginTop: 10,
        },
        listChain: {
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: theme.colors.surface_surface__medium,
            marginTop: 4,
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
            backgroundColor: theme.colors.surface_surface_default,
            ...appStyles.flex1,
            ...appStyles.pH15,
        },
    });
export default useStyles;
