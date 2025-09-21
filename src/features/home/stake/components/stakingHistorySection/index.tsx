import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';

type StakingHistorySectionType = {
    title: string;
    sectionIndex: number;
};

const StakingHistorySection: React.FC<StakingHistorySectionType> = ({
    title,
    sectionIndex,
}) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <View style={[appStyles.mbt10, sectionIndex !== 0 && appStyles.mt15]}>
            <AppText
                title={title}
                variant={TextVariantKeys.labelCap}
                textColor={
                    newUI ? appColors.neutral.black : appColors.neutral.n500
                }
            />
        </View>
    );
};

export default StakingHistorySection;
