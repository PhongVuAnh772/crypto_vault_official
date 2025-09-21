import {
    MaterialTopTabDescriptorMap,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import {
    NavigationHelpers,
    ParamListBase,
    TabNavigationState,
} from '@react-navigation/native';
import React from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity,
    View,
} from 'react-native';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import AppText from '../AppText';
import { useStyles } from './style';

export const TopTab = ({
    state,
    descriptors,
    navigation,
    position,
}: {
    state: TabNavigationState<ParamListBase>;
    descriptors: MaterialTopTabDescriptorMap;
    navigation: NavigationHelpers<
        ParamListBase,
        MaterialTopTabNavigationEventMap
    >;
    position: Animated.AnimatedInterpolation<number>;
}) => {
    const styles = useStyles();
    const theme = useAppTheme();
    const { width } = Dimensions.get('window');
    const tabWidth = width / state.routes.length - 24;
    const translateX = position.interpolate({
        inputRange: state.routes.map((_: any, i: number) => i),
        outputRange: state.routes.map((_: any, i: number) => i * tabWidth),
    });
    const getLabel = (
        options: MaterialTopTabNavigationOptions,
        name: string,
    ) => {
        if (options.tabBarLabel !== undefined) {
            return options.tabBarLabel;
        }
        return options.title ?? name;
    };
    return (
        <View style={styles.tabBarContainer}>
            <View style={[styles.newThemeOpacity]} />
            <View style={[appStyles.flexRow]}>
                <View style={styles.tabBarIndicatorContainerStyle} />
                <Animated.View
                    style={[
                        styles.indicatorStyle,
                        {
                            width: tabWidth,
                            transform: [{ translateX }],
                        },
                    ]}
                />
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label = getLabel(options, route.name) as string;
                    const isFocused = state.index === index;
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole={
                                Platform.OS === 'web' ? 'link' : 'button'
                            }
                            accessibilityState={
                                isFocused ? { selected: true } : {}
                            }
                            accessibilityLabel={
                                options.tabBarAccessibilityLabel
                            }
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[
                                appStyles.flex1,
                                appStyles.pV10,
                                appStyles.center,
                            ]}>
                            <AppText
                                title={label}
                                variant={
                                    isFocused
                                        ? TextVariantKeys.titleSmall
                                        : TextVariantKeys.bodyMMedium
                                }
                                textColor={
                                    isFocused
                                        ? theme.colors.text_on_surface_text_high
                                        : theme.colors
                                              .text_on_surface_text_light
                                }
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
