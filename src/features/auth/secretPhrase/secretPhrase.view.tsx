import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import {
  FlatList,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "src/components/common/AppText";
import AppToastType from "src/core/enum/AppToastType";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import useSecretPhrase from "src/features/auth/secretPhrase/secretPhrase.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useStyles from "./secretPhrase.styles";

const SecretPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    mnemonicData,
    continueAction,
    copyAction,
    handleLayout,
    isSwitchOn,
    themeMode,
    theme,
    insets,
    widthView,
    onToggleSwitch,
    handleInputChange,
    suggestions,
    handleRestoreAccount,
    onDismissKeyboard,
    showSuggestions,
    secretPhraseInputs,
    isMiddleItem,
    onFocusInput,
    inputRefs,
    handlePaste,
    isSingleInput,
    setIsSingleInput,
    tempPhrase,
    setTempPhrase,
    handleShow,
    showNmemonic,
  } = useSecretPhrase({
    navigation,
  });

  const styles = useStyles(theme);

  const renderItem = ({ index }: { index: number }) => (
    <View
      onLayout={handleLayout}
      style={[isMiddleItem(index) ? appStyles.mh5 : null, styles.inputSecret]}
    >
      <View style={[appStyles.flexRow, { alignItems: "center" }]}>
        <View style={styles.indexView}>
          <AppText
            title={(index + 1).toString()}
            variant={TextVariantKeys.bodyMMedium}
            styles={appStyles.textAlignCenter}
          />
        </View>
        <TextInput
          onFocus={() => {
            onFocusInput(index);
          }}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          autoFocus={index === 0}
          style={[styles.input, { flex: 1 }]}
          value={secretPhraseInputs[index]}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          importantForAutofill="no"
          keyboardType={Utils.isAndroid ? "visible-password" : "default"}
          spellCheck={false}
          numberOfLines={1}
          editable={false}
          onChangeText={(text) => {}}
          onKeyPress={(
            e: NativeSyntheticEvent<TextInputKeyPressEventData>
          ) => {}}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppText
        title="Bước 1/2"
        variant={TextVariantKeys.bodyMMedium}
        textColor="#8E8E93"
      />
      <AppText
        title="Nhập ví"
        variant={TextVariantKeys.headlineSmall}
        textColor="#000000"
        styles={{ fontWeight: "700" }}
      />
      <View style={[styles.row, { paddingTop: 5 }]}>
        <AppText
          title="Nhập cụm từ khôi phục bí mật của bạn"
          variant={TextVariantKeys.bodyMMedium}
          textColor="#6E6E73"
        />
        <Feather
          name="info"
          size={18}
          color="#6E6E73"
          style={styles.infoIcon}
        />
      </View>

      <View style={styles.secretPhraseContainer}>
        {isSingleInput ? (
          <View style={styles.inputContainer}>
            <View style={{ position: "relative", width: "100%" }}>
              {tempPhrase.length === 0 && (
                <Text
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 5,
                    color: "#6E6E73",
                    fontSize: 14,
                  }}
                >
                  Thêm dấu cách giữa mỗi từ và đảm bảo không có ai đang nhìn 👀
                </Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    width: "100%",
                    textAlignVertical: "top",
                  },
                ]}
                // secureTextEntry={!showNmemonic}
                value={tempPhrase}
                onChangeText={(text) => {
                  if (text.includes(" ")) {
                    const words = text.trim().split(/\s+/);

                    words.forEach((w, idx) => {
                      if (idx < secretPhraseInputs.length) {
                        handleInputChange(w, idx);
                      }
                    });
                    setIsSingleInput(false);
                    setTimeout(() => {
                      const nextIndex = Math.min(
                        words.length,
                        secretPhraseInputs.length - 1
                      );
                      inputRefs.current[nextIndex]?.focus();
                    }, 0);
                  } else {
                    setTempPhrase(text);
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                multiline={true}
                numberOfLines={4}
                blurOnSubmit={true}
                returnKeyType="default"
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.secretContainer}>
              <FlatList
                scrollEnabled={false}
                data={secretPhraseInputs.map((_, index) => ({
                  key: index.toString(),
                }))}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                numColumns={3}
                contentContainerStyle={styles.grid}
              />
            </View>
            <TouchableOpacity
              style={styles.copyContainer}
              onPress={async () => {
                await Clipboard.setStringAsync(secretPhraseInputs.join(" "));
                Utils.showToast({
                  type: AppToastType.success,
                  msg: "Copy cụm từ thành công !",
                });
              }}
            >
              <Feather name="copy" size={18} color="#7A94FF" />
              <View style={{ width: 8 }} />
              <AppText
                title={"Copy vào clipboard"}
                variant={TextVariantKeys.bodyMMedium}
                styles={appStyles.textAlignCenter}
                textColor="#7A94FF"
              />
            </TouchableOpacity>
          </>
        )}
      </View>
      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 13,
          position: "absolute",
          left: 16,
          bottom: 30,
          width: "100%",
          backgroundColor: "#7A94FF",
          borderRadius: 10,
        }}
        onPress={() => {
          continueAction();
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          Tiếp tục
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SecretPhrase;
