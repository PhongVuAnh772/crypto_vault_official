import { useAppSelector } from 'src/core/redux/hooks';
import { getLoadingLogin } from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useLogin from '../auth/login/login.hook';

const useEmailVerifiedSuccessfully = (navigation: RootNavigationType) => {
    const { login } = useLogin(navigation, true);
    const isLoading = useAppSelector(getLoadingLogin);

    return { login, isLoading };
};
export default useEmailVerifiedSuccessfully;
