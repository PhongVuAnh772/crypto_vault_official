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
import walletConnectUtils from 'src/core/utils/walletConnectUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './sessionSignType.stye';
import useSessionSignTypeData from './useSessionSignTypeDataModal';

export default function SessionSignTypeDataModal() {
    const {
        theme,
        bottomSheetSignTypeRef,
        isEnableDismissOnClose,
        currentProtocol,
        request,
        insets,
        data,
        requirePinCode,
        visibleLoading,
        validateAccount,
        wallet,
        onApprove,
        onReject,
        openRequirePinCode,
        closeRequirePinCode,
        accountChange
    } = useSessionSignTypeData();
    const style = useStyles(theme, insets);
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
                            {request.params[0] && (
                                <AppText
                                    title={WalletUtils.getShortAddress(
                                        request.params[0],
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
                refModal={bottomSheetSignTypeRef}
                snapPoints={['54%']}
                onDismiss={onReject}
                enableDismissOnClose={isEnableDismissOnClose}
                enableContentPanningGesture={!Utils.isAndroid}>
                <View style={[style.view_connect]}>
                    <View
                        style={{
                            width: '100%',
                            alignItems: 'center',
                            marginVertical: 14,
                        }}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.wallet_connect_text_request_proof_from
                            }
                            variant={TextVariantKeys.titleLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </View>
                    <View style={appStyles.flex1}>
                        <View style={style.infoWallet}>
                            <View
                                style={[
                                    style.titleWithValueContainer,
                                    style.borderBottom,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.home_receive_title
                                    }
                                    variant={TextVariantKeys.bodyMLarge}
                                    textColor={
                                        theme.colors.text_on_surface_text_medium
                                    }
                                />
                                <AppText
                                    title={
                                        walletConnectUtils.feeAmount(
                                            data.message.consideration[0]
                                                .startAmount,
                                            18,
                                        ) +
                                        ' ' +
                                        currentProtocol?.symbol
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
                                    style.titleWithValueContainer,
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
                                        data.message.consideration[0].token,
                                    )}
                                />
                            </View>
                            <View
                                style={[
                                    style.titleWithValueContainer,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    title="identifierOrCriteria"
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                                <AppText
                                    textColor={appColors.neutral.black}
                                    variant={TextVariantKeys.bodyRSmall}
                                    title={
                                        '#' +
                                        data.message.offer[0]
                                            .identifierOrCriteria
                                    }
                                />
                            </View>
                            <View
                                style={[
                                    style.titleWithValueContainer,
                                    appStyles.pd10,
                                ]}>
                                <AppText
                                    title={'Token'}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                                <AppText
                                    textColor={appColors.neutral.black}
                                    variant={TextVariantKeys.bodyRSmall}
                                    title={WalletUtils.getShortAddress(
                                        data.message.offer[0].token,
                                    )}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[appStyles.flexRow, appStyles.mbt20]}>
                        <AppText
                            titleWithI18n={LanguageKey.common_text_message}
                            variant={TextVariantKeys.bodyMMedium}
                            numberOfLines={3}
                            textColor={theme.colors.text_on_surface_text_light}>
                            <AppText
                                title={':' + request.params[1]}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.black}
                            />
                        </AppText>
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
            <RequirePinCodeLayout
                visible={requirePinCode}
                onClose={closeRequirePinCode}
                continueActionAfterPassPinCode={onApprove}
            />
             <LoadingScreen visible={visibleLoading} />
        </View>
    );
}
