import { Dimensions, StyleSheet } from "react-native";
import { AppThemeType } from "src/core/type/ThemeType";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const H_PADDING = 16;
const GAP = 10;
const ITEM_WIDTH = (width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1) - 24) / NUM_COLUMNS; // 24 is internal grid padding

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    inputSecret: {
      marginBottom: GAP,
      backgroundColor: "white",
      paddingHorizontal: 8,
      borderRadius: 12,
      width: ITEM_WIDTH,
      height: 52,
      borderWidth: 1,
      borderColor: "#E9ECFF",
      shadowColor: "#4C6FFF",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: "#000",
      height: '100%',
    },
    grid: {
      paddingBottom: 10,
    }
  });
export default useStyles;
