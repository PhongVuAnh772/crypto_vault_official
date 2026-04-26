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
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import LanguageKey from "src/core/locales/LanguageKey";
import { AppThemeType } from "src/core/type/ThemeType";
import CurvedTabBarBackground from "./CurvedTabBarBackground";
import { bottomTabIcon } from "./TabIcon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import AppText from "src/components/common/AppText";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { rootNavigate } from "src/navigation/stacks/type/RootParamListType";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const BAR_WIDTH = SCREEN_WIDTH * 0.92;
  const BAR_HEIGHT = 70;
  const refModalActions = React.useRef<BottomSheetModal>(null);

  const onOpenActions = () => {
    refModalActions.current?.present();
  };

  const handleActionPress = (screen: string) => {
    refModalActions.current?.dismiss();
    rootNavigate(screen);
  };

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
            if (isMiddleTab) {
              onOpenActions();
              return;
            }
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

      <BottomSheetModalGorhom
        refModal={refModalActions}
        snapPoints={["40%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#1C1C1E' }}
        handleIndicatorStyle={{ backgroundColor: '#3A3A3C' }}
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View style={styles.headerLine} />
            <AppText
              title={"Quick Actions"}
              variant={TextVariantKeys.titleLarge}
              styles={styles.sheetTitle}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.actionItem} 
              onPress={() => handleActionPress(HomeStackScreenKey.Trading)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                <Feather name="trending-up" size={24} color="#A78BFA" />
              </View>
              <View style={styles.actionTextContent}>
                <AppText title={"Trading"} variant={TextVariantKeys.bodyMLarge} styles={{ color: '#FFFFFF', fontWeight: '700' }} />
                <AppText title={"Professional crypto trading interface"} variant={TextVariantKeys.bodyMSmall} styles={{ color: '#8E8E93' }} />
              </View>
              <Feather name="chevron-right" size={20} color="#3A3A3C" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.actionItem} 
              onPress={() => handleActionPress(HomeStackScreenKey.Swap)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Feather name="repeat" size={24} color="#34C759" />
              </View>
              <View style={styles.actionTextContent}>
                <AppText title={"Swap"} variant={TextVariantKeys.bodyMLarge} styles={{ color: '#FFFFFF', fontWeight: '700' }} />
                <AppText title={"Instant token exchange at best rates"} variant={TextVariantKeys.bodyMSmall} styles={{ color: '#8E8E93' }} />
              </View>
              <Feather name="chevron-right" size={20} color="#3A3A3C" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.actionItem} 
              onPress={() => handleActionPress(HomeStackScreenKey.LiveBroadcastScreen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Feather name="video" size={24} color="#EF4444" />
              </View>
              <View style={styles.actionTextContent}>
                <AppText title={"Go Live"} variant={TextVariantKeys.bodyMLarge} styles={{ color: '#FFFFFF', fontWeight: '700' }} />
                <AppText title={"Start a livestream and interact with followers"} variant={TextVariantKeys.bodyMSmall} styles={{ color: '#8E8E93' }} />
              </View>
              <Feather name="chevron-right" size={20} color="#3A3A3C" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.actionItem} 
              onPress={() => handleActionPress(HomeStackScreenKey.Transfer)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Feather name="arrow-up-right" size={24} color="#007AFF" />
              </View>
              <View style={styles.actionTextContent}>
                <AppText title={"Transfer"} variant={TextVariantKeys.bodyMLarge} styles={{ color: '#FFFFFF', fontWeight: '700' }} />
                <AppText title={"Send crypto to any wallet address"} variant={TextVariantKeys.bodyMSmall} styles={{ color: '#8E8E93' }} />
              </View>
              <Feather name="chevron-right" size={20} color="#3A3A3C" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BottomSheetModalGorhom>
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
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLine: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
    marginBottom: 15,
  },
  sheetTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C2E',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContent: {
    flex: 1,
  },
});

export default AppTabBar;
