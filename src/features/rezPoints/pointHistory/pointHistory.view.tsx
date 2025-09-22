import React from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SectionList,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import SeparatorLine from 'src/components/specific/SeparatorLine';
import appColors from 'src/core/constants/AppColors';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { EmptyPointExpiryDate } from '../home/homeRezPoints.component';
import {
    SectionHeader,
    SkeletonLoadingList,
    TransactionHistoryItem,
} from './pointHistory.components';
import usePointHistory from './pointHistory.hook';
import styles from './pointHistory.style';

const PointHistoryView: React.FC<RootNavigationType> = () => {
    const {
        pointHistory,
        handleLoadMore,
        handleRefresh,
        loadingMore,
        refreshing,
        loading,
    } = usePointHistory();

    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            headerTextColor={appColors.neutral.white}
            backButtonColor={appColors.neutral.white}
            headerTitleWithI18n={LanguageKey.rez_point_history}>
            <View style={styles.container}>
                {loading ? (
                    <View style={appStyles.pH25}>
                        <SkeletonLoadingList />
                    </View>
                ) : (
                    <SectionList
                        sections={pointHistory}
                        renderSectionHeader={({ section }) => (
                            <SectionHeader title={section.title} />
                        )}
                        renderItem={({ item, index, section }) => (
                            <TransactionHistoryItem
                                item={item}
                                currentIndex={index}
                                lastItem={index === section.data.length - 1}
                            />
                        )}
                        keyExtractor={item => item._id.toString()}
                        contentContainerStyle={[
                            appStyles.pH25,
                            styles.pointHistoryItem,
                            appStyles.pB20,
                        ]}
                        style={appStyles.mt10}
                        stickySectionHeadersEnabled={false}
                        ItemSeparatorComponent={SeparatorLine}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={appStyles.mt20}>
                                    <ActivityIndicator size="small" />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={EmptyPointExpiryDate}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default PointHistoryView;
