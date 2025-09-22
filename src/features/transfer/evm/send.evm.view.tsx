import React from 'react';
import { KeyboardAvoidingView, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import { AppLoadingOpacity } from 'src/components/common/AppLoadingOpacity';
import AppText from 'src/components/common/AppText';
import SendLoading from 'src/components/homeComponents/SendLoading/sendLoading.view';
import { TokenLabel } from 'src/components/homeComponents/TokenLabel';
import WalletAddressInput from 'src/components/homeComponents/WalletAddressInput';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SendMaximumAmountComponent from 'src/components/specific/SendMaximumAmountComponent';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { InfoCircleSvgIcon } from 'src/core/constants/AppIconsSvg';
import InputMode from 'src/core/enum/InputMode';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    BottomSheetContentConfirmation,
    GivePermissionSpendToken,
} from './send.evm.components';
import useSendEVM from './send.evm.hook';
import useStyles from './send.evm.style';

const SendTokenEVM: React.FC<RootNavigationType> = ({ navigation }) => {
    const theme = useAppTheme();

    const {
        handleCallBackScanQR,
        handleCopyToClipboard,
        onShowScanQRCamera,
        showScanQRCamera,
        handleOnClickContinue,
        isLoadingPage,
        tokenSelected,
        amountSend,
        error,
        handleSetMaxAmount,
        t,
        balanceShows,
        bottomSheetConfirmationRef,
        handleConfirmSend,
        recipientAddress,
        setRecipientAddress,
        amountShows,
        serviceFeeShows,
        walletShows,
        gasFeeShows,
        recipientAddressShow,
        logoShow,
        showAmountCurrency,
        showAmountCurrencyConfirm,
        sendMaximumShows,
        handleEnableButtonSend,
        onShowPinCode,
        handlePressSelectToken,
        bottomSheetApprove,
        handleOpenConfirmPinCode,
        handleCloseConfirmPinCode,
        handleCloseApprovePinCode,
        handleOpenApprovePinCode,
        gasFeeApproveShows,
        handleApproveToken,
        tokenAmountApproved,
        handleOnDismissBottomSheetApprove,
        handleSetAmountSend,
        totalAmount,
        onCloseBottomConfirm,
        onCloseBottomApprove,
        disableInput,
        onCloseScanQr,
        params,
        bottomSheetSendMaximum,
        onCloseBottomSheetSendMaximum,
        onOpenBottomSheetSendMaximum,
        isNative,
        newUI,
        insets,
    } = useSendEVM({
        navigation: navigation,
    });
    const styles = useStyles(theme, insets);
    return (
        <>
            <ScreenWrapper
                enableHeader
                paddingTop
                paddingBottom={!newUI}
                enableDismissKeyboard
                headerTitleWithI18n={LanguageKey.home_send_title}
                headerTextVariant={TextVariantKeys.titleLarge}
                headerTextColor={newUI ? appColors.neutral.white : undefined}
                backButtonColor={newUI ? appColors.neutral.white : undefined}
                backgroundColor={
                    newUI
                        ? appColors.main.tokyoRed
                        : theme.colors.surface_surface_default
                }
                onCloseScanQR={onCloseScanQr}
                showScanQRCamera={showScanQRCamera}
                callBackWhenScanQR={handleCallBackScanQR}>
                <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.container}>
                    <View style={[styles.flex1, styles.pH25]}>
                        <AppLoadingOpacity
                            secondView={<SendLoading />}
                            isLoading={isLoadingPage.screen}>
                            <>
                                <TokenLabel
                                    balance={balanceShows}
                                    data={tokenSelected}
                                    theme={theme}
                                    onPress={handlePressSelectToken}
                                    disable={!!params}
                                />
                                <View>
                                    <WalletAddressInput
                                        handleCopyToClipboard={
                                            handleCopyToClipboard
                                        }
                                        onChangeText={setRecipientAddress}
                                        scanQR={onShowScanQRCamera}
                                        value={recipientAddress}
                                        containerStyle={[styles.WalletInput]}
                                        labelStyle={styles.labelWalletAddress}
                                        inputAddressContainer={styles.input}
                                        labelPlaceholderTitle={t(
                                            LanguageKey.send_recipient_address_title,
                                        )}
                                        editable={!disableInput}
                                        showTo
                                        showLabel={false}
                                    />
                                </View>
                                {!!error.address && (
                                    <AppText
                                        title={error.address}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                )}
                                <View
                                    style={[
                                        styles.mt15,
                                        styles.mbt5,
                                        styles.flexRow,
                                        styles.justifyContentBetween,
                                        styles.alignItemsCenter,
                                    ]}>
                                    <View style={[styles.flex1]}>
                                        <AppText
                                            titleWithI18n={
                                                LanguageKey.send_enter_amount_title
                                            }
                                            variant={TextVariantKeys.bodyMSmall}
                                            textColor={appColors.neutral.n600}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.flex2,
                                            styles.flexRow,
                                            styles.justifyContentEnd,
                                            styles.alignItemsCenter,
                                        ]}
                                        onPress={onOpenBottomSheetSendMaximum}
                                        disabled={!isNative}>
                                        <View style={[styles.mr5]}>
                                            <AppText
                                                titleWithI18n={
                                                    LanguageKey.send_send_maximum_title
                                                }
                                                variant={
                                                    TextVariantKeys.bodyMSmall
                                                }
                                                textColor={
                                                    appColors.main.tokyoRed
                                                }
                                                styles={styles.textAlignRight}
                                            />
                                            <AppText
                                                title={sendMaximumShows}
                                                textColor={
                                                    appColors.main.tokyoRed
                                                }
                                                styles={styles.textAlignRight}
                                            />
                                        </View>
                                        {isNative && (
                                            <InfoCircleSvgIcon
                                                height={18}
                                                width={18}
                                                color={appColors.main.tokyoRed}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.flexRow]}>
                                    <TextInput
                                        readOnly={
                                            isLoadingPage.send || disableInput
                                        }
                                        keyboardType="numeric"
                                        dense={false}
                                        onChangeText={handleSetAmountSend}
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
                                        outlineStyle={styles.inputAmountOutline}
                                        numberOfLines={1}
                                        textColor={
                                            error?.amount
                                                ? appColors.main.tokyoRed
                                                : theme.colors
                                                      .text_on_surface_text_high
                                        }
                                        style={[
                                            styles.inputAmountContainer,
                                            { ...theme.fonts.titleSmall },
                                        ]}
                                        contentStyle={styles.contentStyleInput}
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
                                            onPress={handleSetMaxAmount}
                                        />
                                    </View>
                                    <View
                                        style={[
                                            styles.currencyText,
                                            styles.pR15,
                                        ]}>
                                        <AppText
                                            title={tokenSelected?.symbol || ''}
                                            variant={
                                                TextVariantKeys.titleMedium
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_high
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styles.mt5}>
                                    <AppText
                                        title={showAmountCurrency}
                                        variant={TextVariantKeys.titleMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                    />
                                </View>
                                {!!error.amount && (
                                    <AppText
                                        title={error.amount}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                )}
                            </>
                        </AppLoadingOpacity>
                    </View>
                    <View style={styles.newButton}>
                        {newUI ? (
                            <AppButtonSVG
                                onPress={handleOnClickContinue}
                                titleWithI18n={LanguageKey.common_text_continue}
                                textVariant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.white}
                                isLoading={isLoadingPage.send}
                                disabled={handleEnableButtonSend}
                                SvgView={SvgView.button}
                                buttonHeight={48}
                            />
                        ) : (
                            <AppButton
                                onPress={handleOnClickContinue}
                                titleWithI18n={LanguageKey.common_text_continue}
                                textVariant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.white}
                                styles={styles.button}
                                isLoading={isLoadingPage.send}
                                disabled={handleEnableButtonSend}
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>

                <BottomSheetModalGorhom
                    refModal={bottomSheetApprove}
                    snapPoints={['70']}
                    pressBehavior="none"
                    onDismiss={handleOnDismissBottomSheetApprove}
                    enablePanDownToClose={false}>
                    <GivePermissionSpendToken
                        disable={isLoadingPage.send}
                        estimateGas={gasFeeApproveShows}
                        handleConfirm={handleOpenApprovePinCode}
                        isLoading={isLoadingPage.send}
                        theme={theme}
                        sendAmount={tokenAmountApproved}
                        commissionAmount={serviceFeeShows}
                        tokenName={tokenSelected?.name || ''}
                        totalAmount={totalAmount}
                        onClose={onCloseBottomApprove}
                    />
                </BottomSheetModalGorhom>
                <BottomSheetModalGorhom
                    refModal={bottomSheetConfirmationRef}
                    pressBehavior="none"
                    enablePanDownToClose={false}>
                    <BottomSheetContentConfirmation
                        amount={amountShows}
                        amountFollowCurrency={showAmountCurrencyConfirm}
                        estimateGas={gasFeeShows}
                        logo={logoShow}
                        recipient={recipientAddressShow}
                        sender={walletShows}
                        serviceFee={serviceFeeShows}
                        theme={theme}
                        isLoading={isLoadingPage.send}
                        handleConfirm={handleOpenConfirmPinCode}
                        totalAmount={totalAmount}
                        onClose={onCloseBottomConfirm}
                        disable={isLoadingPage.send}
                    />
                </BottomSheetModalGorhom>
                <BottomSheetModalGorhom
                    refModal={bottomSheetSendMaximum}
                    snapPoints={['45']}>
                    <SendMaximumAmountComponent
                        onPress={onCloseBottomSheetSendMaximum}
                    />
                </BottomSheetModalGorhom>
            </ScreenWrapper>
            <RequirePinCodeLayout
                onClose={handleCloseConfirmPinCode}
                visible={onShowPinCode.confirm}
                continueActionAfterPassPinCode={handleConfirmSend}
            />
            <RequirePinCodeLayout
                onClose={handleCloseApprovePinCode}
                visible={onShowPinCode.approve}
                continueActionAfterPassPinCode={handleApproveToken}
            />
        </>
    );
};

export default SendTokenEVM;
