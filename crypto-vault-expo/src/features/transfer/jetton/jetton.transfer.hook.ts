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
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useProtocolSelected,
  useSelectedCurrencySetting,
  useTonAddressData,
} from "src/core/redux/slice/account.selector";
import {
  getBlockJettonTransfer,
  getJettonAdminBounce,
  getKeyboardHeight,
  getMinFeeForJettonTransfer,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import TonServices from "src/core/services/TonServices";
import { TonAccountsType } from "src/core/services/TonServices/type";
import JettonTransfer from "src/core/services/TonTransactions/jettonTransfer";
import {
  CreateJettonTransactionsParamType,
  TransferDataType,
} from "src/core/services/TonTransactions/tonTransactions.type";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import Utils from "src/core/utils/commonUtils";
import AppErrorUtils from "src/core/utils/errorUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import TonUtils from "src/core/utils/tonUtils";
import WalletUtils from "src/core/utils/walletUtils";
import { TransactionDataType } from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.type";
import {
  getJettons,
  selectorJettonDataLoading,
} from "src/features/coinDetails/ton/ton.coinDetails.slice";
import { useSelectorSelectedCryptoData } from "src/features/home/slice/home.selector";
import { updateCryptoBalance } from "src/features/home/slice/home.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { TransactionDetailsProps } from "src/navigation/stacks/type/HomeParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useJettonTransfer = ({ navigation }: RootNavigationType) => {
  // Core hooks & constants
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const blockJettonTransfer = useAppSelector(getBlockJettonTransfer);
  // Selectors
  const selectedCryptoData = useSelectorSelectedCryptoData();
  const minFeeFromRemoteConfig = useAppSelector(getMinFeeForJettonTransfer);
  const logoUri = selectedCryptoData?.logo;
  const tokenName = selectedCryptoData?.name;
  const tokenRateCurrency = selectedCryptoData?.tokenRateCurrency;
  const tokenSymbol = selectedCryptoData?.symbol;
  const jettonData = selectedCryptoData?.navigationParams?.jettonData;
  const isledgerifyToken = selectedCryptoData?.isledgerifyToken;
  const protocolBaseData = useProtocolSelected();
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const tonAddressData = useTonAddressData();
  const jettonAdminBounce = useAppSelector(getJettonAdminBounce);
  const keyboardHeight = useAppSelector(getKeyboardHeight);

  // Loading states
  const jettonDataLoading = useAppSelector(selectorJettonDataLoading);
  // Local states
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const bottomSheetSendMaximum = useRef<BottomSheetModal>(null);
  const inputAmountRef = useRef<TextInput>(null);
  const [getMaxAmountLoading, setGetMaxAmountLoading] = useState(false);
  const [maxAmount, setMaxAmount] = useState<bigint>(BigInt(0));
  const [maxAdminFee, setMaxAdminFee] = useState<bigint>(BigInt(0));
  const [inputRecipientAddress, setInputRecipientAddress] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferData, setTransferData] = useState<TransferDataType>();
  const [requirePinCode, setRequirePinCode] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showScanQRCamera, setShowScanQRCamera] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [toAddressFocus, setToAddressFocus] = useState(false);
  const [toAddressError, setToAddressError] = useState(false);
  const [amountSend, setAmountSend] = useState("");
  const [memo, setMemo] = useState<string | undefined>("");
  const [inputAmountError, setInputAmountError] = useState(false);
  const [errorTransaction, setErrorTransaction] = useState("");
  const [showModalConfirmBounceable, setShowModalConfirmBounceable] =
    useState(false);
  const [transactionData, setTransactionData] = useState<TransactionDataType>();
  const [
    showRequirePinCodeAfterCloseModal,
    setShowRequirePinCodeAfterCloseModal,
  ] = useState(false);
  const [recipientAccountData, setRecipientAccountData] =
    useState<TonAccountsType>();

  const isRequireMemo = recipientAccountData?.memo_required;

  const closeKeyboard = () => setKeyboardOpen(false);
  const openKeyboard = () => setKeyboardOpen(true);

  // Computed values
  const maxAmountWithDecimal = TonUtils.convertWithDecimal(
    maxAmount.toString(),
    selectedCryptoData?.decimal ?? 9
  );

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
          adminAddress: "UQCRGUfy1tTcik1NbkwYUMHv8yi8G8fiAVH6pIWYO9m5j-Ek",
          toAddress: transactionData?.toAddress,
          createdAt: moment().toISOString(),
          type: TransactionType.Sent,
          memo: memo,
          status: TransactionStatusType.Pending,
          coinType: CoinType.Ton,
          tokenSymbol: tokenSymbol,
          decimal: selectedCryptoData?.decimal,
          isNative: false,
          nativeDecimal: protocolBaseData?.nativeToken.decimal,
        };

        const params: TransactionDetailsProps = {
          transactionData: dataHistory,
          blockExplorerUrl: protocolBaseData?.transactionScanURL,
        };
        dispatch(setUpdateBalance(true));
        navigation.dispatch(
          StackActions.replace(HomeStackScreenKey.TransactionDetails, params)
        );
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
    setShowModalConfirm(false);
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

  const { balanceFiatString } = TonUtils.convertBalanceWithFiat({
    balance: 0,
    balanceToken: parseFloat(amountSend),
    isNative: false,
    tokenRate: tokenRateCurrency,
    protocolRate: protocolBaseData?.price ?? 1,
    settingCurrencyRate: selectedCurrencySetting.rate,
    isledgerifyToken: isledgerifyToken,
  });

  const balanceCurrencyString =
    amountSend && tokenRateCurrency
      ? `≈ ${selectedCurrencySetting?.sign}${balanceFiatString}`
      : null;

  // MARK: Modal Balance Text
  const balanceTitle = `${Utils.formattedBalanceCurrency(selectedCryptoData?.balanceToken ?? 0)} ${tokenSymbol}`;

  // MARK: Modal from Text
  const fromAddress = WalletUtils.getShortAddress(tonAddressData?.address);

  const fromAmount = `${amountSend} ${tokenSymbol}`;

  const fromSubAmount = tokenRateCurrency ? (balanceCurrencyString ?? "") : "";

  const adminFeeValue = TonUtils.formatBigNumber(
    transactionData?.adminFee?.toString() ?? "0",
    selectedCryptoData?.decimal
  );
  // MARK: Admin Text
  const adminFee = `${Utils.formattedBalanceCurrency(
    adminFeeValue
  )} ${tokenSymbol}`;

  const subAdminFeeData = TonUtils.getJettonBalanceToCurrency(
    adminFeeValue ?? 0,
    selectedCurrencySetting,
    (tokenRateCurrency ?? 0) * (protocolBaseData?.price ?? 1),
    isledgerifyToken
  );

  const subAdminFee = tokenRateCurrency
    ? `≈ ${selectedCurrencySetting?.sign}${subAdminFeeData.balance}`
    : "";

  // MARK: Max Text
  const maxAmountTitle = ` ${Utils.formattedBalanceCurrency(Number(maxAmountWithDecimal))} ${tokenSymbol}`;

  const networkFeeValue = Utils.truncateToThreeDecimals(
    TonUtils.formatBigNumber(
      transactionData?.fee?.toString() ?? "0",
      selectedCryptoData?.baseData?.nativeToken?.decimal
    )
  );

  // MARK: Network Fee Text
  const networkFee = `${Utils.fiatFormat(networkFeeValue, 3)} ${selectedCryptoData?.baseData?.nativeToken?.symbol}`;

  const subNetworkFee = tokenRateCurrency
    ? `≈ ${selectedCurrencySetting?.sign}${Utils.formattedCurrency((networkFeeValue ?? 0) * (protocolBaseData?.price ?? 0) * (selectedCurrencySetting?.rate ?? 0))}`
    : null;

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
        fileError: `jetton.transfer.hook.ts`,
        reason: reason,
        functionError: functionError,
        id: id,
      },
      logReason,
    });
  };

  const getMaxAmount = async () => {
    try {
      setMaxAmount(BigInt(0));
      const adminAddress = "UQCRGUfy1tTcik1NbkwYUMHv8yi8G8fiAVH6pIWYO9m5j-Ek";
      const adminPercent = protocolBaseData?.tokenTransferFee ?? 0;
      if (!adminAddress || !tonAddressData) {
        const errorReason =
          CommonContextMessage.callApiFailed +
          ": " +
          `[adminAddress: ${adminAddress} || tonAddressData: ${tonAddressData ? JSON.stringify(tonAddressData) : undefined}]`;

        handleError({
          reason: errorReason,
          functionError: "getMaxAmount",
        });
        return;
      }
      setGetMaxAmountLoading(true);

      const tokenBalance = jettonData?.balance ?? 0;
      const bigAdminFee = Big(tokenBalance)
        .times(adminPercent)
        .round(0, Big.roundUp);

      const bigMaxValue = Big(tokenBalance).minus(bigAdminFee);

      const adminFee = BigInt(bigAdminFee.toFixed());
      const maxValue = BigInt(bigMaxValue.toFixed());

      setMaxAmount(maxValue);
      setMaxAdminFee(adminFee);
      setGetMaxAmountLoading(false);
    } catch (error) {
      console.error("getMaxAmount error", error);
      setGetMaxAmountLoading(false);
    }
  };

  // MARK: useEffect
  useEffect(() => {
    if (transferLoading) {
      stopTonTransactionLoading();
    }

    dispatch(getJettons(tonAddressData)).then((res) => {
      if (getJettons.fulfilled.match(res)) {
        const jettonDataList = res.payload.balances;
        const selectedAddress = jettonData?.wallet_address?.address;
        if (selectedAddress) {
          const newJettonData = jettonDataList.find((e) => {
            const currentAddress = e.wallet_address.address;

            return (
              Address.parse(currentAddress).toRawString() ===
              Address.parse(selectedAddress).toRawString()
            );
          });

          const newBalanceWithDecimals = TonUtils.formatBigNumber(
            newJettonData?.balance ?? "",
            selectedCryptoData?.decimal
          );

          dispatch(updateCryptoBalance(newBalanceWithDecimals));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

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
        createJettonTransfer(recipientAccount);
      } else {
        showModalConfirmBounceableAction();
      }
    } else {
      const errorReason =
        CommonContextMessage.errorMissingData +
        ": " +
        `recipientAccount: ${recipientAccount ? JSON.stringify(recipientAccount) : undefined}`;

      handleError({
        reason: errorReason,
        functionError: "createTransactionAction",
      });
      stopTonTransactionLoading();
    }
  };

  const createJettonTransfer = async (
    recipientAccountData: TonAccountsType
  ) => {
    try {
      if (!amountSend) {
        return;
      }
      const convertAmountWithDecimal = TonUtils.toBigNumber(
        amountSend,
        selectedCryptoData?.decimal
      );
      const isSendMaxAmount = amountSend === maxAmountWithDecimal.toString();
      const adminAddress = "UQCRGUfy1tTcik1NbkwYUMHv8yi8G8fiAVH6pIWYO9m5j-Ek";
      const adminPercent = protocolBaseData?.tokenTransferFee ?? 0;
      const privateKey = tonAddressData?.privateKey;
      if (!adminAddress || !privateKey) {
        const errorReason =
          CommonContextMessage.callApiFailed +
          ": " +
          `[adminAddress: ${adminAddress} || privateKey: ${privateKey}]`;

        handleError({
          reason: errorReason,
          functionError: "createJettonTransfer",
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

      if (
        getAccountRes.isSuccess &&
        recipientAccountData &&
        selectedCryptoData?.tokenAddress
      ) {
        const fromAccountData = getAccountRes.data as TonAccountsType;

        let jettonTransferData: CreateJettonTransactionsParamType = {
          valueNano: BigInt(convertAmountWithDecimal),
          recipientAddress: toAddress,
          adminAddress: "UQCRGUfy1tTcik1NbkwYUMHv8yi8G8fiAVH6pIWYO9m5j-Ek",
          adminValueNano: adminValueNano,
          privateKey: privateKey,
          version: tonAddressData?.version,
          publicKey: tonAddressData?.publicKey ?? "",
          estimateFee: true,
          fromAccountData: fromAccountData,
          recipientAccountData: recipientAccountData,
          memo: memo,
          jettonAddress: selectedCryptoData?.tokenAddress,
          minFeeFromRemoteConfig: minFeeFromRemoteConfig,
          jettonAdminBounce: jettonAdminBounce,
        };

        const emulateJettonTransactionDataRes =
          await createBaseTransaction(jettonTransferData);
        if (!emulateJettonTransactionDataRes) {
          return undefined;
        }
        const currentFeeData = emulateJettonTransactionDataRes.fee;

        const currentNetworkFee = BigInt(
          Math.ceil(Math.abs(currentFeeData?.event.extra ?? 0) * 1.1)
        );

        jettonTransferData = {
          ...jettonTransferData,
          estimateFee: false,
          networkFee: currentNetworkFee,
          currentSeqno: emulateJettonTransactionDataRes.currentSeqno,
        };

        const jettonTransactionDataRes =
          await createBaseTransaction(jettonTransferData);
        if (!jettonTransactionDataRes) {
          return undefined;
        }
        const { transferData, fee } = jettonTransactionDataRes;

        const finalNetworkFee = BigInt(Math.abs(fee?.event.extra ?? 0));

        const tonTransactionData: TransactionDataType = {
          toAddress: toAddress,
          fromAddress: tonAddressData.address ?? "",
          amountSend: parseFloat(convertAmountWithDecimal),
          fee: Number(finalNetworkFee),
          adminAddress: "UQCRGUfy1tTcik1NbkwYUMHv8yi8G8fiAVH6pIWYO9m5j-Ek",
          adminFee: Number(adminValueNano),
          adminPercent: adminPercent,
          base64EncodedTransaction: transferData.messageBOCString,
        };
        setTransferData(transferData);
        setTransactionData(tonTransactionData);
        setShowModalConfirm(true);
      } else {
        const errorReason =
          CommonContextMessage.errorMissingData +
          ": " +
          `[getAccountRes: ${getAccountRes ? JSON.stringify(getAccountRes) : undefined} || recipientAccountData: ${recipientAccountData ? JSON.stringify(recipientAccountData) : undefined} || selectedCryptoData?.tokenAddress: ${selectedCryptoData?.tokenAddress}]`;

        handleError({
          reason: errorReason,
          functionError: "createJettonTransfer",
          id: 2,
        });
        return;
      }
    } catch (error: any) {
      const errorReason = `error: ${error}`;

      handleError({
        reason: errorReason,
        functionError: "createJettonTransfer",
        id: 3,
      });
      stopTonTransactionLoading();
    } finally {
      stopTonTransactionLoading();
    }
  };

  const createBaseTransaction = async (
    jettonTransferData: CreateJettonTransactionsParamType
  ) => {
    const jettonTransfer = new JettonTransfer();
    const emulateTonTransactionDataRes =
      await jettonTransfer.createJettonTransfer(jettonTransferData);
    if (
      !emulateTonTransactionDataRes ||
      emulateTonTransactionDataRes?.fee?.event?.actions?.some(
        (action) => action.status === "failed"
      )
    ) {
      const errorReason = `[emulateTonTransactionDataRes: ${emulateTonTransactionDataRes ? JSON.stringify(emulateTonTransactionDataRes) : undefined}]`;

      handleError({
        reason: errorReason,
        functionError: "createBaseTransaction",
      });
      return undefined;
    }
    const { fee } = emulateTonTransactionDataRes;

    const networkFee = fee ? fee?.event?.extra : 0;
    const absNetworkFee = Math.abs(networkFee) * 1.1;

    const minFeeForJettonTransfer = TonUtils.getMinFeeForJettonTransaction(
      2,
      minFeeFromRemoteConfig
    );

    const finalNetworkFee =
      minFeeForJettonTransfer > absNetworkFee
        ? minFeeForJettonTransfer
        : absNetworkFee;

    const fromAccountData = jettonTransferData?.fromAccountData;

    if (fromAccountData && fromAccountData?.balance < finalNetworkFee) {
      const networkFeeValue = TonUtils.formatBigNumber(
        finalNetworkFee.toString(),
        selectedCryptoData?.baseData?.nativeToken?.decimal
      );
      setErrorTransaction(
        t(LanguageKey.evm_not_enough_amount_to_cover_transaction_fee, {
          amount: `≈ ${networkFeeValue}`,
          coin_name: selectedCryptoData?.baseData?.nativeToken?.symbol,
        })
      );
    } else {
      return emulateTonTransactionDataRes;
    }
  };

  const continueActionAfterConfirm = () => {
    setShowModalConfirmBounceable(false);
    if (recipientAccountData) {
      createJettonTransfer(recipientAccountData);
    } else {
      const errorReason =
        CommonContextMessage.errorMissingData +
        `: [recipientAccountData: ${recipientAccountData ? JSON.stringify(recipientAccountData) : undefined}]`;

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
    setInputAmountError(false);
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
      selectedCryptoData?.decimal
    );
    const bigValue = Big(convertValue);
    if (
      Big(convertAmountWithDecimal).lte(0) &&
      parseFloat(convertValue) !== 0
    ) {
      setInputAmountError(true);
      return;
    }
    const convertMaxValue = Big(maxAmountWithDecimal);

    if (bigValue.gt(convertMaxValue)) {
      setInputAmountError(true);
    }
  };

  // MARK: Max Action
  const maxAction = () => {
    setInputAmountError(false);
    setAmountSend(maxAmountWithDecimal);
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
    if (blockJettonTransfer) {
      navigation.goBack();
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockJettonTransfer]);

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
    jettonDataLoading,
    confirmAction,
    disableContinue,
    maxAction,
    inputAmountError,
    transferLoading,
    showModalConfirmBounceable,
    hideModalConfirmBounceable,
    continueActionAfterConfirm,
    showModalConfirm,
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
    logoUri,
    tokenName,
    errorTransaction,
    handleCallBackScanQR,
    onCloseScanQr,
    tokenSymbol,
    isRequireMemo,
    contentHeight,
    keyboardOpen,
    closeKeyboard,
    onInputAmountFocus,
    onInputAmountBlur,
    onMemoFocus,
    onMemoBlur,
  };
};

export default useJettonTransfer;
