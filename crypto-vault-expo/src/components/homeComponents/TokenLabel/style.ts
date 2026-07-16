import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
};
const sendComponentStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        tokenLabelContainer: {
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            ...appStyles.flexRow,
            paddingHorizontal: 12,
            paddingVertical: 16,
            ...box,
        },
        imageToken: {width: 32, height: 32, borderRadius: 100},
    });
export default sendComponentStyle;
