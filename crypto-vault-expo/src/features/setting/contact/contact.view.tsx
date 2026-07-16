import React from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppTextInput from "src/components/common/AppTextInput";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useContact from "./contact.hook";
import useStyle from "./contact.style";

const Contact: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();

  const {
    t,
    name,
    email,
    inquiry,
    setName,
    setEmail,
    setInquiry,
    validate,
    onSubmit,
    loading,
    backAction,
  } = useContact({ navigation });
  const contactStyles = useStyle(theme);
  return (
    <ScreenWrapper
      headerTitleWithI18n={LanguageKey.setting_contact_support}
      headerTextVariant={TextVariantKeys.titleLarge}
      enableHeader
      paddingTop
      backAction={backAction}
      subStyle={[contactStyles.flex1]}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <KeyboardAvoidingView behavior="padding" style={contactStyles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={contactStyles.mbt10}
          bounces={false}
        >
          <AppTextInput
            required
            value={name}
            onChangeText={setName}
            styleTextInput={contactStyles.inputStyle}
            labelName={LanguageKey.setting_name}
            placeholder={`${t(LanguageKey.setting_enter)} ${t(
              LanguageKey.setting_name
            ).toLocaleLowerCase()}`}
          />
          <View style={contactStyles.mv15}>
            <AppTextInput
              required
              value={email}
              onChangeText={setEmail}
              styleTextInput={contactStyles.inputStyle}
              labelName={LanguageKey.setting_email}
              placeholder={`${t(LanguageKey.setting_enter)} ${t(
                LanguageKey.setting_email
              ).toLocaleLowerCase()}`}
            />
          </View>
          <AppTextInput
            required
            value={inquiry}
            onChangeText={setInquiry}
            labelName={LanguageKey.setting_inquiry}
            placeholder={`${t(LanguageKey.setting_inquiry)} ${t(
              LanguageKey.setting_name
            ).toLocaleLowerCase()}`}
            styleTextInput={[contactStyles.inquiry, contactStyles.inputStyle]}
            multiline
          />
        </ScrollView>

        <AppButton
          onPress={onSubmit}
          titleWithI18n={LanguageKey.submit}
          textVariant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.white}
          styles={contactStyles.button}
          disabled={!validate()}
          isLoading={loading}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Contact;
