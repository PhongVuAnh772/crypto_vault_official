// import React from 'react';
// import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
// import Animated from 'react-native-reanimated';
// import {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';

// const AddProtocolTabBar: React.FC<MaterialTopTabBarProps> = ({
//     state,
//     descriptors,
//     navigation,
//     position,
// }) => {
//     return (
//         <View style={styles.container}>
//             {state.routes.map((route, index) => {
//                 const {options} = descriptors[route.key];
//                 const label =
//                     options.tabBarLabel !== undefined
//                         ? options.tabBarLabel
//                         : options.title !== undefined
//                           ? options.title
//                           : route.name;

//                 const isFocused = state.index === index;

//                 const onPress = () => {
//                     const event = navigation.emit({
//                         type: 'tabPress',
//                         target: route.key,
//                         canPreventDefault: true,
//                     });

//                     if (!isFocused && !event.defaultPrevented) {
//                         navigation.navigate(route.name);
//                     }
//                 };

//                 const onLongPress = () => {
//                     navigation.emit({
//                         type: 'tabLongPress',
//                         target: route.key,
//                     });
//                 };

//                 const inputRange = state.routes.map((_, i) => i);
//                 const opacity = position.interpolate({
//                     inputRange,
//                     outputRange: inputRange.map(i => (i === index ? 1 : 0)),
//                 });

//                 return (
//                     <TouchableOpacity
//                         key={route.key}
//                         accessibilityRole="button"
//                         accessibilityState={isFocused ? {selected: true} : {}}
//                         accessibilityLabel={options.tabBarAccessibilityLabel}
//                         testID={options.tabBarTestID}
//                         onPress={onPress}
//                         onLongPress={onLongPress}
//                         style={styles.tabButton}>
//                         <Text>hihi</Text>
//                     </TouchableOpacity>
//                 );
//             })}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//     },
//     tabButton: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });

// export {AddProtocolTabBar};
