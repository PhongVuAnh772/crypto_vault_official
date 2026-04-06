import React from 'react';
import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
    ClockFocusSvgIcon,
    ClockUnFocusSvgIcon,
    ExploreFocusSvgIcon,
    ExploreUnFocusSvgIcon,
    HomeFocusSvgIcon,
    HomeUnFocusSvgIcon,
    NftFocusSvgIcon,
    NftUnFocusSvgIcon,
    SettingFocusSvgIcon,
    SettingUnFocusSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import LanguageKey from 'src/core/locales/LanguageKey';
import { BottomTabScreenKey } from 'src/navigation/enum/NavigationKey';


const HomeIcon = ({focused}: {focused: boolean}) => {
    return focused ? (
      <HomeFocusSvgIcon color={"white"} />
    ) : (
      <HomeUnFocusSvgIcon color={"white"} />
    );
};
const NftIcon = ({focused}: {focused: boolean}) => {
    return focused ? (
      <NftFocusSvgIcon color={"white"} />
    ) : (
      <NftUnFocusSvgIcon color={"white"} />
    );
};
const TransactionIcon = ({focused}: {focused: boolean}) => {
    return focused ? (
      <ClockFocusSvgIcon color={"white"} />
    ) : (
      <ClockUnFocusSvgIcon color={"white"} />
    );
};
const ExploreIcon = ({focused}: {focused: boolean}) => {
    return focused ? (
      <ExploreFocusSvgIcon color={"white"} />
    ) : (
      <ExploreUnFocusSvgIcon />
    );
};
const SettingIcon = ({focused}: {focused: boolean}) => {
    return focused ? (
      <SettingFocusSvgIcon color={"white"} />
    ) : (
      <SettingUnFocusSvgIcon color={"white"} />
    );
};

export const bottomTabIcon = (
    routeName: BottomTabScreenKey,
    focused: boolean,
) => {
    switch (routeName) {
        case LanguageKey.home_tab_crypto_title:
            return <HomeIcon focused={focused} />;
        case LanguageKey.home_tab_nft_collection_title:
            return <NftIcon focused={focused} />;
        case LanguageKey.home_tab_transaction_title:
            return <TransactionIcon focused={focused} />;
        case LanguageKey.home_tab_explore_title:
            return (
              <View
                style={{
                  height: 60,
                  width: 60,
                  marginBottom: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 9999,
                  backgroundColor: "#FF4D4D",
                  position: "absolute",
                  shadowColor: "#000",
                  bottom: -5,
                }}
              >
                <LinearGradient
                  colors={["#D724FF", "#5B62FD"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }} // tương tự ~119 độ
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: 9999,
                  }}
                />
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={20}
                  color="white"
                />
              </View>
            );
        case LanguageKey.home_tab_setting_title:
            return <SettingIcon focused={focused} />;
    }
};
