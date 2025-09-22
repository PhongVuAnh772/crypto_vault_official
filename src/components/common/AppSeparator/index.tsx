import {View} from 'react-native';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import useAppSeparatorStyle from './style';

const AppSeparator = () => {
    const theme = useAppTheme();
    const appSeparatorStyle = useAppSeparatorStyle(theme);
    return <View style={appSeparatorStyle.separator} />;
};
export default AppSeparator;
