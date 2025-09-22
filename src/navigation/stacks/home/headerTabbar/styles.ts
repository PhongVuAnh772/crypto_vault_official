import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        headerIconContainer: {
            width: 32,
            height: 32,
            ...appStyles.center,
        },
        iconContainer: {
            gap: 4,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentEnd,
            minWidth: 88,
        },
        input: {
            height: 44,
        },
        iconArrowDown: {
            color: appColors.neutral.n700,
        },
        protocolBox: {
            borderRadius: 100,
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            paddingVertical: 2,
            paddingHorizontal: 4,
        },
        addAccountButton: {
            backgroundColor: theme.colors.surface_surface_high,
        },
        walletIcon: {
            width: 20,
            height: 20,
            backgroundColor: appColors.neutral.white,
            borderRadius: 100,
            ...appStyles.center,
        },
        account: {
            borderRadius: 100,
            borderColor: theme.colors.outline,
            marginLeft: 50,
            ...appStyles.flexRow,
            ...appStyles.center,
            ...appStyles.pd5,
            backgroundColor: theme.colors.surface_surface__medium,
            maxWidth: (Utils.screenWidth * 3.4) / 10,
            paddingRight: 10,
            alignSelf: 'center',
        },
        titleProtocol: {
            textAlign: 'center',
        },
        closeIconStyle: { position: 'absolute', right: 25, top: -5 },
        protocolList: {
            shadowColor: appColors.neutral.n500,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            ...appStyles.mt15,
            backgroundColor: appColors.neutral.white,
            borderRadius: 4,
            flex: 1,
        },
        bottomSheet: {
            ...StyleSheet.absoluteFillObject,
        },
        mh6: {
            marginHorizontal: 6,
        },
        size20: {
            width: 20,
            height: 20,
            borderRadius: 20,
        },
        accountIcon: {
            ...appStyles.center,
            width: 32,
            height: 32,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            shadowColor: appColors.neutral.black,
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 4,
        },
        protocolContainer: {
            backgroundColor: appColors.other.outline_lightest,
        },
        container: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
            ...appStyles.fullWidth,
            marginTop: GlobalUtils.getEnableRedXNewTheme() ? 0 : insets.top,
            paddingTop: GlobalUtils.getEnableRedXNewTheme() ? insets.top : 0,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? appColors.main.tokyoRed
                : undefined,
        },
        ml8: {
            marginLeft: 8,
        },
        qualityConnect: {
            backgroundColor: 'white',
            borderRadius: 20,
            position: 'absolute',
            right: 0,
            top: -6,
            width: 20,
            height: 20,
            ...appStyles.center,
        },
    });

export default useStyles;
