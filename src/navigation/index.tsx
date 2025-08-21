import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HideHeaderStack from "components/HideHeaderStack";
import * as React from "react";
import { Platform } from "react-native";
import { NavigationStackKey } from "./enum/NavigationKey";
import AuthStack from "./stack/auth";
import HomeStack from "./stack/home";
import { navigationRef } from "./stack/type/RootParamListType";
const Stack = createNativeStackNavigator();

const linking = Platform.select({
  ios: {
    prefixes: [],
    config: {
      screens: {
        Home: NavigationStackKey.HomeStack,
      },
    },
  },
  android: {
    prefixes: [],
    config: {
      screens: {
        Home: NavigationStackKey.HomeStack,
      },
    },
  },
});

const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <HideHeaderStack initialRouteName={NavigationStackKey.AuthStack}>
        <Stack.Screen
          name={NavigationStackKey.AuthStack}
          component={AuthStack}
        />
        <Stack.Screen
          name={NavigationStackKey.HomeStack}
          component={HomeStack}
          options={{
            animation: "fade",
            gestureEnabled: false,
          }}
        />
      </HideHeaderStack>
    </NavigationContainer>
  );
};

export default AppNavigator;
