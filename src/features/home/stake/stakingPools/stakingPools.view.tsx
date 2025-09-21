import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppImage from 'src/components/common/AppImage';
import { SwitchProtocolWarningModal } from 'src/components/homeComponents/SwitchProtocol';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import CardStaking from '../components/cardStaking';
import Separator from '../components/separator';
import StakingPoolsEmptyView from './stakingPools.components';
import useStakingPools from './stakingPools.hook';

const StakingPoolsView: React.FC<RootNavigationType> = navigation => {
    const {
        navigateToDetail,
        stakingPools,
        showModalSwitch,
        onHideModalSwitch,
        currentPool,
        currentProtocolGlobal,
        t,
        handleSwitchProtocol,
    } = useStakingPools(navigation);
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(theme, insets);
    return (
        <View style={appStyles.flex1}>
            <FlatList
                data={stakingPools}
                renderItem={({ item }) => (
                    <CardStaking
                        onPress={navigateToDetail}
                        stakingPool={item}
                    />
                )}
                contentContainerStyle={styles.contentContainerStyle}
                ItemSeparatorComponent={Separator}
                ListEmptyComponent={StakingPoolsEmptyView}
            />
            <SwitchProtocolWarningModal
                acceptAction={() => handleSwitchProtocol()}
                disableAction={onHideModalSwitch}
                currentFalsingProtocol={currentProtocolGlobal?.name || ''}
                insets={insets}
                isLoading={false}
                projectName={t(LanguageKey.stake_staking)}
                theme={theme}
                visibleModal={showModalSwitch}
                promisingProtocol={currentPool?.lock.network}
                expectIcon={
                    <AppImage
                        uri={currentPool?.lock.networkLogo}
                        styleImage={appStyles.iconCircleSize13}
                        containerStyle={appStyles.ml5}
                    />
                }
                currentIcon={
                    <AppImage
                        uri={currentProtocolGlobal?.logo || ''}
                        styleImage={appStyles.iconCircleSize13}
                        containerStyle={appStyles.ml5}
                    />
                }
            />
        </View>
    );
};
const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        contentContainerStyle: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            paddingBottom: insets?.bottom,
        },
    });

export default StakingPoolsView;
