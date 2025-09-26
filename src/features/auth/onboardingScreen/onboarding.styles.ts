import { StyleSheet } from "react-native";
import appColors from "src/core/constants/AppColors";
import { mPlus1 } from "src/core/constants/FontFamily";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";

const useStyles = (theme: AppThemeType, isFirstScreen: boolean) =>
  StyleSheet.create({
    viewBottom: {
      ...appStyles.flex5,
      backgroundColor: theme.colors.surface_surface_high,
      paddingHorizontal: 24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    viewNewTop: {
      ...appStyles.flex6,
      ...appStyles.center,
      backgroundColor: isFirstScreen
        ? theme.colors.surface_surface_brand
        : theme.colors.surface_surface_high,
    },
    viewTop: {
      ...appStyles.flex6,
      ...appStyles.center,
    },
    title: {
      textAlign: "center",
    },
    titleSub: {
      textAlign: "center",
    },
    pT32: {
      paddingTop: 32,
    },
    pT16: { paddingTop: 16 },

    nextButton: {
      ...appStyles.center,
      width: 70,
      height: 70,
      borderRadius: 100,
      backgroundColor: appColors.main.tokyoRed,
      shadowColor: appColors.main.tokyoRed,
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.2,
      elevation: Utils.isAndroid ? 6 : 0,
    },
    viewCounterWithButton: {
      ...appStyles.flexRow,
      ...appStyles.alignItemsEnd,
    },
    nextTextStyle: {
      marginLeft: 4,
      textAlign: "center",
      color: appColors.neutral.white,
      fontWeight: 600,
      letterSpacing: 4,
      lineHeight: 16,
      alignContent: "center",
      fontSize: 12,
      fontFamily: mPlus1.regular,
    },
    viewButton: {
      ...appStyles.justifyContentEnd,
    },
    h10: {
      height: 10,
    },
    button_language: {
      paddingVertical: 4,
      paddingLeft: 16,
      paddingRight: 12,
      flexDirection: "row",
      backgroundColor: theme.colors.surface_surface_high,
      ...appStyles.center,
    },
    bdr100: {
      borderRadius: 100,
    },
    bdr0: {
      borderRadius: 0,
    },
    dropdownContainer: {
      zIndex: 2,
    },
    contentDropdown: {
      borderRadius: 6,
    },
    imageOnboarding: {
      width: 311,
      height: 311,
    },
    customBorderButtonNewUI: {
      borderWidth: 1,
      borderColor: theme.colors.outline_outine,
    },
    customBorderButtonInitialUI: {
      borderWidth: 0,
    },
    contentContainer: {
      flex: 1,
      justifyContent: "flex-end",
      paddingHorizontal: 24,
      backgroundColor: "rgb(25, 25, 29)",
      paddingBottom: 46,
    },
    video: {
      width: 450,
      height: 450,
      position: "absolute",
      top: 150,
      left: -17,
      borderWidth: 0,
      borderColor: "transparent",
    },
    controlsContainer: {
      padding: 10,
    },
    button: {
      width: "100%",
      height: 38,
      backgroundColor: "rgb(13, 27, 250)",
      marginVertical: 15,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    button2: {
      width: "100%",
      height: 38,
      backgroundColor: "gray",
      marginBottom: 15,
      marginTop: 10,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 13,
      fontWeight: "600",
    },
  });
export default useStyles;
