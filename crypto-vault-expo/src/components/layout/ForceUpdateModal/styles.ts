import appColors from "src/core/constants/AppColors";
import appStyles from "src/core/styles";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    ...appStyles.flex1,
    ...appStyles.center,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  subContainer: {
    ...appStyles.pd25,
    ...appStyles.mh25,
    ...appStyles.center,
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
  },
  buttonUpdate: {
    backgroundColor: appColors.main.tokyoRed,
    height: 40,
    flex: 1,
    ...appStyles.center,
    borderRadius: 4,
  },
  btnTrackingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    marginTop: 4,
    textAlign: "center",
  },
  marketInfoContainer: {
    marginTop: 16,
    backgroundColor: appColors.neutral.white,
    padding: 12,
    borderRadius: 12,
  },
  marketInfoSectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  marketInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  marketInfoLabelText: {
    flex: 1,
  },
  marketInfoValueText: {
    flex: 1,
    textAlign: "right",
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  textAlignRight: {
    textAlign: "right",
  },
});

export default styles;
