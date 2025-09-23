import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { ArrowDownSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import WalletUtils from "src/core/utils/walletUtils";

interface WalletInfoProps {
  onPress?: () => void;
  walletData?: AddressListItemType;
  theme: AppThemeType;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  onPress,
  walletData,
  theme,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.2 : 1}
    style={[appStyles.flex1, appStyles.pR10]}
  >
    <View
      style={[
        appStyles.flexRow,
        appStyles.center,
        appStyles.fullWidth,
        appStyles.justifyContentStart,
      ]}
    >
      <AppText
        title={walletData?.name ?? ""}
        numberOfLines={1}
        variant={TextVariantKeys.titleSmall}
        textColor={appColors.neutral.n900}
      />
      {onPress ? (
        <View style={appStyles.ml10}>
          <ArrowDownSvgIcon color={appColors.neutral.n900} />
        </View>
      ) : null}
    </View>
    <AppText
      title={WalletUtils.getShortAddress(walletData?.address ?? "")}
      variant={TextVariantKeys.bodyRSmall}
      textColor={appColors.neutral.n900}
    />
  </TouchableOpacity>
);

export default WalletInfo;
