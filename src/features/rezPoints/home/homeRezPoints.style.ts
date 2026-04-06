import { StyleSheet } from 'react-native';
import { configureFonts } from 'react-native-paper';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const baseVariants = configureFonts();

export const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: appColors.neutral.white,
            width: '100%',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: appColors.neutral.white,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            paddingVertical: 8,
            paddingHorizontal: 12,
            width: '48%',
            height: 40,
        },
        icon: {
            width: 24,
            height: 24,
            marginRight: 8,
        },

        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        socialButtonContainer: {
            width: '100%',
            marginTop: 40,
        },
        dividerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginVertical: 20,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: '#E8E8E8',
        },
        text: {
            color: '#6B7280',
            fontSize: 14,
        },
        buttonContinueWithEmail: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
            height: 48,
            marginTop: 24,
        },
        termsContainer: {
            marginVertical: 40,
            alignItems: 'center',
        },
        termsText: {
            color: theme.colors.text_on_surface_text_high,
            textAlign: 'center',
            ...baseVariants.bodyMedium,
            fontFamily: mPlus1.regular,
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 20,
        },
        link: {
            color: appColors.main.tokyoRed,
            textDecorationLine: 'none',
            ...baseVariants.bodyMedium,
            fontFamily: mPlus1.regular,
            fontWeight: 'bold',
            fontSize: 14,
            lineHeight: -10,
        },
        linkContainer: {
            marginTop: -3,
        },
        overlay: {
            width: '100%',
            height: 500,
            backgroundColor: theme.colors.surface_surface_default,
            position: 'absolute',
            top: -10,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
        },
        overlayTransparent: {
            width: '95%',
            height: 500,
            backgroundColor: 'rgba(255,255,255,0.5)',
            position: 'absolute',
            top: -22,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignSelf: 'center',
        },
        forgotPassword: {
            marginTop: 24,
        },
        buttonDontHaveAccount: {
            marginBottom: 50,
        },
        labelName: {
            marginTop: 24,
            textAlign: 'left',
        },
        wrapper: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
        },
        footerContentContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsEnd,
        },
        coin: {
            marginTop: 8,
        },
        earningImage: {
            width: 96.51,
            height: 100,
        },
        containerContent: {
            padding: 24,
            flex: 1,
        },
        iconActionContainer: {
            width: 35,
            height: 36,
            backgroundColor: appColors.neutral.white,
            ...appStyles.center,
            shadowColor: appColors.neutral.n500,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        contentContainer: {
            width: '100%',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            alignItems: 'center',
        },
        itemActionWrapper: {
            alignItems: 'center',
        },
        actionText: {
            marginTop: 4,
        },
        pointDateListWrapper: {
            marginTop: 24,
        },
        pointDateListTitle: {
            textTransform: 'uppercase',
            marginBottom: 8,
        },
        pointExpiryDateItem: {
            ...appStyles.fullWidth,
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
        },
        pointExpiryDateItemText: {
            ...appStyles.flex1,
            paddingLeft: 12,
            ...appStyles.justifyContentBetween,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
        },
        itemTextTop: {
            marginTop: 4,
        },
        itemTextBottom: {
            marginTop: 4,
        },
        typeButtonContainer: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            height: 56,
            paddingHorizontal: 16,
        },
        bottomSheetContainer: {
            paddingHorizontal: 24,
        },
        cancelButton: {
            backgroundColor: theme.colors.surface_surface_high,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            borderWidth:  0.5,
        },
        contentStyle: {
            flex: 1,
        },
        bottomSheetContent: {
            backgroundColor: appColors.neutral.white,
            shadowColor: theme.colors.text_on_surface_text_light,
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
            marginHorizontal: 24,
            marginTop: 10,
            borderRadius: 4,
        },
        separator: {
            height: 1,
            backgroundColor: theme.colors.outline_outine_lightest,
        },
        shadow: {
            shadowColor: appColors.neutral.n500,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
        },
        contentListAction: {
            flexGrow: 1,
            justifyContent: 'space-between',
            padding: 10,
        },
        itemLoadingContainer: {
            backgroundColor: appColors.neutral.white,
        },
        pointHistory: {
            backgroundColor: 'rgba(255, 255, 255,0.4)',
            paddingHorizontal: 5,
            paddingLeft: 10,
            paddingVertical: 3,
            borderRadius: 20,
        },
    });
