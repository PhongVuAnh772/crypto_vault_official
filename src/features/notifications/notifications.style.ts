import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const usingStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surface_surface_default,
            paddingTop: 20,
        },
        filterContainer: {
            ...appStyles.flexRow,
            ...appStyles.pd5,
            ...appStyles.pH15,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
        },
        itemContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.pT15,
            ...appStyles.pB15,
            ...appStyles.flexRow,
            ...appStyles.pL15,
            ...appStyles.pR15,
            borderBottomWidth: 0.5,
            borderColor: theme.colors.outline_outine_lightest,
        },
        shortNameContainer: {
            backgroundColor: theme.colors.surface_surface__medium,
            ...appStyles.pd5,
            borderRadius: 4,
            ...appStyles.ml10,
        },
        notificationTypeView: {
            position: 'absolute',
            ...appStyles.alignItemsStart,
            ...appStyles.fullWidth,
            ...appStyles.pR10,
        },
        itemNotificationTypeContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n300,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            borderWidth: 0.5,
            borderColor: theme.colors.outline_outine_lightest,
            ...appStyles.flexRow,
            width: 160,
            height: 56,
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
        },
        itemNotificationContainer: {
            borderBottomWidth: 0.6,
            borderColor: theme.colors.outline_outine,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            padding: 16,
            height: 94,
        },
        renderItemNotification: {
            flex: 1,
        },
        notificationIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: appColors.neutral.n100,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            borderWidth: 0.6,
            borderColor: theme.colors.outline_outine_lightest,
        },
        content: {paddingRight: 20},
        unread: {
            width: 8,
            height: 8,
            backgroundColor: appColors.main.tokyoRed,
            borderRadius: 4,
        },
        emptyContainer: {
            alignItems: 'center',
            paddingTop: 55,
        },
        emptyTitle: {
            paddingVertical: 12,
        },

        deleteBox: {
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: 94,
        },
        deleteText: {
            fontWeight: '600',
            paddingTop: 4,
        },
        loadMoreContainer: {
            paddingVertical: 12,
        },
        fillter: {
            ...appStyles.pV15,
            ...appStyles.pH25,
            zIndex: 2,
        },
    });
};

export default usingStyles;
