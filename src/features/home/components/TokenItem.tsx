import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
const TokenItem = ({ item }: { item: any }) => {
  const isPositive = item.change >= 0;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.left}>
        <Image source={item.icon} style={styles.icon} />
        <View>
          <Text style={styles.symbol}>{item.name}</Text>
          <Text style={{ color: isPositive ? "green" : "red", fontSize: 12 }}>
            {isPositive ? "+" : ""}
            {item.change}%
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{item.value}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </View>
  );
};

export default TokenItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  symbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  price: {
    fontSize: 12,
    color: "#888",
  },
});
