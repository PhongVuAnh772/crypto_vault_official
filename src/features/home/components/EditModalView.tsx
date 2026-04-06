import { t } from "i18next";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import AppButton from "src/components/common/AppButton";
import appColors from "src/core/constants/AppColors";
import { WalletLogoSvgIcon } from "src/core/constants/AppIconsSvg";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";

type EditModalType = {
  onCancel: () => void;
  onEdit: () => void;
  editWalletName: string;
  avtColor?: string;
  setEditWalletName: React.Dispatch<React.SetStateAction<string>>;
  typeWallet?: boolean;
};

const EditModalView: React.FC<EditModalType> = ({
  onCancel,
  onEdit,
  editWalletName,
  typeWallet,
  setEditWalletName,
  avtColor,
}) => {
  const theme: AppThemeType = useAppTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity activeOpacity={1} style={styles.editContainer}>
      <View style={styles.removeSubContainer}>
        <View style={[styles.walletIcon2, appStyles.mbt10]}>
          <WalletLogoSvgIcon width={25} height={20} color={avtColor} />
        </View>
        <TextInput
          autoFocus={true}
          multiline={false}
          numberOfLines={1}
          value={editWalletName}
          onChangeText={setEditWalletName}
          placeholder={t(
            typeWallet
              ? LanguageKey.wallet_menu_edit_input_title
              : LanguageKey.account_menu_edit_input_title
          )}
          placeholderTextColor={appColors.neutral.n500}
          mode={InputMode.outlined}
          outlineColor={theme.colors.surface_surface_high}
          activeOutlineColor={theme.colors.surface_surface_high}
          selectionColor={theme.colors.text_on_surface_text_light}
          cursorColor={appColors.neutral.black}
          textColor={theme.colors.text_on_surface_text_high}
          textAlign="center"
          style={[styles.editInputStyle, theme.fonts.titleSmall]}
        />

        <View style={appStyles.flexRow}>
          {
            <AppButton
              onPress={onCancel}
              titleWithI18n={LanguageKey.common_text_cancel}
              textVariant={TextVariantKeys.bodyMMedium}
              forceStyles={[styles.buttonModal, styles.buttonCancel]}
              textStyles={appStyles.textAlignCenter}
              textColor={appColors.main.tokyoRed}
            />
          }
          {
            <AppButton
              onPress={onEdit}
              disabled={editWalletName?.length === 0}
              titleWithI18n={LanguageKey.common_text_confirm}
              textVariant={TextVariantKeys.bodyMMedium}
              forceStyles={[styles.buttonModal, styles.buttonConfirm]}
              textStyles={appStyles.textAlignCenter}
              textColor={appColors.neutral.white}
            />
          }
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    editContainer: {
      ...appStyles.flex1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      paddingTop: Utils.screenHeight * 0.2,
    },
    removeSubContainer: {
      ...appStyles.pd25,
      ...appStyles.mh25,
      ...appStyles.center,
      borderRadius: 4,
      backgroundColor: theme.colors.surface_surface_high,
    },
    buttonModal: {
      height: 48,
      borderRadius: 4,
      ...appStyles.mt25,
    },
    buttonCancel: {
      ...appStyles.center,
      borderWidth: 1,
      borderColor: appColors.main.tokyoRed,
      flex: 1,
      marginRight: 10,
    },
    buttonConfirm: {
      ...appStyles.center,
      backgroundColor: appColors.main.tokyoRed,
      flex: 1,
      marginLeft: 10,
    },
    walletIcon2: {
      width: 44,
      height: 44,
      backgroundColor: theme.colors.surface_surface_high,
      borderRadius: 100,
      ...appStyles.center,
      shadowColor: appColors.neutral.n300,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    editInputStyle: {
      backgroundColor: theme.colors.surface_surface_high,
      minHeight: 60,
      maxHeight: 60,
      ...appStyles.mbt10,
      alignSelf: "center",
      width: "100%",
      alignItems: "center",
    },
  });

export default EditModalView;
