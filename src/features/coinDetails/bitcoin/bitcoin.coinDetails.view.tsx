import { t } from 'i18next';
import React from 'react';
import CoinDetails from 'src/components/specific/CoinDetails/CoinDetails.view';
import HistoryItemComponent from 'src/components/specific/HistoryItemComponent/HistoryItemComponent.view';
import { BitcoinSvgIcon } from 'src/core/constants/AppIconsSvg';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import { useBitcoin } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import ListFooterComponentBitcoin from './bitcoin.coinDetails.components';
import styles from './bitcoin.coinDetails.styles';

const BitcoinScreen: React.FC<RootNavigationType> = ({navigation}) => {
    const {
        bitCoinBalanceTitle,
        goToSendScreen,
        goToReceiveScreen,
        btcTransactionHistory,
        typeSelect,
        changeTypeSelect,
        refreshing,
        onRefresh,
        isTransactionHistoryLoading,
        onCloseTypeBottomSheet,
        onShowTypeBottomSheet,
        btcBalanceCurrencyString,
        onGoToDetails,
        viewMoreHistory,
        onBack,
        showTypeBottomSheetRef,
    } = useBitcoin({
        navigation,
    });

    const renderHistoryItem = ({
        item,
        index,
        section,
    }: {
        item: TransactionHistoryDataType;
        index: number;
        section: HistorySectionDataType;
    }) => {
        const isReceive = item.type === TransactionType.Receive;
        const topItem = index === 0;
        const bottomItem = index === section.data.length - 1;
        const totalAmount =
            item?.amountSend + (item.adminFee ?? 0) + (item.fee ?? 0);
        const amountTitle = `${isReceive ? '+' : '-'} ${Utils.formattedBalanceCurrency(
            parseFloat(BitcoinUtils.getBitcoinFromSatoshi(totalAmount)),
        )} ${t(LanguageKey.currency_bitcoin)}`;

        return (
            <HistoryItemComponent
                itemKey={item?.txHash}
                transactionType={item.type ?? TransactionType.Receive}
                onPress={() => onGoToDetails(item)}
                containerStyle={[
                    bottomItem ? styles.bottomItem : null,
                    topItem ? styles.topItem : null,
                ]}
                createdAt={item.createdAt}
                address={item.toAddress}
                amountTitle={amountTitle}
                status={item.status ?? TransactionStatusType.Pending}
            />
        );
    };

    return (
        <CoinDetails
            coinGeckoId="bitcoin"
            name="Bitcoin"
            networkName="Bitcoin Network"
            refModalShowType={showTypeBottomSheetRef}
            icon={<BitcoinSvgIcon width={50} height={50} />}
            isTransactionHistoryLoading={isTransactionHistoryLoading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onCloseTypeBottomSheet={onCloseTypeBottomSheet}
            typeSelect={typeSelect}
            changeTypeSelect={changeTypeSelect}
            balanceTitle={bitCoinBalanceTitle}
            balanceCurrencyTitle={btcBalanceCurrencyString}
            sendAction={goToSendScreen}
            receiveAction={goToReceiveScreen}
            onShowTypeBottomSheet={onShowTypeBottomSheet}
            sectionData={btcTransactionHistory}
            titleWithI18n={LanguageKey.btc_coin_title}
            viewMoreHistory={viewMoreHistory}
            renderItem={renderHistoryItem}
            ListFooterComponent={
                <ListFooterComponentBitcoin
                    showSeeMore={true}
                    viewMoreHistory={viewMoreHistory}
                />
            }
            onBack={onBack}
        />
    );
};

export default BitcoinScreen;
