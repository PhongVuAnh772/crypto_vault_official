import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import GlobalUtils from 'src/core/utils/globalUtils';

const style = StyleSheet.create({
    labelTitleTokenInfo: {
        backgroundColor: appColors.other.label,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 50,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: appColors.neutral.white,
        borderTopWidth: 1,
        borderTopColor: appColors.other.outline_lightest,
        borderBottomLeftRadius:  0,
        borderBottomRightRadius: 0,
    },
    containerToken: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
    radius50: {
        borderRadius: 50,
    },
    separator: {
        width: 40,
    },
});

export default style;
