import useTonConnect from "hooks/useTonConnect";
import React from "react";
import { StyleSheet, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import Utils from "src/utils/commonUtils";

const TonConnectLayout = () => {
  const { componentView, isShowModalConnect, insets } = useTonConnect();
  const styles = useStyles(insets);
  return isShowModalConnect ? (
    <View style={styles.container}>{componentView}</View>
  ) : null;
};
export default TonConnectLayout;

const useStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      paddingBottom: insets.bottom,
      position: "absolute",
      backgroundColor: "transparent",
      width: Utils.screenWidth,
      height: Utils.screenHeight,
    },
  });
