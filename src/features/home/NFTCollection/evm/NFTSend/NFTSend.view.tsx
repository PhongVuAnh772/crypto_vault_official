import React from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import NFTInformation from 'src/components/homeComponents/NFTInformation';
import WalletAddressInput from 'src/components/homeComponents/WalletAddressInput';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { DangerSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import appStyles from 'src/core/styles';
import nftUtils from 'src/core/utils/nftUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { SendNFTSkeletonLoading } from '../../components';
import { NFTGivePermission } from './NFTSend.component';
import useNFTSend from './NFTSend.hook';
import useNFTSendStyles from './NFTSend.style';

const NFTSend: React.FC<RootNavigationType> = props => {
    const {
        handleOnClickContinue,
        walletAddress,
        setWalletAddress,
        t,
        handleCopyToClipboard,
        showScanQRCamera,
        isLoadingPage,
        showModalGivePermission,
        handleConfirm,
        feeFollowCurrency,
        handleCallBackWhenCompleted,
        showModalConfirmTransaction,
        gasEstimate,
        handleCallBackScanQR,
        onShowScanQRCamera,
        onCloseScanQr,
        error,
        nftData,
        handleUnderstood,
        isNotOwner,
        isLoadingSkeleton,
        quantityInputRef,
        onSubmitWalletAddress,
        quantity,
        setQuantity,
        disableButton,
        insets,
        newUI,
        closeRequirePinCode,
    } = useNFTSend({
        navigation: props.navigation,
    });

    const { detail, root } = nftData;
    const image = detail.image || detail.image_data || '';
    const imageUri = nftUtils.convertIpfsUrl(image);
    const isHasQuantity = detail.tokenStandard === NFTTokenStandard.ERC1155;
    const NFTSendStyle = useNFTSendStyles(insets);
    return (
        <>
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
                    newUI ? appColors.main.tokyoRed : appColors.neutral.n100
                }
                onCloseScanQR={onCloseScanQr}
                showScanQRCamera={showScanQRCamera}
                callBackWhenScanQR={handleCallBackScanQR}>
                <KeyboardAvoidingView
                    behavior="padding"
                    style={[NFTSendStyle.flex1]}>
                    <View
                        style={[
                            NFTSendStyle.flex1,
                            { backgroundColor: appColors.neutral.n100 },
                        ]}>
                        {isLoadingSkeleton ? (
                            <SendNFTSkeletonLoading
                                isHasQuantity={isHasQuantity}
                            />
                        ) : (
                            <View
                                style={[NFTSendStyle.pT15, NFTSendStyle.flex1]}>
                                <View
                                    style={[
                                        NFTSendStyle.flex1,
                                        NFTSendStyle.pH25,
                                    ]}>
                                    <NFTInformation
                                        networkImage={root.protocol.logo ?? ''}
                                        networkName={root.protocol.name}
                                        nftId={detail.nftId ?? 0}
                                        nftImage={imageUri}
                                        nftName={detail.name ?? ''}
                                        quantity={
                                            detail.quantity?.toString() || ''
                                        }
                                    />
                                    <View style={NFTSendStyle.mt10}>
                                        <WalletAddressInput
                                            handleCopyToClipboard={
                                                handleCopyToClipboard
                                            }
                                            onChangeText={setWalletAddress}
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
                                            borderColor={
                                                appColors.neutral.white
                                            }
                                            labelPlaceholderTitle={t(
                                                LanguageKey.wallet_address_title,
                                            )}
                                            editable={!error}
                                            onSubmit={onSubmitWalletAddress}
                                        />
                                    </View>
                                    {isHasQuantity && (
                                        <View style={NFTSendStyle.mt15}>
                                            <AppTextInput
                                                refInput={quantityInputRef}
                                                required
                                                labelName={t(
                                                    LanguageKey.project_detail_quantity,
                                                )}
                                                styleTextInput={
                                                    NFTSendStyle.inputQuantity
                                                }
                                                placeholder={t(
                                                    LanguageKey.enter_quantity,
                                                )}
                                                keyboardType="number-pad"
                                                value={quantity}
                                                onChangeText={setQuantity}
                                            />
                                        </View>
                                    )}
                                    <View style={NFTSendStyle.mt10}>
                                        {!!error && (
                                            <AppText
                                                title={error}
                                                textColor={
                                                    appColors.main.tokyoRed
                                                }
                                            />
                                        )}
                                    </View>
                                </View>
                                <View
                                    style={[
                                        NFTSendStyle.pH25,
                                        appStyles.pT15,
                                        NFTSendStyle.buttonContinue,
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
                                            isLoading={isLoadingPage}
                                            disabled={disableButton}
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
                                            isLoading={isLoadingPage}
                                            disabled={disableButton}
                                        />
                                    )}
                                </View>
                                <BottomSheetModalGorhom
                                    refModal={showModalGivePermission}
                                    snapPoints={['55%']}>
                                    <NFTGivePermission
                                        feeFollowCurrency={feeFollowCurrency()}
                                        gasEstimate={gasEstimate}
                                        handleConfirm={handleConfirm}
                                        isLoading={isLoadingPage}
                                        nftData={nftData}
                                    />
                                </BottomSheetModalGorhom>
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
            <RequirePinCodeLayout
                visible={showModalConfirmTransaction}
                continueActionAfterPassPinCode={handleCallBackWhenCompleted}
                onClose={closeRequirePinCode}
            />
        </>
    );
};

export default NFTSend;
