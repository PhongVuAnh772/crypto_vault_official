import {View} from 'react-native';
import React from 'react';
import appColors from 'src/core/constants/AppColors';

const SeparatorLine: React.FC = () => {
    return (
        <View
            style={{
                height: 0.6,
                backgroundColor: appColors.other.outline_lightest,
            }}
        />
    );
};

export default SeparatorLine;
