import {View} from 'react-native';
import React from 'react';

type Props = {
    height?: number;
};
const Separator: React.FC<Props> = ({height = 16}) => {
    return <View style={{height}} />;
};

export default Separator;
