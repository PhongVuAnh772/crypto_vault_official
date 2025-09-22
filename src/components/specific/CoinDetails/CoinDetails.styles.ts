import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        viewCoin: {
            ...appStyles.flex3,
        },
        loadingTitleContainer: {
            height: 60,
            width: 200,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 4,
            ...appStyles.alignItemsCenter,
        },
        actionContainer: {
            marginHorizontal: 24,
            marginVertical: 16,
            backgroundColor: theme.colors.surface_surface_high,
        },
        actionCenterItem: {
            borderColor: theme.colors.outline_outine,
            borderRightWidth: 0.5,
            borderLeftWidth: 0.5,
        },
        transactionHitoryIcon: {
            ...appStyles.center,
            backgroundColor: appColors.neutral.n100,
            borderRadius: 4,
            marginRight: 15,
            width: 28,
            height: 28,
        },

        typeContainer: {
            ...appStyles.flexRow,
            ...appStyles.center,
            backgroundColor: theme.colors.label_surface_button_pressed,
            borderRadius: 50,
            paddingLeft: 12,
            paddingHorizontal: 8,
            paddingVertical: 5,
            shadowColor: appColors.neutral.n300,
            shadowOffset: {
                width: 0,
                height: GlobalUtils.getEnableRedXNewTheme() ? 0 : 4,
            },
            shadowOpacity: GlobalUtils.getEnableRedXNewTheme() ? 0 : 1,
            shadowRadius: 4,
            elevation: GlobalUtils.getEnableRedXNewTheme() ? 0 : 4,
        },
        iconArrowDown: {
            ...appStyles.center,
            width: 20,
            height: 20,
        },
        header: {
            paddingTop: 16,
            paddingBottom: 10,
            width: '100%',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        transactionHistoryItem: {
            ...appStyles.flexRow,
            ...appStyles.pd15,
            ...appStyles.alignItemsCenter,
            backgroundColor: appColors.neutral.white,
            borderColor: appColors.neutral.n300,
            borderBottomWidth: 0.5,
        },
        bottomItem: {
            borderBottomRightRadius: 4,
            borderBottomLeftRadius: 4,
        },
        topItem: {
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
        },
        containerStatus: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            marginLeft: 8,
            maxHeight: 22,
            ...appStyles.center,
        },
        completedColor: {
            backgroundColor: appColors.light.green,
        },
        pendingColor: {
            backgroundColor: appColors.light.yellow,
        },
        sectionList: {
            ...appStyles.pH15,
            paddingTop: GlobalUtils.getEnableRedXNewTheme() ? 30 : 15,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme() ? 40 : 0,
        },
        listShadow: {
            borderRadius: 4,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            ...appStyles.pB50,
        },

        buttonHeader: {
            width: 32,
        },
        errorColor: {
            backgroundColor: appColors.other.outline_lightest,
        },
        overflowHidden: {
            overflow: 'hidden',
        },
        headerCoin: {
            position: 'absolute',
            width: '100%',
        },
        lowerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginHorizontal: 24,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? undefined
                : appColors.neutral.white,
            minHeight: 80,
            borderRadius: 4,
            paddingVertical: 12,
        },
        featureIconScroll: {
            width: 36,
            height: 36,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
            right: 10,
        },
        borderBox: {
            height: '100%',
            width: 0.7,
            backgroundColor: appColors.neutral.n200,
        },
        featureName: {
            marginTop: 4,
        },
        featureIcon: {
            width: 36,
            height: 36,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? undefined
                : appColors.neutral.n200,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
        },
        colorIcon: {
            color: appColors.neutral.n700,
        },
        colorIconWhite: {
            color: appColors.neutral.white,
        },
        scrollViewContent: {},
        headerSectionList: {
            position: 'absolute',
            right: 0,
            zIndex: 99999,
            top: GlobalUtils.getEnableRedXNewTheme() ? 6 : 10,
        },
        actionButtonHeader: {
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
            marginLeft: -20,
        },
        w20: {
            width: 20,
        },
        contentInsideHeader: {
            position: 'absolute',
            width: '100%',
            zIndex: 2,
            paddingVertical: 10,
        },
        containerContentInsideHeader: {
            marginTop: GlobalUtils.getEnableRedXNewTheme() ? 8 : 0,
        },
        boxActionLoading: {
            borderRadius: 4,
        },
        lineActionBox: {
            backgroundColor: appColors.neutral.n200,
            height: '100%',
            width: 0.5,
        },
        viewBox: {
            position: 'absolute',
            width: '100%',
            zIndex: 2,
            padding: 20,
            ...appStyles.center,
        },
        mlMinus20: {
            marginLeft: -20,
        },
    });

export default useStyles;
