import { Platform, StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
export const useStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        disableInput: {
            backgroundColor: appColors.neutral.n200,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            color: appColors.neutral.n600,
        },
        textInput: {
            fontFamily: mPlus1.regular,
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 20,
        },
        bottomSheetContent: {
            backgroundColor: appColors.neutral.white,
            shadowColor: Platform.select({
                android: appColors.neutral.n500,
                ios: appColors.neutral.n200,
            }),
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 5,
        },
        cancelButton: {
            backgroundColor: theme.colors.surface_surface_high,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            borderWidth: 0.5,
        },
        h16: {
            height: 16,
        },
        container: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            ...appStyles.pT15,
            backgroundColor: appColors.neutral.n100,
        },
    });
};
