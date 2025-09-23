import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StackActions } from "@react-navigation/native";
import { AccountStatus } from "@ton-api/client";
import { Address } from "@ton/core";
import Big from "big.js";
import * as Clipboard from "expo-clipboard";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Linking, TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import EnvConfig from "src/core/constants/EnvConfig";
import AppToastType from "src/core/enum/AppToastType";
import { CoinType } from "src/core/enum/CoinType";
import {
  CommonContextMessage,
  Feature,
} from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useProtocolSelected,
  useSelectedCurrencySetting,
  useTonAddressData,
} from "src/core/redux/slice/account.selector";
import {
  getBlockTonTransfer,
  getKeyboardHeight,
  getTonAdminBounce,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import TonServices from "src/core/services/TonServices";
import { TonAccountsType } from "src/core/services/TonServices/type";
import TonTransactions from "src/core/services/TonTransactions/tonTransactions";
import { TransferDataType } from "src/core/services/TonTransactions/tonTransactions.type";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import Utils from "src/core/utils/commonUtils";
import AppErrorUtils from "src/core/utils/errorUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import TonUtils from "src/core/utils/tonUtils";
import WalletUtils from "src/core/utils/walletUtils";
import { TransactionDataType } from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.type";
import {
  getTonData,
  selectorTonBalance,
  selectorTonDataLoading,
} from "src/features/coinDetails/ton/ton.coinDetails.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { TransactionDetailsProps } from "src/navigation/stacks/type/HomeParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useTonTransfer = ({ navigation }: RootNavigationType) => {
  // Core hooks & constants
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const insets: EdgeInsets = useAppSafeAreaInsets();
  // Selectors
  const protocolBaseData = useProtocolSelected();
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const tonAddressData = useTonAddressData();
  const balance = useAppSelector(selectorTonBalance) ?? 0;
  const tonAdminBounce = useAppSelector(getTonAdminBounce);
  const keyboardHeight = useAppSelector(getKeyboardHeight);

  // Loading states
  const coinDataLoading = useAppSelector(selectorTonDataLoading);

  // Local states
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const bottomSheetSendMaximum = useRef<BottomSheetModal>(null);
  const inputAmountRef = useRef<TextInput>(null);
  const [getMaxAmountLoading, setGetMaxAmountLoading] = useState(false);
  const [maxAmount, setMaxAmount] = useState<number>(0);
  const [maxAdminFee, setMaxAdminFee] = useState<number>(0);
  const [inputRecipientAddress, setInputRecipientAddress] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferData, setTransferData] = useState<TransferDataType>();
  const [requirePinCode, setRequirePinCode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showScanQRCamera, setShowScanQRCamera] = useState(false);

  const [toAddress, setToAddress] = useState("");
  const [toAddressFocus, setToAddressFocus] = useState(false);
  const [toAddressError, setToAddressError] = useState(false);
  const [amountSend, setAmountSend] = useState("");
  const [memo, setMemo] = useState<string | undefined>(undefined);
  const [inputAmountError, setInputAmountError] = useState(false);
  const [estimateMaxError, setEstimateMaxError] = useState<string | null>(null);
  const [showModalConfirmBounceable, setShowModalConfirmBounceable] =
    useState(false);
  const [transactionData, setTransactionData] = useState<TransactionDataType>();
  const [
    showRequirePinCodeAfterCloseModal,
    setShowRequirePinCodeAfterCloseModal,
  ] = useState(false);
  const [recipientAccountData, setRecipientAccountData] =
    useState<TonAccountsType>();
  const blockTonTransfer = useAppSelector(getBlockTonTransfer);

  const isRequireMemo = recipientAccountData?.memo_required;

  // Computed values
  const maxAmountWithDecimal = TonUtils.formatBigNumber(
    maxAmount.toString(),
    protocolBaseData?.nativeToken.decimal
  );

  const handleError = ({
    reason,
    functionError,
    id,
    logReason = true,
  }: {
    reason: string;
    functionError: string;
    id?: number;
    logReason?: boolean;
  }) => {
    AppErrorUtils.handleError({
      dispatch: dispatch,
      contextData: {
        feature: Feature.Transfer,
        protocol: ProtocolType.Ton,
        fileError: `ton.transfer.hook.ts`,
        reason: reason,
        functionError: functionError,
        id: id,
      },
      logReason,
    });
  };

  const closeKeyboard = () => setKeyboardOpen(false);
  const openKeyboard = () => setKeyboardOpen(true);

  const disableWithRequireMemo = isRequireMemo ? !memo : false;

  const disableContinue = inputRecipientAddress
    ? !toAddress ||
      disableWithRequireMemo ||
      !amountSend ||
      inputAmountError ||
      toAddressError ||
      Utils.isInputAmountZero(amountSend) ||
      disableWithRequireMemo
    : !toAddress;

  const continueActionAfterPassPinCode = async () => {
    closeRequirePinCode();
    startTonTransactionLoading();
    const tonServices = new TonServices();
    if (transferData?.messageBOCString) {
      const sendMessageToBlockchainRes =
        await tonServices.sendMessageToBlockchain({
          boc: transferData?.messageBOCString,
        });
      if (sendMessageToBlockchainRes.isSuccess) {
        const dataHistory: TransactionHistoryDataType = {
          amountSend: transactionData?.amountSend ?? 0,
          fee: Math.abs(transactionData?.fee ?? 0),
          adminPercent: transactionData?.adminPercent,
          adminFee: transactionData?.adminFee,
          adminAddress: transactionData?.adminAddress,
          toAddress: transactionData?.toAddress,
          createdAt: moment().toISOString(),
          type: TransactionType.Sent,
          memo: memo,
          status: TransactionStatusType.Pending,
          coinType: CoinType.Ton,
          isNative: true,
        };
        const params: TransactionDetailsProps = {
          transactionData: dataHistory,
          blockExplorerUrl: protocolBaseData?.transactionScanURL,
        };
        dispatch(setUpdateBalance(true));
        navigation.dispatch(
          StackActions.replace(HomeStackScreenKey.TransactionDetails, params)
        );
      } else {
        const errorReason =
          CommonContextMessage.callApiFailed +
          ": " +
          `API: sendMessageToBlockchain, Response: ${sendMessageToBlockchainRes ? JSON.stringify(sendMessageToBlockchainRes) : undefined}`;

        handleError({
          reason: errorReason,
          functionError: "continueActionAfterPassPinCode",
        });
      }
    }
    stopTonTransactionLoading();
  };

  const closeRequirePinCode = () => setRequirePinCode(false);

  const onModalConfirmDismiss = () => {
    if (showRequirePinCodeAfterCloseModal) {
      setRequirePinCode(true);
      setShowRequirePinCodeAfterCloseModal(false);
    }
  };

  const onClose = () => {
    setShowModal(false);
  };

  // MARK: Scan QR action.
  const handleCallBackScanQR = (data: string) => {
    closeKeyboard();
    setToAddress(data);
    checkTonAddressAndSetState(data);
  };

  const onCloseScanQr = () => {
    setShowScanQRCamera(false);
  };

  const onScanQR = () => {
    if (!transferLoading) {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }
      setShowScanQRCamera(true);
    }
  };

  const showModalConfirmBounceableAction = () => {
    setShowModalConfirmBounceable(true);
  };
  const hideModalConfirmBounceable = () => {
    stopTonTransactionLoading();
    setShowModalConfirmBounceable(false);
  };

  const balanceInputCurrency = TonUtils.getTonBalanceToCurrency(
    isNaN(parseFloat(amountSend)) ? 0 : parseFloat(amountSend),
    selectedCurrencySetting,
    protocolBaseData?.price
  );

  const balanceCurrencyString = amountSend
    ? `≈ ${balanceInputCurrency.currency?.sign}${balanceInputCurrency.balance}`
    : "";

  // MARK: Modal Balance Text
  const balanceTitle = `${TonUtils.formatTonBalance(balance)} ${t(LanguageKey.currency_ton)}`;

  // MARK: Modal from Text
  const fromAddress = WalletUtils.getShortAddress(tonAddressData?.address);

  const fromAmount = `${amountSend} ${t(LanguageKey.currency_ton)}`;
  const fromSubAmount = `≈ ${selectedCurrencySetting?.sign}${balanceInputCurrency.balance}`;

  const adminFeeValue = TonUtils.formatBigNumber(
    transactionData?.adminFee?.toString() ?? "0",
    protocolBaseData?.nativeToken.decimal
  );
  // MARK: Admin Text
  const adminFee = `${TonUtils.formatTonBalance(
    adminFeeValue
  )} ${t(LanguageKey.currency_ton)}`;

  const adminFeeCurrency = TonUtils.getTonBalanceToCurrency(
    adminFeeValue,
    selectedCurrencySetting,
    protocolBaseData?.price
  );

  const subAdminFee = `≈ ${selectedCurrencySetting?.sign}${adminFeeCurrency.balance}`;

  // MARK: Max Text
  const maxAmountTitle = ` ${Utils.formattedBalanceCurrency(maxAmountWithDecimal)} ${t(
    LanguageKey.currency_ton
  )}`;

  const networkFeeValue = TonUtils.formatBigNumber(
    transactionData?.fee?.toString() ?? "0",
    protocolBaseData?.nativeToken.decimal
  );

  const networkFeeCurrency = TonUtils.getTonBalanceToCurrency(
    networkFeeValue,
    selectedCurrencySetting,
    protocolBaseData?.price
  );
  // MARK: Network Fee Text
  const networkFee = `${TonUtils.formatTonBalance(networkFeeValue)} ${t(LanguageKey.currency_ton)}`;

  const subNetworkFee = `≈ ${selectedCurrencySetting?.sign}${networkFeeCurrency.balance}`;

  // MARK: useEffect
  useEffect(() => {
    if (transferLoading) {
      stopTonTransactionLoading();
    }
    dispatch(
      getTonData({
        tonAddressData,
        decimal: protocolBaseData?.nativeToken.decimal,
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const getMaxAmount = async () => {
    try {
      setMaxAmount(0);
      const adminAddress = protocolBaseData?.beneficiary?.walletAddress;
      const adminPercent = protocolBaseData?.coinTransferFee ?? 0;

      if (!adminAddress || !tonAddressData) {
        const errorReason =
          CommonContextMessage.errorMissingData +
          ": " +
          `[adminAddress: ${adminAddress} || tonAddressData: ${tonAddressData ? JSON.stringify(tonAddressData) : undefined}]`;
        handleError({
          reason: errorReason,
          functionError: "getMaxAmount",
        });
        return;
      }
      setGetMaxAmountLoading(true);
      const tonTransactionServices = new TonTransactions();
      const maxAmountRes = await tonTransactionServices.estimateMax({
        privateKey: tonAddressData?.privateKey,
        publicKey: tonAddressData?.publicKey,
        recipientAddress: toAddress,
        adminAddress: adminAddress,
        adminPercent: adminPercent,
      });
      if (!maxAmountRes) {
        setGetMaxAmountLoading(false);
        return;
      }
      if (maxAmountRes.maxAmount < 0) {
        const totalFeeWithDecimal = TonUtils.formatBigNumber(
          maxAmountRes.totalFee.toString(),
          protocolBaseData?.nativeToken?.decimal
        );
        setEstimateMaxError(
          AppI18Next.t(
            LanguageKey.evm_not_enough_amount_to_cover_transaction_fee,
            {
              amount: `≈ ${totalFeeWithDecimal}`,
              coin_name: protocolBaseData.symbol,
            }
          )
        );
        setMaxAmount(0);
        setMaxAdminFee(0);
      } else {
        setMaxAmount(maxAmountRes.maxAmount);
        setMaxAdminFee(maxAmountRes.maxAdminFee);
      }
      setGetMaxAmountLoading(false);
    } catch (error) {
      console.error("getMaxAmount error", error);
      setGetMaxAmountLoading(false);
    }
  };

  useEffect(() => {
    if (inputRecipientAddress) {
      if (inputAmountRef?.current) {
        inputAmountRef?.current?.focus();
      }

      getMaxAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRecipientAddress]);

  useEffect(() => {
    if (!toAddress) {
      setInputRecipientAddress(false);
    }
    setAmountSend("");
    setInputAmountError(false);
    setMemo(undefined);
    getReceiveAddressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toAddress]);

  // MARK: Go Confirm Pin Action
  const confirmAction = () => {
    onClose();
    setShowRequirePinCodeAfterCloseModal(true);
  };

  // MARK: Change Ton Transaction Loading
  const startTonTransactionLoading = () => {
    setTransferLoading(true);
  };
  const stopTonTransactionLoading = () => {
    setTransferLoading(false);
  };

  const getReceiveAddressData = async () => {
    const tonServices = new TonServices();
    const getTonAccountsRes = await tonServices.getAccounts({
      address: Address.parse(toAddress),
    });
    if (getTonAccountsRes.isSuccess) {
      const tonAccountData = getTonAccountsRes.data as TonAccountsType;
      setRecipientAccountData(tonAccountData);
      return tonAccountData;
    } else {
      return undefined;
    }
  };

  // MARK: Create Ton Transaction Action
  const createTransactionAction = async () => {
    const isValidAddress = checkTonAddress(toAddress);
    setToAddressError(!isValidAddress);
    setInputRecipientAddress(isValidAddress);

    if (!isValidAddress || !inputRecipientAddress) return;

    // Proceed with transaction
    startTonTransactionLoading();
    const recipientAccount = await getReceiveAddressData();

    if (recipientAccount) {
      if (recipientAccount.status === AccountStatus.Active) {
        createToTransactionAfterCheckAddress(recipientAccount);
      } else {
        showModalConfirmBounceableAction();
      }
    } else {
      const errorReason =
        CommonContextMessage.errorMissingData +
        ": " +
        `recipientAccount: ${recipientAccount}`;
      handleError({
        reason: errorReason,
        functionError: "createTransactionAction",
      });
      stopTonTransactionLoading();
    }
  };

  const createToTransactionAfterCheckAddress = async (
    recipientAccountData: TonAccountsType
  ) => {
    try {
      let convertAmountWithDecimal = TonUtils.toBigNumber(
        amountSend,
        protocolBaseData?.nativeToken.decimal
      );
      const isSendMaxAmount = amountSend === maxAmountWithDecimal.toString();
      const adminAddress = protocolBaseData?.beneficiary?.walletAddress;
      const adminPercent = protocolBaseData?.coinTransferFee ?? 0;
      const privateKey = tonAddressData?.privateKey;
      if (!adminAddress || !privateKey) {
        const errorReason =
          CommonContextMessage.errorMissingData +
          ": " +
          `[adminAddress: ${adminAddress} || tonAddressData: ${tonAddressData ? JSON.stringify(tonAddressData) : undefined}]`;
        handleError({
          reason: errorReason,
          functionError: "createToTransactionAfterCheckAddress",
          id: 1,
        });
        return;
      }

      const adminValueNano = isSendMaxAmount
        ? maxAdminFee
        : BigInt(
            Math.ceil(parseFloat(convertAmountWithDecimal) * adminPercent)
          );
      const tonServices = new TonServices();
      const getAccountRes = await tonServices.getAccounts({
        address: Address.parse(tonAddressData?.address ?? ""),
      });

      if (getAccountRes.isSuccess && recipientAccountData) {
        const tonTransactionServices = new TonTransactions();
        const tonTransactionDataRes =
          await tonTransactionServices.createTransfer({
            valueNano: convertAmountWithDecimal,
            recipientAddress: toAddress,
            adminAddress: adminAddress,
            adminValueNano: adminValueNano.toString(),
            privateKey: privateKey,
            version: tonAddressData?.version,
            publicKey: tonAddressData?.publicKey ?? "",
            estimateFee: true,
            fromAccountData: getAccountRes.data as TonAccountsType,
            recipientAccountData: recipientAccountData,
            memo: memo,
            tonAdminBounce: tonAdminBounce,
          });
        if (!tonTransactionDataRes) {
          return tonTransactionDataRes;
        }
        const { transferData, fee } = tonTransactionDataRes;

        setTransferData(transferData);

        const networkFee = fee ? fee?.event?.extra : 0;

        const tonTransactionData: TransactionDataType = {
          toAddress: toAddress,
          fromAddress: tonAddressData.address ?? "",
          amountSend: parseFloat(convertAmountWithDecimal),
          fee: Number(networkFee),
          adminAddress: adminAddress,
          adminFee: Number(adminValueNano),
          adminPercent: adminPercent,
          base64EncodedTransaction: transferData.messageBOCString,
        };

        setTransactionData(tonTransactionData);
        setShowModal(true);
      } else {
        const errorReason =
          CommonContextMessage.callApiFailed +
          ": " +
          `[getAccountRes: ${getAccountRes ? JSON.stringify(getAccountRes) : undefined} || recipientAccountData: ${recipientAccountData ? JSON.stringify(recipientAccountData) : undefined}]`;
        handleError({
          reason: errorReason,
          functionError: "createToTransactionAfterCheckAddress",
          id: 2,
        });

        return;
      }
    } catch (error: any) {
      const errorReason = `[error: ${error?.message ?? error}]`;
      handleError({
        reason: errorReason,
        functionError: "createToTransactionAfterCheckAddress",
        id: 3,
      });

      stopTonTransactionLoading();
    } finally {
      stopTonTransactionLoading();
    }
  };

  const continueActionAfterConfirm = () => {
    setShowModalConfirmBounceable(false);
    if (recipientAccountData) {
      createToTransactionAfterCheckAddress(recipientAccountData);
    } else {
      const errorReason =
        CommonContextMessage.errorMissingData +
        ": " +
        `recipientAccountData: ${recipientAccountData}`;
      handleError({
        reason: errorReason,
        functionError: "continueActionAfterConfirm",
      });
    }
  };

  // MARK: Handle Copy To Clipboard
  const handleCopyToClipboard = async () => {
    if (!transferLoading) {
      try {
        const text = await Clipboard.getStringAsync();
        if (text !== toAddress) {
          closeKeyboard();
          setToAddress(text);
          checkTonAddressAndSetState(text);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const checkTonAddress = (currentToAddress?: string) => {
    const currentValue = currentToAddress ?? toAddress;
    return TonUtils.validAddress(currentValue);
  };

  const checkTonAddressAndSetState = (currentToAddress?: string) => {
    const currentValue = currentToAddress ?? toAddress;
    const res = checkTonAddress(currentValue);
    setToAddressError(!res);
    setInputRecipientAddress(res);
  };

  const onToAddressFocus = () => {
    openKeyboard();
    setToAddressFocus(true);
  };

  const onToAddressBlur = async () => {
    closeKeyboard();
    if (toAddress) {
      setToAddressFocus(false);
      checkTonAddressAndSetState();
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

  // MARK: On Amount Send Change Text
  const onAmountSendChangeText = (value: string) => {
    const convertValue = value.replace(/,/g, ".");

    if (inputAmountError) {
      setInputAmountError(false);
    }
    setAmountSend(convertValue);
    if (value.length === 0) {
      setInputAmountError(false);
      return;
    }
    if (convertValue === "" || isNaN(Number(convertValue))) {
      setInputAmountError(true);
      return;
    }
    let convertAmountWithDecimal = TonUtils.toBigNumber(
      convertValue,
      protocolBaseData?.nativeToken.decimal
    );
    if (
      parseFloat(convertAmountWithDecimal) <= 0 &&
      parseFloat(convertValue) !== 0
    ) {
      setInputAmountError(true);
      return;
    }
    const newValue = Big(convertValue);
    const convertMaxValue = Big(maxAmountWithDecimal);
    if (newValue.gt(convertMaxValue)) {
      setInputAmountError(true);
    }
  };

  // MARK: Max Action
  const maxAction = () => {
    if (estimateMaxError) {
      return;
    }
    setInputAmountError(false);
    setAmountSend(maxAmountWithDecimal.toString());
  };

  const openNonBounceableMessageLink = () => {
    Linking.openURL(EnvConfig.TON_NON_BOUNCEABLE_MESSAGE_URL);
  };
  const onCloseBottomSheetSendMaximum = () => {
    bottomSheetSendMaximum.current?.close();
  };
  const onOpenBottomSheetSendMaximum = () => {
    Keyboard.dismiss();
    bottomSheetSendMaximum.current?.present();
  };

  useEffect(() => {
    if (blockTonTransfer) {
      navigation.goBack();
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockTonTransfer]);

  const bodyHeight = Utils.screenHeight - insets.top - 30;
  const subBodyHeightActive =
    amountSend || isRequireMemo ? undefined : bodyHeight - keyboardHeight;
  const bodyHeightActive = toAddress
    ? subBodyHeightActive
    : bodyHeight - keyboardHeight;

  const contentHeight = keyboardOpen ? bodyHeightActive : bodyHeight;

  const onInputAmountFocus = () => openKeyboard();
  const onInputAmountBlur = () => closeKeyboard();
  const onMemoFocus = () => openKeyboard();
  const onMemoBlur = () => closeKeyboard();

  return {
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
    confirmAction,
    disableContinue,
    maxAction,
    inputAmountError,
    transferLoading,
    showModalConfirmBounceable,
    hideModalConfirmBounceable,
    continueActionAfterConfirm,
    showModal,
    onClose,
    toAddressFocus,
    onToAddressFocus,
    onToAddressBlur,
    onScanQR,
    showScanQRCamera,
    toAddressError,
    balanceCurrencyString,
    insets,
    onModalConfirmDismiss,
    requirePinCode,
    closeRequirePinCode,
    continueActionAfterPassPinCode,
    openNonBounceableMessageLink,
    bottomSheetSendMaximum,
    onCloseBottomSheetSendMaximum,
    onOpenBottomSheetSendMaximum,
    memo,
    setMemo,
    inputRecipientAddress,
    inputAmountRef,
    getMaxAmountLoading,
    handleCallBackScanQR,
    onCloseScanQr,
    estimateMaxError,
    isRequireMemo,
    keyboardOpen,
    keyboardHeight,
    contentHeight,
    closeKeyboard,
    onInputAmountFocus,
    onInputAmountBlur,
    onMemoFocus,
    onMemoBlur,
  };
};

export default useTonTransfer;
