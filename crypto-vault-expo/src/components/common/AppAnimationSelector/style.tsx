import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const appAnimationSelect = () =>
    StyleSheet.create({
        content: {
            paddingHorizontal: 12,
            backgroundColor: appColors.neutral.white,
        },
        absolute: {
            position: 'absolute',
            right: 0,
            left: 0,
        },
        container: {
            shadowColor: appColors.neutral.n600,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        overflowHidden: {
            overflow: 'hidden',
        },
    });
export default appAnimationSelect;
