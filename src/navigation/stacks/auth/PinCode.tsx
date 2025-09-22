import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {PinCodeStackParamListType} from 'src/navigation/stacks/type/PinCodeStackParamListType';
import {PinCodeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {CreatePin, ReEnterPin} from 'src/features/auth';
import HideHeaderStack from 'src/components/layout/HideHeaderStack';

const Stack = createNativeStackNavigator<PinCodeStackParamListType>();

const PinCodeStack = () => {
    return (
        <HideHeaderStack initialRouteName={PinCodeStackScreenKey.CreatePin}>
            <Stack.Screen
                name={PinCodeStackScreenKey.CreatePin}
                component={CreatePin}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name={PinCodeStackScreenKey.ReEnterPin}
                component={ReEnterPin}
                options={{
                    animation: 'fade',
                }}
            />
        </HideHeaderStack>
    );
};

export default PinCodeStack;
