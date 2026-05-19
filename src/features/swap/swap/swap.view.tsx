import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SendMaximumAmountComponent from 'src/components/specific/SendMaximumAmountComponent';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { SwapDynamicSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    CurrenciesBottomSheet,
    LoadingSwapView,
    MinimalExchangeAmountView,
    ProtocolListBottomSheet,
    RatePreview,
    SwapBox,
    SwapConfirmationBottomSheet,
    WalletBottomSheet,
} from '../components';
import RewardedAdButton from 'src/features/ads/components/RewardedAdButton';
import useSwap from './swap.hook';
import { SwapSelector } from './swap.types';

const SwapView: React.FC<RootNavigationType> = ({ navigation }) => {
    const inset = useAppSafeAreaInsets();
    const { t } = useTranslation();
    const {
        refModal,
        currencies,
        onShowModalProtocol,
        onCloseModalProtocol,
        protocolList,
        onPressProtocol,
        youGetProtocol,
        youSendProtocol,
        protocolSelectedId,
        listOfCurrencies,
        onShowCurrency,
        onCloseCurrency,
        refCurrencies,
        from,
        onChangeAmountSend,
        loading,
        showMinimalExchangeAmount,
        disableButton,
        currencySelected,
        onPressCurrency,
        onChangeSearchCrypto,
        youSendCurrency,
        youGetCurrency,
        onClickMax,
        refSwapConfirmation,
        onShowSwapConfirmation,
        onCloseSwapConfirmation,
        onConfirmSwap,
        onShowModalWalletManagement,
        onCloseModalWalletManagement,
        refWalletManagement,
        listWalletByType,
        onSelectWallet,
        walletManagement,
        currentWalletSelectedId,
        refSendMaximum,
        onCloseSendMaximumBottomSheet,
        onShowSendMaximumBottomSheet,
    } = useSwap({ navigation });
    const activeBenefit = null;
    const handleAdFinished = () => undefined;

    return (
        <>
            {loading.init ? (
                <LoadingSwapView />
            ) : (
                <Animated.View
                    exiting={FadeIn.duration(500)}
                    style={appStyles.flex1}>
                    <KeyboardAvoidingView
                        behavior="padding"
                        style={appStyles.flex1}>
                        <ScrollView
                            contentContainerStyle={[
                                appStyles.flex1,
                                appStyles.pH25,
                                appStyles.pT10,
                            ]}>
                            <SwapBox
                                title={LanguageKey.common_text_from}
                                onPressProtocol={() =>
                                    onShowModalProtocol(SwapSelector.YouSend)
                                }
                                logoProtocol={youSendProtocol?.logo ?? ''}
                                protocolName={youSendProtocol?.symbol ?? ''}
                                tokenName={
                                    currencies.youSendCurrency?.ticker ?? ''
                                }
                                tokenLogo={
                                    currencies.youSendCurrency?.image ?? ''
                                }
                                balanceText={
                                    +from.balanceFormattedYouSend > 0
                                        ? LanguageKey.swap_balance
                                        : LanguageKey.swap_no_balance
                                }
                                currencyText={youSendCurrency ?? ''}
                                onChangeText={onChangeAmountSend}
                                value={from.amountYouSend}
                                disabledInput={false}
                                onPressToken={() =>
                                    onShowCurrency(SwapSelector.YouSend)
                                }
                                i18nParamsBalance={{
                                    balance:
                                        commonUtils.formattedBalanceCurrency(
                                            +from.balanceFormattedYouSend,
                                        ),
                                    symbol:
                                        currencies.youSendCurrency?.ticker.toUpperCase() ??
                                        '',
                                }}
                                disableSendMax={false}
                                onPressSendMax={onClickMax}
                                walletName={
                                    walletManagement.fromWallet?.name ?? ''
                                }
                                onShowWalletManagement={() =>
                                    onShowModalWalletManagement(
                                        SwapSelector.YouSend,
                                    )
                                }
                                onShowBalanceInfo={onShowSendMaximumBottomSheet}
                                isShowBalanceInfo={
                                    +from.balanceFormattedYouSend > 0
                                }
                            />

                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.pT5,
                                ]}>
                                <SwapDynamicSvgIcon
                                    width={38}
                                    height={38}
                                    color={appColors.neutral.white}
                                />
                            </View>
                            <SwapBox
                                title={LanguageKey.common_text_to}
                                onPressProtocol={() =>
                                    onShowModalProtocol(SwapSelector.YouGet)
                                }
                                logoProtocol={youGetProtocol?.logo ?? ''}
                                protocolName={youGetProtocol?.symbol ?? ''}
                                tokenName={
                                    currencies.youGetCurrency?.ticker ?? ''
                                }
                                tokenLogo={
                                    currencies.youGetCurrency?.image ?? ''
                                }
                                balanceText={
                                    +from.balanceFormattedYouGet > 0
                                        ? LanguageKey.swap_balance
                                        : LanguageKey.swap_no_balance
                                }
                                currencyText={youGetCurrency ?? ''}
                                value={from.amountYouGet}
                                disabledInput={true}
                                onPressToken={() =>
                                    onShowCurrency(SwapSelector.YouGet)
                                }
                                i18nParamsBalance={{
                                    balance:
                                        commonUtils.formattedBalanceCurrency(
                                            +from.balanceFormattedYouGet,
                                        ),
                                    symbol:
                                        currencies.youGetCurrency?.ticker.toUpperCase() ??
                                        '',
                                }}
                                walletName={
                                    walletManagement.toWallet?.name ?? ''
                                }
                                onShowWalletManagement={() =>
                                    onShowModalWalletManagement(
                                        SwapSelector.YouGet,
                                    )
                                }
                            />
                            <RewardedAdButton 
                                onAdFinished={handleAdFinished} 
                                hasBenefit={!!activeBenefit}
                            />
                            <RatePreview rate={from.rate} />

                            {showMinimalExchangeAmount && (
                                <MinimalExchangeAmountView
                                    minimum={from.minimalExchangeAmount}
                                    symbol={
                                        currencies.youSendCurrency?.ticker.toUpperCase() ??
                                        ''
                                    }
                                />
                            )}
                            {from.errorMessage && (
                                <AppText
                                    titleWithI18n={from.errorMessage}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={appColors.neutral.white}
                                    styles={[
                                        appStyles.mt10,
                                        appStyles.textAlignCenter,
                                    ]}
                                />
                            )}
                        </ScrollView>
                        <View
                            style={[
                                { paddingBottom: inset.bottom },
                                appStyles.backgroundWhite,
                                appStyles.pH25,
                                appStyles.pT10,
                            ]}>
                            <AppButtonSVG
                                onPress={onShowSwapConfirmation}
                                titleWithI18n={LanguageKey.common_text_continue}
                                textVariant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.white}
                                backgroundColor={appColors.main.tokyoRed}
                                SvgView={SvgView.button}
                                buttonHeight={48}
                                isLoading={
                                    loading.buttonLoading ||
                                    loading.youGetBalance ||
                                    loading.youSendBalance
                                }
                                disabled={disableButton}
                            />
                        </View>
                    </KeyboardAvoidingView>
                    <ProtocolListBottomSheet
                        refModal={refModal}
                        handlePressProtocol={onPressProtocol}
                        onCloseModalProtocol={onCloseModalProtocol}
                        protocolList={protocolList}
                        selectedProtocolId={protocolSelectedId ?? ''}
                    />
                    <CurrenciesBottomSheet
                        refModal={refCurrencies}
                        currencies={listOfCurrencies}
                        currencySelected={currencySelected}
                        onClose={onCloseCurrency}
                        onPressCurrency={onPressCurrency}
                        searchCrypto={from.searchCrypto}
                        onChangeSearchCrypto={onChangeSearchCrypto}
                    />
                    <SwapConfirmationBottomSheet
                        refModal={refSwapConfirmation}
                        onCloseModal={onCloseSwapConfirmation}
                        youSend={{
                            amount: `${from.amountYouSend} ${currencies.youSendCurrency?.ticker.toUpperCase() ?? ''}`,
                            amountFollowCurrency: youSendCurrency ?? '',
                            logo: currencies.youSendCurrency?.image ?? '',
                            walletAddress:
                                walletManagement?.fromWallet?.address ?? '',
                        }}
                        youGet={{
                            amount: `${from.amountYouGet} ${currencies.youGetCurrency?.ticker.toUpperCase() ?? ''}`,
                            amountFollowCurrency: youGetCurrency ?? '',
                            logo: currencies.youGetCurrency?.image ?? '',
                            walletAddress:
                                walletManagement?.toWallet?.address ?? '',
                        }}
                        forecast={t(LanguageKey.swap_forecast_time, {
                            time: from.forecast,
                        })}
                        networkFee={from.estimateNetworkFee}
                        totalAmount={from.totalAmount}
                        onConfirm={onConfirmSwap}
                        isLoading={loading.buttonLoading}
                    />
                    <WalletBottomSheet
                        walletList={listWalletByType}
                        onClose={onCloseModalWalletManagement}
                        refModal={refWalletManagement}
                        walletListId={currentWalletSelectedId ?? ''}
                        handlePressWallet={onSelectWallet}
                    />
                    <BottomSheetModalGorhom
                        refModal={refSendMaximum}
                        snapPoints={['45']}>
                        <SendMaximumAmountComponent
                            onPress={onCloseSendMaximumBottomSheet}
                            title={LanguageKey.common_swap_available_amount}
                            subTitle={LanguageKey.swap_maximum_sub_title}
                        />
                    </BottomSheetModalGorhom>
                </Animated.View>
            )}
        </>
    );
};

export default SwapView;
