import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
  bottomTabContainer: {
    ...appStyles.flexRow,
    ...appStyles.pH15,
  },
  badgeContainer: {
    width: 5,
    height: 5,
    backgroundColor: appColors.main.tokyoRed,
    borderRadius: 10,
    position: "absolute",
    top: 10,
    left: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fabContainer: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    zIndex: 20,
  },

  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF4D4D", // màu nút
    justifyContent: "center",
    alignItems: "center",

    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    // Shadow Android
    elevation: 10,
  },
});

export default styles;
