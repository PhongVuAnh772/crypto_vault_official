import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getKeyboardHeight, setKeyboardHeight } from '../redux/slice/app.slice';

const useKeyboard = () => {
    const keyboardHeight = useAppSelector(getKeyboardHeight);
    const dispatch = useAppDispatch();
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            event => {
                if (keyboardHeight === 0) {
                    dispatch(setKeyboardHeight(event.endCoordinates.height));
                    keyboardDidShowListener.remove();
                }
            },
        );

        return () => {
            keyboardDidShowListener.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export default useKeyboard;
