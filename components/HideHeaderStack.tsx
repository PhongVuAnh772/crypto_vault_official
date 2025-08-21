import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { ReactNode } from "react";

type HideHeaderStackType = {
  children: ReactNode;
  initialRouteName?: string | undefined;
};

const Stack = createNativeStackNavigator();

const HideHeaderStack: React.FC<HideHeaderStackType> = ({
  children,
  initialRouteName,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "none" }}
      initialRouteName={initialRouteName}
    >
      {children}
    </Stack.Navigator>
  );
};

export default HideHeaderStack;
