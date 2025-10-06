import React from "react";
import {
  ImageBackground,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { withTheme } from "react-native-paper";
import AppButton from "src/components/common/AppButton";
import AppModal from "src/components/common/AppModal";
import AppScanQRCode from "src/components/common/AppScanQRCode";
import AppText from "src/components/common/AppText";
import appConstants from "src/core/constants/AppConstants";
import { Close2SvgIcon, WarnSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import useScreenWrapper from "./hook";
import ScreenWrapperProps from "./type";

const ScreenWrapper: React.FC<ScreenWrapperProps> = (props) => {
  const {
    children,
    scrollEnabled = false,
    bounces = false,
    paddingTop = false,
    paddingBottom = false,
    mainStyle = appStyles.flex1,
    subStyle = appStyles.flex1,
    theme,
    backgroundColor,
    backAction,
    enableHeader = false,
    headerTextVariant,
    headerTitle,
    headerTitleWithI18n,
    headerTextColor,
    backButtonColor,
    enableDismissKeyboard = false,
    backgroundImage,
    hiddenBackAction = false,
    onDismissKeyboard,
    iconRight,
    showScanQRCamera = false,
    maxFontSizeMultiplier = 1.5,
    enableWidthLimit = false,
    styleWidthLimitContainer,
    callBackWhenScanQR,
    onCloseScanQR,
    refreshControl,
    headerStyle,
    onMomentumScrollEnd,
  } = props;

  const {
    insets,
    showModalRequestCameraPermission,
    onShowModalRequestCameraPermission,
    openSettingsAction,
    dismissKeyboardWhenTappedOutsideOfInput,
    stylesWithTheme,
    colorArrowBack,
    colorTitleHeader,
    backActionDefault,
    closeShowModalRequestCameraPermission,
  } = useScreenWrapper({
    onDismissKeyboard,
    onCloseScanQR,
    headerTextColor,
    backButtonColor,
    showScanQRCamera,
  });

  const Header = (
    <View
      style={[
        appStyles.mh25,
        appStyles.justifyContentBetween,
        appStyles.flexRow,
        appStyles.alignItemsCenter,
        {
          height: appConstants.HEADER_HEIGHT,
        },
        headerStyle,
      ]}
    >
      <AppButton
        onPress={
          showScanQRCamera ? onCloseScanQR : (backAction ?? backActionDefault)
        }
        icon={
          <Close2SvgIcon
            style={stylesWithTheme.mlMinus20}
            color={theme.colors.text_on_surface_text_high}
          />
        }
        styles={stylesWithTheme.button}
      />

      {enableWidthLimit ? (
        <View style={styleWidthLimitContainer}>
          <AppText
            variant={headerTextVariant ?? TextVariantKeys.titleLarge}
            title={headerTitle ?? ""}
            titleWithI18n={headerTitleWithI18n}
            textColor={colorTitleHeader}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            numberOfLines={1}
          />
        </View>
      ) : (
        <AppText
          variant={headerTextVariant ?? TextVariantKeys.titleLarge}
          title={headerTitle ?? ""}
          titleWithI18n={headerTitleWithI18n}
          textColor={colorTitleHeader}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
        />
      )}
      {iconRight || <AppButton styles={stylesWithTheme.button} />}
    </View>
  );
  const Child = (
    <View
      style={[
        {
          paddingTop: paddingTop ? insets.top : 0,
          paddingBottom: paddingBottom ? insets.bottom : 0,
        },
        subStyle,
      ]}
    >
      {enableHeader ? Header : null}
      {scrollEnabled ? (
        <ScrollView
          bounces={bounces}
          refreshControl={refreshControl}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={[
            appStyles.fullWidth,
            {
              backgroundColor: backgroundColor ?? theme.colors.background,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={appStyles.flexGrow1}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground source={backgroundImage} style={appStyles.flex1}>
            <>{children}</>
          </ImageBackground>
        </ScrollView>
      ) : (
        <>{children}</>
      )}
    </View>
  );

  const HeaderAbsolute = (
    <View
      style={[
        stylesWithTheme.headerCamera,
        {
          top: insets.top,
        },
      ]}
    >
      {Header}
    </View>
  );
  const MainChild = (
    <View
      style={[
        mainStyle ?? stylesWithTheme.container,
        {
          backgroundColor: backgroundColor,
        },
      ]}
    >
      {backgroundImage ? (
        <ImageBackground source={backgroundImage} style={appStyles.flex1}>
          {Child}
        </ImageBackground>
      ) : (
        Child
      )}
      {showScanQRCamera && (
        <>
          <AppModal
            onTouchOutside={closeShowModalRequestCameraPermission}
            titleWithI18n={LanguageKey.scan_qr_sub_denied_title}
            subTitleWithI18n={LanguageKey.scan_qr_sub_denied_sub_title}
            visible={showModalRequestCameraPermission}
            onPress={closeShowModalRequestCameraPermission}
            buttonTitleWithI18n={LanguageKey.transaction_history_close}
            onPress2={openSettingsAction}
            twoOptions={true}
            buttonTitleWithI18n2={LanguageKey.common_open_settings}
            icon={<WarnSvgIcon />}
          />
          <AppScanQRCode
            callBackWhenScanQR={callBackWhenScanQR}
            isShowScanQR={showScanQRCamera}
            onCloseScanQR={onCloseScanQR}
            onShowModalRequestCameraPermission={
              onShowModalRequestCameraPermission
            }
          />
          {HeaderAbsolute}
        </>
      )}
    </View>
  );

  return enableDismissKeyboard ? (
    <TouchableWithoutFeedback onPress={dismissKeyboardWhenTappedOutsideOfInput}>
      {MainChild}
    </TouchableWithoutFeedback>
  ) : (
    MainChild
  );
};

export default withTheme(ScreenWrapper);
