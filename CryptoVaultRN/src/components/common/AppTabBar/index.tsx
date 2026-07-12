import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import React from "react";
import { ImageBackground, StyleProp, View, ViewStyle } from "react-native";
import ScreenWrapper from "src/components/layout/ScreenWrapper";
import ScreenWrapperProps from "src/components/layout/ScreenWrapper/type";
import { appImages } from "src/core/constants/AppImages";
import appStyles from "src/core/styles";
import { useStyles } from "./style";
import { TopTab } from "./tabBar.component";

type ScreenComponentType<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList,
> =
  | React.ComponentType<{
      route: RouteProp<ParamList, RouteName>;
      navigation: any;
    }>
  | React.ComponentType<{}>;
type ScreenData<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList,
> = {
  screen: ScreenComponentType<ParamList, RouteName>;
  title: string;
};
type TabBarProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList,
> = {
  screensData: ScreenData<ParamList, RouteName>[] | null;
  containerStyles?: StyleProp<ViewStyle>;
  screenWrapperProps?: Omit<ScreenWrapperProps, "children" | "theme">;
  onTabChanged?: (index: number) => void;
  tabBarBackground?: string;
  indicatorColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  showThemeOpacity?: boolean;
};

const Tab = createMaterialTopTabNavigator();

const AppTabBar: React.FC<TabBarProps<ParamListBase, string>> = ({
  screensData,
  containerStyles,
  screenWrapperProps,
  onTabChanged,
  tabBarBackground,
  indicatorColor,
  activeTextColor,
  inactiveTextColor,
  showThemeOpacity,
}) => {
  const styles = useStyles();

  if (screensData === null) {
    return screensData;
  }

  const bgImage = screenWrapperProps?.backgroundImage !== undefined ? screenWrapperProps.backgroundImage : appImages.background1;

  return (
    <ScreenWrapper
      paddingTop
      paddingBottom
      backgroundImage={bgImage}
      backgroundColor={screenWrapperProps?.backgroundColor}
      subStyle={[appStyles.flex1, containerStyles]}
      headerTextColor={screenWrapperProps?.headerTextColor ?? "#FFFFFF"}
      backButtonColor={undefined}
      {...screenWrapperProps}
    >
      <View style={[appStyles.flex1]}>
        {bgImage ? (
          <ImageBackground source={bgImage} style={appStyles.flex1}>
            <Tab.Navigator
              sceneContainerStyle={styles.sceneContainerStyle}
              screenListeners={{
                state: ({ data: { state } }) => {
                  if (onTabChanged) {
                    onTabChanged(state.index);
                  }
                },
              }}
              tabBar={(props) => (
                <TopTab
                  {...props}
                  tabBarBackground={tabBarBackground}
                  indicatorColor={indicatorColor}
                  activeTextColor={activeTextColor}
                  inactiveTextColor={inactiveTextColor}
                  showThemeOpacity={showThemeOpacity}
                />
              )}
            >
              {screensData.map((item, index) => {
                return (
                  <Tab.Screen
                    key={`${item.title}_${index}`}
                    component={item.screen}
                    name={item.title}
                  />
                );
              })}
            </Tab.Navigator>
          </ImageBackground>
        ) : (
          <View style={appStyles.flex1}>
            <Tab.Navigator
              sceneContainerStyle={styles.sceneContainerStyle}
              screenListeners={{
                state: ({ data: { state } }) => {
                  if (onTabChanged) {
                    onTabChanged(state.index);
                  }
                },
              }}
              tabBar={(props) => (
                <TopTab
                  {...props}
                  tabBarBackground={tabBarBackground}
                  indicatorColor={indicatorColor}
                  activeTextColor={activeTextColor}
                  inactiveTextColor={inactiveTextColor}
                  showThemeOpacity={showThemeOpacity}
                />
              )}
            >
              {screensData.map((item, index) => {
                return (
                  <Tab.Screen
                    key={`${item.title}_${index}`}
                    component={item.screen}
                    name={item.title}
                  />
                );
              })}
            </Tab.Navigator>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default AppTabBar;
