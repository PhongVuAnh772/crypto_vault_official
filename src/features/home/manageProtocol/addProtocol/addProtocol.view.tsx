import React from 'react';
import useAddProtocol from './addProtocol.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {ScreenWrapper} from 'src/components';
import addProtocolStyle from './addProtocol.style';
import LanguageKey from 'src/core/locales/LanguageKey';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {View} from 'react-native';

const Tab = createMaterialTopTabNavigator();

enum TabScreen {
    Suggested = 'Suggested',
    CustomProtocol = 'Custom protocol',
}
const AddProtocol: React.FC<RootNavigationType> = ({navigation}) => {
    const {theme} = useAddProtocol();
    const style = addProtocolStyle(theme);
    return (
        <ScreenWrapper
            paddingTop
            enableHeader
            paddingBottom
            headerTitleWithI18n={LanguageKey.common_protocol}
            backgroundColor={theme.colors.surface_surface_default}>
            <Tab.Navigator
                screenOptions={{
                    tabBarLabelStyle: style.tabBarLabelStyle,
                    tabBarStyle: style.tabBarStyle,
                    tabBarIndicatorStyle: style.tabBarIndicatorStyle,
                    tabBarInactiveTintColor:
                        theme.colors.text_on_surface_text_light,
                }}>
                <Tab.Screen name={TabScreen.Suggested} component={Suggested} />
                <Tab.Screen
                    name={TabScreen.CustomProtocol}
                    component={CustomProtocol}
                />
            </Tab.Navigator>
        </ScreenWrapper>
    );
};
const Suggested: React.FC<RootNavigationType> = ({navigation}) => {
    const {theme} = useAddProtocol();
    const style = addProtocolStyle(theme);
    return <View style={style.container}></View>;
};
const CustomProtocol: React.FC<RootNavigationType> = ({navigation}) => {
    const {theme} = useAddProtocol();
    const style = addProtocolStyle(theme);

    return <View style={style.container}></View>;
};
export default AddProtocol;
