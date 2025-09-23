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
import { TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import styles from "./styles";
import { bottomTabIcon } from "./TabIcon";

const AppTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
  theme,
  enableBadge,
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
  return (
    <View
      style={[
        styles.bottomTabContainer,
        appStyles.justifyContentAround,
        {
          paddingBottom: Utils.isAndroid ? 10 : insets.bottom,
          backgroundColor: theme.colors.surface_surface_nav,
        },
      ]}
      onLayout={({ nativeEvent: { layout } }) => {
        setHeightBottomTab(layout.height);
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isExploreTab = route.name === LanguageKey.home_tab_explore_title;
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

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              appStyles.flexRow,
              appStyles.center,
              appStyles.pV15,
              !isFocused && appStyles.flex1,
              { position: "relative" },
            ]}
          >
            {bottomTabIcon(route.name, isFocused)}
            {isFocused ? (
              <View style={appStyles.ml10}>
                <AppText
                  titleWithI18n={route.name}
                  textColor={appColors.main.tokyoRed}
                  variant={TextVariantKeys.labelSmall}
                />
              </View>
            ) : null}
            {enableBadge && isExploreTab && isFocused ? (
              <View style={styles.badgeContainer}></View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AppTabBar;
