import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { ArrowDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import styles from './style';

type FilterSelectorProps = {
    onPress: () => void;
    typeSelect: string;
};

const FilterSelector: React.FC<FilterSelectorProps> = ({
    onPress,
    typeSelect,
}) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.pB15,
            ]}>
            <AppText
                titleWithI18n={LanguageKey.nft_choosing_type}
                variant={TextVariantKeys.labelMedium}
                styles={[appStyles.textAlignLeft]}
                textColor={
                    appColors.neutral.n500
                }
            />
            <TouchableOpacity
                style={[styles.typeUnAddedContainer]}
                onPress={onPress}>
                <AppText
                    titleWithI18n={typeSelect}
                    textColor={appColors.neutral.white}
                    variant={TextVariantKeys.labelMedium}
                />
                <View style={styles.iconArrowDown}>
                    <ArrowDownSvgIcon color={appColors.neutral.white} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default FilterSelector;
