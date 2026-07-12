import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import {mPlus1} from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';

const appTextInput = StyleSheet.create({
    ...appStyles,
    labelName: {
        color: appColors.neutral.n600,
    },
    inputText: {
        backgroundColor: appColors.neutral.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
        marginTop: 4,
        fontFamily: mPlus1.medium,
        fontWeight: '400',
        fontSize: 14,
    },
});

export default appTextInput;
