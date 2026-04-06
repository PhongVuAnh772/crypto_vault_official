import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { ScreenWrapper } from 'src/components';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import appColors from 'src/core/constants/AppColors';
import { SwapSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import {
    ConFirmTransactionView,
    TonConnectView,
} from 'src/features/tonConnect/component';
import { useDAppBridge } from './hook/useDAppBridge';

const DAppBrowserScreen = () => {
    const {
        t,
        ref,
        injectedJavaScriptBeforeContentLoaded,
        bottomSheetConnectRef,
        infoDapp,
        tonAddressData,
        bottomSheetTransactionRef,
        visibleLoading,
        requirePinCode,
        webViewUrl,
        isCheckEmulate,
        isLoading,
        lisTransaction,
        insufficientBalance,
        isEnableDismissOnClose,
        showCommonErrorModal,
        titleAddressRequest,
        titleCurrentAddress,
        titleDApp,
        closeShowModal,
        showRequirePinCode,
        closeRequirePinCode,
        onMessage,
        onCloseModalTonConnect,
        confirmConnect,
        confirmTransaction,
        rejectTransaction,
        accountChange,
        setTitleDApp,
    } = useDAppBridge();
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const [canGoBack, setCanGoBack] = useState(false);
    const handleNavigationStateChange = useCallback((e: WebViewNavigation) => {
        const fullUrl = e.url;
        const mainUrl = new URL(fullUrl).origin;
        if (!mainUrl.includes(webViewUrl)) {
            setTitleDApp(mainUrl);
        }
        setCanGoBack(e.canGoBack);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoBackPress = useCallback(() => {
        ref.current?.goBack();
    }, [ref]);
    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            headerTitle={TonConnectUtils.getDomainUrl(titleDApp)}
            headerTextColor={theme.colors.text_on_surface_text_brand}
            enableHeader
            enableDismissKeyboard
            headerTextVariant={TextVariantKeys.titleLarge}
            hiddenBackAction={!canGoBack}
            backAction={canGoBack ? handleGoBackPress : undefined}>
            <WebView
                ref={ref}
                style={styles.container}
                source={{ uri: webViewUrl }}
                javaScriptCanOpenWindowsAutomatically
                androidLayerType="hardware"
                mixedContentMode="always"
                nestedScrollEnabled={true}
                decelerationRate="normal"
                hideKeyboardAccessoryView
                thirdPartyCookiesEnabled={true}
                forceDarkOn={false}
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                pullToRefreshEnabled={true}
                allowsBackForwardNavigationGestures={true}
                onMessage={onMessage}
                injectedJavaScriptBeforeContentLoaded={
                    injectedJavaScriptBeforeContentLoaded
                }
                onNavigationStateChange={handleNavigationStateChange}
            />
            <AppModal
                visible={showCommonErrorModal}
                titleWithI18n={LanguageKey.common_text_switch_wallet}
                twoOptions={true}
                buttonTitleWithI18n={LanguageKey.common_text_switch_action}
                textButtonSecondColor={appColors.main.tokyoRed}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                onPress={accountChange}
                onPress2={closeShowModal}
                footerView={
                    <View>
                        <AppText
                            styles={[
                                appStyles.textAlignCenter,
                                appStyles.mbt10,
                            ]}
                            titleWithI18n={t(
                                LanguageKey.common_text_switch_wallet_Dapp,
                                {
                                    current_wallet_address: titleCurrentAddress,
                                    wallet_address_request: titleAddressRequest,
                                },
                            )}
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
                                title={titleCurrentAddress}
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

                            <AppText
                                title={titleAddressRequest}
                                styles={appStyles.flex5}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        </View>
                    </View>
                }
            />
            <BottomSheetModalGorhom
                refModal={bottomSheetConnectRef}
                containerStyles={styles.containerBottomSheet}
                onDismiss={onCloseModalTonConnect}
                enableContentPanningGesture={!Utils.isAndroid}>
                <View style={styles.boxConnect}>
                    <TonConnectView
                        infoDapp={infoDapp}
                        tonAddressData={tonAddressData}
                        confirm={confirmConnect}
                    />
                </View>
            </BottomSheetModalGorhom>
            <BottomSheetModalGorhom
                refModal={bottomSheetTransactionRef}
                containerStyles={styles.containerBottomSheet}
                enableDismissOnClose={isEnableDismissOnClose}
                onDismiss={rejectTransaction}
                snapPoints={[insufficientBalance ? '30%' : '70%']}
                enableContentPanningGesture={!Utils.isAndroid}>
                <View style={styles.boxConnect}>
                    <ConFirmTransactionView
                        emulate={isCheckEmulate}
                        dataList={lisTransaction}
                        loading={!isLoading}
                        confirm={showRequirePinCode}
                        insufficientBalance={insufficientBalance}
                        reject={rejectTransaction}
                    />
                </View>
            </BottomSheetModalGorhom>
            <RequirePinCodeLayout
                visible={requirePinCode}
                onClose={closeRequirePinCode}
                continueActionAfterPassPinCode={confirmTransaction}
            />
            <LoadingScreen visible={visibleLoading} />
        </ScreenWrapper>
    );
};

export default DAppBrowserScreen;

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        containerBottomSheet: {
            backgroundColor: appColors.other.outline_lightest,
        },
        boxConnect: {
            ...appStyles.flex1,
        },
        buttonCancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
        },
        box: {
            ...appStyles.flex1,
        },
        view_switch_address: {
            ...appStyles.flexRow,
            ...appStyles.pd16,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n600,
            borderWidth: 0.6,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
            borderRadius: 6,
            width: '100%',
            ...appStyles.center,
        },
        opacityView: {
            opacity: 0,
        },
    });
