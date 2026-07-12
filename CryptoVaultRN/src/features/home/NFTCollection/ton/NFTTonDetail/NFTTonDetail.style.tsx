import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { PlatformOS } from 'src/core/enum/PlatformOS';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const box = {
    borderRadius: 4,
    ...(Platform.OS === PlatformOS.IOS
        ? {
              shadowColor: appColors.neutral.n700,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 32,
          }
        : {}),
};
const PADDING = 30;
const MARGIN_TOP = 15;
const RADIUS = 4;
const useStyle = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        description: {
            ...box,
            marginTop: 16,
            padding: 16,
        },
        content: {
            ...box,
            ...appStyles.pB8,
        },
        nftImage: {
            width: '100%',
            minHeight: 327,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        p16: {
            padding: 16,
        },
        nameAndId: {
            borderBottomWidth: 0.6,
            paddingBottom: 12,
            borderColor: appColors.neutral.n200,
        },
        information: {
            paddingTop: 16,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
        },

        tokenStandard: {
            color: appColors.neutral.n500,
            flex: 1,
        },
        mt8: {
            marginTop: 8,
        },
        image: {
            width: '100%',
            aspectRatio: 1,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
        },
        network: {
            top: 12,
            left: 12,
            width: 40,
            height: 40,
        },
        underline: { textDecorationLine: 'underline' },
        menuIcon: {
            color: appColors.neutral.n800,
        },
        removeContainer: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
        },
        trashBinIcon: {
            color: appColors.main.tokyoRed,
            marginRight: 10,
        },
        buttonDelete: {
            flex: 1,
            height: 48,
        },
        cancelButton: {
            borderColor: appColors.main.tokyoRed,
            borderWidth: 1,
            marginRight: 7,
        },
        confirmButton: {
            backgroundColor: appColors.main.tokyoRed,
            marginLeft: 7,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
        boxContainer: {
            backgroundColor: appColors.neutral.white,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
        avatarContainer: {
            paddingHorizontal: PADDING,
            paddingBottom: PADDING,
            paddingTop: MARGIN_TOP,
        },
        shadowLayer: {
            width: '100%',
            height: '100%',
            backgroundColor: appColors.neutral.n400,
            marginHorizontal: PADDING,
            borderRadius: RADIUS,
            marginBottom: PADDING,
            marginTop: MARGIN_TOP,
        },
        innerShadowLayer: {
            width: '100%',
            height: '100%',
            backgroundColor: appColors.neutral.n400,
            borderRadius: RADIUS,
        },
        buttonSend: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            backgroundColor: undefined,
            paddingBottom: insets.bottom,
        },
        container: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyle;
