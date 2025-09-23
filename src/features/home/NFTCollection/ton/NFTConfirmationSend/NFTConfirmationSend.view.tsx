import React from "react";
import { ScreenWrapper } from "src/components";
import ConfirmTonView from "src/components/homeComponents/ConfirmTonView";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import WalletUtils from "src/core/utils/walletUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useNFTTonConfirmationSend from "./NFTConfirmationSend.hook";

const NFTTonConfirmationSend: React.FC<RootNavigationType> = ({
  navigation,
}) => {
  const theme = useAppTheme();
  const {
    subNetworkFee,
    root,
    detail,
    lastPreview,
    sign,
    fromAddress,
    toAddress,
    formattedAdminFee,
    subAdminFee,
    t,
    isLoadingPage,
    requirePinCode,
    closeRequirePinCode,
    confirmAction,
    continueActionAfterPassPinCode,
    protocolSelected,
    selectedCurrencySetting,
    formattedTotalFeeBigAmount,
    formattedNetworkFee,
  } = useNFTTonConfirmationSend({ navigation });
  return (
    <>
      <ScreenWrapper
        enableHeader
        paddingTop
        headerTitle={t(LanguageKey.common_text_confirmation)}
        headerTextVariant={TextVariantKeys.titleLarge}
        backgroundColor={theme.colors.surface_surface_default}
      >
        <ConfirmTonView
          fromAddress={WalletUtils.getShortAddress(fromAddress)}
          toAddress={WalletUtils.getShortAddress(toAddress)}
          networkFee={formattedNetworkFee}
          subNetworkFee={subNetworkFee}
          adminFee={formattedAdminFee}
          subAdminFee={subAdminFee}
          root={root}
          detail={detail}
          lastPreview={lastPreview}
          sign={sign}
          isLoadingPage={isLoadingPage}
          confirmAction={confirmAction}
          protocolSelected={protocolSelected}
          totalAmount={formattedTotalFeeBigAmount}
          selectedCurrencySetting={selectedCurrencySetting}
        />
      </ScreenWrapper>
      <RequirePinCodeLayout
        visible={requirePinCode}
        onClose={closeRequirePinCode}
        continueActionAfterPassPinCode={continueActionAfterPassPinCode}
      />
    </>
  );
};

export default NFTTonConfirmationSend;
