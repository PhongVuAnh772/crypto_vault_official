import { Feather } from "@expo/vector-icons";
import { appAnimations } from "constants/AppAnimations";
import LottieView from "lottie-react-native";
import React from "react";
import { TouchableOpacity, View, ScrollView } from "react-native";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import CoreModal from "src/components/common/CoreModal";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import useBottomSheetWallet from "./bottomSheetWalletWarning.hook";
import useStyles from "./bottomSheetWalletWarning.style";

interface BottomSheetProps {
  closeModalCreateNewWallet: () => void;
  isVisible: boolean;
  continueAction: () => void;
  onDismiss: () => void;
}

const BottomSheetWarningWallet: React.FC<BottomSheetProps> = ({
  closeModalCreateNewWallet,
  isVisible,
  continueAction,
  onDismiss,
}) => {
  const { listBottomSheetPhrase, insets } = useBottomSheetWallet();

  return (
    <CoreModal
      visible={isVisible}
      onDismiss={onDismiss}
      animationType="slide"
      transparent={true}
    >
      <View style={[appStyles.flex1, { backgroundColor: "#0B1023", paddingTop: insets.top }]}>
        
        {/* Header */}
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter, appStyles.justifyContentBetween, appStyles.mt15, { paddingHorizontal: 16 }]}>
          <View style={{ width: 40 }} />
          
          <View style={appStyles.alignItemsCenter}>
            <View style={[appStyles.flexRow, appStyles.alignItemsCenter, appStyles.mbt10]}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "rgb(90, 100, 255)" }} />
              <View style={{ width: 24, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
              <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" }} />
              <View style={{ width: 24, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
              <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" }} />
            </View>
            <AppText
              titleWithI18n={"Bước 1 / 3"}
              variant={TextVariantKeys.bodySMedium}
              textColor={"rgba(255,255,255,0.5)"}
            />
          </View>
          
          <TouchableOpacity 
            onPress={closeModalCreateNewWallet} 
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", ...appStyles.center }}
          >
            <Feather name="x" size={20} color={"rgba(255,255,255,0.8)"} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={appStyles.flex1} 
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[{ paddingHorizontal: 16, marginTop: 10 }]}>
            <View style={appStyles.center}>
              <LottieView
                source={appAnimations.securityAnimation}
                style={{
                  width: 250,
                  height: 200,
                }}
                autoPlay
                loop
              />
              <View style={[appStyles.alignItemsCenter, { marginBottom: 30, paddingHorizontal: 10 }]}>
                <AppText
                  titleWithI18n={LanguageKey.protect_secret_phrase_title_new}
                  variant={TextVariantKeys.headlineMedium}
                  textColor={"#FFFFFF"}
                  styles={{ textAlign: "center", marginBottom: 12, fontSize: 24, fontWeight: "bold" }}
                />
                <AppText
                  titleWithI18n={LanguageKey.protect_secret_phrase_subtitle_new}
                  variant={TextVariantKeys.bodyRMedium}
                  textColor={"rgba(255, 255, 255, 0.7)"}
                  styles={{ textAlign: "center", fontSize: 15, lineHeight: 22 }}
                />
              </View>
              
              <View style={{ width: "100%" }}>
                {listBottomSheetPhrase.map((item, index) => (
                  <View
                    key={item.title}
                    style={[
                      appStyles.flexRow,
                      appStyles.alignItemsCenter,
                      {
                        backgroundColor: "#13182B",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        padding: 16,
                        marginBottom: 12,
                        width: "100%",
                      }
                    ]}
                  >
                    <View style={[{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 24, 
                        backgroundColor: index === 0 ? "rgba(90, 100, 255, 0.15)" : "rgba(255,255,255,0.08)", 
                        marginRight: 16 
                      }, appStyles.center]}
                    >
                      <Feather
                        name={item.icon as any}
                        size={20}
                        color={index === 0 ? "rgb(120, 140, 255)" : "rgba(255, 255, 255, 0.6)"}
                      />
                    </View>
                    <View style={[appStyles.flex1]}>
                      <AppText
                        titleWithI18n={item.title}
                        variant={TextVariantKeys.titleSmall}
                        textColor={"#FFFFFF"}
                        styles={{ marginBottom: 4, fontSize: 15, fontWeight: "600" }}
                      />
                      <AppText
                        titleWithI18n={item.desc}
                        variant={TextVariantKeys.bodySMedium}
                        textColor={"rgba(255, 255, 255, 0.5)"}
                        styles={{ fontSize: 13, lineHeight: 18 }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Area */}
        <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16, paddingTop: 16 }}>
          <AppButton
            onPress={continueAction}
            titleWithI18n={LanguageKey.common_text_continue}
            styles={{
              backgroundColor: "rgb(85, 95, 255)",
              ...appStyles.fullWidth,
              height: 56,
              borderRadius: 16,
            }}
            textVariant={TextVariantKeys.titleSmall}
            textColor={appColors.neutral.white}
          />
          <View style={[appStyles.center, appStyles.flexRow, appStyles.mt15]}>
            <Feather name="shield" size={14} color={"rgba(255,255,255,0.4)"} />
            <View style={{ marginLeft: 6 }}>
              <AppText
                titleWithI18n={LanguageKey.protect_secret_phrase_footer_new}
                variant={TextVariantKeys.bodySMedium}
                textColor={"rgba(255,255,255,0.4)"}
                styles={{ fontSize: 12 }}
              />
            </View>
          </View>
        </View>
      </View>
    </CoreModal>
  );
};

export default BottomSheetWarningWallet;
