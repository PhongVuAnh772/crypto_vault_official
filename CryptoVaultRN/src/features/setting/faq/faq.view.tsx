import React from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import {
  ArrowRightSvgIcon,
  QuestionSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useFAQ from "./faq.hook";
import useStyle from "./faq.style";

const ContactSuccess: React.FC<RootNavigationType> = ({ navigation }) => {
  const { faqData, loading, onPressItem } = useFAQ({ navigation });
  const theme = useAppTheme();
  const faqStyle = useStyle(theme);
  return (
    <ScreenWrapper
      headerTitleWithI18n={LanguageKey.setting_faq}
      headerTextVariant={TextVariantKeys.titleLarge}
      enableHeader
      paddingTop
      scrollEnabled
      subStyle={[faqStyle.flex1]}
      backgroundColor={theme.colors.surface_surface_default}
    >
      {/* Show loading state or FAQ list */}
      {loading ? (
        <Loading />
      ) : (
        <View style={faqStyle.container}>
          <FlatList
            data={faqData}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={Separator}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              faqStyle.pH25,
              faqStyle.mt20,
              faqStyle.flexGrow1,
            ]}
            renderItem={({ item }) => {
              return (
                <TouchableHighlight
                  activeOpacity={0.9}
                  underlayColor={appColors.neutral.n200}
                  style={faqStyle.button}
                  onPress={() => onPressItem(item)}
                >
                  <View
                    style={[
                      faqStyle.flexRow,
                      faqStyle.alignItemsCenter,
                      faqStyle.justifyContentBetween,
                    ]}
                  >
                    <QuestionSvgIcon />
                    <AppText
                      title={item.question}
                      variant={TextVariantKeys.titleSmall}
                      styles={faqStyle.buttonText}
                    />
                    <ArrowRightSvgIcon color={faqStyle.iconArrow.color} />
                  </View>
                </TouchableHighlight>
              );
            }}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const Loading = () => {
  const theme = useAppTheme();
  const faqStyle = useStyle(theme);
  return (
    <View style={[faqStyle.center, faqStyle.flex1]}>
      <ActivityIndicator />
    </View>
  );
};
const Separator = () => {
  return <View style={{ height: 10 }} />;
};

export default ContactSuccess;
