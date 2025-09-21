import { t } from 'i18next';
import React from 'react';
import { View } from 'react-native';
import HistoryItemComponent from 'src/components/specific/HistoryItemComponent/HistoryItemComponent.view';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { AccountType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { useStyles } from './ton.transactionTab.styles';

const RenderTonHistoryItem: React.FC<{
    item: TransactionHistoryDataType;
    goToDetails: (item: TransactionHistoryDataType) => void;
    protocolLogo?: string;
    currentWallet: AccountType | undefined;
    selectedAddress: string | undefined;
    section: HistorySectionDataType;
}> = ({
    item,
    goToDetails,
    protocolLogo,
    currentWallet,
    selectedAddress,
    section,
}) => {
    const sectionLength = section.data.length;
    const multipleItem = sectionLength > 1;
    const currentItemIndex = section.data.findIndex(e => e === item);
    const isLastMainItem = currentItemIndex === sectionLength - 1;
    const isNeedMarginBottom = !isLastMainItem && multipleItem;
    const marginBottomStyle = isNeedMarginBottom ? appStyles.mbt10 : null;

    const theme = useAppTheme();
    const multipleTransactionData = item.multipleTransactionData;
    const isCaseTwoTransactionsHaveAdminTransaction =
        multipleTransactionData?.length === 2 &&
        multipleTransactionData.some(e => e.isAdminFee === true);

    const isMultipleTransaction =
        multipleTransactionData != null &&
        !isCaseTwoTransactionsHaveAdminTransaction;

    const filterAdminFeeAction = multipleTransactionData?.filter(
        e => !e?.isAdminFee,
    );
    const styles = useStyles(theme);

    if (isMultipleTransaction) {
        return (
            <View style={marginBottomStyle} key={item?.txHash}>
                {filterAdminFeeAction?.map((currentTransaction, index) => {
                    const isFirstItem = index === 0;
                    const isLastItem =
                        index === filterAdminFeeAction.length - 1;
                    const totalAmount =
                        currentTransaction?.amountSend +
                        (currentTransaction.adminFee ?? 0) +
                        (currentTransaction.isNative
                            ? (currentTransaction.fee ?? 0)
                            : 0);

                    const isReceive =
                        currentTransaction.type === TransactionType.Receive;
                    const amountTitle = `${isReceive ? '+' : '-'} ${(item.isNative
                        ? TonUtils.formatTonBalance
                        : Utils.formattedBalanceCurrency)(
                        TonUtils.formatBigNumber(
                            String(totalAmount ?? 0),
                            currentTransaction.decimal,
                        ),
                    )} ${item.tokenSymbol ?? t(LanguageKey.currency_ton)}`;

                    let finalTotalAmount = '';

                    if (
                        currentTransaction.type === TransactionType.SendNFT ||
                        currentTransaction.type === TransactionType.ReceiveNFT
                    ) {
                        finalTotalAmount = '';
                    } else if (
                        currentTransaction.type ===
                            TransactionType.SmartContractExec &&
                        item.amountTonAttachedSmartExc
                    ) {
                        const totalAmountForSmartContract = `${'-'} ${(item.isNative
                            ? TonUtils.formatTonBalance
                            : Utils.formattedBalanceCurrency)(
                            TonUtils.formatBigNumber(
                                String(item.amountTonAttachedSmartExc),
                                currentTransaction.decimal,
                            ),
                        )} ${item.tokenSymbol ?? t(LanguageKey.currency_ton)}`;
                        finalTotalAmount = `${totalAmountForSmartContract}`;
                    } else {
                        finalTotalAmount = amountTitle;
                    }

                    return (
                        <HistoryItemComponent
                            key={`${index}${item.id}`}
                            itemKey={`${item.id} ${index}`}
                            transactionType={
                                currentTransaction.type ??
                                TransactionType.Receive
                            }
                            onPress={() => goToDetails(currentTransaction)}
                            containerStyle={[
                                isFirstItem
                                    ? styles.firstTransactionItemInSection
                                    : null,
                                isLastItem
                                    ? styles.lastTransactionItemInSection
                                    : null,
                            ]}
                            createdAt={currentTransaction.createdAt}
                            address={currentTransaction.toAddress}
                            amountTitle={finalTotalAmount}
                            status={
                                currentTransaction.status ??
                                TransactionStatusType.Pending
                            }
                            logoUri={item.logoUri ?? protocolLogo}
                        />
                    );
                })}
            </View>
        );
    } else {
        const totalAmount =
            item?.amountSend +
            (item.adminFee ?? 0) +
            (item.isNative ? (item.fee ?? 0) : 0);
        const isReceive = item.type === TransactionType.Receive;

        let amountTitle;
        if (
            item.type === TransactionType.ReceiveNFT ||
            item.type === TransactionType.SendNFT
        ) {
            amountTitle = ``;
        } else if (
            item.type === TransactionType.SmartContractExec &&
            item.amountTonAttachedSmartExc
        ) {
            const fee = Number(item.fee ?? NaN);
            const totalAmountForSmartContract = `${TonUtils.getFeeStatus(fee) ? '+' : '-'} ${(item.isNative
                ? TonUtils.formatTonBalance
                : Utils.formattedBalanceCurrency)(
                TonUtils.formatBigNumber(
                    String(item.amountTonAttachedSmartExc),
                    item.decimal,
                ),
            )} ${item.tokenSymbol ?? t(LanguageKey.currency_ton)}`;
            amountTitle = `${totalAmountForSmartContract}`;
        } else {
            amountTitle = `${isReceive ? '+' : '-'} ${(item.isNative
                ? TonUtils.formatTonBalance
                : Utils.formattedBalanceCurrency)(
                TonUtils.formatBigNumber(
                    String(totalAmount ?? 0),
                    item.decimal,
                ),
            )} ${item.tokenSymbol ?? t(LanguageKey.currency_ton)}`;
        }

        const isNFTReceiveTransfer =
            selectedAddress === item.toAddress &&
            item.type === TransactionType.ReceiveNFT;
        return (
            <View style={marginBottomStyle} key={item?.txHash}>
                <HistoryItemComponent
                    transactionType={item.type ?? TransactionType.Receive}
                    onPress={() => goToDetails(item)}
                    containerStyle={[styles.transactionContainer]}
                    createdAt={item.createdAt}
                    address={item.toAddress}
                    amountTitle={amountTitle}
                    status={item.status ?? TransactionStatusType.Pending}
                    logoUri={item.logoUri ?? protocolLogo}
                    isNFTReceiveTransfer={isNFTReceiveTransfer}
                />
            </View>
        );
    }
};

export { RenderTonHistoryItem };
