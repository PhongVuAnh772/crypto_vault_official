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
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: '#111222',
            borderColor: '#323560',
            borderWidth: 1.5,
            borderRadius: 12,
        },
        imageToken: { width: 36, height: 36, borderRadius: 18 },
    });
export default sendComponentStyle;
