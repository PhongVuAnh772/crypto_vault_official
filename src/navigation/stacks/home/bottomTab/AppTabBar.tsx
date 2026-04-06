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
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
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
        {
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          paddingVertical: 10,
          width: "95%",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 100,
          shadowColor: "#020202",
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: {
            width: 4,
            height: 8,
          },

          // Android Shadow
          elevation: 12,
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
              // appStyles.flexRow,
              appStyles.center,
              { flex: 1 },
              // { position: "relative" },
            ]}
          >
            {bottomTabIcon(route.name, isFocused)}
            {route.name !== LanguageKey.home_tab_explore_title && (
              <AppText
                title={(() => {
                  switch (route.name) {
                    case LanguageKey.home_tab_nft_collection_title:
                      return "NFTs";
                    case LanguageKey.home_tab_transaction_title:
                      return "History";
                    default:
                      return undefined;
                  }
                })()}
                titleWithI18n={(() => {
                  switch (route.name) {
                    case LanguageKey.home_tab_nft_collection_title:
                    case LanguageKey.home_tab_transaction_title:
                      return undefined; // vì đã override title
                    default:
                      return route.name; // dùng i18n
                  }
                })()}
                textColor={'white'}
                variant={TextVariantKeys.labelTiny}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AppTabBar;
