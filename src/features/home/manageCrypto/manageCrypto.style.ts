import { Dimensions, StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
const { height } = Dimensions.get('screen');

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        item: {
            ...appStyles.flex1,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.pd15,
            ...appStyles.alignItemsCenter,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline_outine_lightest,
            backgroundColor: theme.colors.surface_surface_high,
        },
        button: {
            marginTop: 16,
            marginBottom: 32,
            backgroundColor: theme.colors.label_surface_button_primary,
            paddingVertical: GlobalUtils.getEnableRedXNewTheme() ? 0 : 13,
        },
        buttonHeader: {
            width: 32,
        },
        input: {
            height: 44,
        },
        image: { width: 28, height: 28, borderRadius: 100 },
        switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
        emptyView: {
            position: 'absolute',
            right: 0,
            left: 0,
            top: height * 0.2,
        },
        container: {
            ...appStyles.flex1,
            backgroundColor: appColors.neutral.n100,
        },
    });

export default useStyles;
