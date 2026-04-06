import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { PiggyBankSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';

const StakingPoolsEmptyView: React.FC = () => {
    return (
        <View style={[appStyles.flex1, appStyles.center, appStyles.mt55]}>
            <PiggyBankSvgIcon
                color={
                    appColors.neutral.n500
                }
                width={28}
                height={25}
            />
            <AppText
                titleWithI18n={LanguageKey.stake_no_staking_pool_yet}
                variant={TextVariantKeys.titleLarge}
                textColor={
                     appColors.neutral.n600
                }
            />
            <View style={appStyles.mt12}>
                <AppText
                    titleWithI18n={
                        LanguageKey.stake_no_staking_pool_yet_description
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={
                         appColors.neutral.n600
                    }
                    styles={appStyles.textAlignCenter}
                />
            </View>
        </View>
    );
};

export default StakingPoolsEmptyView;
