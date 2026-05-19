// @ts-nocheck
import React from 'react';
import {StyleSheet} from 'react-native';
import CoinDetails from 'src/components/specific/CoinDetails/CoinDetails.view';
import {HistoryItem} from 'src/components/specific/HistoryItem/HistoryItem';
import {CoinType} from 'src/core/enum/CoinType';
import {HistorySectionDataType} from 'src/core/type/HistorySectionDataType';
import {TransactionHistoryDataType} from 'src/core/type/TransactionHistoryDataType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {ImageTokenDetail, RenderFooter} from './token.detail.components';
import useTokenDetailEVM from './token.detail.hook';

const TokenDetailEVM: React.FC<RootNavigationType> = ({navigation}) => {
    const {
        tokenParams,
        isLoadingPage,
        refreshing,
        transactionType,
        onRefreshPage,
        onShowTypeBottomSheet,
        onSendPress,
        onReceivePress,
        balanceTitle,
        changeTypeTransaction,
        onDetailTransactionHistory,
        showTypeBottomSheetRef,
        onCloseBottomSheetSelectType,
        tokenHistories,
        balanceShow,
        onLoadMore,
        isLoadingMore,
        onPressViewMore,
    } = useTokenDetailEVM({
        navigation,
    });

    const renderItem = ({
        item,
        index,
        section,
    }: {
        item: TransactionHistoryDataType;
        index: number;
        section: HistorySectionDataType;
    }) => {
        const topItem = index === 0;
        const bottomItem = index === section.data.length - 1;
        const isBitcoin = item.coinType === CoinType.Bitcoin;

        return (
            <HistoryItem
                item={item}
                onPressHistoryItem={onDetailTransactionHistory}
                isBitcoin={isBitcoin}
                containerStyle={[
                    bottomItem ? styles.bottomItem : null,
                    topItem ? styles.topItem : null,
                ]}
            />
        );
    };

    return (
        <CoinDetails
            coinGeckoId={tokenParams?.id}
            name={tokenParams?.name}
            networkName={tokenParams?.baseData?.name || 'Mainnet Network'}
            icon={<ImageTokenDetail uri={tokenParams?.logo ?? ''} />}
            isTransactionHistoryLoading={isLoadingPage}
            refreshing={refreshing}
            onRefresh={onRefreshPage}
            refModalShowType={showTypeBottomSheetRef}
            onCloseTypeBottomSheet={onCloseBottomSheetSelectType}
            typeSelect={transactionType}
            changeTypeSelect={changeTypeTransaction}
            balanceTitle={balanceShow}
            balanceCurrencyTitle={balanceTitle}
            sendAction={onSendPress}
            receiveAction={onReceivePress}
            onShowTypeBottomSheet={onShowTypeBottomSheet}
            sectionData={tokenHistories}
            titleScreen={tokenParams.name}
            onLoadMore={onLoadMore}
            renderItem={renderItem}
            viewMoreHistory={onPressViewMore}
            ListFooterComponent={
                <RenderFooter
                    isLoading={isLoadingMore}
                    isShowViewMore={true}
                    onPressViewMore={onPressViewMore}
                />
            }
        />
    );
};
const styles = StyleSheet.create({
    bottomItem: {
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4,
    },
    topItem: {
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
    },
});

export default TokenDetailEVM;
