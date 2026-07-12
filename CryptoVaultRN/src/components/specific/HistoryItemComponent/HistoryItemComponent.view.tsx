import { t } from 'i18next';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import TransactionHistoryTypeIcon from '../TransactionHistoryTypeIcon';
import useStyles from './HistoryItemComponent.styles';
import { HistoryItemComponentType } from './HistoryItemComponent.type';

export const HistoryItemComponent: React.FC<HistoryItemComponentType> = ({
    onPress,
    containerStyle,
    amountTitle,
    createdAt,
    transactionType,
    status,
    customTitle,
    itemKey,
    address,
    logoUri,
    isNFTReceiveTransfer = false,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    const isReceive =
        transactionType === TransactionType.Receive ||
        transactionType === TransactionType.ReceiveNFT;

    const getTitle = () => {
        if (customTitle) return customTitle;
        if (isNFTReceiveTransfer) return LanguageKey.nft_send;
        if (transactionType === TransactionType.SmartContractExec) return LanguageKey.transaction_smart_contract_call;
        if (transactionType === TransactionType.SendNFT) return LanguageKey.nft_send;
        if (transactionType === TransactionType.ReceiveNFT) return `${t(LanguageKey.common_text_receive_nft)}`;
        if (transactionType === TransactionType.Swap) return LanguageKey.home_swap_title;
        
        return isReceive ? LanguageKey.common_text_receive : LanguageKey.home_send_title;
    };

    const isSwap = transactionType === TransactionType.Swap;

    return (
        <TouchableOpacity
            onPress={onPress}
            key={itemKey}
            activeOpacity={0.8}
            style={[styles.transactionHistoryItem, containerStyle]}>
            
            {/* LARGE Icon matching mockup */}
            <View style={styles.iconWrapper}>
              <TransactionHistoryTypeIcon
                  type={isNFTReceiveTransfer ? TransactionType.ReceiveNFT : transactionType}
                  uri={logoUri}
                  size={50} // Large as in mockup
              />
            </View>

            <View style={[appStyles.flex1, appStyles.pL15, appStyles.justifyContentCenter]}>
              <AppText
                  titleWithI18n={getTitle()}
                  variant={TextVariantKeys.bodyMMedium}
                  textColor="#111"
                  styles={{ fontWeight: '700', fontSize: 16 }}
              />
              <AppText
                  title={address ? `To ${address.substring(0,6)}...${address.substring(address.length-4)}` : "Uniswap"}
                  variant={TextVariantKeys.bodyRSmall}
                  textColor="#8E8E93"
                  styles={{ marginTop: 2 }}
              />
            </View>

            <View style={appStyles.alignItemsEnd}>
              <AppText
                  title={amountTitle}
                  variant={TextVariantKeys.bodyMMedium}
                  textColor={isReceive || isNFTReceiveTransfer ? '#4CAF50' : '#111'}
                  styles={{ fontWeight: '700', fontSize: 16 }}
              />
              {isSwap && (
                  <AppText
                      title="-10,064.43 USDT" // Placeholder for swap secondary amount if available
                      variant={TextVariantKeys.bodyRSmall}
                      textColor="#8E8E93"
                      styles={{ marginTop: 2 }}
                  />
              )}
            </View>
        </TouchableOpacity>
    );
};

export default HistoryItemComponent;
