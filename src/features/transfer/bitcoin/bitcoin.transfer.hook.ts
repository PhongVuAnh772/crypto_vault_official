import { StackActions, StackActionType } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Linking } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import EnvConfig from "src/core/constants/EnvConfig";
import AppToastType from "src/core/enum/AppToastType";
import { CoinType } from "src/core/enum/CoinType";
import { Feature } from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useBitcoinAddressData,
  useProtocolSelected,
  useSelectedCurrencySetting,
} from "src/core/redux/slice/account.selector";
import {
  getBlockBitcoinTransfer,
  setActionFailedNeedToContact,
  setShowCommonErrorModal,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import createContextError from "src/core/services/ContextError";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import BitcoinUtils from "src/core/utils/bitcoinUtils";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import WalletUtils from "src/core/utils/walletUtils";
import {
  createBitcoinTransaction,
  getBitcoinData,
  getBTCFinalBalance,
  getIsPushTransactionFailure,
  getNetworkFee,
  pushBitcoinTransactionAction,
  selectorBitcoinData,
  selectorBitcoinTransactionData,
  selectorIsBitcoinDataLoading,
  selectorIsBitcoinMaxAmountLoading,
  selectorIsLoadingPushTransaction,
  selectorMaxAmount,
  selectorPushBitcoinHashErrorDust,
  selectorPushBitcoinHashErrorExists,
  selectorPushBitcoinOtherError,
  selectorShowDustError,
  selectorShowModalConfirm,
  setIsPushTransactionFailure,
  setShowDustError,
  setShowModalConfirm,
} from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

export const useBitcoinTransfer = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const btcAddress = useBitcoinAddressData()?.address ?? "";
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const dispatch = useAppDispatch();
  const protocolBaseData = useProtocolSelected();
  const showDustError = useAppSelector(selectorShowDustError);
  const bitcoinData = useAppSelector(selectorBitcoinData);
  const pushBitcoinHashErrorExists = useAppSelector(
    selectorPushBitcoinHashErrorExists
  );
  const blockBitcoinTransfer = useAppSelector(getBlockBitcoinTransfer);

  const selectedCurrencySetting = useSelectedCurrencySetting();
  const pushBitcoinHashErrorDust = useAppSelector(
    selectorPushBitcoinHashErrorDust
  );
  const pushBitcoinOtherError = useAppSelector(selectorPushBitcoinOtherError);
  const bitcoinTransactionData = useAppSelector(selectorBitcoinTransactionData);
  const coinType = CoinType.Bitcoin;
  const [requirePinCode, setRequirePinCode] = useState(false);

  const continueActionAfterPassPinCode = async () => {
    onClose();
    setRequirePinCode(false);
    await pushBitcoinTransaction();
  };

  const pushBitcoinTransaction: () => Promise<void> = async () => {
    const result = await dispatch(
      pushBitcoinTransactionAction({ bitcoinAddress: btcAddress })
    );

    if (pushBitcoinTransactionAction.fulfilled.match(result)) {
      const payloadData = result.payload;

      if (payloadData && bitcoinTransactionData) {
        const data: TransactionHistoryDataType = {
          txHash: payloadData?.tx?.hash,
          amountSend: bitcoinTransactionData?.amountSend,
          fee: bitcoinTransactionData.fee,
          adminPercent: bitcoinTransactionData.adminPercent,
          adminFee: parseInt(bitcoinTransactionData.adminFee.toString(), 10),
          adminAddress: bitcoinTransactionData.adminAddress,
          toAddress: bitcoinTransactionData.toAddress,
          createdAt: payloadData.tx?.received,
          type: TransactionType.Sent,
          status:
            (payloadData.tx?.confirmations ?? 0) > 6
              ? TransactionStatusType.Completed
              : TransactionStatusType.Pending,
          coinType: CoinType.Bitcoin,
        };
        navigation.dispatch(
          StackActions.replace(HomeStackScreenKey.TransactionDetails, {
            transactionData: data,
          })
        );
        dispatch(setUpdateBalance(true));
      }
    } else if (!pushBitcoinHashErrorExists || !pushBitcoinHashErrorDust) {
      const errorConTextMissingData = createContextError({
        feature: Feature.Transfer,
        fileError: `bitcoin.transfer.hook.ts`,
        functionError: `pushBitcoinTransaction`,
        lineError: 90,
        reason: `pushBitcoinTransactionAction.rejected`,
        protocol: ProtocolType.Bitcoin,
      });
      dispatch(setShowCommonErrorModal(true));
      dispatch(setActionFailedNeedToContact(errorConTextMissingData));
    }
  };

  const closeRequirePinCode = () => setRequirePinCode(false);

  const errorHash = pushBitcoinOtherError;

  const openErrorHashLink = () => {
    Linking.openURL(
      `${EnvConfig.BLOCK_CYPHER_PUSH_TRANSACTION_DETAIL_ULR}${errorHash}`
    );
  };

  const getSubErrorTitle = (): {
    titleWithI18N?: string;
    title?: string;
    subTitleWithI18N?: string;
    subTitle?: string;
  } => {
    if (pushBitcoinHashErrorExists) {
      return {
        titleWithI18N: LanguageKey.push_bitcoin_hash_error_exists_title,
        subTitleWithI18N: LanguageKey.push_bitcoin_hash_error_exists_sub_title,
      };
    }
    if (pushBitcoinHashErrorDust) {
      return {
        titleWithI18N: LanguageKey.push_bitcoin_hash_error_dust_title,
        subTitleWithI18N: LanguageKey.push_bitcoin_hash_error_dust_sub_title,
      };
    }
    return {
      titleWithI18N: LanguageKey.send_push_error_title,
      subTitle: pushBitcoinOtherError ?? t(LanguageKey.common_try_again),
    };
  };

  const errorSubTitle = getSubErrorTitle();

  const showModal = useAppSelector(selectorShowModalConfirm);
  const [
    actionNavigationAfterModalDismiss,
    setActionNavigationAfterModalDismiss,
  ] = useState<StackActionType>();

  const onModalConfirmDismiss = () => {
    if (actionNavigationAfterModalDismiss) {
      navigation.dispatch(actionNavigationAfterModalDismiss);
      setActionNavigationAfterModalDismiss(undefined);
    }
  };

  const isPushTransactionFailure = useAppSelector(getIsPushTransactionFailure);

  const onClosePushTransactionFailureModal = () =>
    dispatch(setIsPushTransactionFailure(false));

  const onClose = () => {
    dispatch(setShowModalConfirm(false));
  };

  // MARK: Scan QR action.
  const [showScanQRCamera, setShowScanQRCamera] = useState(false);

  const onCloseScanQR = () => {
    setShowScanQRCamera(false);
  };

  const handleCallBackScanQR = async (data: string) => {
    setToAddress(data);
    const res = await checkBitCoinAddress(data);
    setToAddressError(!res);
    setShowScanQRCamera(false);
  };

  const onScanQR = () => {
    if (!isLoading) {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }
      setShowScanQRCamera(true);
    }
  };

  // MARK: Balance data
  const balance = useAppSelector(getBTCFinalBalance) ?? 0;

  // MARK: Max data
  const btcMaxAmount = useAppSelector(selectorMaxAmount) ?? 0;
  const maxAmount = btcMaxAmount;

  // MARK: Loading state
  const isLoadingPushTransaction = useAppSelector(
    selectorIsLoadingPushTransaction
  );
  const isBitcoinMaxAmountLoading = useAppSelector(
    selectorIsBitcoinMaxAmountLoading
  );
  const maxAmountLoading = isBitcoinMaxAmountLoading;

  const coinDataLoading = useAppSelector(selectorIsBitcoinDataLoading);

  const isLoading = isLoadingPushTransaction;

  // MARK: Transaction Data
  const transactionData = useAppSelector(selectorBitcoinTransactionData);

  const [toAddress, setToAddress] = useState("");
  const [toAddressFocus, setToAddressFocus] = useState(false);
  const [toAddressError, setToAddressError] = useState(false);
  const onToAddressFocus = () => setToAddressFocus(true);
  const checkBitCoinAddress = async (
    currentToAddress?: string
  ): Promise<boolean> => {
    const currentValue = currentToAddress ?? toAddress;
    const res = await BitcoinUtils.isValidAddress(currentValue);
    return res;
  };
  const onToAddressBlur = async () => {
    if (toAddress) {
      setToAddressFocus(false);
      const res = await checkBitCoinAddress();
      if (!res) {
        setToAddressError(true);
      }
    }
  };
  const onToAddressChange = (text: string) => {
    if (toAddressError) {
      setToAddressError(false);
    }
    setToAddress(text);
  };
  const clearToAddress = () => {
    setToAddress("");
    if (toAddressError) {
      setToAddressError(false);
    }
  };
  const [amountSend, setAmountSend] = useState("");
  const [inputAmountError, setInputAmountError] = useState(false);

  const isInputAmountZero = () => {
    try {
      const res = parseFloat(amountSend);
      return res === 0;
    } catch (error) {
      console.error("isInputAmountZero Error:", error);
      return true;
    }
  };

  const balanceInputCurrency = BitcoinUtils.getBitcoinBalanceToCurrency(
    BitcoinUtils.getSatoshiFromBitcoin(amountSend),
    selectedCurrencySetting,
    protocolBaseData?.price
  );

  const balanceCurrencyString = amountSend
    ? `≈ ${balanceInputCurrency.currency?.sign}${balanceInputCurrency.balance}`
    : "";

  // MARK: Modal Balance Text
  const balanceTitle = `${Utils.formattedBalanceCurrency(
    parseFloat(BitcoinUtils.getBitcoinFromSatoshi(balance))
  )} ${t(LanguageKey.currency_bitcoin)}`;
  // MARK: Modal from Text
  const fromAddress = WalletUtils.getShortAddress(btcAddress);
  const fromAmount = `${Utils.formattedBalanceCurrency(parseFloat(amountSend))} ${t(
    LanguageKey.currency_bitcoin
  )}`;

  const getAmountBTCCurrency = (amount: string | number) => {
    const formCurrency = BitcoinUtils.getBitcoinBalanceToCurrency(
      BitcoinUtils.getSatoshiFromBitcoin(amount),
      selectedCurrencySetting,
      protocolBaseData?.price
    );

    return `≈ ${formCurrency.currency?.sign}${formCurrency.balance}`;
  };

  const fromSubAmount = getAmountBTCCurrency(fromAmount);
  // MARK: Admin Text
  const adminFee = `${Utils.formattedBalanceCurrency(
    parseFloat(
      BitcoinUtils.getBitcoinFromSatoshi(transactionData?.adminFee ?? 0)
    )
  )} ${t(LanguageKey.currency_bitcoin)}`;

  const subAdminFee = getAmountBTCCurrency(
    BitcoinUtils.getBitcoinFromSatoshi(transactionData?.adminFee ?? 0)
  );
  // MARK: Max Text
  const maxAmountTitle = ` ${Utils.formattedBalanceCurrency(
    parseFloat(BitcoinUtils.getBitcoinFromSatoshi(maxAmount.toString()))
  )} ${t(LanguageKey.currency_bitcoin)}`;

  const errorNetworkFeeHigh =
    maxAmount === 0 && bitcoinData?.final_balance !== 0;

  // MARK: Network Fee Text
  const networkFee = `${Utils.formattedBalanceCurrency(
    parseFloat(BitcoinUtils.getBitcoinFromSatoshi(transactionData?.fee ?? 0))
  )} ${t(LanguageKey.currency_bitcoin)}`;
  const subNetworkFee = getAmountBTCCurrency(
    BitcoinUtils.getBitcoinFromSatoshi(transactionData?.fee ?? 0)
  );
  // MARK: useEffect
  useEffect(() => {
    if (showDustError) {
      dispatch(setShowDustError(false));
    }
    dispatch(getNetworkFee());
    dispatch(getBitcoinData({ bitcoinAddress: btcAddress }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MARK: Go Confirm Pin Action
  const confirmAction = () => {
    setRequirePinCode(true);
  };

  // MARK: Disable Continue State
  const disableContinue =
    toAddress === "" ||
    toAddress === undefined ||
    toAddress === null ||
    amountSend === "" ||
    amountSend === undefined ||
    amountSend === null ||
    inputAmountError ||
    toAddressError ||
    isInputAmountZero();

  // MARK: Create Transaction Action
  const createTransactionAction = () => {
    Keyboard.dismiss();
    createBitcoinTransactionAction();
  };

  // MARK: Create Bitcoin Transaction Action
  const createBitcoinTransactionAction = async () => {
    if (amountSend === "" || amountSend === undefined || amountSend === null) {
      return;
    }
    const res = await checkBitCoinAddress();
    if (!res) {
      setToAddressError(true);
    } else {
      dispatch(
        createBitcoinTransaction({
          fromAddress: btcAddress,
          toAddress: toAddress,
          amountSend: parseFloat(
            BitcoinUtils.getSatoshiFromBitcoin(amountSend).toString()
          ),
          adminAddress: protocolBaseData?.beneficiary?.walletAddress ?? "",
          adminPercent: protocolBaseData?.coinTransferFee ?? 0,
        })
      );
    }
  };

  // MARK: Handle Copy To Clipboard
  const handleCopyToClipboard = async () => {
    if (!isLoading) {
      try {
        const text = await Clipboard.getStringAsync();
        setToAddress(text);
        const res = await checkBitCoinAddress(text);
        setToAddressError(!res);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // MARK: On Amount Send Change Text
  const onAmountSendChangeText = (value: string) => {
    const convertValue = value.replace(/,/g, ".");
    if (showDustError) {
      dispatch(setShowDustError(false));
    }
    if (inputAmountError) {
      setInputAmountError(false);
    }
    setAmountSend(convertValue);
    const newValue = parseFloat(convertValue);
    const convertMaxValue = parseFloat(
      BitcoinUtils.getBitcoinFromSatoshi(maxAmount.toString())
    );
    if (newValue > convertMaxValue) {
      setInputAmountError(true);
    }
  };

  // MARK: Max Action
  const maxAction = () => {
    setInputAmountError(false);
    setAmountSend(BitcoinUtils.getBitcoinFromSatoshi(maxAmount.toString()));
  };
  return {
    coinType,
    balanceTitle,
    adminFee,
    subAdminFee,
    networkFee,
    subNetworkFee,
    fromAddress,
    onToAddressChange,
    clearToAddress,
    toAddress,
    handleCopyToClipboard,
    maxAmountTitle,
    onAmountSendChangeText,
    amountSend,
    fromAmount,
    fromSubAmount,
    createTransactionAction,
    coinDataLoading,
    maxAmountLoading,
    confirmAction,
    isLoadingPushTransaction,
    disableContinue,
    maxAction,
    inputAmountError,
    showModal,
    onClose,
    toAddressFocus,
    onToAddressFocus,
    onToAddressBlur,
    onScanQR,
    showScanQRCamera,
    isPushTransactionFailure,
    onClosePushTransactionFailureModal,
    showDustError,
    errorNetworkFeeHigh,
    toAddressError,
    balanceCurrencyString,
    isLoading,
    errorSubTitle,
    insets,
    errorHash,
    openErrorHashLink,
    pushBitcoinHashErrorExists,
    pushBitcoinHashErrorDust,
    onModalConfirmDismiss,
    requirePinCode,
    closeRequirePinCode,
    continueActionAfterPassPinCode,
    handleCallBackScanQR,
    onCloseScanQR,
  };
};
