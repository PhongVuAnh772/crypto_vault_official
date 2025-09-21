import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType, newUI: boolean, insets?: EdgeInsets) => {
    return StyleSheet.create({
        headerContainer: {
            ...appStyles.flex1,
            ...appStyles.fullWidth,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            backgroundColor: appColors.neutral.white,
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 12,
            borderBottomWidth: 0.6,
            borderBottomColor: theme.colors.outline_outine,
        },
        headerLoadingContainer: {
            ...appStyles.flex1,
            ...appStyles.fullWidth,
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            backgroundColor: appColors.neutral.white,
            paddingBottom: 12,
            paddingLeft: 12,
            borderBottomWidth: 0.6,
            borderBottomColor: theme.colors.outline_outine,
        },
        marketCapHeader: {
            paddingHorizontal: 12,
        },
        tokenItem: {
            paddingTop: 16,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 12,
            backgroundColor: appColors.neutral.white,
        },
        pdH12: {
            paddingHorizontal: 12,
        },
        name: {
            marginHorizontal: 12,
            marginBottom: 2,
        },
        fiat: {
            marginTop: 2,
            marginHorizontal: 12,
        },
        imageToken: {
            width: 24,
            height: 24,
            borderRadius: 24,
        },
        symbol: {
            backgroundColor: appColors.neutral.n200,
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4,
        },
        indexColumn: {
            flex: 3,
        },
        tokenInfoColumn: {
            justifyContent: 'center',
            paddingRight: 8,
        },
        priceColumn: {
            flex: 2.5,
            justifyContent: 'center',
        },
        changeColumn: {
            flex: 1.5,
            justifyContent: 'center',
        },
        ml8: {
            marginLeft: 8,
        },
        ml12: {
            marginLeft: 12,
        },
        mr12: {
            marginRight: 12,
        },
        pr12: {
            paddingRight: 12,
        },
        pr16: {
            paddingRight: 16,
        },
        pr8: {
            paddingRight: 8,
        },
        loadingContainer: {
            ...appStyles.pV15,
            ...appStyles.pH10,
            ...appStyles.flex1,
            backgroundColor: appColors.neutral.white,
        },
        listContentContainer: {
            borderRadius: 8,
            paddingTop: 16,
        },
        ml16: {
            marginLeft: 16,
        },
        indexLoadingColumn: {
            flex: 3.5,
        },
        tokenInfoLoadingColumn: {
            justifyContent: 'center',
            paddingRight: 8,
        },
        priceLoadingColumn: {
            flex: 2,
            justifyContent: 'center',
        },
        changeLoadingColumn: {
            flex: 1.5,
            justifyContent: 'center',
            alignItems: 'flex-end',
        },
        indexHeaderColumn: {
            flex: 3.5,
        },
        priceHeaderColumn: {
            flex: 2.25,
            justifyContent: 'center',
            marginRight: 10,
        },
        changeHeaderColumn: {
            flex: 1.3,
            justifyContent: 'center',
        },
    });
};

export default useStyle;
