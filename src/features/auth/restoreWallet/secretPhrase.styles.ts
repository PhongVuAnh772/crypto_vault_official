import { Dimensions, StyleSheet } from "react-native";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import GlobalUtils from "src/core/utils/globalUtils";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3; // số cột muốn hiển thị
const H_PADDING = 16; // = container.paddingHorizontal
const GAP = 8; // khoảng cách giữa các ô
const ITEM_WIDTH =
  (width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    secretPhraseItem: {
      padding: 5,
      ...appStyles.flex1,
      ...appStyles.flexRow,
    },
    newSecretPhraseItem: {
      padding: 5,
      ...appStyles.flex1,
      ...appStyles.flexRow,
      position: "absolute",
      zIndex: 2,
    },
    secretPhraseItemViewIndex: {
      ...appStyles.center,
      height: 40,
      width: GlobalUtils.getEnableRedXNewTheme() ? 26 : 22,
      backgroundColor: GlobalUtils.getEnableRedXNewTheme()
        ? undefined
        : theme.colors.surface_surface_high,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      marginRight: 2,
    },

    secretPhraseItemViewPhrase: {
      ...appStyles.center,
      height: 40,
      width: 85,
      paddingRight: 5,
    },
    secretPhraseItemViewPhrase2: {
      ...appStyles.justifyContentCenter,
      paddingLeft: GlobalUtils.getEnableRedXNewTheme() ? 0 : 8,
      height: 40,
      width: "100%",
      backgroundColor: GlobalUtils.getEnableRedXNewTheme()
        ? undefined
        : theme.colors.surface_surface_high,
      borderBottomRightRadius: 4,
      borderTopRightRadius: 4,
    },

    newThemeOpacity: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.7,
    },
    switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
    container: {
      flex: 1,
      backgroundColor: "white",
      paddingHorizontal: H_PADDING,
    },
    button: {
      width: "100%",
    },
    inputContainer: {
      marginVertical: 4,
      backgroundColor: "#F7F7FA",
      height: 300,
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 8,
    },
    secretContainer: {
      marginVertical: 4,
      backgroundColor: "#F7F7FA",
      height: 300,
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 8,
    },
    inputSecret: {
      marginVertical: 4,
      backgroundColor: "white",
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 8,
      width: "32%",
      height: 50,
      borderWidth: 1,
      borderColor: "#C9D6FF",
    },
    input: {
      height: 40,
      ...appStyles.center,
      paddingVertical: 12,
      paddingHorizontal: 8,
      textAlignVertical: "top",
      fontSize: 14,
      fontWeight: "500",
      color: "#000",
    },
    newInput: {
      height: 40,
      flex: 1,
      ...appStyles.center,
      textAlignVertical: "center",
      paddingVertical: 12,
    },
    pasteButton: {
      position: "absolute",
      width: 70,
    },
    suggestionBar: {
      ...appStyles.flexRow,
      backgroundColor: "rgba(51, 52, 52, 0.6)",
    },
    suggestionItem: {
      padding: 10,
      marginRight: 10,
      backgroundColor: "#fff",
      borderRadius: 5,
    },
    grid: {
      flexGrow: 1,
    },
    indexView: {
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      paddingLeft: 2,
    },
    newIndexView: {
      ...appStyles.center,
      ...appStyles.pd10,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      minWidth: 35,
    },
    item: {
      width: ITEM_WIDTH,
      marginBottom: GAP,
    },
    itemContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },

    itemContainer: {
      ...appStyles.flexRow,
      position: "absolute",
      zIndex: 2,
    },
    buttonContainer: {
      position: "absolute",
      left: 0,
      bottom: 0,
      width: "100%",
    },
    header: {
      backgroundColor: appColors.main.tokyoRed,
      marginHorizontal: 0,
      paddingHorizontal: 25,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoIcon: {
      marginLeft: 4,
      marginTop: 2,
    },
    secretPhraseContainer: {
      flex: 1,
      marginTop: 16,
    },
    copyContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
  });
export default useStyles;
