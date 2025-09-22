import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { RefreshControl, SectionList, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import {
    LoadingListTransaction,
    LoadingTransactionListWrapper,
    RenderItemTransaction,
} from './transactionProject.component';
import { useProjectTransactionDetail } from './transactionProject.hook';
import { TransactionProps } from './transactionProject.type';

interface TransactionHistoryProjectProp {
    props: {};
}

const TransactionHistoryProject: React.FC<
    TransactionHistoryProjectProp
> = props => {
    const navigation = useNavigation();
    const {
        theme,
        dataClaimHistory,
        refreshing,
        onRefresh,
        navigateToClaimDetail,
        groupByClaimDate,
        firstLoading,
        dataClaimable,
    } = useProjectTransactionDetail(
        { navigation },
        props?.props as TransactionProps,
    );

    const sections = groupByClaimDate(dataClaimHistory);

    if (firstLoading) {
        return (
            <ScreenWrapper backgroundColor={appColors.neutral.n100}>
                <View style={[appStyles.mh25, appStyles.mt30, appStyles.flex1]}>
                    <LoadingTransactionListWrapper theme={theme} />
                    <View style={appStyles.pT10}>
                        <LoadingTransactionListWrapper theme={theme} />
                    </View>
                    <View style={appStyles.pT10}>
                        <LoadingTransactionListWrapper theme={theme} />
                    </View>
                    <View style={appStyles.pT10}>
                        <LoadingTransactionListWrapper theme={theme} />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
    return (
        <ScreenWrapper backgroundColor={appColors.neutral.n100}>
            <View
                style={[
                    appStyles.mh25,
                    dataClaimHistory?.length === 0
                        ? appStyles.mt30
                        : appStyles.mt25,
                    appStyles.flex1,
                ]}>
                {dataClaimHistory && dataClaimHistory.length > 0 ? (
                    <SectionList
                        sections={sections}
                        keyExtractor={item => item?.txHash ?? ''}
                        renderItem={({ item }) => (
                            <RenderItemTransaction
                                item={item}
                                navigateToClaimDetail={navigateToClaimDetail}
                                dataClaimable={dataClaimable}
                                theme={theme}
                            />
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <AppText
                                title={title}
                                variant={TextVariantKeys.labelCap}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                                styles={[
                                    appStyles.mbt15,
                                    {
                                        backgroundColor:
                                            theme.colors
                                                .surface_surface_default,
                                    },
                                ]}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                colors={[
                                    theme.colors.text_on_surface_text_high,
                                ]}
                            />
                        }
                        contentContainerStyle={appStyles.pB50}
                    />
                ) : (
                    <LoadingListTransaction
                        onRefresh={onRefresh}
                        isLoading={firstLoading}
                        refreshing={refreshing}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default TransactionHistoryProject;
