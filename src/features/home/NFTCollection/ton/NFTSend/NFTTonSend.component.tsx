import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import SvgView from 'src/components/SvgBox';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import NFTInformation from 'src/components/homeComponents/NFTInformation';
import WalletAddressInput from 'src/components/homeComponents/WalletAddressInput';
import appColors from 'src/core/constants/AppColors';
import { DangerSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { SendNFTSkeletonLoading } from '../../components';
import useStyle from './NFTTonSend.style';
import { NFTSendTonProps } from './NFTTonSend.type';

const NFTSendTon: React.FC<NFTSendTonProps> = ({
    handleBack,
    showScanQRCamera,
    isLoadingSkeleton,
    root,
    detail,
    handleCopyToClipboard,
    error,
    setWalletAddress,
    handleOnClickContinue,
    onSubmitWalletAddress,
    onShowScanQRCamera,
    walletAddress,
    handleCallBackScanQR,
    isNotOwner,
    handleUnderstood,
    requirePinCode,
    closeRequirePinCode,
    isLoadingPage,
    adminFee,
    networkFee,
    currentProtocol,
    errorBalance,
    errorBalanceCover,
    onCloseScanQr,
    hidingErrorBalance,
}) => {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const lastPreview =
        detail.nftDetailAll.previews?.[detail.nftDetailAll.previews.length - 1]
            ?.url;
    const insets = useAppSafeAreaInsets();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const NFTSendStyle = useStyle(insets, theme);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            paddingBottom={!newUI}
            enableDismissKeyboard
            headerTitleWithI18n={LanguageKey.nft_send}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            backAction={handleBack}
            onCloseScanQR={onCloseScanQr}
            callBackWhenScanQR={handleCallBackScanQR}
            showScanQRCamera={showScanQRCamera}>
            <KeyboardAvoidingView
                behavior="padding"
                style={[NFTSendStyle.flex1]}>
                <View
                    style={[
                        NFTSendStyle.flex1,
                        {
                            backgroundColor:
                                theme.colors.surface_surface_default,
                        },
                    ]}>
                    {isLoadingSkeleton ? (
                        <SendNFTSkeletonLoading isHasQuantity={false} />
                    ) : (
                        <View style={[NFTSendStyle.pT15, NFTSendStyle.flex1]}>
                            <View
                                style={[NFTSendStyle.flex1, NFTSendStyle.pH25]}>
                                <NFTInformation
                                    networkImage={root.protocol.logo ?? ''}
                                    networkName={root.protocol.name}
                                    nftId={detail.nftDetailAll.index ?? 0}
                                    nftImage={
                                        lastPreview ?? appImages.NFTDefault
                                    }
                                    nftName={
                                        detail.nftDetailAll.metadata?.name ??
                                        t(LanguageKey.common_unnamed_nft)
                                    }
                                    quantity={detail.quantity?.toString() ?? ''}
                                />
                                <View style={NFTSendStyle.mt10}>
                                    <WalletAddressInput
                                        handleCopyToClipboard={() => {
                                            handleCopyToClipboard();
                                            hidingErrorBalance();
                                        }}
                                        onChangeText={(text: string) => {
                                            setWalletAddress(text);
                                            hidingErrorBalance();
                                        }}
                                        scanQR={onShowScanQRCamera}
                                        value={walletAddress}
                                        showTo
                                        containerStyle={[
                                            NFTSendStyle.WalletInput,
                                        ]}
                                        labelStyle={
                                            NFTSendStyle.labelWalletAddress
                                        }
                                        inputAddressContainer={
                                            NFTSendStyle.input
                                        }
                                        borderColor={appColors.neutral.white}
                                        labelPlaceholderTitle={t(
                                            LanguageKey.wallet_address_title,
                                        )}
                                        editable={!error}
                                        onSubmit={onSubmitWalletAddress}
                                    />
                                </View>
                                {errorBalanceCover && (
                                    <AppText
                                        titleWithI18n={t(
                                            LanguageKey.ton_not_enough_amount_to_cover_gas_fee,
                                            {
                                                amount: currentProtocol
                                                    ? currentProtocol.nftTransferFee
                                                    : 0,
                                                coin_name:
                                                    currentProtocol?.name,
                                            },
                                        )}
                                        variant={TextVariantKeys.bodyMSmall}
                                        styles={appStyles.mt10}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                )}

                                {errorBalance && (
                                    <AppText
                                        titleWithI18n={t(
                                            LanguageKey.ton_not_enough_amount_to_cover_gas_fee,
                                            {
                                                amount: commonUtils.formattedBalanceCurrency(
                                                    networkFee,
                                                ),
                                                coin_name:
                                                    currentProtocol?.name,
                                            },
                                        )}
                                        variant={TextVariantKeys.bodyMSmall}
                                        styles={appStyles.mt10}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                )}

                                <View style={NFTSendStyle.mt10}>
                                    {!!error && (
                                        <AppText
                                            title={error}
                                            textColor={appColors.main.tokyoRed}
                                        />
                                    )}
                                </View>
                            </View>
                            <View
                                style={[
                                    appStyles.pH25,
                                    appStyles.pT15,
                                    NFTSendStyle.containerButton,
                                ]}>
                                {newUI ? (
                                    <AppButtonSVG
                                        onPress={handleOnClickContinue}
                                        titleWithI18n={
                                            LanguageKey.common_text_continue
                                        }
                                        textVariant={
                                            TextVariantKeys.bodyMMedium
                                        }
                                        textColor={appColors.neutral.white}
                                        styles={NFTSendStyle.button}
                                        disabled={!walletAddress || !!error}
                                        isLoading={isLoadingPage}
                                        SvgView={SvgView.button}
                                        buttonHeight={48}
                                    />
                                ) : (
                                    <AppButton
                                        onPress={handleOnClickContinue}
                                        titleWithI18n={
                                            LanguageKey.common_text_continue
                                        }
                                        textVariant={
                                            TextVariantKeys.bodyMMedium
                                        }
                                        textColor={appColors.neutral.white}
                                        styles={NFTSendStyle.button}
                                        disabled={!walletAddress || !!error}
                                        isLoading={isLoadingPage}
                                    />
                                )}
                            </View>

                            <AppModal
                                visible={isNotOwner}
                                titleWithI18n={
                                    LanguageKey.unable_to_make_transaction
                                }
                                subTitle={t(LanguageKey.nft_no_owned)}
                                icon={<DangerSvgIcon />}
                                buttonTitleWithI18n={
                                    LanguageKey.common_understood
                                }
                                onPress={handleUnderstood}
                            />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export { NFTSendTon };
