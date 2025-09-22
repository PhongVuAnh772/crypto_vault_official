import React from 'react';
import {
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from 'src/components/common/AppText';
import { ArrowDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { TransactionType } from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    LoadingTransactionView,
    LoadingTypeTransactionView,
    SeeMoreTransactionView,
} from '../components';
import { RenderTonHistoryItem } from './ton.transactionTab.component';
import useTonTransactionTab from './ton.transactionTab.hook';
import { useStyles } from './ton.transactionTab.styles';

const TonTransactionTab: React.FC<
    RootNavigationType & {
        setShowTypeModal: (value: boolean) => void;
        typeSelect: TransactionType;
    }
> = ({ navigation, setShowTypeModal, typeSelect }) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    const {
        transactionHistory,
        typeSelectTitle,
        refreshing,
        onRefresh,
        onGoToDetails,
        loading,
        viewMoreHistory,
        protocolLogo,
        currentWallet,
        selectedAddress,
        newUI,
    } = useTonTransactionTab({ navigation, typeSelect });
    const renderHistoryItem = ({
        item,
        section,
    }: {
        item: TransactionHistoryDataType;
        section: HistorySectionDataType;
    }) => {
        return (
            <RenderTonHistoryItem
                key={item.id}
                item={item}
                goToDetails={onGoToDetails}
                protocolLogo={protocolLogo}
                currentWallet={currentWallet}
                selectedAddress={selectedAddress}
                section={section}
            />
        );
    };

    const renderSectionHeader = ({
        section: { title },
    }: {
        section: HistorySectionDataType;
    }) => {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>{title}</Text>
            </View>
        );
    };
    return (
        <>
            {transactionHistory.length > 0 ? (
                <SectionList
                    style={styles.maxHeigh}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.text_on_surface_text_high}
                            colors={[theme.colors.text_on_surface_text_high]}
                        />
                    }
                    sections={transactionHistory}
                    renderItem={renderHistoryItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={[
                        appStyles.pB50,
                        newUI && appStyles.pT5,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item?.txHash ?? ''}
                    ListFooterComponent={
                        <SeeMoreTransactionView
                            handleViewMore={viewMoreHistory}
                        />
                    }
                />
            ) : (
                <LoadingTransactionView
                    isTransactionHistoryLoading={loading}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    viewMoreHistory={viewMoreHistory}
                />
            )}
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentEnd,
                    StyleSheet.absoluteFill,
                    styles.h30,
                    newUI && appStyles.pT5,
                ]}>
                {loading ? (
                    <LoadingTypeTransactionView
                        isTransactionHistoryLoading={loading}
                        onRefresh={onRefresh}
                        refreshing={refreshing}
                        viewMoreHistory={viewMoreHistory}
                    />
                ) : (
                    <TouchableOpacity
                        style={[styles.protocolContainer]}
                        onPress={() => {
                            setShowTypeModal(true);
                        }}>
                        <AppText
                            titleWithI18n={typeSelectTitle}
                            textColor={theme.colors.surface_surface_high}
                            variant={TextVariantKeys.labelMedium}
                        />
                        <View style={styles.iconArrowDown}>
                            <ArrowDownSvgIcon
                                color={theme.colors.surface_surface_high}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
};

export default TonTransactionTab;
