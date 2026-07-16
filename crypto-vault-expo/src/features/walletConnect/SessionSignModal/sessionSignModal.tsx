import React from 'react';
import { View } from 'react-native';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { InfoCircleSvgIcon, WalletLogoSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { hexToAscii } from 'src/core/utils/walletConnectUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './sessionSign.style';
import useSessionSign from './useSessionSign';

export default function SessionSignModal() {
    const {
        theme,
        verifyContext,
        request,
        insets,
        bottomSheetSignRef,
        isEnableDismissOnClose,
        visibleLoading,
        wallet,
        requirePinCode,
        closeRequirePinCode,
        openRequirePinCode,
        onApprove,
        onReject,
    } = useSessionSign();
    const styles = useStyles(theme, insets);
    const getDomainUrl = (url?: string) => {
        const domain = url?.replace(/^https?:\/\//, '') ?? '';
        return domain;
    };
    return (
        <View style={appStyles.flex1}>
            <BottomSheetModalGorhom
                refModal={bottomSheetSignRef}
                onDismiss={onReject}
                enableDismissOnClose={isEnableDismissOnClose}
                enableContentPanningGesture={!Utils.isAndroid}>
                <View style={styles.container}>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.wallet_connect_text_request_proof_from
                            }
                            variant={TextVariantKeys.titleLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                        <AppText
                            title={getDomainUrl(verifyContext.verified.origin)}
                            variant={TextVariantKeys.titleLarge}
                            textColor={appColors.main.tokyoRed}
                        />
                    </View>
                    <View style={[appStyles.flex1,appStyles.mt10]}>
                        <AppText
                            title={hexToAscii(request.params[0])}
                            styles={appStyles.textAlignCenter}
                            variant={TextVariantKeys.bodyRMedium}
                        />
                    </View>
                    <View style={[ appStyles.pT15]}>
                        <View style={styles.infoWallet}>
                            <View style={styles.accountIcon}>
                                <WalletLogoSvgIcon
                                    color={wallet?.avtColor}
                                />
                            </View>
                            <View>
                                <AppText
                                    title={wallet?.name}
                                    variant={TextVariantKeys.titleSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                                <AppText
                                    title={WalletUtils.getShortAddress(
                                        wallet?.address,
                                    )}
                                    variant={TextVariantKeys.bodyRSmall}
                                    textColor={appColors.neutral.black}
                                    styles={appStyles.mt5}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.warning}>
                        <InfoCircleSvgIcon
                            width={32}
                            height={32}
                            color={appColors.functional.yellow}
                        />
                        <AppText
                            titleWithI18n={
                                LanguageKey.wallet_connect_text_warning_sign
                            }
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={theme.colors.text_on_surface_text_medium}
                            styles={appStyles.ml12}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <AppButtonSVG
                        titleWithI18n={LanguageKey.common_text_confirm }
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
