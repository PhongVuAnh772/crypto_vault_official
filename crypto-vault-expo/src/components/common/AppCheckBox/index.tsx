import {TouchableOpacity} from 'react-native';
import React from 'react';
import useStyles from './styles';
import {CheckSvgIcon} from 'src/core/constants/AppIconsSvg';
import {useAppTheme} from 'src/core/hooks/useAppTheme';

type AppCheckBoxType = {
    checked: boolean;
    onPress?: () => void;
};

const AppCheckBox: React.FC<AppCheckBoxType> = props => {
    const {checked, onPress} = props;
    const theme = useAppTheme();

    const styles = useStyles(theme);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {checked ? (
                <CheckSvgIcon color={theme.colors.text_on_surface_text_high} />
            ) : null}
        </TouchableOpacity>
    );
};

export default AppCheckBox;
