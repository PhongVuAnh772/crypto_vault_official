import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import AppText from "components/AppText";
import { UseAppThemeReturn } from "hooks/useAppThemeHook";
import {
  BottomTabDescriptorMap,
  BottomTabNavigationEventMap,
} from "node_modules/@react-navigation/bottom-tabs/lib/typescript/src/types";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import appStyles from "src/core/styles";
import Utils from "src/utils/commonUtils";
import styles from "./styles";
import { bottomTabIcon } from "./TabIcon";

const AppTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
  theme,
}: {
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  insets: EdgeInsets;
  theme: UseAppThemeReturn;
}) => {
  return (
    <View
      style={[
        styles.bottomTabContainer,
        appStyles.justifyContentAround,
        {
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingBottom: Utils.isAndroid ? 10 : insets.bottom,
          backgroundColor: "white",
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

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
            testID={options?.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              appStyles.flexRow,
              appStyles.center,
              appStyles.pV15,
              { position: "relative" },
            ]}
          >
            {bottomTabIcon(route.name, isFocused)}
            {isFocused ? (
              <View style={appStyles.ml10}>
                <AppText
                  titleWithI18n={route.name}
                  textColor={isFocused ? "#A66DD4" : "rgb(162, 162, 162)"}
                  styles={{
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AppTabBar;
