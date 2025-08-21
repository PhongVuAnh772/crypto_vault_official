import AppText from "components/AppText";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import TextVariantKeys from "src/core/constants/TextVariantKeys";
import appStyles from "src/core/styles";
import PinCodeInput from "src/features/components/PinCode";
import { AppThemeType } from "src/type/ThemeType";
import Utils from "src/utils/commonUtils";
import CountdownTimer from "./CountdownTimer";
import useRequirePinCode from "./requirePinCode.hook";
import appColors from "src/core/constants/AppColors";

type RequirePinCodeLayoutType = {
  headerTitle?: string;
  subVisible?: boolean;
  visible?: boolean;
  onClose?: () => void;
  continueActionAfterPassPinCode?: (pinCode: string) => void;
  isWebviewShowing?: boolean;
  isMainRequirePinCode?: boolean;
  disableFaceId?: boolean;
};

const RequirePinCodeLayout: React.FC<RequirePinCodeLayoutType> = ({
  headerTitle,
  subVisible = true,
  visible,
  onClose,
  continueActionAfterPassPinCode,
  isWebviewShowing = false,
  isMainRequirePinCode = false,
  disableFaceId = false,
}) => {
  const {
    requirePinCode,
    pinCode,
    onChangeValue,
    incorrectPin,
    insets,
    timeLock,
    remainingTime,
    keepSplash,
  } = useRequirePinCode({
    isMainRequirePinCode,
    visible: visible,
    continueActionAfterPassPinCode: continueActionAfterPassPinCode,
    onClose,
    disableFaceId,
  });
  const styles = useStyles(insets);
  const header = (
    <AppText
      titleWithI18n={headerTitle}
      variant={TextVariantKeys.TitleMedium}
      styles={appStyles.textAlignCenter}
      textColor={appColors.neutral.black}
    />
  );

  const showState = subVisible && (visible ?? requirePinCode) && !keepSplash;
  return showState ? (
    <View style={styles.container}>
      {timeLock ? (
        <CountdownTimer remainingTime={remainingTime} />
      ) : (
        <View style={[appStyles.flex1]}>
          {onClose ? (
            <View
              style={[
                appStyles.justifyContentBetween,
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.mh15,
              ]}
            ></View>
          ) : (
            header
          )}
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.containerPinCode}>
              <AppText
                titleWithI18n={"Nhập mật mã"}
                textColor={appColors.neutral.black}
                styles={{ marginBottom: 30, fontSize: 15, fontWeight: "600" }}
              />
              <PinCodeInput
                value={pinCode}
                setValue={onChangeValue}
                error={incorrectPin}
              />
              <AppText
                titleWithI18n={
                  "Nhập mật mã của bạn. Bạn hãy ghi nhớ mật mã này để mở khoá ví của bạn"
                }
                textColor={appColors.neutral.n500}
                styles={{
                  marginTop: 30,
                  textAlign: "center",
                  paddingHorizontal: 50,
                  fontSize: 12,
                }}
              />
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  ) : null;
};

const useStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      backgroundColor: appColors.neutral.white,
      width: Utils.screenWidth,
      height: Utils.screenHeight,
      paddingTop: insets.top,
      zIndex: 100,
    },
    button: {
      width: 32,
    },
    box: {
      ...appStyles.flex1,
      ...appStyles.pT60,
      ...appStyles.pH15,
    },
    safeArea: {
      flex: 1,
      backgroundColor: "white",
    },
    containerPinCode: {
      flex: 1,
      alignItems: "center",
      paddingTop: "50%",
    },
  });

export default RequirePinCodeLayout;
