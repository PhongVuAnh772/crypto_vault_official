import { Feather } from "@expo/vector-icons";
import {
  BottomTabDescriptorMap,
  BottomTabNavigationEventMap,
} from "@react-navigation/bottom-tabs/lib/typescript/src/types";
import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import LanguageKey from "src/core/locales/LanguageKey";
import { AppThemeType } from "src/core/type/ThemeType";
import CurvedTabBarBackground from "./CurvedTabBarBackground";
import { bottomTabIcon } from "./TabIcon";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AppTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
  setHeightBottomTab,
}: {
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  insets: EdgeInsets;
  theme: AppThemeType;
  enableBadge: boolean | null;
  setHeightBottomTab: (value: number) => void;
}) => {
  const BAR_WIDTH = SCREEN_WIDTH * 0.92;
  const BAR_HEIGHT = 70;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: 10,
        },
      ]}
      onLayout={({ nativeEvent: { layout } }) => {
        setHeightBottomTab(layout.height);
      }}
    >
      <CurvedTabBarBackground width={BAR_WIDTH} height={BAR_HEIGHT} backgroundColor="#121212" />

      <View style={[styles.tabsWrapper, { width: BAR_WIDTH, height: BAR_HEIGHT }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isMiddleTab = route.name === LanguageKey.home_tab_explore_title;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (isMiddleTab) {
            return (
              <View key={route.key} style={styles.fabContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onPress}
                  style={styles.fabButton}
                >
                  <Feather name="plus" size={30} color="white" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              {bottomTabIcon(route.name, isFocused)}
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  tabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 15,
    height: 2,
    backgroundColor: '#7C3AED',
    borderRadius: 1,
    marginTop: 4,
    position: 'absolute',
    bottom: 15
  },
  fabContainer: {
    width: 70,
    height: '100%',
    alignItems: 'center',
  },
  fabButton: {
    position: 'absolute',
    top: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default AppTabBar;
