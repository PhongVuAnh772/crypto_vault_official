import { useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import SvgView from 'src/components/SvgBox';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import NFTInformation from 'src/components/homeComponents/NFTInformation';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appColors from 'src/core/constants/AppColors';
import { DangerSvgIcon, SendDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import nftUtils from 'src/core/utils/nftUtils';
import walletUtils from 'src/core/utils/walletUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useNFTConfirmationSend from './NFTConfirmationSendNFT.hook';
import useStyle from './NFTConfirmationSendNFT.style';
import { NFTConfirmationSendType } from './NFTConfirmationSendNFT.type';

const NFTConfirmationSend: React.FC<RootNavigationType> = ({ navigation }) => {
    const { params } = useRoute<NFTConfirmationSendType>();
    const { detail, root } = params.data;
    const image = detail.image || detail.image_data || '';
    const imageUri = nftUtils.convertIpfsUrl(image);

    const {
        handleConfirm,
        isLoadingPage,
        gasFee,
        adminFee,
        handleConfirmSendNFTCallBack,
        showModalConfirmTransaction,
        isNotOwner,
        t,
        handleUnderstood,
        handleCloseConfirmation,
        theme,
        newUI,
        insets,
    } = useNFTConfirmationSend(
        {
            navigation,
        },
        params,
    );
    const NFTConfirmationSendStyle = useStyle(theme, insets);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            paddingBottom={!newUI}
            headerTitleWithI18n={LanguageKey.common_text_confirmation}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }>
            <View style={NFTConfirmationSendStyle.container}>
                <View
                    style={[
                        NFTConfirmationSendStyle.pH25,
                        NFTConfirmationSendStyle.flex1,
                    ]}>
                    <NFTInformation
                        networkImage={root.protocol.logo ?? ''}
                        networkName={root.protocol.name}
                        nftId={detail.nftId}
                        nftImage={imageUri}
                        nftName={detail.name}
                    />
                    <View style={NFTConfirmationSendStyle.flex1}>
                        <View
                            style={[
                                NFTConfirmationSendStyle.walletBox,
                                NFTConfirmationSendStyle.mt25,
                            ]}>
                            <View style={NFTConfirmationSendStyle.borderBox}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_from}
                                    variant={TextVariantKeys.bodyMMedium}
                                    styles={
                                        NFTConfirmationSendStyle.textAlignCenter
                                    }
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_lightest
                                    }
                                />
                            </View>
                            <AppText
                                titleWithI18n={walletUtils.getShortAddress(
                                    params.sender,
                                )}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                NFTConfirmationSendStyle.alignItemsCenter,
                                NFTConfirmationSendStyle.mv10,
                            ]}>
                            <SendDownSvgIcon />
                        </View>
                        <View style={[NFTConfirmationSendStyle.walletBox]}>
                            <View style={NFTConfirmationSendStyle.borderBox}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_to}
                                    variant={TextVariantKeys.bodyMMedium}
                                    styles={
                                        NFTConfirmationSendStyle.textAlignCenter
                                    }
                                    textColor={appColors.neutral.n500}
                                />
                            </View>
                            <AppText
                                titleWithI18n={walletUtils.getShortAddress(
                                    params.addressReceive,
                                )}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                NFTConfirmationSendStyle.flexRow,
                                NFTConfirmationSendStyle.justifyContentBetween,
                                NFTConfirmationSendStyle.mt30,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.nft_estimate_gas_fee}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={gasFee}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                NFTConfirmationSendStyle.flexRow,
                                NFTConfirmationSendStyle.justifyContentBetween,
                                NFTConfirmationSendStyle.mt30,
                            ]}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.send_service_fee_title
                                }
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={adminFee}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={
                                    NFTConfirmationSendStyle.textAlignCenter
                                }
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        {params.quantity && (
                            <View
                                style={[
                                    NFTConfirmationSendStyle.flexRow,
                                    NFTConfirmationSendStyle.justifyContentBetween,
                                    NFTConfirmationSendStyle.mt30,
                                ]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.project_detail_quantity
                                    }
                                    variant={TextVariantKeys.bodyMMedium}
                                    styles={
                                        NFTConfirmationSendStyle.textAlignCenter
                                    }
                                    textColor={appColors.neutral.n500}
                                />
                                <AppText
                                    title={params.quantity}
                                    variant={TextVariantKeys.bodyMMedium}
                                    styles={
                                        NFTConfirmationSendStyle.textAlignCenter
                                    }
                                    textColor={appColors.neutral.n800}
                                />
                            </View>
                        )}
                    </View>
                </View>
                <View style={NFTConfirmationSendStyle.buttonConfirm}>
                    {newUI ? (
                        <AppButtonSVG
                            onPress={handleConfirm}
                            titleWithI18n={LanguageKey.common_text_confirm}
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.white}
                            isLoading={isLoadingPage}
                            SvgView={SvgView.button}
                            buttonHeight={48}
                        />
                    ) : (
                        <AppButton
                            onPress={handleConfirm}
                            titleWithI18n={LanguageKey.common_text_confirm}
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.white}
                            styles={NFTConfirmationSendStyle.button}
                            isLoading={isLoadingPage}
                        />
                    )}
                </View>

                <AppModal
                    visible={isNotOwner}
                    titleWithI18n={LanguageKey.unable_to_make_transaction}
                    subTitle={t(LanguageKey.nft_no_owned)}
                    icon={<DangerSvgIcon />}
                    buttonTitleWithI18n={LanguageKey.common_understood}
                    onPress={handleUnderstood}
                />
            </View>
            <RequirePinCodeLayout
                visible={showModalConfirmTransaction}
                continueActionAfterPassPinCode={handleConfirmSendNFTCallBack}
                onClose={handleCloseConfirmation}
            />
        </ScreenWrapper>
    );
};

export default NFTConfirmationSend;
