import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "src/components/common/AppText";
import AppToastType from "src/core/enum/AppToastType";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import Utils from "src/core/utils/commonUtils";
import useSecretPhrase from "src/features/auth/secretPhrase/secretPhrase.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useStyles from "./secretPhrase.styles";

const SecretPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    continueAction,
    handleLayout,
    theme,
    handleInputChange,
    secretPhraseInputs,
    isMiddleItem,
    onFocusInput,
    inputRefs,
    isSingleInput,
    setIsSingleInput,
    tempPhrase,
    setTempPhrase,
  } = useSecretPhrase({
    navigation,
  });

  const insets = useSafeAreaInsets();
  const styles = useStyles(theme);

  const renderItem = ({ index }: { index: number }) => (
    <View
      onLayout={handleLayout}
      style={[
        styles.inputSecret,
        isMiddleItem(index) ? { marginHorizontal: 6 } : null,
      ]}
    >
      <View style={localStyles.itemInner}>
        <View style={localStyles.indexBadge}>
          <Text style={localStyles.indexText}>{index + 1}</Text>
        </View>
        <TextInput
          onFocus={() => onFocusInput(index)}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          autoFocus={index === 0}
          style={styles.input}
          value={secretPhraseInputs[index]}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          importantForAutofill="no"
          keyboardType={Utils.isAndroid ? "visible-password" : "default"}
          spellCheck={false}
          editable={false}
          pointerEvents="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: 0 }]}>
      <View style={localStyles.header}>
        <AppText
          title="Bước 1/2"
          variant={TextVariantKeys.bodyMMedium}
          textColor="#8E8E93"
          styles={localStyles.stepText}
        />
        <AppText
          title="Nhập ví"
          variant={TextVariantKeys.headlineMedium}
          textColor="#000000"
          styles={localStyles.title}
        />
        <View style={styles.row}>
          <AppText
            title="Nhập cụm từ khôi phục bí mật của bạn"
            variant={TextVariantKeys.bodyMMedium}
            textColor="#6E6E73"
          />
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather
              name="info"
              size={16}
              color="#6E6E73"
              style={localStyles.infoIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={localStyles.mainContent}>
        <View style={localStyles.gridCard}>
          {isSingleInput ? (
            <View style={localStyles.singleInputWrapper}>
              <TextInput
                style={localStyles.largeInput}
                placeholder="Thêm dấu cách giữa mỗi từ và đảm bảo không có ai đang nhìn 👀"
                placeholderTextColor="#A1A1A1"
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
                  } else {
                    setTempPhrase(text);
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={6}
                blurOnSubmit
              />
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={secretPhraseInputs.map((_, index) => ({
                key: index.toString(),
              }))}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              numColumns={3}
              contentContainerStyle={localStyles.flatlistContent}
            />
          )}
        </View>

        {!isSingleInput && (
          <TouchableOpacity
            style={localStyles.copyBtn}
            onPress={async () => {
              await Clipboard.setStringAsync(secretPhraseInputs.join(" "));
              Utils.showToast({
                type: AppToastType.success,
                msg: "Copy cụm từ thành công !",
              });
            }}
          >
            <Feather name="copy" size={18} color="#4C6FFF" />
            <Text style={localStyles.copyText}>Copy vào clipboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[localStyles.footer,]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={continueAction}
          style={localStyles.primaryBtnWrapper}
        >
          <LinearGradient
            colors={["#4C6FFF", "#2D51F0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.primaryBtn}
          >
            <Text style={localStyles.primaryBtnText}>Tiếp tục</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 24,
  },
  stepText: {
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontWeight: "900",
    fontSize: 32,
    marginBottom: 8,
  },
  infoIcon: {
    marginLeft: 6,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridCard: {
    backgroundColor: "#F8F9FE",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEF0F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  flatlistContent: {
    paddingBottom: 4,
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E9ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  indexText: {
    fontSize: 12,
    color: '#4C6FFF',
    fontWeight: '700',
  },
  copyBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  copyText: {
    marginLeft: 8,
    color: "#4C6FFF",
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 12,
  },
  primaryBtnWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#4C6FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  singleInputWrapper: {
    height: 200,
    padding: 12,
  },
  largeInput: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    height: '100%',
  }
});

export default SecretPhrase;
