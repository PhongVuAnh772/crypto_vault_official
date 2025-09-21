import React from 'react';
import { View } from 'react-native';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { SwapSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { feeAmount, hexToEther } from 'src/core/utils/walletConnectUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './sessionSendTransaction.style';
import useSessionSendTransaction from './useSessionSendTransaction';

export default function SessionSendTransaction() {
    const {
        theme,
        netWork,
        dataSendTransaction,
        bottomSheetTransactionRef,
        visibleLoading,
        isEnableDismissOnClose,
        validateAccount,
        insets,
        wallet,
        requirePinCode,
        closeRequirePinCode,
        openRequirePinCode,
        onApprove,
        accountChange,
        onReject,
    } = useSessionSendTransaction();
    const styles = useStyles(theme, insets);
    return (
        <View style={appStyles.flex1}>
            <AppModal
                visible={validateAccount}
                titleWithI18n={LanguageKey.common_text_switch_wallet}
                twoOptions={true}
                buttonTitleWithI18n={LanguageKey.common_text_switch_action}
                textButtonSecondColor={appColors.main.tokyoRed}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                onPress={accountChange}
                onPress2={onReject}
                footerView={
                    <View>
                        <AppText
                            styles={[
                                appStyles.textAlignCenter,
                                appStyles.mbt10,
                            ]}
                            titleWithI18n={LanguageKey.request_switch_wallet}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                        <View style={styles.view_switch_address}>
                            <AppText
                                titleWithI18n={LanguageKey.common_text_from}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_brand_2
                                }
                                styles={appStyles.flex1}
                            />
                            <AppText
                                title={WalletUtils.getShortAddress(
                                    wallet?.address,
                                )}
                                styles={appStyles.flex5}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        </View>
                        <View
                            style={[
                                appStyles.mv10,
                                appStyles.alignItemsCenter,
                            ]}>
                            <SwapSvgIcon width={26} height={26} />
                        </View>
                        <View
                            style={[
                                styles.view_switch_address,
                                appStyles.mbt20,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_text_to}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_brand_2
                                }
                                styles={appStyles.flex1}
                            />
                            {dataSendTransaction?.from && (
                                <AppText
                                    title={WalletUtils.getShortAddress(
                                        dataSendTransaction.from,
                                    )}
                                    styles={appStyles.flex5}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            )}
                        </View>
                    </View>
                }
            />
            <BottomSheetModalGorhom
                refModal={bottomSheetTransactionRef}
                onDismiss={onReject}
                enableDismissOnClose={isEnableDismissOnClose}
                snapPoints={['54%']}
                enableContentPanningGesture={!Utils.isAndroid}>
                <View style={styles.view_connect}>
                    <View style={styles.headerTitle}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.common_text_confirm_transaction
                            }
                            variant={TextVariantKeys.titleLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </View>
                    <View style={[appStyles.flex1, appStyles.pT15]}>
                        <View style={styles.infoWallet}>
                            <View
                                style={[
                                    styles.titleWithValueContainer,
                                    styles.borderBottom,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.project_detail_amount
                                    }
                                    variant={TextVariantKeys.bodyMLarge}
                                    textColor={
                                        theme.colors.text_on_surface_text_medium
                                    }
                                />
                                <AppText
                                    title={
                                        hexToEther(
                                            dataSendTransaction.value,
                                            netWork?.nativeToken.decimal ?? 0,
                                        ) +
                                        ' ' +
                                        (netWork?.nativeToken.symbol ?? '')
                                    }
                                    variant={TextVariantKeys.titleMedium}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_highest
                                    }
                                />
                            </View>
                            <View
                                style={[
                                    styles.titleWithValueContainer,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_from}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                                <AppText
                                    textColor={appColors.neutral.black}
                                    variant={TextVariantKeys.bodyRSmall}
                                    title={WalletUtils.getShortAddress(
                                        dataSendTransaction.from,
                                    )}
                                />
                            </View>
                            <View
                                style={[
                                    styles.titleWithValueContainer,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_to}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                                <AppText
                                    textColor={appColors.neutral.black}
                                    variant={TextVariantKeys.bodyRSmall}
                                    title={WalletUtils.getShortAddress(
                                        dataSendTransaction.to,
                                    )}
                                />
                            </View>
                        </View>
                        {dataSendTransaction.gas && (
                            <View
                                style={[
                                    styles.titleWithValueContainer,
                                    appStyles.mv25,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.send_network_fee_title
                                    }
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                                <AppText
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                    title={
                                        feeAmount(
                                            dataSendTransaction.gas,
                                            netWork?.nativeToken.decimal ?? 0,
                                            dataSendTransaction.maxPriorityFeePerGas,
                                        ) +
                                        ' ' +
                                        netWork?.nativeToken.symbol
                                    }
                                />
                            </View>
                        )}
                        {dataSendTransaction.data && (
                            <View style={appStyles.flexRow}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_data}
                                    variant={TextVariantKeys.bodyMMedium}
                                    numberOfLines={3}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }>
                                    <AppText
                                        title={':' + dataSendTransaction.data}
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={appColors.neutral.black}
                                    />
                                </AppText>
                            </View>
                        )}
                    </View>
                    <AppButtonSVG
                        titleWithI18n={LanguageKey.common_text_confirm}
                        styles={{
                            backgroundColor: theme.colors.onPrimary,
                        }}
                        textColor={theme.colors.text_on_surface_text_brand}
                        onPress={openRequirePinCode}
                        SvgView={SvgView.button}
                        textVariant={TextVariantKeys.bodyMMedium}
                    />
                </View>
            </BottomSheetModalGorhom>
            <LoadingScreen visible={visibleLoading} />
            <RequirePinCodeLayout
                visible={requirePinCode}
                onClose={closeRequirePinCode}
                continueActionAfterPassPinCode={onApprove}
            />
        </View>
    );
}
