import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType) => {
    return StyleSheet.create({
        itemCollectionContainer: {
            borderRadius: 4,
        },
        logoCollection: {
            width: 51,
            height: 51,
            borderRadius: 4,
            borderWidth: 0.4,
            borderColor: appColors.neutral.n300,
        },
        logoCollectionText: {
            width: 51,
            height: 51,
            borderRadius: 4,
            alignSelf: 'center',
            borderWidth: 0.4,
            borderColor: appColors.neutral.n300,
            backgroundColor: appColors.main.tokyoRed,
        },
        logoCollectionTextLabel: {
            fontSize: 15,
            fontWeight: '500',
        },
        verifiedContainer: {
            backgroundColor: appColors.functional.green,
        },
        unVerifiedContainer: {
            backgroundColor: appColors.neutral.n500,
        },
        spamContainer: {
            backgroundColor: theme.colors.label_surface_button_primary,
        },
        pV2: {
            paddingVertical: 5,
        },
        pH6: {
            paddingHorizontal: 10,
            borderRadius: 4,
        },
    });
};
export default useStyle;
