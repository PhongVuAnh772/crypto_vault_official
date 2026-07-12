import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';

const { width } = Dimensions.get('window');

interface NFTOnboardingProps {
    onStart: () => void;
    visible?: boolean;
}

type SlideItem = {
    id: string;
    title: string;
    subtitle: string;
    image: any;
};

const NFTOnboarding: React.FC<NFTOnboardingProps> = ({ onStart, visible = true }) => {
    const listRef = useRef<FlatList<SlideItem>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = useMemo<SlideItem[]>(
        () => [
            {
                id: 'discover',
                title: 'Discover NFT Collections',
                subtitle: 'Explore trending collections across your connected networks in one place.',
                image: appImages.nftArt1,
            },
            {
                id: 'manage',
                title: 'Manage Your Assets',
                subtitle: 'View owned NFTs, check details, and keep your portfolio organized.',
                image: appImages.nftArt2,
            },
            {
                id: 'trade',
                title: 'Trade With Confidence',
                subtitle: 'List or transfer NFTs with clear ownership and verified collection metadata.',
                image: appImages.nftArt3,
            },
        ],
        [],
    );

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
            return;
        }
        onStart();
    };

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
                    <FlatList
                        ref={listRef}
                        data={slides}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        onMomentumScrollEnd={handleScrollEnd}
                        renderItem={({ item }) => (
                            <View style={styles.slide}>
                                <Image source={item.image} style={styles.nftImage} />
                                <AppText
                                    title={item.title}
                                    variant={TextVariantKeys.headlineSmall}
                                    textColor="#FFFFFF"
                                    styles={styles.title}
                                />
                                <AppText
                                    title={item.subtitle}
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor="#D8DFE0"
                                    styles={styles.subtitle}
                                />
                            </View>
                        )}
                    />

                    <View style={styles.dots}>
                        {slides.map((slide, index) => (
                            <View
                                key={slide.id}
                                style={[
                                    styles.dot,
                                    index === currentIndex ? styles.dotActive : undefined,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <Animated.View style={styles.footer} entering={FadeInUp.delay(150).duration(300)}>
                    <AppButton
                        title={currentIndex === slides.length - 1 ? 'Start Explore NFT' : 'Next'}
                        onPress={handleNext}
                        styles={[styles.button, { backgroundColor: '#9FE870' }]}
                        textVariant={TextVariantKeys.titleMedium}
                        textColor="#03251D"
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#03251D',
        justifyContent: 'space-between',
        paddingBottom: 40,
        paddingTop: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slide: {
        width,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.9,
        paddingHorizontal: 10,
    },
    nftImage: {
        width: width * 0.72,
        height: width * 0.9,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    dotActive: {
        width: 18,
        backgroundColor: '#9FE870',
    },
    footer: {
        width: '100%',
        paddingHorizontal: 24,
    },
    button: {
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        width: '100%',
    },
});

export default NFTOnboarding;
