import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { StakingHistorySvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';

const StakingHistoryEmptyView: React.FC = () => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    return (
        <View style={[appStyles.flex1, appStyles.center, appStyles.mt55]}>
            <StakingHistorySvgIcon
                color={newUI ? appColors.neutral.black : appColors.neutral.n500}
                width={28}
                height={25}
            />
            <AppText
                titleWithI18n={LanguageKey.stake_no_staking_history}
                variant={TextVariantKeys.titleLarge}
                textColor={
                    newUI ? appColors.neutral.black : appColors.neutral.n600
                }
            />
            <View style={appStyles.mt12}>
                <AppText
                    titleWithI18n={
                        LanguageKey.stake_no_staking_history_description
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={
                        newUI ? appColors.neutral.black : appColors.neutral.n600
                    }
                    styles={appStyles.textAlignCenter}
                />
            </View>
        </View>
    );
};

export default StakingHistoryEmptyView;
