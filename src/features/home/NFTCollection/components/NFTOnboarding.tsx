import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';

const { width } = Dimensions.get('window');

interface NFTOnboardingProps {
    onStart: () => void;
    visible?: boolean;
}

const NFTOnboarding: React.FC<NFTOnboardingProps> = ({ onStart, visible = true }) => {
    const float1 = useSharedValue(0);
    const float2 = useSharedValue(0);
    const float3 = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            float1.value = withRepeat(
                withSequence(
                    withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            );
            float2.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            );
            float3.value = withRepeat(
                withSequence(
                    withTiming(-12, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            );
        }
    }, [visible, float1, float2, float3]);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [{ translateY: float1.value }, { rotate: '-8deg' }],
    }));
    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [{ translateY: float2.value }, { rotate: '12deg' }, { translateX: -30 }],
    }));
    const animatedStyle3 = useAnimatedStyle(() => ({
        transform: [{ translateY: float3.value }, { rotate: '5deg' }, { translateX: 40 }],
    }));

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            statusBarTranslucent={true}
            presentationStyle="fullScreen"
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                        <AppText
                            title="Find And Collect Your Rare Digital Art"
                            variant={TextVariantKeys.headlineSmall}
                            textColor="#FFFFFF"
                            styles={styles.title}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                        <AppText
                            title="Find and collect your favorite digital collectibles on the TON network. Easy and secure."
                            variant={TextVariantKeys.bodyRMedium}
                            textColor="#E0E0E0"
                            styles={styles.subtitle}
                        />
                    </Animated.View>

                    <View style={styles.imageStack}>
                        <Animated.Image
                            entering={FadeInLeft.delay(600).duration(1000).springify()}
                            source={appImages.nftArt3}
                            style={[styles.nftImage, styles.image3, animatedStyle3]}
                        />
                        <Animated.Image
                            entering={FadeInRight.delay(800).duration(1000).springify()}
                            source={appImages.nftArt2}
                            style={[styles.nftImage, styles.image2, animatedStyle2]}
                        />
                        <Animated.Image
                            entering={FadeInUp.delay(1000).duration(1000).springify()}
                            source={appImages.nftArt1}
                            style={[styles.nftImage, styles.image1, animatedStyle1]}
                        />
                    </View>
                </View>

                <Animated.View style={styles.footer} entering={FadeInUp.delay(1200).duration(800)}>
                    <AppButton
                        title="Start Explore NFT"
                        onPress={onStart}
                        styles={[styles.button, { backgroundColor: '#FFFFFF' }]}
                        textVariant={TextVariantKeys.titleMedium}
                        textColor="#8B5CF6"
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    content: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 16,
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.8,
        marginBottom: 40,
    },
    imageStack: {
        width: width * 0.8,
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    nftImage: {
        width: 220,
        height: 280,
        borderRadius: 24,
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: '#f0f0f0',
    },
    image1: {
        zIndex: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    image2: {
        zIndex: 2,
        opacity: 0.95,
    },
    image3: {
        zIndex: 1,
        opacity: 0.9,
    },
    footer: {
        width: '100%',
        marginBottom: 20,
    },
    button: {
        borderRadius: 30,
        height: 60,
        justifyContent: 'center',
        width: '100%',
    },
});

export default NFTOnboarding;
