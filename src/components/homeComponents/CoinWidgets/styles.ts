import appColors from 'src/core/constants/AppColors';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: appColors.neutral.white,
        paddingHorizontal: 15,
        paddingVertical: 18,
        borderRadius: 4,
    },
    loading: {
        alignItems: 'flex-start',
        paddingLeft: 12,
    },
});

export default styles;
