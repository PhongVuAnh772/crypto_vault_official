import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import HideHeaderStack from 'src/components/layout/HideHeaderStack';
import AboutRezPointView from 'src/features/rezPoints/about/about.view';
import EmailVerificationView from 'src/features/rezPoints/emailVerification/emailVerification.view';
import EmailVerifiedSuccessfullyView from 'src/features/rezPoints/emailVerifiedSuccessfully/emailVerifiedSuccessfully.view';
import RezPointMainScreen from 'src/features/rezPoints/home/homeRezPoints.view';
import PersonalInformation from 'src/features/rezPoints/personalInformation/personalInformation.view';
import PointHistoryView from 'src/features/rezPoints/pointHistory/pointHistory.view';
import { RezPointStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { RezPointStackParamListType } from './type';

const Stack = createNativeStackNavigator<RezPointStackParamListType>();

const RezPointStack = () => {
    return (
        <HideHeaderStack
            initialRouteName={RezPointStackScreenKey.RezPointMainScreen}>
            <Stack.Screen
                name={RezPointStackScreenKey.RezPointMainScreen}
                component={RezPointMainScreen}
            />
            <Stack.Screen
                name={RezPointStackScreenKey.PersonalInformation}
                component={PersonalInformation}
            />
            <Stack.Screen
                name={RezPointStackScreenKey.PointHistory}
                component={PointHistoryView}
            />
            <Stack.Screen
                name={RezPointStackScreenKey.AboutRezPoint}
                component={AboutRezPointView}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name={RezPointStackScreenKey.EmailVerification}
                component={EmailVerificationView}
            />
            <Stack.Screen
                name={RezPointStackScreenKey.EmailVerifiedSuccessfully}
                component={EmailVerifiedSuccessfullyView}
            />
        </HideHeaderStack>
    );
};
export default RezPointStack;
