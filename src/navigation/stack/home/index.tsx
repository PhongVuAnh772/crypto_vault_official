import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HideHeaderStack from "components/HideHeaderStack";
import React from "react";
import BottomTab from "../../../navigation/bottomTab";
import { HomeStackScreenKey } from "../../enum/NavigationKey";
import TonSendCoin from "src/features/send/coin/ton";

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <HideHeaderStack initialRouteName={HomeStackScreenKey.BottomTab}>
      <Stack.Screen name={HomeStackScreenKey.BottomTab} component={BottomTab} />
      <Stack.Screen
        name={HomeStackScreenKey.TonSendCoin}
        component={TonSendCoin}
      />
    </HideHeaderStack>
  );
};

export default HomeStack;
