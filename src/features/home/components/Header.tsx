import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Header = () => (
  <View style={styles.headerRow}>
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>a</Text>
    </View>
    <TouchableOpacity style={styles.mintingStatus}>
      <Ionicons name="md-power" size={16} color="white" />
      <Text style={styles.mintingText}>Minting disabled</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarPlaceholder: {
    backgroundColor: "#000",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontWeight: "bold" },
  mintingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4b0082",
    borderRadius: 12,
    padding: 6,
  },
  mintingText: { color: "white", fontSize: 12 },
});

export default Header;
