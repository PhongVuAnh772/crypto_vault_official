import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View, Image } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring
} from 'react-native-reanimated';
import { ScreenWrapper } from 'src/components';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useSplash from './splashScreen.hook';
import styles from './splashScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { showRequirePinCode, actionAfterPassPinCode, loading } = useSplash({
        navigation,
    });

    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    const spinValue = useSharedValue(0);

    useEffect(() => {
        // Entrance animation for the logo
        logoScale.value = withSpring(1, {
            damping: 12,
            stiffness: 90,
        });
        logoOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        });

        // Continuous spin animation for the loader
        spinValue.value = withRepeat(
            withTiming(360, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: logoScale.value }],
            opacity: logoOpacity.value,
        };
    });

    const animatedSpinnerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spinValue.value}deg` }],
        };
    });

    return (
        <>
            <ScreenWrapper
                mainStyle={[styles.container, appStyles.flex1]}
                backgroundColor="#08090C">

                <View style={[appStyles.flex1, appStyles.center, localStyles.mainContent]}>
                    {/* Native Wallet Logo Image */}
                    <Animated.View style={[localStyles.logoContainer, animatedLogoStyle]}>
                        <Image
                            source={require('assets/main_logo.png')}
                            style={localStyles.logoImage}
                        />
                    </Animated.View>

                    {/* App Title & Subtitle */}
                    <View style={localStyles.textContainer}>
                        <Animated.Text style={localStyles.titleText}>Web3 <Animated.Text style={localStyles.titleAccent}>Wallet</Animated.Text></Animated.Text>
                        <Animated.Text style={localStyles.subtitleText}>Secure . Simple . Decentralized</Animated.Text>
                    </View>

                    {/* Rotating Circular Spinner */}
                    <View style={localStyles.loaderContainer}>
                        <Animated.View style={[localStyles.spinnerRing, animatedSpinnerStyle]}>
                            <View style={localStyles.spinnerDot} />
                        </Animated.View>
                        <Animated.Text style={localStyles.loaderText}>Đang khởi động...</Animated.Text>
                    </View>
                </View>

            </ScreenWrapper>
            <RequirePinCodeLayout
                visible={showRequirePinCode}
                continueActionAfterPassPinCode={actionAfterPassPinCode}
            />
            <LoadingScreen visible={loading} />
        </>
    );
};

const localStyles = StyleSheet.create({
    mainContent: {
        justifyContent: 'space-between',
        paddingVertical: 80,
    },
    logoContainer: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 320,
        height: 320,
        resizeMode: 'contain',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: -20,
    },
    titleText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
    titleAccent: {
        color: '#8F9CFE',
    },
    subtitleText: {
        fontSize: 14,
        color: '#6C7A8A',
        marginTop: 10,
        letterSpacing: 0.5,
    },
    loaderContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    spinnerRing: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: 'rgba(143, 156, 254, 0.15)',
        borderTopColor: '#8F9CFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#8F9CFE',
        position: 'absolute',
        top: 0,
    },
    loaderText: {
        fontSize: 12,
        color: '#6C7A8A',
        marginTop: 15,
        letterSpacing: 0.8,
    },
});

export default SplashScreen;
