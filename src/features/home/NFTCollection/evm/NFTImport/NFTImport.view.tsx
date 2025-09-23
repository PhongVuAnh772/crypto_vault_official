import React from "react";
import { KeyboardAvoidingView, View } from "react-native";
import Canvas from "react-native-canvas";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { NFTImportContent } from "../../components";
import useNFTImport from "./NFTImport.hook";
import useNFTImportStyles from "./NFTImport.style";

const NFTImport: React.FC<RootNavigationType> = (props) => {
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
    insets,
  } = useNFTImport({ navigation: props.navigation });
  const NFTImportStyle = useNFTImportStyles(insets);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      headerTitleWithI18n={LanguageKey.nft_import_nft}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
      enableDismissKeyboard
      onCloseScanQR={onCloseScanQr}
      showScanQRCamera={showScanQRCamera}
      callBackWhenScanQR={handleCallBackScanQR}
      backAction={handleBack}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={[NFTImportStyle.container]}
      >
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
          <AppButton
            onPress={handleSubmitImport}
            titleWithI18n={LanguageKey.common_import}
            textVariant={TextVariantKeys.bodyMMedium}
            textColor={theme.colors.text_on_surface_text_brand}
            styles={NFTImportStyle.button}
            isLoading={loading}
            disabled={!validate()}
          />
        </View>
      </KeyboardAvoidingView>

      <View style={NFTImportStyle.hideCanvas}>
        <Canvas ref={canvasRef} />
      </View>
    </ScreenWrapper>
  );
};

export default NFTImport;
