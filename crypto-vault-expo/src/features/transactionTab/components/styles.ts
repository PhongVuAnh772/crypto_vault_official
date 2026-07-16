import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
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
        icon_color: {
            color: theme.colors.text_on_surface_text_light,
        },
        transactionEmptyContainer: {width: '100%', height: '100%'},
        transactionHistoryItem: {
            ...appStyles.flexRow,
            ...appStyles.pd15,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_high,
            borderBottomWidth: 0.5,
            borderBottomColor: appColors.neutral.n200,
        },
        transactionHistoryTopItemBorder: {
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
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
        errorColor: {
            backgroundColor: appColors.other.outline_lightest,
        },
    });
export default useStyles;
