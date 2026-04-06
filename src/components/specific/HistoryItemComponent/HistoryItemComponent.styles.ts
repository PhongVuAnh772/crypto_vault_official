import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        transactionHistoryItem: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            backgroundColor: '#fff',
            paddingVertical: 20,
            paddingHorizontal: 15,
            borderRadius: 16,
            marginBottom: 12,
            marginHorizontal: 20, // Add margin from screen edges
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        iconWrapper: {
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: '#F2F2F7',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        bottomItem: {
            // No longer needed for cards
        },
        topItem: {
            // No longer needed for cards
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
        maxHeigh: {
            // ...appStyles.pH15,
        },
        listShadow: {
            // ...appStyles.pB50,
        },
        typeModalContainer: {
            alignItems: 'flex-end',
            paddingTop: 10,
        },
        buttonHeader: {
            width: 32,
        },
        errorColor: {
            backgroundColor: appColors.other.outline_lightest,
        },
    });

export default useStyles;
