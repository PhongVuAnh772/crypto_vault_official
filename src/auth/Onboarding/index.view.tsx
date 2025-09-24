import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AppText from "components/AppText";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppDispatch } from "src/core/redux/hooks";
import { setIsFirstTime } from "src/core/redux/slices/auth.slice";
import TermValidation from "src/features/components/TermValidation";
import OnboardingTextSlider from "src/features/components/TextSlideAnimate";
import { AuthStackScreenKey } from "src/navigation/enum/NavigationKey";
import { AuthStackParamList } from "src/navigation/stack/auth/AuthParamsListType";
import appColors from "../../../../src/core/constants/AppColors";

const videoSource = require("../../../../assets/video/onboarding.mp4");
type VideoScreenNavigationProp = StackNavigationProp<AuthStackParamList>;

export default function VideoScreen() {
  const navigation = useNavigation<VideoScreenNavigationProp>();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  

  useEffect(() => {
    dispatch(setIsFirstTime(false));
  }, []);

  return (
    <View style={styles.contentContainer}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
      />
      <OnboardingTextSlider />
      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate(AuthStackScreenKey.CreatePinCode);
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
          navigation.navigate(AuthStackScreenKey.ImportPassphase);
        }}
      >
        <AppText
          titleWithI18n={"Tôi đã có ví"}
          textColor={appColors.neutral.white}
          styles={styles.buttonText}
        />
      </Pressable>
      <TermValidation onPress1={() => {}} onPress2={() => {}} />
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
