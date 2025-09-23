import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RouteProp, StackActions, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import moment from "moment";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import AppToastType from "src/core/enum/AppToastType";
import { CoinType } from "src/core/enum/CoinType";
import { TransactionType } from "src/core/enum/TransactionType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrencyRateConversion,
  useCurrentWallet,
  useProtocolSelected,
  useSelectedCurrencySetting,
} from "src/core/redux/slice/account.selector";
import {
  getCryptoCurrencyState,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import { filterTokenByWalletAddress } from "src/core/redux/slice/customToken/addCustomToken.slice";
import {
  SupportedTokenItemWithProtocol,
  TokenType,
} from "src/core/redux/slice/customToken/addCustomToken.type";
import Web3Service, { checkValidAddressEVM } from "src/core/services/Web3";
import { TransactionWeb3Response } from "src/core/services/Web3/type";
import {
  default as commonUtils,
  default as Utils,
} from "src/core/utils/commonUtils";
import { convertChainByProtocol } from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import walletUtils from "src/core/utils/walletUtils";
import { paramsTransactions } from "src/features/home/NFTCollection/evm/NFTConfirmationSendNFT/NFTConfirmationSendNFT.type";
import {
  getBalanceNativeEVM,
  getBalanceTokensEVM,
} from "src/features/home/slice/home.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "src/navigation/stacks/type/HomeStackParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { getEVMSendState, handleChangeCurrentToken } from "./send.evm.slice";
import {
  ErrorMessageType,
  LoadingSendTokenType,
  PinCodeType,
} from "./send.evm.type";

type SendEVMParams = RouteProp<
  HomeStackParamListType,
  HomeStackScreenKey.Transfer
>;

const useSendEVM = ({ navigation }: RootNavigationType) => {
  const params = useRoute<SendEVMParams>().params?.tokenData;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const bottomSheetConfirmationRef = useRef<BottomSheetModal>(null); // Reference to the confirmation bottom sheet
  const bottomSheetApprove = useRef<BottomSheetModal>(null); // Reference to the approve bottom sheet
  const bottomSheetSendMaximum = useRef<BottomSheetModal>(null); // Reference to the approve bottom sheet
  const [recipientAddress, setRecipientAddress] = useState<string>(""); // State for the recipient address
  const [showScanQRCamera, setShowScanQRCamera] = useState<boolean>(false); // State to show/hide QR code scanner
  const [amountSend, setAmountSend] = useState<string>(""); // State for the amount to send
  const [balance, setBalance] = useState<string>(""); // State for the wallet balance
  const [isApproveDone, setIsApproveDone] = useState<boolean>(false); // State to track if approve is done
  const [sendMaximum, setSendMaximum] = useState<string>(""); // State for the maximum amount to send
  const [estimateGasFee, setEstimateGasFee] = useState<string>(""); // State for the estimated gas fee
  const [disableInput, setDisableInput] = useState<boolean>(false); // State to disable input fields
  const [estimateGasFeeForApprove, setEstimateGasFeeForApprove] =
    useState<string>(""); // State for the estimated gas fee for approve
  const [onShowPinCode, setOnShowPinCode] = useState<PinCodeType>({
    approve: false, // State to show/hide pin code for approve
    confirm: false, // State to show/hide pin code for confirmation
  });
  const [isLoadingPage, setIsLoadingPage] = useState<LoadingSendTokenType>({
    send: false, // State to track if send is loading
    screen: true, // State to track if the screen is loading
  });

  const [error, setError] = useState<ErrorMessageType>({
    address: "", // State for error message for address
    amount: "", // State for error message for amount
    page: "", // State for error message for the page
  });
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const listToken = useAppSelector(filterTokenByWalletAddress); // Get list of tokens filtered by wallet address
  const wallet = useCurrentWallet(); // Get the current wallet
  const currentProtocol = useProtocolSelected(); // Get the selected protocol
  const selectedCurrencySetting = useSelectedCurrencySetting(); // Get the selected currency setting

  const cryptosCurrency = useAppSelector(getCryptoCurrencyState); // Get the list of crypto currencies
  const { currentToken } = useAppSelector(getEVMSendState); // Get the current token
  const currencyRateConversion = useCurrencyRateConversion();

  const tokenSelected = useMemo(
    () => params || currentToken || listToken.find((t) => t?.isNativeToken), // Get the selected token
    [currentToken, listToken, params]
  );

  const initWeb3 = () => {
    const urpUrl = currentProtocol?.rpcUrl ?? ""; // Get the RPC URL of the selected protocol
    const token = tokenSelected as SupportedTokenItemWithProtocol; // Cast tokenSelected to SupportedTokenItemWithProtocol
    return new Web3Service({
      urpUrl, // Initialize Web3 service with RPC URL
      contractAddress: token?.contractAddress || undefined, // Optional contract address
    });
  };
  const handleCopyToClipboard = async () => {
    Keyboard.dismiss();
    try {
      const text = await Clipboard.getStringAsync();
      setRecipientAddress(text);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCallBackScanQR = (value: string) => {
    setShowScanQRCamera(false);
    setRecipientAddress(value);
  };

  const onShowScanQRCamera = () => {
    if (!disableInput) {
      setShowScanQRCamera(true);
      Keyboard.dismiss();
    }
  };

  const handleValidate = () => {
    if (!checkValidAddressEVM(recipientAddress)) {
      setError((prev) => {
        return {
          ...prev,
          address: t(LanguageKey.common_invalid_address),
        };
      });
      return false;
    }
    return true;
  };
  const processEstimateTransferToken = async () => {
    const data = validateBaseData();
    const web3 = initWeb3();
    if (!data) {
      throw new Error(
        "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
      );
    }
    const {
      commissionContractAddress,
      wallet,
      beneficiaryWalletAddress,
      tokenSelected,
      protocol,
    } = data;
    const supportedToken = tokenSelected as SupportedTokenItemWithProtocol;

    const approvedAmount = await web3.getAmountTokenApproved(
      wallet?.address,
      commissionContractAddress
    );
    const amountToBigIn = commonUtils.convertAmountToWeiFollowDecimals(
      amountSend,
      supportedToken.decimal
    );
    const serviceFee = calculateServiceFee();
    const amount = !checkBalance ? amountToBigIn : amountToBigIn + serviceFee;

    if (approvedAmount >= amount) {
      const amountEstimate = checkBalance
        ? amountToBigIn
        : amountToBigIn - serviceFee;
      const [gasFee, balanceCoin] = await Promise.all([
        web3.estimateGasTransferToken({
          amount: amountEstimate,
          smartContract: commissionContractAddress,
          recipientAddress: wallet.address,
          beneficiaryAddress: beneficiaryWalletAddress,
          commission: serviceFee,
          tokenContractAddress: supportedToken.contractAddress,
          sender: wallet.address,
        }),
        processGetBalanceTokens(
          protocol.slip0044,
          tokenSelected,
          wallet.address,
          protocol.nativeToken.address,
          true
        ),
      ]);
      const convertEstimateGasFee = commonUtils.convertBigIntFollowDecimals(
        gasFee,
        protocol.nativeToken.decimal
      );

      if (gasFee > balanceCoin) {
        setError((prev) => {
          return {
            ...prev,
            amount: t(LanguageKey.evm_not_enough_amount_to_cover_gas_fee, {
              coin_name: protocol.symbol,
              amount: commonUtils.formattedBalanceCurrency(
                +convertEstimateGasFee
              ),
            }),
          };
        });
        return;
      }

      setEstimateGasFee(convertEstimateGasFee);
      bottomSheetConfirmationRef.current?.present();
    } else {
      const [gasFeeApprove, balanceCoin] = await Promise.all([
        web3.estimateGasFeeForApproveToken({
          amount: amount,
          smartContract: commissionContractAddress,
          walletAddress: wallet.address,
          tokenContractAddress: supportedToken.contractAddress,
        }),
        processGetBalanceTokens(
          protocol.slip0044,
          tokenSelected,
          wallet.address,
          protocol.nativeToken.address,
          true
        ),
      ]);
      const convertEstimateGasFeeApprove =
        commonUtils.convertBigIntFollowDecimals(
          gasFeeApprove,
          protocol.nativeToken.decimal
        );
      if (gasFeeApprove > balanceCoin) {
        setError((prev) => {
          return {
            ...prev,
            amount: t(LanguageKey.evm_not_enough_amount_to_cover_gas_fee, {
              coin_name: protocol.symbol,
              amount: commonUtils.formattedBalanceCurrency(
                +convertEstimateGasFeeApprove
              ),
            }),
          };
        });
        return;
      }

      setEstimateGasFeeForApprove(convertEstimateGasFeeApprove);
      bottomSheetApprove.current?.present();
    }
  };
  const processEstimateTransferNativeToken = async () => {
    const serviceFee = calculateServiceFee();
    const web3 = initWeb3();
    const data = validateBaseData();
    if (!data) {
      throw new Error(
        "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
      );
    }
    const {
      commissionContractAddress,
      wallet,
      beneficiaryWalletAddress,
      tokenSelected,
    } = data;

    const estimateGasFee = await web3.estimateGasTransferNativeToken({
      smartContract: commissionContractAddress,
      amount: commonUtils.convertAmountToWeiFollowDecimals(
        amountSend,
        tokenSelected.decimal
      ),
      beneficiaryAddress: beneficiaryWalletAddress,
      commission: serviceFee,
      recipientAddress: recipientAddress,
      sender: wallet?.address,
    });

    const convertEstimateGasFee = commonUtils.convertBigIntFollowDecimals(
      estimateGasFee,
      tokenSelected.decimal
    );
    setEstimateGasFee(convertEstimateGasFee);
    bottomSheetConfirmationRef.current?.present();
  };
  const handleOnClickContinue = async () => {
    Keyboard.dismiss();
    try {
      if (!handleValidate()) {
        return;
      }

      setIsLoadingPage((prev) => {
        return { ...prev, send: true };
      });
      if (tokenSelected?.isNativeToken) {
        await processEstimateTransferNativeToken();
      } else {
        await processEstimateTransferToken();
      }
    } catch (error) {
      console.log("🚀 ~ handleOnClickContinue ~ error:", error);
    } finally {
      setIsLoadingPage((prev) => {
        return { ...prev, send: false };
      });
    }
  };

  const handleSetMaxAmount = () => {
    Keyboard.dismiss();
    const convertAmount = commonUtils.removeTrailingZeros(sendMaximum ?? "");
    setAmountSend(convertAmount + "");
  };

  const handleSetAmountSend = (value: string) => {
    let normalizedAmount = value.replace(/,/g, ".");
    setAmountSend(normalizedAmount);
  };
  const validateBaseData = () => {
    if (
      !currentProtocol ||
      !wallet ||
      !currentProtocol.commissionContractAddress ||
      currentProtocol.beneficiary?.status !== "approved" ||
      !currentProtocol.beneficiary.walletAddress ||
      !tokenSelected ||
      !wallet.path
    ) {
      return;
    }
    return {
      protocol: currentProtocol,
      wallet,
      commissionContractAddress: currentProtocol.commissionContractAddress,
      beneficiaryWalletAddress: currentProtocol.beneficiary.walletAddress,
      tokenSelected,
      path: wallet.path,
    };
  };

  const handleApproveToken = async (pinCode: string) => {
    try {
      const web3 = initWeb3();
      handleCloseApprovePinCode();
      setIsLoadingPage((prev) => {
        return { ...prev, send: true };
      });
      const data = validateBaseData();
      if (!data) {
        throw new Error(
          "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
        );
      }
      const { commissionContractAddress, tokenSelected, path, protocol } = data;
      const supportedToken = tokenSelected as SupportedTokenItemWithProtocol;
      const fee = calculateServiceFee();
      const amount = !checkBalance ? amountSend : amountSend + fee;
      const approve = await web3.approveToken({
        amount: commonUtils.convertAmountToWeiFollowDecimals(
          amount,
          tokenSelected.decimal
        ),
        smartContractApproved: commissionContractAddress,
        smartContractToken: supportedToken.contractAddress,
        pinCode: pinCode,
        path: path,
        slip: protocol.slip0044,
      });
      if (!approve) {
        throw new Error("Give permission fail");
      }
      await handleOnClickContinue();
      bottomSheetApprove.current?.dismiss();
      setIsApproveDone(true);
    } catch (error) {
      console.log("🚀 ~ approveToken ~ error:", error);
      Utils.showToast({
        msg: `${t(LanguageKey.nft_give_permission_fail)}`,
        type: AppToastType.error,
        visibilityTime: 2000,
      });
    } finally {
      setIsLoadingPage((prev) => {
        return { ...prev, send: false };
      });
    }
  };
  const handleInitData = async () => {
    setIsLoadingPage((prev) => {
      return { ...prev, screen: true };
    });
    const web3 = initWeb3();
    try {
      const data = validateBaseData();
      if (!data) {
        throw new Error(
          "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
        );
      }
      const {
        commissionContractAddress,
        protocol,
        wallet,
        beneficiaryWalletAddress,
        tokenSelected,
      } = data;

      let balance: bigint = 0n;
      let decimals: number = 18;

      if (tokenSelected.isNativeToken) {
        balance = await processGetBalanceTokens(
          protocol.slip0044,
          tokenSelected,
          wallet.address,
          tokenSelected.contractAddress
        );
        decimals = tokenSelected.decimal;
        const convertBalanceFollowDecimal =
          commonUtils.convertBigIntFollowDecimals(balance, decimals);

        const feeAmount =
          (+convertBalanceFollowDecimal * protocol.coinTransferFee) / 100;
        const convertFeeToBigInt = commonUtils.convertAmountToWeiFollowDecimals(
          feeAmount,
          decimals
        );

        const estimateGasFeeWhenSendFullBalance =
          await web3.estimateGasTransferNativeToken({
            smartContract: commissionContractAddress,
            amount: balance - convertFeeToBigInt,
            beneficiaryAddress: beneficiaryWalletAddress,
            commission: convertFeeToBigInt,
            recipientAddress: wallet?.address,
            sender: wallet?.address,
          });

        let totalMaximumSend =
          balance - estimateGasFeeWhenSendFullBalance - convertFeeToBigInt;
        if (totalMaximumSend < 0) {
          setError({
            address: "",
            amount: t(LanguageKey.send_input_error_2),
            page: "",
          });
          totalMaximumSend = 0n;
          setDisableInput(true);
        }

        const convertMaximumSend = commonUtils.convertBigIntFollowDecimals(
          totalMaximumSend,
          protocol.nativeToken.decimal
        );
        setSendMaximum(convertMaximumSend);
      } else if (tokenSelected.contractAddress) {
        balance = await processGetBalanceTokens(
          protocol.slip0044,
          tokenSelected,
          wallet.address,
          tokenSelected.contractAddress
        );
        decimals = tokenSelected.decimal;

        const convertMaximumSend = commonUtils.convertBigIntFollowDecimals(
          balance,
          tokenSelected.decimal
        );
        setSendMaximum(convertMaximumSend);
      }

      const convertBalanceFollowDecimals =
        commonUtils.convertBigIntFollowDecimals(balance, decimals);
      setBalance(convertBalanceFollowDecimals);
    } catch (error) {
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
      });
      console.log("🚀 ~ handleInitData ~ error:", error);
    } finally {
      setIsLoadingPage((prev) => {
        return { ...prev, screen: false };
      });
    }
  };
  const amountFollowCurrency = (amount: string) => {
    if (cryptosCurrency && selectedCurrencySetting) {
      const isNativeToken = tokenSelected?.isNativeToken;
      const rateToken = isNativeToken
        ? currentProtocol?.price
        : tokenSelected?.balanceCurrency;

      if (!rateToken) {
        return "";
      }

      const rate = Utils.truncateToNumberDecimals(
        rateToken * selectedCurrencySetting.rate * currencyRateConversion,
        2
      );

      const amountCurrency = Number(commonUtils.keepNumbers(amount)) * rate;
      const formatCurrency = commonUtils.formattedCurrency(amountCurrency);
      return formatCurrency;
    }
  };

  const calculateServiceFee = useCallback((): bigint => {
    if (!currentProtocol || !amountSend) {
      return 0n;
    }
    const isNative = tokenSelected?.isNativeToken;

    const supportedToken = tokenSelected as SupportedTokenItemWithProtocol;

    const getFeePercent = isNative
      ? currentProtocol.coinTransferFee
      : currentProtocol.tokenTransferFee;

    const feeAmount = (+amountSend * getFeePercent) / 100;

    const convertFeeToBigInt = commonUtils.convertAmountToWeiFollowDecimals(
      feeAmount,
      supportedToken.decimal
    );

    return convertFeeToBigInt;
  }, [amountSend, currentProtocol, tokenSelected]);

  const processGetBalanceTokens = async (
    slip0044: number,
    token: TokenType,
    walletAddress: string,
    contractAddress: string,
    isGetNative?: boolean
  ) => {
    const getChain = convertChainByProtocol(slip0044);
    const isNative = isGetNative || token.isNativeToken;

    if (!getChain) {
      throw new Error("Could not get chain");
    }
    if (isNative) {
      const balanceResponse = await dispatch(
        getBalanceNativeEVM({
          walletAddress: walletAddress,
          params: {
            chain: getChain,
            cursor: null,
            limit: 2,
          },
          contractAddress: contractAddress,
        })
      ).unwrap();
      if (!balanceResponse) {
        return 0n;
      }
      return BigInt(balanceResponse.balance);
    } else {
      const balanceResponse = await dispatch(
        getBalanceTokensEVM({
          walletAddress: walletAddress,
          params: {
            chain: getChain,
            limit: 1,
            tokenAddresses: [contractAddress],
          },
        })
      ).unwrap();
      if (!balanceResponse?.result.length) {
        return 0n;
      }
      return BigInt(balanceResponse?.result[0].balance);
    }
  };
  const handleOpenConfirmPinCode = () => {
    bottomSheetConfirmationRef.current?.dismiss();
    setOnShowPinCode((prev) => {
      return { ...prev, confirm: true };
    });
  };
  const handleCloseConfirmPinCode = () => {
    setOnShowPinCode((prev) => {
      return { ...prev, confirm: false };
    });
  };
  const handleOpenApprovePinCode = () => {
    bottomSheetApprove.current?.dismiss();
    setOnShowPinCode((prev) => {
      return { ...prev, approve: true };
    });
  };
  const handleCloseApprovePinCode = () => {
    setOnShowPinCode((prev) => {
      return { ...prev, approve: false };
    });
  };
  const clearData = () => {
    setAmountSend("");
    setBalance("");
    setSendMaximum("");
    setEstimateGasFee("");
    setEstimateGasFeeForApprove("");
    setRecipientAddress("");
    setError({
      address: "",
      amount: "",
      page: "",
    });
  };
  const processConfirmSendToken = async (pinCode: string) => {
    const serviceFee = calculateServiceFee();
    const web3 = initWeb3();
    const data = validateBaseData();
    if (!data) {
      throw new Error(
        "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
      );
    }
    const {
      commissionContractAddress,
      beneficiaryWalletAddress,
      tokenSelected,
      path,
      protocol,
    } = data;
    const supportedToken = tokenSelected as SupportedTokenItemWithProtocol;

    const convertedBalance = commonUtils.convertAmountToWeiFollowDecimals(
      balance,
      tokenSelected.decimal
    );
    const convertAmountSend = commonUtils.convertAmountToWeiFollowDecimals(
      amountSend,
      tokenSelected.decimal
    );
    const totalSend = convertAmountSend + serviceFee <= convertedBalance;

    const result = await web3.transferToken({
      amount: totalSend ? convertAmountSend : convertAmountSend - serviceFee,
      beneficiaryAddress: beneficiaryWalletAddress,
      commission: serviceFee,
      pinCode,
      path,
      recipientAddress: recipientAddress,
      slip: protocol.slip0044,
      smartContract: commissionContractAddress,
      tokenContractAddress: supportedToken.contractAddress,
    });
    return result;
  };
  const processConfirmSendNativeToken = async (pinCode: string) => {
    const web3 = initWeb3();
    const serviceFee = calculateServiceFee();
    const data = validateBaseData();
    if (!data) {
      throw new Error(
        "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
      );
    }
    const {
      commissionContractAddress,
      beneficiaryWalletAddress,
      tokenSelected,
      path,
      protocol,
    } = data;
    const result = await web3.transferNativeToken({
      amount: commonUtils.convertAmountToWeiFollowDecimals(
        amountSend,
        tokenSelected.decimal
      ),
      beneficiaryAddress: beneficiaryWalletAddress,
      commission: serviceFee,
      recipientAddress,
      path: path,
      slip: protocol.slip0044,
      pinCode: pinCode,
      smartContract: commissionContractAddress,
    });
    return result;
  };
  const handleConfirmSend = async (pinCode: string) => {
    try {
      const web3 = initWeb3();
      const data = validateBaseData();
      if (!data) {
        throw new Error(
          "Could not found getCurrentProtocol | wallet or address beneficiary not approved "
        );
      }
      handleCloseConfirmPinCode();
      setIsLoadingPage((prev) => {
        return { ...prev, send: true };
      });
      let result: TransactionWeb3Response;
      if (tokenSelected?.isNativeToken) {
        result = await processConfirmSendNativeToken(pinCode);
      } else {
        result = await processConfirmSendToken(pinCode);
      }
      bottomSheetConfirmationRef.current?.close();
      const estimatedGasFeeEth = web3.calculateGasUsedForTransfer(
        result.effectiveGasPrice,
        result.gasUsed
      );
      const params: paramsTransactions = {
        transactionData: {
          amountSend: amountNotSymbol,
          coinType: CoinType.Ethereum,
          txHash: result.transactionHash.toString(),
          createdAt: moment().toString(),
          adminFee: feeFollowDecimal,
          toAddress: recipientAddress,
          estimatedGasFee: +estimatedGasFeeEth,
          type: TransactionType.Sent,
          isNative: tokenSelected?.isNativeToken,
          protocolData: currentProtocol,
          tokenSymbol: tokenSelected?.symbol,
          confirmations: 2, //pending
        },
      };
      dispatch(setUpdateBalance(true));
      navigation.dispatch(
        StackActions.replace(HomeStackScreenKey.TransactionDetails, params)
      );
    } catch (error) {
      console.log("🚀 ~ handleConfirmSend ~ error:", error);
      Utils.showToast({
        msg: t(LanguageKey.common_send_failed),
        type: AppToastType.error,
        visibilityTime: 2000,
      });
    } finally {
      setIsLoadingPage((prev) => {
        return { ...prev, send: false };
      });
    }
  };
  const handlePressSelectToken = () => {
    navigation.dispatch(
      StackActions.push(HomeStackScreenKey.SelectTokenEVM, tokenSelected)
    );
  };

  const handleOnDismissBottomSheetApprove = () => {
    if (isApproveDone) {
      setIsApproveDone(false);
      handleOnClickContinue();
    }
  };

  const onCloseBottomApprove = () => {
    bottomSheetApprove.current?.close();
  };
  const onCloseBottomConfirm = () => {
    bottomSheetConfirmationRef.current?.close();
  };

  const onOpenBottomSheetSendMaximum = () => {
    Keyboard.dismiss();
    bottomSheetSendMaximum.current?.present();
  };
  const onCloseBottomSheetSendMaximum = () => {
    bottomSheetSendMaximum.current?.close();
  };
  const balanceShows = `${Utils.formattedBalanceCurrency(+balance)} ${tokenSelected?.symbol}`;

  const walletShows = walletUtils.getShortAddress(wallet?.address ?? "");

  const gasFeeShows = `${Utils.formattedBalanceCurrency(+estimateGasFee)} ${currentProtocol?.symbol}`;

  const recipientAddressShow = walletUtils.getShortAddress(recipientAddress);

  const logoShow = tokenSelected?.logo ?? "";

  const showAmountCurrency = amountFollowCurrency(amountSend)
    ? `≈ ${amountFollowCurrency(amountSend)} ${selectedCurrencySetting.sign}`
    : "";

  const showAmountCurrencyConfirm = tokenSelected?.isNativeToken
    ? `${selectedCurrencySetting.sign} ${amountFollowCurrency(amountSend)}`
    : "";

  const sendMaximumShows = `${Utils.formattedBalanceCurrency(+(sendMaximum ?? 0))} ${tokenSelected?.symbol}`;

  const handleEnableButtonSend =
    !recipientAddress || !amountSend || +amountSend <= 0 || !!error.amount;

  const feeFollowDecimal = +commonUtils.convertBigIntFollowDecimals(
    calculateServiceFee(),
    tokenSelected?.decimal || 18
  );

  const serviceFeeShows = `${Utils.formatAmountSend(feeFollowDecimal)} ${tokenSelected?.symbol}`;

  const checkBalance = +amountSend + feeFollowDecimal <= +balance;

  const tokenAmountApproved = `${commonUtils.formattedBalanceCurrency(
    checkBalance ? +amountSend : +amountSend - feeFollowDecimal
  )} ${tokenSelected?.symbol}`;

  const gasFeeApproveShows = `${Utils.formattedBalanceCurrency(+estimateGasFeeForApprove)} ${currentProtocol?.symbol}`;

  const amountNotSymbol = checkBalance
    ? +amountSend
    : +amountSend - feeFollowDecimal;
  const amountShows = `${commonUtils.formatAmountSend(
    amountNotSymbol
  )} ${tokenSelected?.symbol}`;

  const totalAmountNotSymbol = !checkBalance
    ? +amountSend
    : +amountSend + feeFollowDecimal;
  const totalAmount = `${commonUtils.formatAmountSend(
    totalAmountNotSymbol
  )} ${tokenSelected?.symbol}`;

  const isNative = tokenSelected?.isNativeToken;
  const handleValidateInputRealtime = () => {
    setError({
      address: "",
      amount: "",
      page: "",
    });
    const decimal = tokenSelected?.decimal || 18;
    const amountSendConvert = commonUtils.convertAmountToWeiFollowDecimals(
      amountSend,
      decimal
    );
    const sendMaxConvert = commonUtils.convertAmountToWeiFollowDecimals(
      sendMaximum,
      decimal
    );
    if (amountSend.length && amountSendConvert > sendMaxConvert) {
      setError({
        address: "",
        amount: t(LanguageKey.send_input_error),
        page: "",
      });
    }
  };
  useLayoutEffect(() => {
    dispatch(handleChangeCurrentToken(undefined));
    return () => {
      dispatch(handleChangeCurrentToken(undefined));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tokenSelected) {
      clearData();
      handleInitData();
      setDisableInput(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSelected]);

  useEffect(() => {
    handleValidateInputRealtime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountSend, recipientAddress]);

  const onCloseScanQr = () => {
    setShowScanQRCamera(false);
  };

  return {
    t,
    recipientAddress,
    handleCopyToClipboard,
    showScanQRCamera,
    onShowScanQRCamera,
    handleCallBackScanQR,
    setRecipientAddress,
    handleOnClickContinue,
    isLoadingPage,
    tokenSelected,
    amountSend,
    error,
    handleSetMaxAmount,
    handleConfirmSend,
    balanceShows,
    bottomSheetConfirmationRef,
    estimateGasFee,
    senderWallet: wallet?.address,
    amountShows,
    serviceFeeShows,
    walletShows,
    gasFeeShows,
    recipientAddressShow,
    logoShow,
    showAmountCurrency,
    showAmountCurrencyConfirm,
    sendMaximumShows,
    handleEnableButtonSend,
    onShowPinCode,
    handlePressSelectToken,
    bottomSheetApprove,
    handleOpenConfirmPinCode,
    handleCloseConfirmPinCode,
    handleCloseApprovePinCode,
    handleOpenApprovePinCode,
    gasFeeApproveShows,
    handleApproveToken,
    tokenAmountApproved,
    handleOnDismissBottomSheetApprove,
    handleSetAmountSend,
    totalAmount,
    onCloseBottomConfirm,
    onCloseBottomApprove,
    disableInput,
    onCloseScanQr,
    params,
    onOpenBottomSheetSendMaximum,
    onCloseBottomSheetSendMaximum,
    bottomSheetSendMaximum,
    isNative,
    insets,
  };
};
export default useSendEVM;
