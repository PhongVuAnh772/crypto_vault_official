import React from "react";

import { StyleSheet, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import appStyles from "src/core/styles";
import useSessionTonConnect from "hooks/useSessionTonConnect";
import useAppSafeAreaInsets from "hooks/useAppSafeAreaInsets";
import BottomSheetModalGorhom from "./BottomSheetProvider";
import LoadingScreen from "./LoadingComponent";

export default function SessionTonConnect() {
  const {
    infoDapp,
    closeModal,
    confirm,
    tonAddressData,
    visibleLoading,
    showBottomSheetConnect,
  } = useSessionTonConnect();
  const insets = useAppSafeAreaInsets();
  const style = useStyles(insets);
  return (
    <View style={[appStyles.flex1]}>
      <BottomSheetModalGorhom
        onDismiss={closeModal}
        refModal={showBottomSheetConnect as any}
      >
        <View style={style.box}></View>
      </BottomSheetModalGorhom>
      <LoadingScreen visible={visibleLoading} />
    </View>
  );
}
const useStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    box: {
      ...appStyles.flex1,
    },
  });
