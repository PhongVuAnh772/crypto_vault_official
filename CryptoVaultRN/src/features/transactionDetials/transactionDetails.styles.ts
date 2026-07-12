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
            ...appStyles.mbt10,
            ...appStyles.mt20,
        },
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
        },
        widthHalf: { width: '50%' },
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
        container: {
            ...appStyles.flex1,
            ...appStyles.pH15,
            backgroundColor: appColors.neutral.n100,
        },
        viewButton: {
            backgroundColor:  undefined,
            paddingTop: 0,
            paddingBottom: 0,
            ...appStyles.pH15,
        },
        loadingContainer: {
            ...appStyles.flex1,
            ...appStyles.pH15,
            backgroundColor: appColors.neutral.n100,
            ...appStyles.alignItemsCenter,
            ...appStyles.pT30,
        },
        contentLoadingContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            width: 327,
            height: 404,
            paddingVertical: 24,
            paddingHorizontal: 16,
            justifyContent: 'space-between',
        },
    });

export default useStyles;
