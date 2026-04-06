import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { ScreenWrapper } from 'src/components';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useSplash from './splashScreen.hook';
import styles from './splashScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LogoSVG = ({ size = 200 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
        <Defs>
            {/* Multi-faceted Facet Gradients */}
            <LinearGradient id="gradTop" x1="50%" y1="0%" x2="50%" y2="100%">
                <Stop offset="0%" stopColor="#EA4492" />
                <Stop offset="100%" stopColor="#9C27B0" />
            </LinearGradient>
            <LinearGradient id="gradRight" x1="100%" y1="50%" x2="0%" y2="50%">
                <Stop offset="0%" stopColor="#FBBC05" />
                <Stop offset="100%" stopColor="#F9AB00" />
            </LinearGradient>
            <LinearGradient id="gradBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                <Stop offset="0%" stopColor="#4285F4" />
                <Stop offset="100%" stopColor="#3F51B5" />
            </LinearGradient>
            <LinearGradient id="gradLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                <Stop offset="0%" stopColor="#00BCD4" />
                <Stop offset="100%" stopColor="#009688" />
            </LinearGradient>

            <RadialGradient id="centerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
        </Defs>
        <G>
            {/* Background Atmosphere Glow */}
            <Circle cx="512" cy="512" r="480" fill="url(#centerGlow)" opacity="0.15" />

            {/* Main Diamond Structure - More Facets */}
            {/* Top Pyramid */}
            <Path d="M512 64 L780 400 L512 400 Z" fill="#FF4081" opacity="0.85" />
            <Path d="M512 64 L244 400 L512 400 Z" fill="#E91E63" opacity="1" />

            {/* Bottom Pyramid */}
            <Path d="M512 960 L780 624 L512 624 Z" fill="#3F51B5" opacity="0.9" />
            <Path d="M512 960 L244 624 L512 624 Z" fill="#2196F3" opacity="1" />

            {/* Middle Section (Body) */}
            <Path d="M244 400 L512 400 L512 512 L64 512 Z" fill="#673AB7" />
            <Path d="M780 400 L512 400 L512 512 L960 512 Z" fill="#FFC107" />
            <Path d="M64 512 L512 512 L512 624 L244 624 Z" fill="#3F51B5" />
            <Path d="M960 512 L512 512 L512 624 L780 624 Z" fill="#FBBC05" />

            {/* Inner Glowing Core */}
            <Path d="M512 400 L640 512 L512 624 L384 512 Z" fill="#FFFFFF" opacity="0.3" />

            {/* Highlight Edges */}
            <Path d="M512 64 L512 960" stroke="#FFFFFF" strokeWidth="4" opacity="0.2" />
            <Path d="M64 512 L960 512" stroke="#FFFFFF" strokeWidth="4" opacity="0.2" />
        </G>
    </Svg>
);

const SplashScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { showRequirePinCode, actionAfterPassPinCode, loading } = useSplash({
        navigation,
    });

    const progress = useSharedValue(0);
    const shimmer = useSharedValue(0);

    useEffect(() => {
        // Entrance animation
        progress.value = withDelay(400, withSpring(1, {
            damping: 15,
            stiffness: 80,
        }));

        // Loop shimmer effect
        shimmer.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.linear }),
            -1,
            true
        );
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [0, -100], Extrapolate.CLAMP);
        const scale = interpolate(progress.value, [0, 1], [1.8, 0.85], Extrapolate.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.2, 1], [0, 1, 1], Extrapolate.CLAMP);
        const rotate = interpolate(shimmer.value, [0, 1], [-2, 2], Extrapolate.CLAMP);

        return {
            transform: [
                { translateX },
                { scale },
                { rotate: `${rotate}deg` }
            ],
            opacity,
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [SCREEN_WIDTH, 20], Extrapolate.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
        const skewX = interpolate(progress.value, [0, 0.8, 1], [20, 10, 0], Extrapolate.CLAMP);

        return {
            transform: [{ translateX }, { skewX: `${skewX}deg` }],
            opacity,
        };
    });

    return (
        <>
            <ScreenWrapper
                mainStyle={[styles.container, appStyles.flex1]}
                backgroundColor="#000000">

                <View style={[appStyles.flex1, appStyles.center]}>
                    <View style={localStyles.animationRow}>
                        <Animated.View style={animatedLogoStyle}>
                            <LogoSVG size={220} />
                        </Animated.View>

                        <Animated.View style={[localStyles.textWrapper, animatedTextStyle]}>
                            <Animated.Text style={localStyles.geodeText}>GEODE</Animated.Text>
                            <Animated.Text style={localStyles.tagline}>CRYPTO VAULT</Animated.Text>
                        </Animated.View>
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
    animationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrapper: {
        position: 'absolute',
        alignItems: 'flex-start',
    },
    geodeText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 6,
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 4,
        marginTop: -5,
        marginLeft: 5,
        fontWeight: '600',
    }
});

export default SplashScreen;
