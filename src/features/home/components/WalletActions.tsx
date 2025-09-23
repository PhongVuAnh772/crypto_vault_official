import * as Clipboard from "expo-clipboard";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import appColors from "src/core/constants/AppColors";
import { Copy3SvgIcon, ScanHomeSvgIcon } from "src/core/constants/AppIconsSvg";
import AppToastType from "src/core/enum/AppToastType";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppSelector } from "src/core/redux/hooks";
import { getHeightBottomTab } from "src/core/redux/slice/app.slice";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";

interface WalletActionsProps {
  address?: string;
  hiddenScan?: boolean;
  goToScan?: () => void;
}

const WalletActions: React.FC<WalletActionsProps> = ({
  address,
  hiddenScan,
  goToScan,
}) => {
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;
  const copyAddressAction = () => {
    Clipboard.setStringAsync(address ?? "");
    Utils.showToast({
      msg: AppI18Next.t(LanguageKey.common_copied),
      type: AppToastType.success,
      contentOffSet: contentOffsetToast,
    });
  };
  return (
    <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
      <TouchableOpacity
        onPress={copyAddressAction}
        style={[styles.actionButton]}
      >
        <Copy3SvgIcon color={appColors.neutral.n900} />
      </TouchableOpacity>
      {hiddenScan && (
        <TouchableOpacity style={styles.actionButton} onPress={goToScan}>
          <ScanHomeSvgIcon color={appColors.neutral.n900} />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  actionButton: {
    width: 36,
    height: 36,
    ...appStyles.center,
    padding: 8,
    borderRadius: 4,
  },
});

export default WalletActions;
