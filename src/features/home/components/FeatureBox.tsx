import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FeatureBox = ({
  label,
  badge,
}: {
  label: string;
  badge?: { count: number };
}) => (
  <TouchableOpacity style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge.count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#ffffff10",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    color: "white",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ff0066",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
});

export default FeatureBox;
