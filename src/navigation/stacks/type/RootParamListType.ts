import {
    createNavigationContainerRef,
    StackActions,
} from '@react-navigation/native';
import { NavigationStackKey } from 'src/navigation/enum/NavigationKey';
import { HomeParamListType } from './HomeParamListType';

export type RootParamListType = {
    [NavigationStackKey.AuthStack]: undefined;
    [NavigationStackKey.HomeStack]: HomeParamListType;
};

export const navigationRef = createNavigationContainerRef();

export function rootNavigate(name: string, props: object) {
    if (navigationRef.isReady()) {
        if (props) {
            navigationRef.dispatch(StackActions.push(name, props));
        } else {
            navigationRef.dispatch(StackActions.push(name));
        }
    }
}
