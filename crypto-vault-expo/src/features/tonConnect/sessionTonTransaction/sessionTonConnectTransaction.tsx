import { Address } from '@ton/core';
import React from 'react';
import { View } from 'react-native';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import appColors from 'src/core/constants/AppColors';
import { SwapSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import WalletUtils from 'src/core/utils/walletUtils';
import { ConFirmTransactionView } from '../component';
import useStyles from './tonConnectTransaction.style';
import useTonConnectTransaction from './useTonConnectTransaction';

export default function SessionTonConnectTransaction() {
    const {
        lisTransaction,
        validateAccount,
        visibleLoading,
        theme,
        requirePinCode,
        isCheckEmulate,
        continueActionAfterPassPinCode,
        reject,
        accountChange,
        showRequirePinCode,
        closeRequirePinCode,
        showBottomSheetTransaction,
        loading,
        isEnableDismissOnClose,
        tonAddressData,
        params,
        insufficientBalance,
    } = useTonConnectTransaction();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme, insets);

    return (
        <View style={appStyles.flex1}>
            <View style={[style.box]}>
                <BottomSheetModalGorhom
                    refModal={showBottomSheetTransaction}
                    onDismiss={reject}
                    enableDismissOnClose={isEnableDismissOnClose}
                    containerStyles={
                        validateAccount ? style.opacityView : undefined
                    }
                    snapPoints={[insufficientBalance ? '30%' : '70']}>
                    <View
                        style={[
                            style.box,
                            validateAccount ? style.opacityView : undefined,
                        ]}>
                        <ConFirmTransactionView
                            emulate={isCheckEmulate}
                            dataList={lisTransaction}
                            loading={loading}
                            confirm={showRequirePinCode}
                            insufficientBalance={insufficientBalance}
                            reject={reject}
                        />
                    </View>
                </BottomSheetModalGorhom>
            </View>

            <AppModal
                visible={validateAccount}
                titleWithI18n={LanguageKey.common_text_switch_wallet}
                twoOptions={true}
                buttonTitleWithI18n={LanguageKey.common_text_switch_action}
                textButtonSecondColor={appColors.main.tokyoRed}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                onPress={accountChange}
                onPress2={reject}
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
                        <View style={style.view_switch_address}>
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
                                    tonAddressData?.address,
                                    8,
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
                                style.view_switch_address,
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
                            {params?.from && (
                                <AppText
                                    title={WalletUtils.getShortAddress(
                                        Address.parse(params.from).toString({
                                            testOnly: false,
                                            bounceable: false,
                                        }),
                                        8,
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
            <LoadingScreen visible={visibleLoading} />
            <RequirePinCodeLayout
                visible={requirePinCode}
                onClose={closeRequirePinCode}
                continueActionAfterPassPinCode={continueActionAfterPassPinCode}
            />
        </View>
    );
}
