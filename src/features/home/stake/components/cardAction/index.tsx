import React from 'react';
import {View} from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import style from './style';

type CardActionProps = {
    title: string;
    onPress: () => void;
};
const CardAction = ({title, onPress}: CardActionProps) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                style.container,
            ]}>
            <AppText
                title={title}
                variant={TextVariantKeys.titleMedium}
                textColor={appColors.neutral.black}
            />
            <AppButton
                onPress={onPress}
                titleWithI18n={LanguageKey.common_text_join}
                textVariant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.white}
                isLoading={false}
                disabled={false}
                styles={style.button}
            />
        </View>
    );
};

export default CardAction;
