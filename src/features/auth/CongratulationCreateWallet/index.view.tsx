import AppText from "components/AppText";
import { FireworksAnimationRef } from "components/FireworkAnimation";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import FastImage from "react-native-fast-image";
import appColors from "src/core/constants/AppColors";
import {
  HomeStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";

const CongratulationCreateWallet = () => {
  const navigation = useNavigation<any>();
  const [showConfetti, setShowConfetti] = useState(true);
  const onHandleNoti = () => {};
  const fireworksRef = useRef<FireworksAnimationRef>(null);

  const onRejectNoti = () => {
    navigation.navigate(NavigationStackKey.HomeStack, {
      screen: HomeStackScreenKey.BottomTab,
    });
  };

  useEffect(() => {
    const handleAnimate = () => {
      fireworksRef.current?.triggerFireworks();
    };
    handleAnimate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.itemWrapper}>
        <FastImage
          source={require("../../../../assets/images/wallet-create.gif")}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
        <AppText
          titleWithI18n={"Tuyệt vời, ví của bạn đã sẵn sàng!"}
          textColor={appColors.neutral.black}
          styles={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: 18,
          }}
        />
        <AppText
          titleWithI18n={"Mua hoặc nạp tiền để bắt đầu"}
          textColor={appColors.neutral.n500}
          styles={{
            textAlign: "center",
            paddingTop: 15,
            fontSize: 13,
          }}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <Pressable
          style={[
            styles.notificationBtn,
            styles.bgButton,
            { marginBottom: 15 },
          ]}
          onPress={onHandleNoti}
        >
          <AppText
            titleWithI18n={"Mua tiền mã hoá"}
            textColor={appColors.neutral.white}
            styles={{
              textAlign: "center",
              fontWeight: "500",
              fontSize: 13,
            }}
          />
        </Pressable>
        <Pressable
          style={[styles.notificationBtn, styles.bg2Button]}
          onPress={onHandleNoti}
        >
          <AppText
            titleWithI18n={"Nạp tiền mã hoá"}
            textColor={appColors.neutral.black}
            styles={{
              textAlign: "center",
              fontWeight: "500",
              fontSize: 13,
            }}
          />
        </Pressable>
        <Pressable style={styles.notificationReject} onPress={onRejectNoti}>
          <AppText
            titleWithI18n={"Bỏ qua, tôi sẽ dùng tính năng này sau"}
            textColor={appColors.neutral.black}
            styles={{
              textAlign: "center",
              fontSize: 13,
            }}
          />
        </Pressable>
      </View>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut
          autoStart
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </View>
  );
};

export default CongratulationCreateWallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 30,
  },
  itemWrapper: {
    paddingHorizontal: 24,
    paddingTop: "30%",
    alignItems: "center",
  },
  buttonWrapper: {
    alignItems: "center",
    paddingBottom: 55,
    width: "100%",
    paddingHorizontal: 24,
  },
  notificationBtn: {
    width: "100%",
    height: 47,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  bgButton: { backgroundColor: "rgb(14, 26, 251)" },
  bg2Button: { backgroundColor: appColors.neutral.n400 },
  notificationReject: {
    marginTop: 24,
  },
});
