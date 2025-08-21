import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { BottomTabBarName } from "../enum/NavigationKey";

export const bottomTabIcon = (routeName: string, focused: boolean) => {
  const color = focused ? "#A66DD4" : "rgb(162, 162, 162)"; // Active: xanh dương, Inactive: xám
  const size = 24;

  switch (routeName) {
    case BottomTabBarName.Home:
      return <Ionicons name="home" size={size} color={color} />;
    case BottomTabBarName.Trending:
      return <Feather name="trending-up" size={size} color={color} />;
    case BottomTabBarName.Swap:
      return <MaterialIcons name="swap-horiz" size={size} color={color} />;
    case BottomTabBarName.Earn:
      return <MaterialIcons name="stars" size={size} color={color} />;
    case BottomTabBarName.Discover:
      return <Ionicons name="compass" size={size} color={color} />;
    default:
      return null;
  }
};
