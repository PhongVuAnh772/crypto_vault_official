import { RouteProp } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

export type LockProp = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.LockScreen
>;
export type DayItemType = {
    title: string;
    value: number;
    apr: number;
};
export type LoadingPageType = {
    lock: boolean;
    confirmation: boolean;
};
