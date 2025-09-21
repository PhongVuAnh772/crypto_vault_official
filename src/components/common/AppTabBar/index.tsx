import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import React from 'react';
import { ImageBackground, StyleProp, View, ViewStyle } from 'react-native';
import ScreenWrapper from 'src/components/layout/ScreenWrapper';
import ScreenWrapperProps from 'src/components/layout/ScreenWrapper/type';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import { useStyles } from './style';
import { TopTab } from './tabBar.component';

type ScreenComponentType<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList,
> =
    | React.ComponentType<{
          route: RouteProp<ParamList, RouteName>;
          navigation: any;
      }>
    | React.ComponentType<{}>;
type ScreenData<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList,
> = {
    screen: ScreenComponentType<ParamList, RouteName>;
    title: string;
};
type TabBarProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList,
> = {
    screensData: ScreenData<ParamList, RouteName>[] | null;
    containerStyles?: StyleProp<ViewStyle>;
    screenWrapperProps?: Omit<ScreenWrapperProps, 'children' | 'theme'>;
    onTabChanged?: (index: number) => void;
};

const Tab = createMaterialTopTabNavigator();

const AppTabBar: React.FC<TabBarProps<ParamListBase, string>> = ({
    screensData,
    containerStyles,
    screenWrapperProps,
    onTabChanged,
}) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const styles = useStyles();

    if (screensData === null) {
        return screensData;
    }
    return (
        <ScreenWrapper
            paddingTop
            backgroundImage={newUI ? undefined : appImages.background1}
            backgroundColor={newUI ? appColors.main.tokyoRed : undefined}
            subStyle={[appStyles.flex1, containerStyles]}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            {...screenWrapperProps}>
            <View style={[appStyles.flex1]}>
                <ImageBackground
                    source={
                        newUI ? appImages.newBackground1 : appImages.background1
                    }
                    style={appStyles.flex1}>
                    <Tab.Navigator
                        sceneContainerStyle={styles.sceneContainerStyle}
                        screenListeners={{
                            state: ({ data: { state } }) => {
                                if (onTabChanged) {
                                    onTabChanged(state.index);
                                }
                            },
                        }}
                        tabBar={TopTab}>
                        {screensData.map((item, index) => {
                            return (
                                <Tab.Screen
                                    key={`${item.title}_${index}`}
                                    component={item.screen}
                                    name={item.title}
                                />
                            );
                        })}
                    </Tab.Navigator>
                </ImageBackground>
            </View>
        </ScreenWrapper>
    );
};

export default AppTabBar;
