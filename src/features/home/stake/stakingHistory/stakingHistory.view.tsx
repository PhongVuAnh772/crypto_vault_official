import React from 'react';
import { SectionList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import SeparatorLine from '../../../../components/specific/SeparatorLine';
import StakingHistoryItem from '../components/stakingHistoryItem';
import StakingHistorySection from '../components/stakingHistorySection';
import StakingHistoryEmptyView from './stakingHistory.components';
import useStakingHistory from './stakingHistory.hook';
import styles from './stakingHistory.style';

const StakingHistoryView: React.FC<RootNavigationType> = navigation => {
    const insets = useSafeAreaInsets();
    const { stakingHistory, onPressItem } = useStakingHistory(navigation);

    return (
        <View style={[appStyles.flex1]}>
            <SectionList
                sections={stakingHistory}
                renderSectionHeader={({ section }) => {
                    const sectionIndex = stakingHistory.findIndex(
                        s => s.title === section.title,
                    );
                    return (
                        <StakingHistorySection
                            title={section.title}
                            sectionIndex={sectionIndex}
                        />
                    );
                }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => onPressItem(item)}
                        style={styles.itemContainer}>
                        <StakingHistoryItem {...item} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={[
                    appStyles.pH25,
                    appStyles.pT10,
                    {
                        paddingBottom: insets.bottom,
                    },
                ]}
                ItemSeparatorComponent={SeparatorLine}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={StakingHistoryEmptyView}
            />
        </View>
    );
};

export default StakingHistoryView;
