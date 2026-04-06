import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        detailsContainer: {
            backgroundColor: theme.colors.surface_surface_high,
        },
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
        },
        statusView: {
            ...appStyles.mt15,
            paddingLeft: 8,
            paddingRight: 6,
            paddingVertical: 4,
            borderRadius: 4,
        },
        titleWithValueContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            padding: 15,
            backgroundColor: appColors.neutral.white,
        },
        line: {
            height: 1,
            backgroundColor: theme.colors.outline_outine,
            marginHorizontal: 15,
        },
        widthHalf: {
            width: '50%',
            justifyContent: 'flex-end',
        },
        button: {
            ...appStyles.pH25,
            ...appStyles.pT10,
            backgroundColor: undefined,
            paddingBottom: insets?.bottom,
        },
        container: {
            ...appStyles.pH15,
            ...appStyles.pB10,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyles;
