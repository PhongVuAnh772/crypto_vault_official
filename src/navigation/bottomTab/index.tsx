import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import useAppTheme from "hooks/useAppThemeHook";
import {
  BottomTabDescriptorMap,
  BottomTabNavigationEventMap,
} from "node_modules/@react-navigation/bottom-tabs/lib/typescript/src/types";
import * as React from "react";
import { EdgeInsets } from "react-native-safe-area-context";
import Home from "src/features/home/home/index.view";
import appColors from "../../../src/core/constants/AppColors";
import { BottomTabBarName } from "../enum/NavigationKey";
import AppTabBar from "./AppTabBar";

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName={BottomTabBarName.Home}
      tabBar={({
        state,
        descriptors,
        navigation,
        insets,
      }: {
        state: TabNavigationState<ParamListBase>;
        descriptors: BottomTabDescriptorMap;
        navigation: NavigationHelpers<
          ParamListBase,
          BottomTabNavigationEventMap
        >;
        insets: EdgeInsets;
      }) =>
        AppTabBar({
          state,
          descriptors,
          navigation,
          insets,
          theme,
        })
      }
      screenOptions={() => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: appColors.main.tokyoRed,
        tabBarInactiveTintColor: appColors.neutral.n400,
        headerTransparent: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name={BottomTabBarName.Home} component={Home} />
      <Tab.Screen name={BottomTabBarName.Trending} component={Home} />
      <Tab.Screen name={BottomTabBarName.Swap} component={Home} />
      <Tab.Screen name={BottomTabBarName.Earn} component={Home} />
      <Tab.Screen name={BottomTabBarName.Discover} component={Home} />
    </Tab.Navigator>
  );
};

export default BottomTab;
