import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text } from "react-native";
import { OnboardingScreen } from "src/features/auth";
import CongratulationCreateWallet from "src/features/auth/CongratulationCreateWallet/index.view";
import CreateNewWallet from "src/features/auth/CreateNewWallet/index.view";
import CreatePinCode from "src/features/auth/CreatePinCode/index.view";
import ImportPassphase from "src/features/auth/ImportPassphase/import_passpharse.view";
import RePinCode from "src/features/auth/RePinCode/index.view";
import SplashScreen from "../../../../src/features/auth/SplashScreen/index.view";
import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "../../../../src/navigation/enum/NavigationKey";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const navigation = useNavigation<any>();
  return (
    <Stack.Navigator
      initialRouteName={AuthStackScreenKey.SplashScreen}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={AuthStackScreenKey.SplashScreen}
        component={SplashScreen}
      />
      <Stack.Screen
        name={AuthStackScreenKey.OnboardingScreen}
        component={OnboardingScreen}
      />
      <Stack.Screen
        name={AuthStackScreenKey.CreatePinCode}
        component={CreatePinCode}
        options={{
          animationTypeForReplace: "push",
          animation: "slide_from_right",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Mật mã</Text>
          ),
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.navigate(NavigationStackKey.AuthStack, {
                  screen: AuthStackScreenKey.OnboardingScreen,
                });
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={AuthStackScreenKey.RePinCode}
        component={RePinCode}
        options={{
          animationTypeForReplace: "push",
          animation: "slide_from_right",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Mật mã</Text>
          ),
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.navigate(NavigationStackKey.AuthStack, {
                  screen: AuthStackScreenKey.OnboardingScreen,
                });
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={AuthStackScreenKey.CreateNewWallet}
        component={CreateNewWallet}
        options={{
          animationTypeForReplace: "push",
          animation: "slide_from_right",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Tạo ví mới</Text>
          ),
          headerLeft: () => <></>,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={AuthStackScreenKey.CongratulationCreateWallet}
        component={CongratulationCreateWallet}
        options={{
          animationTypeForReplace: "push",
          animation: "slide_from_right",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              Tạo ví mới thành công
            </Text>
          ),
          headerLeft: () => <></>,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name={AuthStackScreenKey.ImportPassphase}
        component={ImportPassphase}
        options={{
          animationTypeForReplace: "push",
          animation: "slide_from_right",
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => <></>,
          headerRight: () => (
            <Pressable
              onPress={() => {
                navigation.navigate(NavigationStackKey.AuthStack, {
                  screen: AuthStackScreenKey.OnboardingScreen,
                });
              }}
            >
              <AntDesign name="qrcode" size={24} color="black" />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.navigate(NavigationStackKey.AuthStack, {
                  screen: AuthStackScreenKey.OnboardingScreen,
                });
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
