import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        transactionHistoryItem: {
            ...appStyles.flexRow,
            ...appStyles.pd15,
            ...appStyles.alignItemsCenter,
            backgroundColor: appColors.neutral.white,
            borderColor: appColors.neutral.n300,
            // borderBottomWidth: 0.5,
        },
        bottomItem: {
            borderBottomRightRadius: 4,
            borderBottomLeftRadius: 4,
        },
        topItem: {
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
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
            ...appStyles.pH15,
        },
        listShadow: {
            borderRadius: 4,
            shadowColor: appColors.neutral.n300,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            ...appStyles.pB50,
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
