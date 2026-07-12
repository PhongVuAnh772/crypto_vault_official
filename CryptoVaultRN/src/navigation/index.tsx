import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Platform } from 'react-native';
import HideHeaderStack from 'src/components/layout/HideHeaderStack';
import EnvConfig from 'src/core/constants/EnvConfig';
import commonUtils from 'src/core/utils/commonUtils';
import { NavigationStackKey } from './enum/NavigationKey';
import AuthStack from './stacks/auth';
import HomeStack from './stacks/home';
import { navigationRef } from './stacks/type/RootParamListType';
const Stack = createNativeStackNavigator();

const dataIos = commonUtils.separateCallBack(EnvConfig.AUTH0_CALLBACK_URL_IOS);
const dataAndroid = commonUtils.separateCallBack(
    EnvConfig.AUTH0_CALLBACK_URL_ANDROID,
);

const linking = Platform.select({
    ios: {
        prefixes: [dataIos.scheme, dataIos.host],
        config: {
            screens: {
                Home: NavigationStackKey.HomeStack,
            },
        },
    },
    android: {
        prefixes: [dataAndroid.scheme, dataAndroid.host],
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
                <HideHeaderStack
                    initialRouteName={NavigationStackKey.AuthStack}>
                    <Stack.Screen
                        name={NavigationStackKey.AuthStack}
                        component={AuthStack}
                    />
                    <Stack.Screen
                        name={NavigationStackKey.HomeStack}
                        component={HomeStack}
                        options={{
                            animation: 'fade',
                            gestureEnabled: false,
                        }}
                    />
                </HideHeaderStack>
        </NavigationContainer>
    );
};

export default AppNavigator;
