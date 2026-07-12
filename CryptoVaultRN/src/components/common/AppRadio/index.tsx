import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import useStyles from './styles';
import appColors from 'src/core/constants/AppColors';
type AppRadioType = {
    checked: boolean;
    onPress?: () => void;
};
const AppRadio: React.FC<AppRadioType> = props => {
    const {checked, onPress} = props;

    const styles = useStyles();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    borderColor: checked
                        ? appColors.main.tokyoRed
                        : appColors.neutral.n400,
                },
            ]}
            onPress={onPress}>
            {checked ? <View style={styles.active} /> : null}
        </TouchableOpacity>
    );
};

export default AppRadio;
