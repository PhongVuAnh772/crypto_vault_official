import { StyleSheet } from "react-native";
import appColors from "src/core/constants/AppColors";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    button: {
      flex: 12,
      borderRadius: 14,
      height: 120,
    },
    fire: { marginBottom: 3 },
    chartTopImage: {
      width: "100%",
      height: "100%",
      borderRadius: 4,
    },
    status: {
      backgroundColor: theme.colors.onBackground,
      paddingHorizontal: 8,
      paddingTop: 2,
      position: "absolute",
      top: 12,
      left: 12,
      borderRadius: 4,
      paddingBottom: 4,
    },
    image: {
      ...appStyles.fullWidth,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      aspectRatio: 16 / 9.1,
    },
    notFoundContainer: {
      flex: 1,
      alignItems: "center",
      paddingTop: "20%",
    },
    titleNoAssetFound: {
      paddingTop: 15,
      color: theme.colors.text_on_surface_text_medium,
      ...appStyles.textAlignCenter,
    },
    itemContainer: {
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: appColors.neutral.white,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    endDate: {
      fontWeight: "400",
      paddingLeft: 5,
    },
    endDateContainer: {
      paddingTop: 8,
    },
    top5NFTsText: {
      position: "absolute",
      bottom: 12,
      left: 12,
    },
    noAssetFoundIcon: {
      color: appColors.neutral.n600,
    },
    title: {
      paddingHorizontal: 0,
      backgroundColor: undefined,
    },
    separator: {
      width: 12,
    },
  });
export default useStyles;
