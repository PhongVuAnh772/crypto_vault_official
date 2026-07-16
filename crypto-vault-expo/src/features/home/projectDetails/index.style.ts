import { StyleSheet } from 'react-native';
import { configureFonts } from 'react-native-paper';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const baseVariants = configureFonts();
export const useTabStyles = (theme: AppThemeType, gap = 8) => {
    return StyleSheet.create({
        modalContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        },
        tabBarContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: 15,
            paddingTop: 5,
        },
        tabBarStyle: {
            paddingHorizontal: 40,
            height: 35,
            marginTop: 10,
            backgroundColor: 'transparent',
            alignSelf: 'center',
            borderBottomWidth: 1.5,
        },
        tabStyle: {
            marginHorizontal: 25,
            width: 'auto',
        },
        tabBarLabelStyle: {
            textTransform: 'none',
            ...baseVariants.titleSmall,
            fontFamily: mPlus1.bold,
            fontWeight: '700',
            fontSize: 5,
            lineHeight: 20,
        },
        tabBarIndicatorStyle: {
            backgroundColor: appColors.main.tokyoRed,
        },
        imageBanner: {
            ...appStyles.fullWidth,
            height: 200,
            borderRadius: 5,
        },
        activeLabel: {
            fontWeight: '500',
        },
        protocolContainer: {
            backgroundColor: theme.colors.label_surface_button_pressed,
            ...appStyles.flexRow,
            ...appStyles.center,
            height: 28,
            borderRadius: 50,
            paddingLeft: 12,
            paddingRight: 8,
        },
        typeContainer: {
            ...appStyles.flexRow,
            ...appStyles.center,
            backgroundColor: appColors.neutral.white,
            height: 28,
            borderRadius: 50,
            paddingLeft: 12,
            paddingRight: 8,
        },
        iconArrowDown: {
            ...appStyles.center,
            width: 20,
            height: 20,
        },
        header: {
            padding: 10,
            backgroundColor: theme.colors.surface_surface_default,
        },
        headerText: {
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.colors.text_on_surface_text_light,
        },
        transactionHistoryItem: {
            ...appStyles.flexRow,
            ...appStyles.pd15,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_high,
        },
        transactionHistoryTopItemBorder: {
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
        },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        transactionHistoryBottomItemBorder: {
            borderBottomRightRadius: 4,
            borderBottomLeftRadius: 4,
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
        maxHeigh: {
            height: '100%',
            borderRadius: 4,
            ...appStyles.mt5,
        },
        closeContainer: {
            position: 'absolute',
            alignItems: 'flex-end',
            width: '100%',
            justifyContent: 'center',
        },
        closeButton: {
            width: 24,
            height: 24,
            ...appStyles.center,
        },
        listContainer: {
            height: '100%',
        },
        titleCryptoDetail: {
            marginVertical: gap / 2,
            color: theme.colors.text_on_surface_text_high,
        },
        shortCryptoDetailContainer: {
            marginVertical: -(gap / 2),
            paddingLeft: 4,
        },
        container: {
            backgroundColor: appColors.neutral.white,
            paddingHorizontal: 12,
            paddingVertical: 18,
            borderRadius: 4,
        },
        icon_color: {
            color: theme.colors.text_on_surface_text_light,
        },
        h30: {
            height: 30,
        },
        icon: {
            padding: 5,
            backgroundColor: theme.colors.surface_surface_default,
            borderRadius: 5,
        },
        itemHistoryContainer: {
            backgroundColor: appColors.neutral.white,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 4,
        },
        widthLimitContainer: {
            width: '70%',
        },
        backgroundContainer: {
            backgroundColor:  undefined,
        },
    });
};
