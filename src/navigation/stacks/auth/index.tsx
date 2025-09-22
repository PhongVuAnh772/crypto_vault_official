import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import HideHeaderStack from 'src/components/layout/HideHeaderStack';
import {SplashScreen} from 'src/features/auth';
import OnboardingScreen from 'src/features/auth/onboardingScreen/onboarding.view';
import {
    AuthStackScreenKey,
    NavigationStackKey,
} from 'src/navigation/enum/NavigationKey';
import CreateNewWalletStack from './CreateNewWallet';
import RestoreWalletStack from './RestoreWallet';
import PinCodeStack from './PinCode';

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
                animation: 'fade',
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
    </HideHeaderStack>
);
export default AuthStack;
