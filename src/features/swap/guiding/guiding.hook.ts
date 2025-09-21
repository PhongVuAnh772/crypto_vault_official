import { StackActions } from '@react-navigation/native';
import { useAppDispatch } from 'src/core/redux/hooks';
import { setSwapGuidingShow } from 'src/core/redux/slice/app.slice';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useGuiding = ({ navigation }: RootNavigationType) => {
    const dispatch = useAppDispatch();
    const onTryASwap = () => {
        dispatch(setSwapGuidingShow(false));

        navigation.dispatch(StackActions.replace(HomeStackScreenKey.Swap));
    };
    const onMaybeLater = () => {
        dispatch(setSwapGuidingShow(false));

        navigation.goBack();
    };
    return {
        onTryASwap,
        onMaybeLater,
    };
};
export default useGuiding;
