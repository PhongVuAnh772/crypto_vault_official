import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const borderRadius = 4;
const imageStyle = StyleSheet.create({
    ...appStyles,
    container: {
        flex: 0,
    },
    image: {
        borderRadius: borderRadius,
        backgroundColor: appColors.neutral.white,
    },
    blur: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        height: 32,
        borderRadius: 4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: 'hidden',
        ...appStyles.justifyContentCenter,
        ...appStyles.alignItemsCenter,
    },
    textBlurAndroid: { paddingTop: 2, textAlign: 'center' },
    networkImage: {
        width: 28,
        height: 28,
        top: 8,
        left: 8,
        borderRadius: 100,
    },
    loading: { opacity: 0, position: 'absolute' },
});

export default imageStyle;
