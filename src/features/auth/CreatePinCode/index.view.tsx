import { useNavigation } from "@react-navigation/native";
import AppText from "components/AppText";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, TextInput, View } from "react-native";
import appColors from "src/core/constants/AppColors";
import PinCodeInput from "src/features/components/PinCode";
import { AuthStackScreenKey } from "src/navigation/enum/NavigationKey";

const CreatePinCode = () => {
  const [pinCode, setPinCode] = useState("");
  const pinRef = useRef<TextInput>(null);
  const navigation = useNavigation<any>();

  const continueAction = () => {
    navigation.navigate(AuthStackScreenKey.RePinCode);
  };

  useEffect(() => {
    if (pinCode.length === 6) {
      continueAction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinCode.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText
          titleWithI18n={"Tạo mật mã"}
          textColor={appColors.neutral.black}
          styles={{ marginBottom: 30, fontSize: 15, fontWeight: "600" }}
        />
        <PinCodeInput
          value={pinCode}
          setValue={setPinCode}
          customRef={pinRef}
          error={false}
          maxCount={6}
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: "50%",
  },
});

export default CreatePinCode;
