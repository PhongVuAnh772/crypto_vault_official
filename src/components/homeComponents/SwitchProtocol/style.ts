import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

export const containerStyles = (theme: AppThemeType, insets: EdgeInsets) => {
    return StyleSheet.create({
        claimTokenButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '88%',
            marginBottom: insets.bottom,
            zIndex: 10,
            marginTop: 10,
        },
        claimTokenButtonContainer: {
            backgroundColor: appColors.neutral.white,
            width: '100%',
            position: 'absolute',
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cancelActionSwitching: {
            backgroundColor: appColors.neutral.white,
            borderColor: appColors.main.tokyoRed,
            borderWidth: GlobalUtils.getEnableRedXNewTheme() ? 0 : 0.6,
        },
    });
};
