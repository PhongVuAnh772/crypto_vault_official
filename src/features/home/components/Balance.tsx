import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActionButton from "./ActionButton";

const BalanceSection = () => (
  <View style={styles.balanceContainer}>
    <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
    <Text style={styles.balanceValue}>⧉0</Text>
    <Text style={styles.balanceSub}>AVAILABLE: ⧉0</Text>

    <View style={styles.actionRow}>
      <ActionButton label="Transfer" icon="swap-horiz" />
      <ActionButton label="Buy" icon="add" />
      <ActionButton label="Trade" icon="sync" />
    </View>

    <TouchableOpacity style={styles.connectButton}>
      <Text style={styles.connectButtonText}>Connect to earn</Text>
    </TouchableOpacity>

    <Text style={styles.subNote}>
      Download Sweatcoin app to start earning $SWEAT
    </Text>
  </View>
);

const styles = StyleSheet.create({
  balanceContainer: { alignItems: "center", marginTop: 40 },
  balanceLabel: { color: "#bbb", fontSize: 12, letterSpacing: 1 },
  balanceValue: {
    fontSize: 48,
    color: "white",
    fontWeight: "700",
    marginTop: 10,
  },
  balanceSub: { color: "#bbb", fontSize: 14, marginTop: 4 },
  actionRow: { flexDirection: "row", marginTop: 24, gap: 10 },
  connectButton: {
    marginTop: 24,
    backgroundColor: "#ff2fb0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  connectButtonText: { color: "white", fontWeight: "600" },
  subNote: { color: "#ccc", fontSize: 12, marginTop: 8 },
});

export default BalanceSection;
