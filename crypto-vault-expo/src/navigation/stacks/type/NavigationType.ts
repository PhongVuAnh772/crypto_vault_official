import {NavigationProp, ParamListBase} from '@react-navigation/native';

interface RootNavigationType {
    navigation: NavigationProp<ParamListBase>;
    route?: any;
}

export default RootNavigationType;
