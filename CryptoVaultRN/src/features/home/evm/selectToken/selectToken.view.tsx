import { useRoute } from "@react-navigation/native";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "src/components";
import RNCustomInput from "src/components/layout/SearchInput";
import {
  DeleteTextSvgIcon,
  SearchSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { RenderTokenItem } from "./selectToken.components";
import useSelectToken from "./selectToken.hook";
import useStyles from "./selectToken.style";
import { SelectTokenEVMParamsType } from "./selectToken.type";

const SelectTokenEVM: React.FC<RootNavigationType> = ({ navigation }) => {
  const { params } = useRoute<SelectTokenEVMParamsType>();

  const {
    searchValue,
    theme,
    handleSearchChange,
    cleanSearch,
    listTokenByProtocol,
    setLoadingImages,
    isLoadingImages,
    handlePressItem,
  } = useSelectToken({ navigation });

  const styles = useStyles(theme);

  return (
    <ScreenWrapper
      paddingTop
      headerTextColor={undefined}
      backButtonColor={undefined}
      backgroundColor={theme.colors.surface_surface_default}
      enableHeader
      headerTextVariant={TextVariantKeys.titleLarge}
      headerTitleWithI18n={LanguageKey.select_token_title}
    >
      <View style={styles.container}>
        <RNCustomInput
          placeholder={LanguageKey.wallet_address_select_protocol}
          value={searchValue}
          containerStyle={styles.input}
          setValue={handleSearchChange}
          keyboardType="default"
          leftIcon={<SearchSvgIcon color={theme.colors.outline} />}
          secureTextEntry={false}
          RightIcon={
            searchValue !== "" && (
              <TouchableOpacity onPress={cleanSearch}>
                <DeleteTextSvgIcon />
              </TouchableOpacity>
            )
          }
        />
        <FlatList
          data={listTokenByProtocol}
          keyExtractor={(item, index) => `${item.name}_${index}`}
          contentContainerStyle={styles.listContentContainer}
          renderItem={({ item }) => (
            <RenderTokenItem
              item={item}
              handlePressItem={handlePressItem}
              loadingImages={isLoadingImages}
              setLoadingImages={setLoadingImages}
              theme={theme}
              currentToken={params}
            />
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default SelectTokenEVM;
