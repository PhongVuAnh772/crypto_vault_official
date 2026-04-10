import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "src/components/common/AppText";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import usePinCode from "src/features/auth/pinCode/pinCode.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import PinIndicator from "../components/PinIndicator";
import PinKeypad from "../components/PinKeypad";

const PinCode: React.FC<RootNavigationType> = ({ navigation }) => {
  const { pinCode, setPinCode, theme } = usePinCode({ navigation });
  const insets = useSafeAreaInsets();

  const handlePressNumber = (num: string) => {
    if (pinCode.length < 6) {
      setPinCode(pinCode + num);
    }
  };

  const handlePressDelete = () => {
    setPinCode(pinCode.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* Mesh Background Layer 1: Indigo to Soft blue */}
      <LinearGradient
        colors={["#DCE9FF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Mesh Background Layer 2: Subtle Pink/Lavender overlay from top-right */}
      <LinearGradient
        colors={["rgba(245, 243, 255, 0.7)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Mesh Background Layer 3: Cyan/Mint accent from bottom-left */}
      <LinearGradient
        colors={["rgba(236, 253, 245, 0.4)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { marginTop: insets.top + 20 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <AppText
          titleWithI18n={LanguageKey.pin_input_title}
          variant={TextVariantKeys.bodyRLarge}
          textColor="#1F2937"
          styles={styles.title}
        />

        <PinIndicator length={6} value={pinCode} />
      </View>

      <View style={styles.keypadWrapper}>
        <PinKeypad
          onPressNumber={handlePressNumber}
          onPressDelete={handlePressDelete}
        />
      </View>

      <View style={{ height: insets.bottom + 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',

  },
  keypadWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
});

export default PinCode;
