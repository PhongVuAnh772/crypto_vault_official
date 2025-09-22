import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n300,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 32,
    elevation: 4,
};
const useStyle = (theme: AppThemeType, insets?: EdgeInsets) =>
    StyleSheet.create({
        itemContainer: {
            borderRadius: 4,
            shadowColor: appColors.neutral.n500,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            backgroundColor: appColors.neutral.white,
        },
        inputAmount: {
            ...box,
            borderRadius: 4,
        },
        inputAmountOutline: {
            borderRadius: 0,
        },
        inputAmountContainer: {
            backgroundColor: appColors.neutral.white,
            flex: 1,
        },
        contentStyleInput: {
            textAlign: 'auto',
            lineHeight: undefined,
        },
        currencyText: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.center,
        },
        lockOverview: {
            borderRadius: 4,
            shadowColor: appColors.neutral.n500,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            backgroundColor: appColors.neutral.white,
            paddingVertical: 10,
            paddingHorizontal: 10,
        },
        boxContainer: {
            flex: 1,
            ...box,
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        separator: {
            width: 12,
        },
        buttonContainer: {
            position: 'relative',
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? insets?.bottom
                : 20,
        },
        boxContainerView: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            ...appStyles.pT15,
            backgroundColor: theme.colors.surface_surface_default,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? 0
                : insets?.bottom,
        },
    });

export default useStyle;
