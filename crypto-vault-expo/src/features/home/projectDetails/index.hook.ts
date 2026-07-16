import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EdgeInsets } from "react-native-safe-area-context";
import { shallowEqual } from "react-redux";
import AppToastType from "src/core/enum/AppToastType";
import { Feature } from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";
import createContextError from "src/core/services/ContextError";
import Web3Service from "src/core/services/Web3";
import {
  default as Utils,
  default as commonUtils,
} from "src/core/utils/commonUtils";
import AppErrorUtils from "src/core/utils/errorUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import tonUtils from "src/core/utils/tonUtils";
import {
  getDataClaimable,
  getTabContainer,
  handleLinkingTonAddress,
  setDataTransaction,
  setTabIndex,
} from "../bottomTab/explore/explore.slice";
import { SignedTransaction, Web3Account } from "./details/projectDetails.type";

const useProjectDetailTab = (navigation: NavigationProp<ParamListBase>) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const protocolBaseData = useProtocolSelected();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const [contractTonAddress, setContractTonAddress] = useState<string>("");
  const containerRoutesTab = useAppSelector(getTabContainer, shallowEqual);
  const [requirePinCode, setRequirePinCode] = useState(false);
  const [showImportLinking, setShowImportLinking] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const bottomSheetSecondRef = useRef<BottomSheetModal>(null);
  const currentProtocol = useProtocolSelected();
  const dataClaimable = useAppSelector(getDataClaimable);
  const currentWallet = useCurrentWallet();
  const urpUrl = protocolBaseData?.rpcUrl ?? "";
  const [loadingLinking, setLoadingLinking] = useState(false);
  const [enableInstruction] = useState(false);
  const [showScanQRCamera, setShowScanQRCamera] = useState(false);
  const [errorValidAddress, setErrorValidAddress] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const index = containerRoutesTab.index;
  const routes = containerRoutesTab.routes;

  const handleCallBackScanQR = (value: string) => {
    setShowScanQRCamera(false);
    setContractTonAddress(value);
  };

  const web3 = new Web3Service({
    urpUrl: urpUrl,
  });

  const contextSupportClaimTokenError = (
    functionError: string,
    reason: string,

    id?: number
  ) => {
    const error = createContextError({
      feature: Feature.ClaimToken,
      fileError: `index.ts (tabs)`,
      functionError: functionError,
      reason: reason,
      protocol: currentProtocol?.symbol ?? ProtocolType.All,
      id: id,
    });
    // Auto log => push error to server
    AppErrorUtils.sendContactWhenError(dispatch, error);
    return error;
  };

  const backAction = () => {
    navigation.goBack();
    dispatch(setTabIndex(0));
    dispatch(setDataTransaction([]));
  };

  const continueActionForSecondSheet = () => {
    handleHidePinCodeInstruction();
    setShowImportLinking(true);
  };

  const onFoCus = () => {
    setIsFocus(false);
  };
  const onBlur = () => {
    setIsFocus(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setContractTonAddress(text);
    } catch (error) {
      console.error(error);
    }
  };

  const continueActionAfterPassPinCode = async (
    pinCode: string
  ): Promise<SignedTransaction | undefined> => {
    try {
      setLoadingLinking(true);
      setRequirePinCode(false);
      if (!currentProtocol || !currentWallet || !currentWallet.path) {
        console.error("Could not found data");
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_failed),
          type: AppToastType.error,
        });
        contextSupportClaimTokenError(
          `continueActionAfterPassPinCode`,
          `Could not found data currentProtocol or currentWallet or currentWallet.path`,
          126
        );

        return;
      }
      const resultPrivateKeyAndNonceAddress =
        await web3.getPrivateKeyAndNonceAddress(
          pinCode,
          currentWallet.path,
          currentProtocol.slip0044
        );
      if (
        !resultPrivateKeyAndNonceAddress?.privateKey ||
        !resultPrivateKeyAndNonceAddress?.walletAddress
      ) {
        console.log("Could not found privateKey and walletAddress");
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_failed),
          type: AppToastType.error,
        });
        contextSupportClaimTokenError(
          `continueActionAfterPassPinCode`,
          `Could not found privateKey and walletAddress`,
          152
        );
        return;
      }
      const parsedPrivateKey = web3
        .initNetwork()
        .utils.toHex(resultPrivateKeyAndNonceAddress?.privateKey);

      const userAddress: string =
        resultPrivateKeyAndNonceAddress?.walletAddress;
      const walletAccount = web3
        .initNetwork()
        .eth.accounts.privateKeyToAccount(parsedPrivateKey);
      if (walletAccount.address.toLowerCase() !== userAddress.toLowerCase()) {
        console.error("private key does not match wallet address");
        contextSupportClaimTokenError(
          `continueActionAfterPassPinCode`,
          `private key does not match wallet address`,
          126
        );
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_failed),
          type: AppToastType.error,
        });
        return;
      }

      const transactionData: string = JSON.stringify({
        receiver_address: contractTonAddress,
      });

      const signedTransaction: SignedTransaction = await signTransaction(
        walletAccount,
        transactionData
      );
      await handleMessageSigned(signedTransaction);
    } catch (error: any) {
      setLoadingLinking(false);
      console.error("Signing error", error);
      contextSupportClaimTokenError(`continueActionAfterPassPinCode`, error);
      throw error;
    }
  };

  const handleMessageSigned = async (signedTransaction: SignedTransaction) => {
    try {
      if (
        !dataClaimable ||
        !dataClaimable?.project ||
        !currentWallet?.address ||
        !currentWallet ||
        !signedTransaction.message
      ) {
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_failed),
          type: AppToastType.error,
        });
        return;
      }
      const res = await dispatch(
        handleLinkingTonAddress({
          claimableTokenProjectId: dataClaimable?.project?._id,
          nftWalletAddress: currentWallet?.address,
          tokenReceiverWalletAddress: contractTonAddress,
          messageDecoded: signedTransaction.message,
          signatureHash: signedTransaction.signature,
        })
      );

      if (handleLinkingTonAddress.fulfilled.match(res)) {
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_complete),
          type: AppToastType.success,
        });
        setShowImportLinking(false);
      } else {
        Utils.showToast({
          msg: t(LanguageKey.claim_token_link_ton_address_failed),
          type: AppToastType.error,
        });
      }
    } catch (error: any) {
      console.log(error);
      Utils.showToast({
        msg: t(LanguageKey.claim_token_link_ton_address_failed),
        type: AppToastType.error,
      });
      contextSupportClaimTokenError(`handleMessageSigned`, error, 247);
    } finally {
      setLoadingLinking(false);
    }
  };
  const handleContractAddress = (value: string) => {
    setContractTonAddress(value);
    setErrorValidAddress(false);
  };

  const signTransaction = async (
    walletAccount: Web3Account,
    transactionData: string
  ): Promise<SignedTransaction> => {
    return walletAccount.sign(transactionData);
  };

  const handleIndexChange = (newIndex: number) => {
    dispatch(setTabIndex(newIndex));
  };

  const closeRequirePinCode = () => {
    setRequirePinCode(false);
  };
  const showRequirePinCode = () => {
    setRequirePinCode(true);
  };
  const handleShowInstruction = () => {
    bottomSheetRef.current?.present();
  };
  const handleHideInstruction = () => {
    bottomSheetRef.current?.close();
  };

  const handleShowPinCodeInstruction = () => {
    bottomSheetSecondRef.current?.present();
  };
  const handleHidePinCodeInstruction = () => {
    bottomSheetSecondRef.current?.close();
  };

  const initialLayout = { width: commonUtils.screenWidth };

  const customProps = {
    setContractTonAddress,
    contractTonAddress,
    showRequirePinCode,
    loadingLinking,
    handleShowInstruction,
  };

  const onCloseScanQr = () => {
    setShowScanQRCamera(false);
  };

  const onShowScanQr = () => {
    setShowScanQRCamera(true);
  };
  const handleCheckProtocolLinkingAction = () => {
    onBlur();
    if (!tonUtils.validAddress(contractTonAddress)) {
      setErrorValidAddress(true);
    } else {
      showRequirePinCode();
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setTabIndex(0));
      dispatch(setDataTransaction([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    continueActionAfterPassPinCode,
    setContractTonAddress,
    contractTonAddress,
    closeRequirePinCode,
    requirePinCode,
    showRequirePinCode,
    loadingLinking,
    enableInstruction,
    handleHideInstruction,
    handleShowInstruction,
    insets,
    bottomSheetRef,
    initialLayout,
    routes,
    index,
    setTabIndex,
    customProps,
    containerRoutesTab,
    dispatch,
    handleIndexChange,
    backAction,
    handleCallBackScanQR,
    onCloseScanQr,
    showScanQRCamera,
    continueActionForSecondSheet,
    handleShowPinCodeInstruction,
    handleHidePinCodeInstruction,
    bottomSheetSecondRef,
    showImportLinking,
    setShowImportLinking,
    errorValidAddress,
    handleContractAddress,
    handleCheckProtocolLinkingAction,
    handleCopyToClipboard,
    isFocus,
    setIsFocus,
    onFoCus,
    onBlur,
    onShowScanQr,
    setErrorValidAddress,
  };
};

export default useProjectDetailTab;
