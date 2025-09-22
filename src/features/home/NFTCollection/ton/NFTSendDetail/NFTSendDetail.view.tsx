import moment from 'moment';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowForward2SvgIcon,
    PendingSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { DetailRow } from './NFTSendDetail.components';
import useTransactionDetails from './NFTSendDetail.hook';
import useStyles from './NFTSendDetail.styles';

const NFTTonSendDetail: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        txHash,
        fromAddress,
        toAddress,
        adminFee,
        networkFee,
        onViewOnScan,
        backAction,
        copyAction,
        selectedProtocol,
        nftData,
        total,
        newUI,
        insets,
    } = useTransactionDetails({ navigation });
    const styles = useStyles(theme, insets);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            backAction={backAction}
            headerTitleWithI18n={LanguageKey.transaction_detail_header_title}
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            headerTextColor={newUI ? appColors.neutral.white : undefined}>
            <ScrollView style={styles.container}>
                <View style={[appStyles.mt30, appStyles.mbt10]}>
                    <View style={appStyles.center}>
                        <PendingSvgIcon color={appColors.functional.pending} />
                        <View
                            style={[
                                styles.statusView,
                                {
                                    backgroundColor:
                                        appColors.functional.pending,
                                },
                            ]}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.transaction_history_pending
                                }
                                textColor={appColors.neutral.white}
                                variant={TextVariantKeys.labelSmall}
                            />
                        </View>
                    </View>

                    <View style={[appStyles.mt20, styles.detailsContainer]}>
                        <DetailRow
                            titleWithI18n={
                                LanguageKey.transaction_detail_total_amount
                            }
                            value={`${commonUtils.formattedBalanceCurrency(total) ?? 0} ${selectedProtocol?.name}`}
                            totalAmount
                            variantValue={TextVariantKeys.titleSmall}
                            valueColor={appColors.neutral.black}
                            bottomLine
                            valueMaxFontSizeMultiplier={1.3}
                            titleStyles={styles.widthHalf}
                            contentContainerStyles={styles.widthHalf}
                        />
                        <DetailRow
                            titleWithI18n={
                                LanguageKey.send_recipient_address_title
                            }
                            value={WalletUtils.getShortAddress(toAddress)}
                        />
                        <DetailRow
                            titleWithI18n={LanguageKey.transaction_detail_date}
                            value={DateTimeUtils.formatTimeWithTimezone(
                                moment().toString(),
                                'YYYY/MM/DD, h:mm A',
                            )}
                        />
                        <DetailRow
                            titleWithI18n={LanguageKey.common_text_from}
                            value={WalletUtils.getShortAddress(fromAddress)}
                        />

                        <DetailRow
                            titleWithI18n={LanguageKey.common_collection}
                            value={
                                nftData.detail.nftDetailAll.collection?.name
                                    ? nftData.detail.nftDetailAll.collection
                                          .name
                                    : '-'
                            }
                            titleStyles={styles.widthHalf}
                            contentContainerStyles={styles.widthHalf}
                        />

                        <DetailRow
                            titleWithI18n={LanguageKey.send_service_fee_title}
                            value={`${commonUtils.formattedBalanceCurrency(Number(adminFee))} ${selectedProtocol?.name}`}
                        />
                        <DetailRow
                            titleWithI18n={LanguageKey.send_network_fee_title}
                            value={`${commonUtils.formattedBalanceCurrency(Number(networkFee)) ?? 0} ${selectedProtocol?.name}`}
                            titleStyles={styles.widthHalf}
                            contentContainerStyles={styles.widthHalf}
                        />
                        <DetailRow
                            titleWithI18n={LanguageKey.transaction_tx_has_title}
                            value={WalletUtils.getShortAddress(txHash)}
                            showCopyButton
                            copyAction={copyAction}
                        />
                        <TouchableOpacity
                            onPress={onViewOnScan}
                            style={styles.titleWithValueContainer}>
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.flex1,
                                    appStyles.center,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.transaction_detail_view_on_scan_title
                                    }
                                    variant={TextVariantKeys.titleSmall}
                                    textColor={
                                        theme.colors.surface_surface_brand
                                    }
                                />
                                <View style={appStyles.ml5}>
                                    <ArrowForward2SvgIcon />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.button}>
                {newUI ? (
                    <AppButtonSVG
                        titleWithI18n={LanguageKey.transaction_history_close}
                        styles={styles.closeButton}
                        textColor={appColors.neutral.white}
                        textVariant={TextVariantKeys.bodyMMedium}
                        onPress={backAction}
                        SvgView={SvgView.button}
                    />
                ) : (
                    <AppButton
                        titleWithI18n={LanguageKey.transaction_history_close}
                        styles={styles.closeButton}
                        textColor={appColors.neutral.white}
                        textVariant={TextVariantKeys.bodyMMedium}
                        onPress={backAction}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default NFTTonSendDetail;
