import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';

export const useStyles = () => {
    return StyleSheet.create({
        tabBarStyle: {
            height: 50,
            marginHorizontal: 25,
            backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
            fontSize: 13,
            textTransform: 'none',
            fontFamily: mPlus1.bold,
            fontWeight: '700',
        },
        tabBarIndicatorStyle: {
            backgroundColor: appColors.main.tokyoRed,
        },
        sceneContainerStyle: {
            backgroundColor: 'transparent',
        },
    });
};
