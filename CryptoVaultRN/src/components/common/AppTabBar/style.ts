import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import GlobalUtils from 'src/core/utils/globalUtils';

export const useStyles = () => {
    return StyleSheet.create({
        sceneContainerStyle: {
            backgroundColor: 'transparent',
        },
        tabBarIndicatorContainerStyle: {
            position: 'absolute',
            bottom: 0,
            height: 1,
            width: '100%',
            backgroundColor: undefined,
        },
        newThemeOpacity: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: appColors.neutral.white,
            opacity: 0.24,
        },
        indicatorStyle: {
            position: 'absolute',
            bottom: 0,
            height: 2,
            backgroundColor: appColors.main.tokyoRed,
        },
        tabBarContainer: {
            paddingHorizontal: 24,
            paddingTop: 5,
            paddingBottom: 17,
            backgroundColor: 'transparent',
        },
    });
};
