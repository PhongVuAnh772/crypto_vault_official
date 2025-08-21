import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

const toastConfig = {
  success: (props: BaseToastProps) => (
    <View
      style={{
        width: "95%",
        backgroundColor: "#28a745",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
      }}
    >
      <MaterialIcons name="check-circle" size={20} color="white" />
      <Text style={{ color: "white", marginLeft: 8, fontWeight: "600" }}>
        {props.text1}
      </Text>
    </View>
  ),

  error: (props: BaseToastProps) => (
    <View
      style={{
        width: "95%",
        backgroundColor: "#dc3545",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
      }}
    >
      <MaterialIcons name="error" size={20} color="white" />
      <Text style={{ color: "white", marginLeft: 8, fontWeight: "600" }}>
        {props.text1}
      </Text>
    </View>
  ),
};

export default toastConfig;
export type ToastType = "success" | "error";
