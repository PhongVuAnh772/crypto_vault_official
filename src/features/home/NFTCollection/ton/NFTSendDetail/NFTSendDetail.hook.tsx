import { RouteProp, StackActions, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import AppToastType from "src/core/enum/AppToastType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useProtocolSelected } from "src/core/redux/slice/account.selector";
import Utils from "src/core/utils/commonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "src/navigation/stacks/type/HomeStackParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

type TransactionDetailsProp = RouteProp<
  HomeStackParamListType,
  HomeStackScreenKey.NFTTonSendDetail
>;
const useTransactionDetails = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const selectedProtocol = useProtocolSelected();
  const insets = useAppSafeAreaInsets();
  const {
    txHash,
    fromAddress,
    toAddress,
    adminFee,
    networkFee,
    nftData,
    total,
  } = useRoute<TransactionDetailsProp>().params;
  const backAction = () => {
    navigation.dispatch(StackActions.popToTop());
  };

  const onViewOnScan = () => {
    Linking.openURL(`${nftData.root.protocol.transactionScanURL}${txHash}`);
  };

  const copyAction = () => {
    Clipboard.setStringAsync(txHash);
    Utils.showToast({
      msg: t(LanguageKey.common_copied),
      type: AppToastType.success,
    });
  };

  return {
    theme,
    onViewOnScan,
    backAction,
    copyAction,
    txHash,
    fromAddress,
    toAddress,
    adminFee,
    networkFee,
    selectedProtocol,
    nftData,
    total,
    insets,
  };
};

export default useTransactionDetails;
