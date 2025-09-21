import React from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import Canvas from 'react-native-canvas';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTImportContent } from '../../components';
import useNFTImport from './NFTImport.hook';
import useNFTImportStyles from './NFTImport.style';

const NFTImport: React.FC<RootNavigationType> = props => {
    const theme = useAppTheme();
    const {
        showScanQRCamera,
        contractAddress,
        idNFT,
        loading,
        canvasRef,
        setContractAddress,
        handleCopyToClipboard,
        setIdNFT,
        handleSubmitImport,
        onScanQR,
        validate,
        handleCallBackScanQR,
        handleBack,
        onCloseScanQr,
        newUI,
        insets,
    } = useNFTImport({ navigation: props.navigation });
    const NFTImportStyle = useNFTImportStyles(insets);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            paddingBottom={!newUI}
            headerTitleWithI18n={LanguageKey.nft_import_nft}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            enableDismissKeyboard
            onCloseScanQR={onCloseScanQr}
            showScanQRCamera={showScanQRCamera}
            callBackWhenScanQR={handleCallBackScanQR}
            backAction={handleBack}>
            <KeyboardAvoidingView
                behavior="padding"
                style={[NFTImportStyle.container]}>
                <NFTImportContent
                    handleCopyToClipboard={handleCopyToClipboard}
                    setContractAddress={setContractAddress}
                    contractAddress={contractAddress}
                    idNFT={idNFT}
                    onScanQR={onScanQR}
                    setIdNFT={setIdNFT}
                    usingWithEVM
                />
                <View style={NFTImportStyle.containerButton}>
                    {newUI ? (
                        <AppButtonSVG
                            onPress={handleSubmitImport}
                            titleWithI18n={LanguageKey.common_import}
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_brand}
                            styles={NFTImportStyle.button}
                            isLoading={loading}
                            disabled={!validate()}
                            SvgView={SvgView.button}
                            buttonHeight={48}
                        />
                    ) : (
                        <AppButton
                            onPress={handleSubmitImport}
                            titleWithI18n={LanguageKey.common_import}
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_brand}
                            styles={NFTImportStyle.button}
                            isLoading={loading}
                            disabled={!validate()}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>

            <View style={NFTImportStyle.hideCanvas}>
                <Canvas ref={canvasRef} />
            </View>
        </ScreenWrapper>
    );
};

export default NFTImport;
