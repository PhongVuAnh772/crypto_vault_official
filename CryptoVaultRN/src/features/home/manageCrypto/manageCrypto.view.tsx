import React from "react";
import { TouchableOpacity, View, TextInput as RNTextInput } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import {
  Close2SvgIcon,
  SearchSvgIcon,
  DeleteTextSvgIcon,
  ClockUnFocusSvgIcon,
  PlusSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ManageCrypto } from "./manageCrypto.components";
import { useCrypto } from "./manageCrypto.hook";
import useStyles from "./manageCrypto.style";

const ManageCryptoScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    searchValue,
    handleSearchChange,
    cleanSearch,
    onPressAddCustomCrypto,
    listTokenByWalletAddress,
    setLoadingImages,
    isLoadingImages,
    handleOnChangeStatus,
    hideAddCustomToken,
  } = useCrypto({ navigation });

  const styles = useStyles(theme);

  return (
    <ScreenWrapper
      paddingTop
      paddingBottom={false}
      headerTextColor={undefined}
      backButtonColor={undefined}
      backgroundColor="#FAFAFC"
      enableHeader={false}
    >
      <View style={styles.container}>
        {/* Custom Header matching mockup */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Close2SvgIcon color="#0A0D14" width={20} height={20} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrapper}>
            <AppText
              titleWithI18n={LanguageKey.title_manage_crypto}
              variant={TextVariantKeys.titleMedium}
              textColor="#0A0D14"
              styles={styles.headerTitle}
            />
            <AppText
              title="Tất cả token và tài sản tùy chỉnh"
              variant={TextVariantKeys.bodyRSmall}
              textColor="#7C8099"
              styles={styles.headerSubtitle}
            />
          </View>

          <TouchableOpacity style={styles.historyBtn} onPress={() => {}}>
            <ClockUnFocusSvgIcon color="#0A0D14" width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Custom Pill Search Input */}
        <View style={styles.searchBarWrapper}>
          <SearchSvgIcon color="#7C8099" width={18} height={18} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tài sản hoặc địa chỉ token"
            placeholderTextColor="#8F9BB3"
            value={searchValue}
            onChangeText={handleSearchChange}
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
          {searchValue !== "" && (
            <TouchableOpacity onPress={cleanSearch} style={styles.clearSearchBtn}>
              <DeleteTextSvgIcon color="#7C8099" width={16} height={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Manage List View */}
        <View style={appStyles.flex1}>
          <ManageCrypto
            tokenData={listTokenByWalletAddress}
            searching={searchValue}
            isLoadingImages={isLoadingImages}
            setIsLoadingImage={setLoadingImages}
            handleOnChangeStatus={handleOnChangeStatus}
            onPressAddCustomCrypto={onPressAddCustomCrypto}
          />
        </View>

        {/* Bottom Button */}
        {hideAddCustomToken ? null : (
          <View style={styles.buttonContainer}>
            <AppButton
              title="Thêm tài sản tùy chỉnh"
              textColor="#FFFFFF"
              styles={styles.button}
              textStyles={styles.buttonText}
              icon={<PlusSvgIcon color="#FFFFFF" width={16} height={16} style={{ marginRight: 6 }} />}
              onPress={onPressAddCustomCrypto}
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default ManageCryptoScreen;
