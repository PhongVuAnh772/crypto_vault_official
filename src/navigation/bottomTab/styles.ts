import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
    bottomTabContainer: {
        ...appStyles.flexRow,
        ...appStyles.pH15,
    },
    badgeContainer: {
        width: 5,
        height: 5,
        backgroundColor: appColors.main.tokyoRed,
        borderRadius: 10,
        position: 'absolute',
        top: 10,
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default styles;
