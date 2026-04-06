import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
};
const useStyle = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
        image: {
            width: 100,
            aspectRatio: 1,
        },
        walletBox: {
            ...appStyles.flexRow,
            ...box,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            padding: 16,
        },
        imageNetwork: {
            height: 20,
            width: 20,
        },
        nftId: {
            marginTop: 3,
            marginBottom: 8,
        },
        borderBox: {
            backgroundColor: appColors.neutral.n200,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 100,
        },
        container: {
            ...appStyles.pT15,
            ...appStyles.flex1,
            backgroundColor: appColors.neutral.n100,
        },
        viewButton: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            backgroundColor: undefined,
            paddingBottom:0,
        },
        buttonConfirm: {
            ...appStyles.pH25,
            ...appStyles.pT10,
            backgroundColor: undefined,
            paddingBottom:0,
        },
    });

export default useStyle;
