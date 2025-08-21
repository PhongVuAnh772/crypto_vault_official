import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const ListHeaderToken = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Image
          source={{
            uri: "https://cryptologos.cc/logos/usd-open-dollar-usdo-logo.png",
          }}
          style={styles.usdoIcon}
        />
        <View>
          <Text style={styles.usdoSymbol}>USDO</Text>
          <Text style={styles.usdoChange}>+0.04%</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.usdoAmount}>190.25</Text>
        <Text style={styles.usdoUsd}>$190.25</Text>
      </View>
    </View>
  );
};

export default ListHeaderToken;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "rgb(26, 26, 26)",
    borderRadius: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  usdoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  usdoSymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  usdoChange: {
    fontSize: 16,
    color: "green",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  usdoAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  usdoUsd: {
    fontSize: 16,
    color: "white",
  },
});
