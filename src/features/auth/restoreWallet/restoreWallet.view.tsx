import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import AppModal from "src/components/common/AppModal";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { Warn2SvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";

import AppButton from "src/components/common/AppButton";
import LoadingScreen from "src/components/common/LoadingScreen";
import appConstants from "src/core/constants/AppConstants";
import { appImages } from "src/core/constants/AppImages";
import Utils from "src/core/utils/commonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useRestoreWallet from "./restoreWallet.hook";
import useStyles from "./restoreWallet.styles";

const RestoreWallet: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    modalVisible,
    onCloseModal,
    handleInputChange,
    handleWordSelect,
    suggestions,
    theme,
    handleRestoreAccount,
    onDismissKeyboard,
    showSuggestions,
    secretPhraseInputs,
    isMiddleItem,
    onFocusInput,
    handleLayout,
    widthView,
    disableButton,
    isDarkTheme,
    insets,
    inputRefs,
    isLoading,
  } = useRestoreWallet({
    navigation,
  });

  const styles = useStyles(theme);
  const renderItem = ({ index }: { index: number }) => (
    <View
      onLayout={handleLayout}
      style={[
        styles.inputContainer,
        isMiddleItem(index) ? appStyles.mh5 : null,
      ]}
    >
      {
        <View style={[appStyles.flexRow]}>
          <View style={styles.indexView}>
            <AppText
              title={(index + 1).toString()}
              variant={TextVariantKeys.bodyRSmall}
              styles={appStyles.textAlignCenter}
              textColor={theme.colors.text_on_surface_text_high}
            />
          </View>
          <TextInput
            onFocus={() => {
              onFocusInput(index);
            }}
            ref={(ref) => (inputRefs.current[index] = ref)}
            autoFocus={index === 0}
            style={[styles.input, theme.fonts.labelSmall]}
            value={secretPhraseInputs[index]}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="no"
            keyboardType={Utils.isAndroid ? "visible-password" : "default"}
            spellCheck={false}
            selectionColor={theme.colors.text_on_surface_text_high}
            cursorColor={theme.colors.text_on_surface_text_high}
            onChangeText={(text) => handleInputChange(text, index)}
          />
        </View>
      }
    </View>
  );

  return (
    <ScreenWrapper
      enableDismissKeyboard
      onDismissKeyboard={onDismissKeyboard}
      enableHeader
      headerTitleWithI18n={LanguageKey.restore_title}
      headerTextVariant={TextVariantKeys.titleLarge}
      headerTextColor={undefined}
      backButtonColor={undefined}
      mainStyle={[appStyles.flex1]}
      backgroundImage={
        isDarkTheme ? appImages.background1Dark : appImages.background1
      }
      backgroundColor={undefined}
      headerStyle={{
        ...styles.header,
        paddingTop: insets.top,
        height: appConstants.HEADER_HEIGHT + insets.top,
      }}
      subStyle={appStyles.flex1}
    >
      <AppModal
        visible={modalVisible}
        onPress={onCloseModal}
        onTouchOutside={onCloseModal}
        titleWithI18n={LanguageKey.restore_error_title}
        subTitleWithI18n={LanguageKey.restore_error_sub_title}
        buttonTitleWithI18n={LanguageKey.common_text_try_again}
        icon={<Warn2SvgIcon />}
      />

      <KeyboardAvoidingView style={appStyles.flexGrow1} behavior={"padding"}>
        <View style={[appStyles.flex1]}>
          <View style={[appStyles.flex1, appStyles.pH25]}>
            <View style={[appStyles.mv15, appStyles.pv16]}>
              {null}

              <AppText
                titleWithI18n={LanguageKey.restore_sub_title}
                variant={TextVariantKeys.bodyRLarge}
                styles={appStyles.textAlignCenter}
                textColor={theme.colors.text_on_surface_text_highest}
              />
            </View>
            <View style={[appStyles.fullWidth, appStyles.mt15]}>
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
            <View style={appStyles.mv15}>
              <AppText
                titleWithI18n={LanguageKey.restore_sub_input}
                variant={TextVariantKeys.bodyRMedium}
                styles={appStyles.textAlignCenter}
                textColor={theme.colors.text_on_surface_text_high}
              />
            </View>
          </View>
          <View
            style={[
              appStyles.pH25,
              styles.buttonContainer,
              {
                padding: insets.bottom,
              },
            ]}
          >
            {
              <AppButton
                disabled={disableButton}
                onPress={handleRestoreAccount}
                titleWithI18n={LanguageKey.restore_title}
                styles={styles.button}
                textVariant={TextVariantKeys.titleSmall}
                textColor={theme.colors.text_on_surface_text_invert}
              />
            }
          </View>
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
        </View>
      </KeyboardAvoidingView>

      <LoadingScreen visible={isLoading} />
    </ScreenWrapper>
  );
};

export default RestoreWallet;
