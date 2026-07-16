import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { appAnimations } from 'src/core/constants/AppAnimations';
import appStyles from 'src/core/styles';
import appLogoLoadingAnimationStyle from './style';

type AppLogoLoadingAnimationType = {
    isLoading?: boolean;
};

const AppLogoLoadingAnimation: React.FC<AppLogoLoadingAnimationType> = ({
    isLoading,
}) => {
    return isLoading ? (
        <View
            style={[
                StyleSheet.absoluteFillObject,
                appStyles.center,
                appLogoLoadingAnimationStyle.container,
            ]}>
            <LottieView
                source={appAnimations.logoLoading}
                style={appLogoLoadingAnimationStyle.icon}
                autoPlay
                loop
            />
        </View>
    ) : null;
};

export default AppLogoLoadingAnimation;
