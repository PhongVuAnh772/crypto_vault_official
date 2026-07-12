import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import GlobalUtils from 'src/core/utils/globalUtils';

const parallaxScrollViewStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.other.outline_lightest,
    },
    header: {
        overflow: 'hidden',
    },
    content: {
        flexGrow: 1,
        gap: 16,
        overflow: 'hidden',
        marginTop: -10,
    },
    headerAbsolute: {
        position: 'absolute',
    },
    contentContainerStyle: {
        flexGrow: 1,
    },
    contentInsideHeader: {
        position: 'absolute',
        left: 25,
        right: 25,
    },
});
export default parallaxScrollViewStyle;
