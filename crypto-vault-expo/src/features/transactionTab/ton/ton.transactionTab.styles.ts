import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

export const useStyles = (theme: AppThemeType, gap = 8) =>
    StyleSheet.create({
        protocolContainer: {
            backgroundColor: theme.colors.label_surface_button_pressed,
            ...appStyles.flexRow,
            ...appStyles.center,
            height: 28,
            borderRadius: 50,
            paddingLeft: 12,
            paddingRight: 8,
        },
        header: {
            paddingVertical: 15,
            paddingHorizontal: 20,
            backgroundColor: 'transparent',
        },
        headerText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#8E8E93',
        },
        typeContainer: {
            ...appStyles.flexRow,
            ...appStyles.center,
            backgroundColor: appColors.neutral.white,
            height: 28,
            borderRadius: 50,
            paddingLeft: 12,
            paddingRight: 8,
        },
        iconArrowDown: {
            ...appStyles.center,
            width: 20,
            height: 20,
        },
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
        maxHeigh: {
            height: '100%',
            borderRadius: 4,
            ...appStyles.mt5,
        },
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
        listContainer: {
            height: '100%',
        },
        titleCryptoDetail: {
            marginVertical: gap / 2,
            color: theme.colors.text_on_surface_text_high,
        },
        shortCryptoDetailContainer: {
            marginVertical: -(gap / 2),
            paddingLeft: 4,
        },
        container: {
            backgroundColor: appColors.neutral.white,
            paddingHorizontal: 12,
            paddingVertical: 18,
            borderRadius: 4,
        },
        icon_color: {
            color: theme.colors.text_on_surface_text_light,
        },
        h30: {
            height: 30,
        },
        documentIcon: {
            color: appColors.neutral.n800,
        },
        documentContainer: {
            backgroundColor: appColors.other.outline_lightest,
            padding: 8,
            borderRadius: 4,
        },
        transactionContainer: {
            borderRadius: 4,
        },
        firstTransactionItemInSection: {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        lastTransactionItemInSection: {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
        transactionEmptyContainer: { width: '100%', height: '100%' },
    });
