import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
        },
        iconWrapper: {
            marginRight: 15,
        },
        itemInfo: {
            flex: 1,
            justifyContent: 'center',
        },
        itemTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#1C1C1E',
            marginBottom: 2,
        },
        itemSub: {
            fontSize: 12,
            color: '#8E8E93',
            marginBottom: 2,
        },
        itemStatus: {
            fontSize: 12,
            color: '#8E8E93',
        },
        amountInfo: {
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        itemAmount: {
            fontSize: 16,
            fontWeight: '600',
            color: '#1C1C1E',
        },
        shortCurrencyContainer: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: theme.colors.surface_surface__medium,
            borderRadius: 4,
            ...appStyles.center,
        },
    });

export default useStyles;
