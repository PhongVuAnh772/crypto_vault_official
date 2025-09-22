import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getIsShowPinCode,
    setPinCodeForSwap,
    setShowPinCodeForAuthSwap,
} from 'src/core/redux/slice/swap/swap.slice';

const useSwapMain = () => {
    const dispatch = useAppDispatch();
    const getShowPinCode = useAppSelector(getIsShowPinCode);

    const onClose = () => {
        dispatch(setShowPinCodeForAuthSwap(false));
    };

    const setPinCode = (pinCode: string) => {
        dispatch(setPinCodeForSwap(pinCode));
    };
    return { setPinCode, onClose, getShowPinCode };
};
export default useSwapMain;
