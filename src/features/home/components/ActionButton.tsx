import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const ActionButton = ({ label, icon }: { label: string; icon: any }) => (
  <TouchableOpacity style={styles.button}>
    <MaterialIcons name={icon} size={20} color="#fff" />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff10",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "30%",
  },
  label: {
    color: "white",
    fontSize: 13,
    marginLeft: 4,
  },
});

export default ActionButton;
