import {View, TouchableOpacity} from 'react-native';
import React from 'react';
import styles from './styles';
import TransactionHistoryTypeIcon from 'src/components/specific/TransactionHistoryTypeIcon';
import AppText from 'src/components/common/AppText';
import appStyles from 'src/core/styles';
import {TransactionType} from 'src/core/enum/TransactionType';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {CheckSvgIcon2} from 'src/core/constants/AppIconsSvg';

type TypeButtonType = {
    typeSelect: TransactionType;
    onPress?: () => void;
    type: TransactionType;
    titleWithI18n: string;
};

const TypeButton: React.FC<TypeButtonType> = ({
    typeSelect,
    onPress,
    type,
    titleWithI18n,
}) => {
    const getCheck = (currenType: TransactionType) => {
        return typeSelect === currenType ? <CheckSvgIcon2 /> : null;
    };
    return (
        <TouchableOpacity style={styles.typeButtonContainer} onPress={onPress}>
            <TransactionHistoryTypeIcon style={appStyles.mh15} type={type} />
            <AppText
                titleWithI18n={titleWithI18n}
                textColor={appColors.neutral.black}
                variant={TextVariantKeys.labelMedium}
                styles={appStyles.flex1}
            />
            <View style={styles.checkIcon}>{getCheck(type)}</View>
        </TouchableOpacity>
    );
};

export default TypeButton;
