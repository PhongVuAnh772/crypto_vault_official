import { RouteProp, useRoute } from "@react-navigation/native";
import AppText from "components/AppText";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import appColors from "src/core/constants/AppColors";
import { useAppDispatch } from "src/core/redux/hooks";
import {
  addAccount,
  setPin,
  setTemporaryMnemonic,
} from "src/core/redux/slices/app.slice";
import {
  AuthStackScreenKey,
  PinCodeStackScreenKey,
} from "src/navigation/enum/NavigationKey";
import NativeWalletCoreModule from "../../../../src/modules/WalletCoreModules/NativeWalletCoreModule";

export type PinCodeStackParamListType = {
  [PinCodeStackScreenKey.CreatePin]: undefined;
  [PinCodeStackScreenKey.ReEnterPin]: { pinCode: string };
};

type ReEnterPinProp = RouteProp<
  PinCodeStackParamListType,
  PinCodeStackScreenKey.ReEnterPin
>;

const CreateNewWallet = () => {
  const route = useRoute<ReEnterPinProp>();

  const pin: string = route.params.pinCode;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const onHandleNoti = () => {
    createWallet();
  };
  const onRejectNoti = () => {
    createWallet();
  };
  const createWallet = async () => {
    const nativeWalletCoreModule = new NativeWalletCoreModule();
    try {
      const mnemonic = await nativeWalletCoreModule.createWallet();
      if (mnemonic) {
        dispatch(setTemporaryMnemonic(mnemonic));
        if (mnemonic !== undefined && mnemonic !== null) {
          setIsLoading(true);
          dispatch(setPin(pin));
          await dispatch(addAccount({ mnemonic: mnemonic, pinCode: pin }));
          navigation.navigate(AuthStackScreenKey.CongratulationCreateWallet);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <>
      <View style={styles.container}>
        <View style={styles.itemWrapper}>
          <FastImage
            source={require("../../../../assets/images/shield.png")}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
          <AppText
            titleWithI18n={"Luôn cập nhật tin tức thị trường"}
            textColor={appColors.neutral.black}
            styles={{
              textAlign: "center",
              paddingHorizontal: 50,
              fontWeight: "600",
              fontSize: 17,
            }}
          />
          <AppText
            titleWithI18n={
              "Bật thông báo để theo dõi giá cả và nhận thông báo mới về giao dịch"
            }
            textColor={appColors.neutral.n500}
            styles={{
              textAlign: "center",
              paddingTop: 15,
              fontSize: 13,
            }}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Pressable style={styles.notificationBtn} onPress={onHandleNoti}>
            <AppText
              titleWithI18n={"Bật thông báo"}
              textColor={appColors.neutral.white}
              styles={{
                textAlign: "center",
                fontWeight: "500",
                fontSize: 13,
              }}
            />
          </Pressable>
          <Pressable style={styles.notificationReject} onPress={onRejectNoti}>
            <AppText
              titleWithI18n={"Bỏ qua, tôi sẽ bật tính năng này sau"}
              styles={{
                textAlign: "center",
                fontSize: 13,
              }}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default CreateNewWallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 30,
  },
  itemWrapper: {
    paddingHorizontal: 24,
    paddingTop: "40%",
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
    height: 45,
    backgroundColor: "rgb(14, 26, 251)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  notificationReject: {
    marginTop: 24,
  },
});
