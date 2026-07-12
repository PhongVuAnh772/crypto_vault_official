// import React from "react";
// import {
//   FlatList,
//   KeyboardAvoidingView,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { ScreenWrapper } from "src/components";
// import AppModal from "src/components/common/AppModal";
// import AppText from "src/components/common/AppText";
// import appColors from "src/core/constants/AppColors";
// import { Warn2SvgIcon } from "src/core/constants/AppIconsSvg";
// import TextVariantKeys from "src/core/enum/TextVariantKeys";
// import LanguageKey from "src/core/locales/LanguageKey";
// import appStyles from "src/core/styles";

// import AppButton from "src/components/common/AppButton";
// import LoadingScreen from "src/components/common/LoadingScreen";
// import appConstants from "src/core/constants/AppConstants";
// import { appImages } from "src/core/constants/AppImages";
// import Utils from "src/core/utils/commonUtils";
// import RootNavigationType from "src/navigation/stacks/type/NavigationType";
// import useRestoreWallet from "./restoreWallet.hook";
// import useStyles from "./restoreWallet.styles";

// const RestoreWallet: React.FC<RootNavigationType> = ({ navigation }) => {
//   const {
//     modalVisible,
//     onCloseModal,
//     handleInputChange,
//     handleWordSelect,
//     suggestions,
//     theme,
//     handleRestoreAccount,
//     onDismissKeyboard,
//     showSuggestions,
//     secretPhraseInputs,
//     isMiddleItem,
//     onFocusInput,
//     handleLayout,
//     widthView,
//     disableButton,
//     isDarkTheme,
//     insets,
//     inputRefs,
//     isLoading,
//   } = useRestoreWallet({
//     navigation,
//   });

//   const styles = useStyles(theme);
//   const renderItem = ({ index }: { index: number }) => (
//     <View
//       onLayout={handleLayout}
//       style={[
//         styles.inputContainer,
//         isMiddleItem(index) ? appStyles.mh5 : null,
//       ]}
//     >
//       {
//         <View style={[appStyles.flexRow]}>
//           <View style={styles.indexView}>
//             <AppText
//               title={(index + 1).toString()}
//               variant={TextVariantKeys.bodyRSmall}
//               styles={appStyles.textAlignCenter}
//               textColor={theme.colors.text_on_surface_text_high}
//             />
//           </View>
//           <TextInput
//             onFocus={() => {
//               onFocusInput(index);
//             }}
//             ref={(ref) => (inputRefs.current[index] = ref)}
//             autoFocus={index === 0}
//             style={[styles.input, theme.fonts.labelSmall]}
//             value={secretPhraseInputs[index]}
//             autoCorrect={false}
//             autoCapitalize="none"
//             autoComplete="off"
//             importantForAutofill="no"
//             keyboardType={Utils.isAndroid ? "visible-password" : "default"}
//             spellCheck={false}
//             selectionColor={theme.colors.text_on_surface_text_high}
//             cursorColor={theme.colors.text_on_surface_text_high}
//             onChangeText={(text) => handleInputChange(text, index)}
//           />
//         </View>
//       }
//     </View>
//   );

//   return (
//     <ScreenWrapper
//       enableDismissKeyboard
//       onDismissKeyboard={onDismissKeyboard}
//       enableHeader
//       headerTitleWithI18n={LanguageKey.restore_title}
//       headerTextVariant={TextVariantKeys.titleLarge}
//       headerTextColor={undefined}
//       backButtonColor={undefined}
//       mainStyle={[appStyles.flex1]}
//       backgroundImage={
//         isDarkTheme ? appImages.background1Dark : appImages.background1
//       }
//       backgroundColor={undefined}
//       headerStyle={{
//         ...styles.header,
//         paddingTop: insets.top,
//         height: appConstants.HEADER_HEIGHT + insets.top,
//       }}
//       subStyle={appStyles.flex1}
//     >
//       <AppModal
//         visible={modalVisible}
//         onPress={onCloseModal}
//         onTouchOutside={onCloseModal}
//         titleWithI18n={LanguageKey.restore_error_title}
//         subTitleWithI18n={LanguageKey.restore_error_sub_title}
//         buttonTitleWithI18n={LanguageKey.common_text_try_again}
//         icon={<Warn2SvgIcon />}
//       />

//       <KeyboardAvoidingView style={appStyles.flexGrow1} behavior={"padding"}>
//         <View style={[appStyles.flex1]}>
//           <View style={[appStyles.flex1, appStyles.pH25]}>
//             <View style={[appStyles.mv15, appStyles.pv16]}>
//               {null}

//               <AppText
//                 titleWithI18n={LanguageKey.restore_sub_title}
//                 variant={TextVariantKeys.bodyRLarge}
//                 styles={appStyles.textAlignCenter}
//                 textColor={theme.colors.text_on_surface_text_highest}
//               />
//             </View>
//             <View style={[appStyles.fullWidth, appStyles.mt15]}>
//               <FlatList
//                 scrollEnabled={false}
//                 data={secretPhraseInputs.map((_, index) => ({
//                   key: index.toString(),
//                 }))}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.key}
//                 numColumns={3}
//                 contentContainerStyle={styles.grid}
//               />
//             </View>
//             <View style={appStyles.mv15}>
//               <AppText
//                 titleWithI18n={LanguageKey.restore_sub_input}
//                 variant={TextVariantKeys.bodyRMedium}
//                 styles={appStyles.textAlignCenter}
//                 textColor={theme.colors.text_on_surface_text_high}
//               />
//             </View>
//           </View>
//           <View
//             style={[
//               appStyles.pH25,
//               styles.buttonContainer,
//               {
//                 padding: insets.bottom,
//               },
//             ]}
//           >
//             {
//               <AppButton
//                 disabled={disableButton}
//                 onPress={handleRestoreAccount}
//                 titleWithI18n={LanguageKey.restore_title}
//                 styles={styles.button}
//                 textVariant={TextVariantKeys.titleSmall}
//                 textColor={theme.colors.text_on_surface_text_invert}
//               />
//             }
//           </View>
//           {showSuggestions && suggestions.length > 0 ? (
//             <View style={styles.suggestionBar}>
//               <FlatList
//                 data={suggestions}
//                 keyboardShouldPersistTaps="always"
//                 showsHorizontalScrollIndicator={false}
//                 horizontal
//                 style={appStyles.pd10}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     key={item}
//                     onPress={() => {
//                       handleWordSelect(item);
//                     }}
//                     style={styles.suggestionItem}
//                   >
//                     <AppText
//                       title={item}
//                       variant={TextVariantKeys.labelSmall}
//                       textColor={appColors.neutral.black}
//                     />
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//           ) : null}
//         </View>
//       </KeyboardAvoidingView>

//       <LoadingScreen visible={isLoading} />
//     </ScreenWrapper>
//   );
// };

// export default RestoreWallet;

import { Feather } from "@expo/vector-icons";
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
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useRestoreWallet from "./importPassphrase.hook";
import useStyles from "./secretPhrase.styles";

const SecretPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    handleLayout,
    insets,
    widthView,
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
    handleWordSelect,
    theme,
  } = useRestoreWallet({
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
          secureTextEntry={!showNmemonic}
          onChangeText={(text) => {
            if (text.endsWith(" ")) {
              const word = text.trim();
              handleInputChange(word, index);
              if (index < secretPhraseInputs.length - 1) {
                inputRefs.current[index + 1]?.focus();
              }
            } else {
              handleInputChange(text, index);
            }
          }}
          onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            if (e.nativeEvent.key !== "Backspace") return;
            const isEmpty = !secretPhraseInputs[index];
            if (index === 1 && isEmpty) {
              const phrase = secretPhraseInputs
                .filter((w) => w && w.length > 0)
                .join(" ");
              for (let i = 0; i < secretPhraseInputs.length; i++) {
                handleInputChange("", i);
              }
              setTempPhrase(phrase);
              setIsSingleInput(true);
              return;
            }
            if (isEmpty && index > 0) {
              inputRefs.current[index - 1]?.focus();
            }
          }}
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
                secureTextEntry={!showNmemonic}
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
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 12,
                right: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                borderTopColor: "white",
                borderTopWidth: 1,
              }}
            >
              <TouchableOpacity
                onPress={handleShow}
                style={{
                  width: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 13,
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {!showNmemonic ? "Hiển thị tất cả" : "Ẩn tất cả"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePaste}
                style={{
                  width: "50%",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 13,
                }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Dán
                </Text>
              </TouchableOpacity>
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

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 12,
                  right: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  borderTopColor: "white",
                  borderTopWidth: 1,
                }}
              >
                <TouchableOpacity
                  onPress={handleShow}
                  style={{
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 13,
                  }}
                >
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    {!showNmemonic ? "Hiển thị tất cả" : "Ẩn tất cả"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePaste}
                  style={{
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 13,
                  }}
                >
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Dán
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
          handleRestoreAccount();
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
      {showSuggestions && suggestions.length > 0 ? (
        <View style={styles.suggestionBar}>
          <FlatList
            data={suggestions}
            keyboardShouldPersistTaps="always"
            showsHorizontalScrollIndicator={false}
            horizontal
            style={appStyles.pd10}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  handleWordSelect(item);
                }}
                style={styles.suggestionItem}
              >
                <AppText
                  title={item}
                  variant={TextVariantKeys.labelSmall}
                  textColor={appColors.neutral.black}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default SecretPhrase;
