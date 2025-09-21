import { NavigationProp, ParamListBase } from "@react-navigation/native";
import RequirePinCodeLayout from "components/RequirePinCode/requirePinCode.view";
import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import useSplash from "./index.hook";

export interface RootNavigationType {
  navigation: NavigationProp<ParamListBase>;
  route?: any;
}

const SplashScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const { showRequirePinCode, actionAfterPassPinCode } = useSplash({
    navigation,
  });
  return (
    <>
      <View style={styles.container}>
        <FastImage
          source={require("../../../../assets/images/icon_app.png")}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <RequirePinCodeLayout
        visible={showRequirePinCode}
        continueActionAfterPassPinCode={actionAfterPassPinCode}
      />
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 320,
  },
});
