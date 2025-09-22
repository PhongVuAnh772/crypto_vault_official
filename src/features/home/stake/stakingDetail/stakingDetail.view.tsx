import React from 'react';
import { FlatList, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import RowItem from '../components/rowItem';
import useStakingDetail from './stakingDetail.hook';
import styles from './stakingDetail.style';

const StakingDetailView: React.FC<RootNavigationType> = navigation => {
    const { stakingTransactionData, t, newUI } = useStakingDetail(navigation);

    return (
        <>
            <ScreenWrapper
                paddingTop
                backgroundColor={
                    newUI ? appColors.main.tokyoRed : appColors.neutral.n100
                }
                enableHeader
                bounces={false}
                headerTitleWithI18n={t(LanguageKey.stake_text_staking_details)}
                backButtonColor={newUI ? appColors.neutral.white : undefined}
                headerTextColor={newUI ? appColors.neutral.white : undefined}
                scrollEnabled>
                <View style={styles.viewBox}>
                    <AppText
                        title={t(
                            LanguageKey.stake_text_staking_details,
                        ).toUpperCase()}
                        styles={appStyles.textAlignLeft}
                        variant={TextVariantKeys.labelCap}
                        textColor={appColors.neutral.n500}
                    />
                    <View style={[appStyles.mt5, styles.boxContainer]}>
                        <FlatList
                            data={stakingTransactionData}
                            renderItem={({ item }) => (
                                <RowItem
                                    title={t(item.title)}
                                    value={item.value}
                                />
                            )}
                            scrollEnabled={false}
                            contentContainerStyle={appStyles.pB10}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        </>
    );
};

export default StakingDetailView;
