import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Modal,
    TouchableOpacity,
    View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import { AppLoadingOpacity } from 'src/components/common/AppLoadingOpacity';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import CoinWidgets from 'src/components/homeComponents/CoinWidgets';
import ConfirmView from 'src/components/homeComponents/ConfirmView';
import SendLoading from 'src/components/homeComponents/SendLoading/sendLoading.view';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { DangerSvgIcon, ScanSvgIcon } from 'src/core/constants/AppIconsSvg';
import InputMode from 'src/core/enum/InputMode';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { useBitcoinTransfer } from './bitcoin.transfer.hook';
import useStyles from './bitcoin.transfer.styles';

const TransferBitcoinComponent: React.FC<
    RootNavigationType & {
        isFromHome?: boolean;
    }
> = ({ navigation, isFromHome }) => {
    const { t } = useTranslation();
    const theme = useAppTheme();

    const {
        coinType,
        balanceTitle,
        adminFee,
        subAdminFee,
        networkFee,
        subNetworkFee,
        fromAddress,
        onToAddressChange,
        clearToAddress,
        toAddress,
        handleCopyToClipboard,
        maxAmountTitle,
        onAmountSendChangeText,
        amountSend,
        fromAmount,
        fromSubAmount,
        createTransactionAction,
        coinDataLoading,
        maxAmountLoading,
        confirmAction,
        isLoadingPushTransaction,
        disableContinue,
        maxAction,
        inputAmountError,
        showModal,
        onClose,
        toAddressFocus,
        onToAddressFocus,
        onToAddressBlur,
        onScanQR,
        showScanQRCamera,
        isPushTransactionFailure,
        onClosePushTransactionFailureModal,
        showDustError,
        errorNetworkFeeHigh,
        toAddressError,
        balanceCurrencyString,
        isLoading,
        errorSubTitle,
        insets,
        errorHash,
        openErrorHashLink,
        pushBitcoinHashErrorExists,
        pushBitcoinHashErrorDust,
        onModalConfirmDismiss,
        requirePinCode,
        closeRequirePinCode,
        continueActionAfterPassPinCode,
        handleCallBackScanQR,
        onCloseScanQR,
        newUI,
    } = useBitcoinTransfer({ navigation });
    const styles = useStyles(theme, insets);

    return (
        <ScreenWrapper
            enableDismissKeyboard
            enableHeader
            headerTitleWithI18n={LanguageKey.home_send_title}
            headerTextVariant={TextVariantKeys.titleLarge}
            paddingTop
            paddingBottom={!newUI}
            callBackWhenScanQR={handleCallBackScanQR}
            showScanQRCamera={showScanQRCamera}
            onCloseScanQR={onCloseScanQR}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }>
            <KeyboardAvoidingView
                style={styles.container}
                keyboardVerticalOffset={newUI ? 0 : insets.bottom}
                behavior={Utils.isIos ? 'padding' : 'height'}>
                <BottomSheetModal
                    showModal={showModal}
                    onDismiss={onModalConfirmDismiss}
                    closeModalAction={onClose}
                    child={
                        <>
                            <ConfirmView
                                coinType={coinType}
                                fromAddress={fromAddress}
                                fromAmount={fromAmount}
                                fromSubAmount={fromSubAmount}
                                toAddress={WalletUtils.getShortAddress(
                                    toAddress,
                                )}
                                networkFee={networkFee}
                                subNetworkFee={subNetworkFee}
                                adminFee={adminFee}
                                subAdminFee={subAdminFee}
                            />
                            <Modal visible={requirePinCode}>
                                <RequirePinCodeLayout
                                    visible={requirePinCode}
                                    onClose={closeRequirePinCode}
                                    continueActionAfterPassPinCode={
                                        continueActionAfterPassPinCode
                                    }
                                />
                            </Modal>
                        </>
                    }
                    bottomChild={
                        newUI ? (
                            <AppButtonSVG
                                onPress={() => {
                                    confirmAction();
                                }}
                                titleWithI18n={LanguageKey.home_send_title}
                                styles={styles.button}
                                textVariant={TextVariantKeys.titleSmall}
                                textColor={appColors.neutral.white}
                                SvgView={SvgView.button}
                            />
                        ) : (
                            <AppButton
                                onPress={() => {
                                    confirmAction();
                                }}
                                titleWithI18n={LanguageKey.home_send_title}
                                styles={styles.button}
                                textVariant={TextVariantKeys.titleSmall}
                                textColor={appColors.neutral.white}
                            />
                        )
                    }
                />

                <AppModal
                    titleWithI18n={errorSubTitle.titleWithI18N}
                    subTitleWithI18n={errorSubTitle.subTitleWithI18N}
                    subTitle={errorSubTitle.subTitle}
                    visible={isPushTransactionFailure}
                    onPress={onClosePushTransactionFailureModal}
                    onTouchOutside={onClosePushTransactionFailureModal}
                    buttonTitleWithI18n={LanguageKey.common_text_ok}
                    keepBottomButton
                    titleVariant={TextVariantKeys.titleMedium}
                    footerView={
                        errorHash &&
                        (pushBitcoinHashErrorExists ||
                            pushBitcoinHashErrorDust) && (
                            <TouchableOpacity
                                onPress={openErrorHashLink}
                                style={[appStyles.pB20]}>
                                <AppText
                                    title={errorHash}
                                    numberOfLines={1}
                                    textColor={
                                        theme.colors.surface_surface_brand
                                    }
                                    styles={styles.hashLink}
                                />
                            </TouchableOpacity>
                        )
                    }
                    icon={<DangerSvgIcon />}
                />
                <AppLoadingOpacity
                    secondView={
                        <View style={[appStyles.pH25, appStyles.pT15]}>
                            <SendLoading />
                        </View>
                    }
                    isLoading={coinDataLoading || maxAmountLoading}>
                    <View
                        style={[
                            appStyles.justifyContentBetween,
                            appStyles.flex1,
                        ]}>
                        <View>
                            <View style={[appStyles.pH25, appStyles.pT15]}>
                                <CoinWidgets
                                    coinType={coinType}
                                    balanceTitle={balanceTitle}
                                    isLoading={coinDataLoading}
                                    action={() => {}}
                                    hideAction={true}
                                />
                            </View>
                            <View style={appStyles.pV30}>
                                <View
                                    style={[
                                        appStyles.flexRow,
                                        appStyles.alignItemsCenter,
                                        appStyles.pH25,
                                    ]}>
                                    <View style={styles.textTo}>
                                        <AppText
                                            titleWithI18n={
                                                LanguageKey.common_text_to
                                            }
                                            variant={TextVariantKeys.bodyMSmall}
                                            textColor={appColors.neutral.n600}
                                        />
                                    </View>
                                    <View style={appStyles.flex1}>
                                        <TextInput
                                            readOnly={isLoading}
                                            onFocus={onToAddressFocus}
                                            onBlur={onToAddressBlur}
                                            numberOfLines={1}
                                            onChangeText={onToAddressChange}
                                            value={
                                                toAddressFocus
                                                    ? toAddress
                                                    : WalletUtils.getShortAddress(
                                                          toAddress,
                                                      )
                                            }
                                            mode={InputMode.outlined}
                                            outlineColor={
                                                theme.colors
                                                    .surface_surface_default
                                            }
                                            activeOutlineColor={
                                                theme.colors
                                                    .surface_surface_default
                                            }
                                            placeholder={t(
                                                LanguageKey.send_recipient_address_title,
                                            )}
                                            selectionColor={
                                                appColors.neutral.black
                                            }
                                            cursorColor={
                                                appColors.neutral.black
                                            }
                                            style={[
                                                styles.inputAddressContainer,
                                            ]}
                                            contentStyle={
                                                styles.inputAddressContent
                                            }
                                            right={
                                                toAddress.length > 0 ? (
                                                    <TextInput.Icon
                                                        icon={'close'}
                                                        onPress={clearToAddress}
                                                        color={
                                                            theme.colors
                                                                .text_on_surface_text_light
                                                        }
                                                        size={20}
                                                    />
                                                ) : null
                                            }
                                        />
                                    </View>

                                    <AppButton
                                        onPress={handleCopyToClipboard}
                                        titleWithI18n={
                                            LanguageKey.common_text_paste
                                        }
                                        textVariant={
                                            TextVariantKeys.bodyMMedium
                                        }
                                        textColor={appColors.main.tokyoRed}
                                    />

                                    <TouchableOpacity
                                        style={styles.scanIcon}
                                        onPress={onScanQR}>
                                        <ScanSvgIcon />
                                    </TouchableOpacity>
                                </View>
                                {toAddressError && (
                                    <View style={[appStyles.mh25]}>
                                        <AppText
                                            titleWithI18n={
                                                LanguageKey.send_input_to_address_error
                                            }
                                            variant={TextVariantKeys.bodyMSmall}
                                            textColor={appColors.main.tokyoRed}
                                        />
                                    </View>
                                )}
                            </View>
                            <View
                                style={[
                                    appStyles.mh25,
                                    appStyles.mbt5,
                                    appStyles.flexRow,
                                    appStyles.justifyContentBetween,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.send_enter_amount_title
                                    }
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={appColors.neutral.n600}
                                />
                                <View style={[appStyles.flexRow]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_send_maximum_title
                                        }
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor={appColors.main.tokyoRed}
                                    />

                                    <AppText
                                        title={maxAmountTitle}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                </View>
                            </View>
                            <View style={[appStyles.pH25, appStyles.flexRow]}>
                                <TextInput
                                    readOnly={isLoading}
                                    keyboardType="numeric"
                                    dense={false}
                                    onChangeText={onAmountSendChangeText}
                                    clearButtonMode="while-editing"
                                    value={amountSend}
                                    mode={InputMode.outlined}
                                    outlineColor={
                                        theme.colors.surface_surface_high
                                    }
                                    activeOutlineColor={
                                        theme.colors.surface_surface_high
                                    }
                                    selectionColor={appColors.neutral.black}
                                    cursorColor={appColors.neutral.black}
                                    outlineStyle={styles.inputAmountOutline}
                                    textColor={
                                        inputAmountError
                                            ? appColors.main.tokyoRed
                                            : theme.colors
                                                  .text_on_surface_text_high
                                    }
                                    style={[
                                        styles.inputAmountContainer,
                                        { ...theme.fonts.titleSmall },
                                    ]}
                                />
                                <View style={styles.currencyText}>
                                    <AppButton
                                        titleWithI18n={
                                            LanguageKey.common_text_max
                                        }
                                        textVariant={
                                            TextVariantKeys.titleMedium
                                        }
                                        textColor={appColors.main.tokyoRed}
                                        onPress={maxAction}
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.currencyText,
                                        appStyles.pR15,
                                    ]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.currency_bitcoin
                                        }
                                        variant={TextVariantKeys.titleMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                    />
                                </View>
                            </View>
                            {balanceCurrencyString ? (
                                <View style={[appStyles.pT10, appStyles.mh25]}>
                                    <AppText
                                        title={balanceCurrencyString}
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                    />
                                </View>
                            ) : null}
                            {inputAmountError ? (
                                <View style={[appStyles.pT10, appStyles.mh25]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_input_error
                                        }
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                </View>
                            ) : null}
                            {errorNetworkFeeHigh ? (
                                <View style={[appStyles.pT10, appStyles.mh25]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_input_error_2
                                        }
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                </View>
                            ) : null}
                            {showDustError ? (
                                <View style={[appStyles.pT10, appStyles.mh25]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_dust_error_title
                                        }
                                        variant={TextVariantKeys.bodyMLarge}
                                        textColor={
                                            theme.colors
                                                .label_surface_button_primary
                                        }
                                    />
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_dust_error_sub_title
                                        }
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_highest
                                        }
                                    />
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.send_dust_error_sub_title_2
                                        }
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_highest
                                        }
                                    />
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.newButton}>
                            {newUI ? (
                                <AppButtonSVG
                                    isLoading={isLoadingPushTransaction}
                                    disabled={disableContinue}
                                    onPress={createTransactionAction}
                                    titleWithI18n={
                                        LanguageKey.common_text_continue
                                    }
                                    textVariant={TextVariantKeys.titleSmall}
                                    textColor={appColors.neutral.white}
                                    SvgView={SvgView.button}
                                    buttonHeight={48}
                                />
                            ) : (
                                <AppButton
                                    isLoading={isLoadingPushTransaction}
                                    disabled={disableContinue}
                                    onPress={createTransactionAction}
                                    titleWithI18n={
                                        LanguageKey.common_text_continue
                                    }
                                    styles={styles.button}
                                    textVariant={TextVariantKeys.titleSmall}
                                    textColor={appColors.neutral.white}
                                />
                            )}
                        </View>
                    </View>
                </AppLoadingOpacity>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default TransferBitcoinComponent;
