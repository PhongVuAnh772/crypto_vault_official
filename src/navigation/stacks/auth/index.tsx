import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import HideHeaderStack from "src/components/layout/HideHeaderStack";
import { SplashScreen } from "src/features/auth";
import CongratulationCreateWallet from "src/features/auth/CongratulationCreateWallet/index.view";
import OnboardingScreen from "src/features/auth/onboardingScreen/onboarding.view";
import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";
import CreateNewWalletStack from "./CreateNewWallet";
import PinCodeStack from "./PinCode";
import RestoreWalletStack from "./RestoreWallet";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <HideHeaderStack initialRouteName={AuthStackScreenKey.SplashScreen}>
    <Stack.Screen
      name={AuthStackScreenKey.SplashScreen}
      component={SplashScreen}
    />
    <Stack.Screen
      name={AuthStackScreenKey.OnboardingScreen}
      component={OnboardingScreen}
      options={{
        animation: "fade",
      }}
    />
    <Stack.Screen
      name={NavigationStackKey.CreateWalletStack}
      component={CreateNewWalletStack}
    />
    <Stack.Screen
      name={NavigationStackKey.RestoreWalletStack}
      component={RestoreWalletStack}
    />
    <Stack.Screen
      name={NavigationStackKey.PinCodeStack}
      component={PinCodeStack}
    />
    <Stack.Screen
      name={NavigationStackKey.CongratulationCreateWallet}
      component={CongratulationCreateWallet}
      options={{
        title: "Tạo ví tiền mã hoá",
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#000",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 16,
        },
        headerLeft: () => null,
        headerBackVisible: false,
        headerShadowVisible: false,
      }}
    />
  </HideHeaderStack>
);
export default AuthStack;
