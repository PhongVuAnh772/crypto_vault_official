import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import Utils from '../utils/commonUtils';

const useAppSafeAreaInsets = () => {
    const insets: EdgeInsets = useSafeAreaInsets();

    const appInsets: EdgeInsets = {
        ...insets,
        bottom: Utils.isAndroid ? 10 : insets.bottom,
        top: Utils.isAndroid ? 40 : insets.top,
    };

    return appInsets;
};

export default useAppSafeAreaInsets;
