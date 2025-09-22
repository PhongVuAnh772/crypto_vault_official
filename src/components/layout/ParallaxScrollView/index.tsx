import React, { type PropsWithChildren, type ReactElement } from 'react';
import {
    ColorValue,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControlProps,
    StyleProp,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import parallaxScrollViewStyle from './styles';

type Props = PropsWithChildren<{
    headerImage: ReactElement;
    headerAbsolute?: ReactElement;
    contentInsideHeader?: ReactElement;
    showIndicator?: boolean;
    contentStyle?: ViewStyle;
    headerHeightImage?: number;
    containerStyle?: StyleProp<ViewStyle>;
    onScroll?:
        | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
        | SharedValue<
              | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
              | undefined
          >;
    customTranslateY?: number[];
    refreshControl?: React.ReactElement<RefreshControlProps>;
}>;

export default function ParallaxScrollView({
    children,
    headerImage,
    headerAbsolute,
    showIndicator = true,
    contentStyle,
    contentInsideHeader,
    headerHeightImage = 250,
    containerStyle,
    onScroll,
    customTranslateY = [-headerHeightImage + 100, 0, headerHeightImage * 0.75],
    refreshControl,
}: Props) {
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const insets = useSafeAreaInsets();
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-headerHeightImage, 0, headerHeightImage],
                        customTranslateY,
                    ),
                },
                {
                    scale: interpolate(
                        scrollOffset.value,
                        [-headerHeightImage, 0, headerHeightImage],
                        [2, 1, 1],
                    ),
                },
            ],
        };
    });
    const headerAbsoluteAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollOffset.value,
            [0, 150],
            ['rgba(255, 0, 0, 0)', appColors.main.tokyoRed],
        ) as ColorValue;

        return {
            backgroundColor,
        };
    });

    return (
        <View style={[parallaxScrollViewStyle.container, containerStyle]}>
            <Animated.ScrollView
                ref={scrollRef}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={showIndicator}
                onScroll={onScroll}
                refreshControl={refreshControl}
                contentContainerStyle={
                    parallaxScrollViewStyle.contentContainerStyle
                }>
                <Animated.View
                    style={[
                        parallaxScrollViewStyle.header,
                        headerAnimatedStyle,
                        { height: headerHeightImage },
                    ]}>
                    {headerImage}
                </Animated.View>
                <View
                    style={[
                        parallaxScrollViewStyle.contentInsideHeader,
                        {
                            top: insets.top + 45,
                        },
                    ]}>
                    {contentInsideHeader}
                </View>
                <View style={[parallaxScrollViewStyle.content, contentStyle]}>
                    {children}
                </View>
            </Animated.ScrollView>
            <Animated.View
                style={[
                    headerAbsoluteAnimatedStyle,
                    {
                        paddingTop: insets.top,
                    },
                    parallaxScrollViewStyle.headerAbsolute,
                ]}>
                {headerAbsolute}
            </Animated.View>
        </View>
    );
}
