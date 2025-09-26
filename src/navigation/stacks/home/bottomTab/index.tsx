import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomTabDescriptorMap,
  BottomTabNavigationEventMap,
} from "@react-navigation/bottom-tabs/lib/typescript/src/types";
import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import * as React from "react";
import { EdgeInsets } from "react-native-safe-area-context";
import appColors from "src/core/constants/AppColors";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { setHeightBottomTab } from "src/core/redux/slice/app.slice";
import NFTCollectionContainerScreen from "src/features/home/bottomTab/NFTCollection";
import { getDataProjectOnGoing } from "src/features/home/bottomTab/explore/explore.slice";
import SettingScreen from "src/features/home/bottomTab/setting/setting.view";
import HomeView from "src/features/home/home.view";
import TransactionTab from "src/features/transactionTab/transactionTab.view";
import { BottomTabScreenKey } from "src/navigation/enum/NavigationKey";
import { renderHeaderTabbar } from "../headerTabbar/headerTabbar.view";
import AppTabBar from "./AppTabBar";

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const theme = useAppTheme();
  const appInsets: EdgeInsets = useAppSafeAreaInsets();
  const dataProjectLists = useAppSelector(getDataProjectOnGoing);
  const enableBadge =
    dataProjectLists && dataProjectLists?.countOngoingProject > 0;
  const dispatch = useAppDispatch();

  const handleSetHeightBottomTab = (value: number) => {
    dispatch(setHeightBottomTab(value));
  };
  return (
    <Tab.Navigator
      initialRouteName={BottomTabScreenKey.Crypto}
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
          enableBadge,
          setHeightBottomTab(value) {
            handleSetHeightBottomTab(value);
          },
        })
      }
      screenOptions={() => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: appColors.main.tokyoRed,
        tabBarInactiveTintColor: appColors.neutral.n400,
        headerTransparent: true,
        header: ({ options, navigation, route }) =>
          renderHeaderTabbar(options, navigation, route, appInsets),
      })}
    >
      <Tab.Screen
        name={LanguageKey.home_tab_crypto_title}
        component={HomeView}
      />
      <Tab.Screen
        name={LanguageKey.home_tab_nft_collection_title}
        component={NFTCollectionContainerScreen}
      />
      <Tab.Screen
        name={LanguageKey.home_tab_transaction_title}
        component={TransactionTab}
      />
      <Tab.Screen
        name={LanguageKey.home_tab_explore_title}
        component={SettingScreen}
      />
      <Tab.Screen
        name={LanguageKey.home_tab_setting_title}
        component={SettingScreen}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
