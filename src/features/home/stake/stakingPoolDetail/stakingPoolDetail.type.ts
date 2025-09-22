import { RouteProp } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

export type StakingPoolDetailProp = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.StakingPoolDetail
>;
