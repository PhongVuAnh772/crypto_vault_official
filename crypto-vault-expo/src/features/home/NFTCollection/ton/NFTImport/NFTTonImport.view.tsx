import React from "react";
import { KeyboardAvoidingView, View } from "react-native";
import Canvas from "react-native-canvas";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppModal from "src/components/common/AppModal";
import { DangerSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { NFTImportContent } from "../../components";
import useNFTImport from "./NFTTonImport.hook";
import useStyles from "./NFTTonImport.style";

const NFTTonImport: React.FC<RootNavigationType> = (props) => {
  const theme = useAppTheme();
  const {
    showScanQRCamera,
    contractAddress,
    loading,
    canvasRef,
    setContractAddress,
    handleCopyToClipboard,
    handleSubmitImport,
    onScanQR,
    validate,
    handleCallBackScanQR,
    handleBack,
    burntNFTModal,
    insets,
    closeBurntWarningModal,
    onCloseScanQr,
  } = useNFTImport({ navigation: props.navigation });
  const NFTImportStyle = useStyles(theme, insets);
  return (
    <>
      <ScreenWrapper
        enableHeader
        paddingTop
        headerTitleWithI18n={LanguageKey.nft_import_nft}
        headerTextVariant={TextVariantKeys.titleLarge}
        backgroundColor={theme.colors.surface_surface_default}
        enableDismissKeyboard
        showScanQRCamera={showScanQRCamera}
        callBackWhenScanQR={handleCallBackScanQR}
        onCloseScanQR={onCloseScanQr}
        backAction={handleBack}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={NFTImportStyle.container}
        >
          <NFTImportContent
            handleCopyToClipboard={handleCopyToClipboard}
            setContractAddress={setContractAddress}
            contractAddress={contractAddress}
            onScanQR={onScanQR}
          />
          <View style={NFTImportStyle.viewButton}>
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
      <AppModal
        titleWithI18n={LanguageKey.nft_burned_title}
        subTitleWithI18n={LanguageKey.nft_burned_description}
        visible={burntNFTModal}
        onPress={closeBurntWarningModal}
        buttonTitleWithI18n={LanguageKey.common_close}
        textButtonSecondColor={theme.colors.text_on_surface_text_brand_2}
        icon={<DangerSvgIcon />}
        buttonFirstContainerStyle={NFTImportStyle.button}
        buttonSecondContainerStyle={NFTImportStyle.button}
      />
    </>
  );
};

export default NFTTonImport;
