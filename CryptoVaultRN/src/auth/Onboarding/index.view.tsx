import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "src/components/common/AppText";
import { useAppDispatch } from "src/core/redux/hooks";
import { setIsFirstTime } from "src/core/redux/slice/app.slice";
// import TermValidation from "src/features/components/TermValidation";
import appColors from "src/core/constants/AppColors";
import OnboardingTextSlider from "src/features/auth/components/TextSlideAnimate";
import { NavigationStackKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const videoSource = require("../../../../assets/video/onboarding.mp4");

export default function VideoScreen() {
  const navigation = useNavigation<RootNavigationType["navigation"]>();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isFocused) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isFocused]);

  useEffect(() => {
    dispatch(setIsFirstTime(false));
  }, [dispatch]);

  return (
    <View style={styles.contentContainer}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
      <OnboardingTextSlider />
      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate(NavigationStackKey.PinCodeStack as any);
        }}
      >
        <AppText
          titleWithI18n={"Tạo ví mới"}
          textColor={appColors.neutral.white}
          styles={styles.buttonText}
        />
      </Pressable>
      <Pressable
        style={styles.button2}
        onPress={() => {
          navigation.navigate(NavigationStackKey.RestoreWalletStack as any);
        }}
      >
        <AppText
          titleWithI18n={"Tôi đã có ví"}
          textColor={appColors.neutral.white}
          styles={styles.buttonText}
        />
      </Pressable>
      {/* <TermValidation onPress1={() => {}} onPress2={() => {}} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
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
