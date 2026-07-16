import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StackActions, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppToastType from "src/core/enum/AppToastType";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
  useSelectedCurrencySetting,
} from "src/core/redux/slice/account.selector";
import { BeneficiaryType } from "src/core/redux/slice/account.type";
import { getCryptoCurrencyState } from "src/core/redux/slice/app.slice";
import Web3Service, { checkValidAddressEVM } from "src/core/services/Web3";
import { NFTTokenStandard } from "src/core/services/Web3/type";
import Utils from "src/core/utils/commonUtils";
import {
  compareAddressesEVM,
  convertChainByProtocol,
} from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { getBalanceNativeEVM } from "src/features/home/slice/home.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  setDeleteNFT,
  setUpdateNFT,
} from "../../../../../core/redux/slice/NFT/NFTImport.slice";
import { NFTData } from "../../ton/NFTImport/NFTTonImport.type";
import { NFTConfirmationSendParamsType, NFTSendParams } from "./NFTSend.type";

const useNFTSend = ({ navigation }: RootNavigationType) => {
  // get NFT data from route
  const NFT = useRoute<NFTSendParams>().params;

  const [nftData, setNftData] = useState<NFTData>(NFT);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [gasFee, setGasFee] = useState<number>(0);
  const [quantity, setQuantity] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [isNotOwner, setIsNotOwner] = useState<boolean>(false);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState<boolean>(true);
  const [showModalConfirmTransaction, setShowModalConfirmTransaction] =
    useState<boolean>(false);
  const showModalGivePermission = useRef<BottomSheetModal>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const [showScanQRCamera, setShowScanQRCamera] = useState(false);

  const currentWallet = useCurrentWallet();
  const currentCurrency = useSelectedCurrencySetting();
  const cryptosCurrency = useAppSelector(getCryptoCurrencyState);
  const currentProtocol = useProtocolSelected();
  const dispatch = useAppDispatch();

  const handleCopyToClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setWalletAddress(text);
      quantityInputRef.current?.focus();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCallBackScanQR = (value: string) => {
    setShowScanQRCamera(false);
    setWalletAddress(value);
    quantityInputRef.current?.focus();
  };

  const onShowScanQRCamera = () => {
    setShowScanQRCamera(true);
    Keyboard.dismiss();
  };
  const handleCheckError = (error: string) => {
    const errorMessage = error + "";
    const checkError = errorMessage.includes("insufficient funds");
    if (checkError) {
      setError(t(LanguageKey.send_input_error_2));
    }
  };

  const checkSystemData = () => {
    if (
      currentWallet &&
      currentProtocol?.commissionContractAddress &&
      currentProtocol?.beneficiary &&
      currentProtocol.rpcUrl &&
      currentProtocol.nativeToken?.decimal &&
      currentWallet.path
    ) {
      return {
        currentProtocol,
        currentWallet,
        commissionContractAddress: currentProtocol?.commissionContractAddress,
        beneficiary: currentProtocol?.beneficiary,
        rpcUrl: currentProtocol.rpcUrl,
        decimals: currentProtocol.nativeToken.decimal,
        path: currentWallet.path,
      };
    }
  };

  const showError = (message: string) => {
    Utils.showToast({
      msg: message,
      type: AppToastType.error,
      visibilityTime: 2000,
    });
  };
  const validateData = () => {
    if (!checkValidAddressEVM(walletAddress)) {
      showError(t(LanguageKey.common_invalid_address));
      return false;
    }
    if (quantity && +quantity > (nftData.detail.quantity || 0)) {
      showError(t(LanguageKey.nft_not_enough_quantity));
      return false;
    }
    return true;
  };

  const processCheckOwnerNFT = async (
    web3Service: Web3Service,
    currentWalletAddress: string,
    quantity?: number
  ): Promise<boolean> => {
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //check owner of ERC1155
      const balance = await web3Service.getOwnerOfNFTERC1155({
        contractAddress: nftData.root.contractAddress,
        nftId: nftData.detail.nftId ?? 0,
        walletAddress: currentWalletAddress,
      });
      if (typeof balance === "undefined") {
        showError(t(LanguageKey.common_server_busy));
        return false;
      }
      if (quantity && balance < quantity) {
        showError(t(LanguageKey.nft_not_enough_quantity));
        return false;
      }
      if (balance === 0) {
        dispatch(setDeleteNFT(nftData));
        setIsNotOwner(true);
        return false;
      }
      if (balance !== nftData.detail.quantity) {
        const dataUpdate: NFTData = {
          ...nftData,
          detail: {
            ...nftData.detail,
            quantity: balance,
          },
        };
        dispatch(setUpdateNFT(dataUpdate));
        setNftData(dataUpdate);
      }
    } else {
      //check owner of ERC721
      const getOwner = await web3Service.getOwnerOfNFT({
        nftSmartContract: nftData.root.contractAddress,
        tokenId: nftData.detail.nftId ?? 0,
      });
      if (getOwner && !compareAddressesEVM(getOwner, currentWalletAddress)) {
        dispatch(setDeleteNFT(nftData));
        setIsNotOwner(true);
        return false;
      }
    }
    return true;
  };
  const processCheckApproveNFT = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    walletAddress: string
  ) => {
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      const result = await web3Service.getApproveNFT1155({
        walletAddress: walletAddress,
        commissionContractAddress,
        contractAddress: nftData.root.contractAddress,
      });
      return result;
    } else {
      const currentApprove = await web3Service.getApproveNFTERC721({
        nftSmartContract: nftData.root.contractAddress,
        tokenId: nftData.detail.nftId ?? 0,
      });
      if (compareAddressesEVM(currentApprove, commissionContractAddress)) {
        return true;
      }
    }
    return false;
  };
  const processEstimateGasTransferNFT = async (
    web3Service: Web3Service,
    commission: number,
    commissionContractAddress: string,
    beneficiary: BeneficiaryType,
    currentWalletAddress: string,
    decimals: number
  ): Promise<string | undefined> => {
    let estimateGas: string;
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      estimateGas = await web3Service.estimateGasForTransferNFT1155({
        commission: commission,
        commissionContractAddress,
        beneficiaryAddress: beneficiary.walletAddress,
        recipientAddress: walletAddress,
        quantity: quantity,
        nftContractAddress: nftData.root.contractAddress,
        nftId: nftData.detail.nftId ?? 0,
        decimals,
        sender: currentWalletAddress,
      });
    } else {
      //check approve ERC721
      estimateGas =
        (await web3Service.getEstimateGasForTransferNFT({
          commission: commission,
          nftAddress: nftData.root.contractAddress,
          nftId: nftData.detail.nftId ?? 0,
          recipient: walletAddress,
          sender: currentWalletAddress,
          smartContractUseForTransfer: commissionContractAddress,
          beneficiaryAddress: beneficiary.walletAddress,
          decimals,
        })) || "0";
    }
    if (estimateGas) {
      const totalFee = commission + +estimateGas;
      const balance = await handleGetBalance(currentWalletAddress);
      const convertBalance = Utils.convertBigIntFollowDecimals(
        balance,
        currentProtocol?.nativeToken.decimal || 18
      );
      if (+convertBalance < totalFee) {
        setError(
          t(LanguageKey.evm_not_enough_amount_to_cover_transaction_fee, {
            amount: Utils.formattedBalanceCurrency(totalFee),
            coin_name: currentProtocol?.nativeToken.symbol,
          })
        );
        onHideLoading();
        return;
      }
      return estimateGas;
    } else {
      setError(
        t(LanguageKey.evm_not_enough_amount_to_cover_transaction_fee, {
          amount: commission,
          coin_name: currentProtocol?.nativeToken.symbol,
        })
      );
    }
  };
  const handleGetBalance = async (walletAddress: string) => {
    if (!currentProtocol?.slip0044) {
      throw new Error("Could not get split 0044");
    }
    const getChain = convertChainByProtocol(currentProtocol?.slip0044);

    if (!getChain) {
      throw new Error("Could not get chain");
    }

    const balanceResponse = await dispatch(
      getBalanceNativeEVM({
        walletAddress: walletAddress,
        params: {
          chain: getChain,
          cursor: null,
          limit: 2,
        },
        contractAddress: currentProtocol.nativeToken.address,
      })
    ).unwrap();

    if (!balanceResponse) {
      return 0n;
    }
    return BigInt(balanceResponse.balance);
  };

  const processRequestPermission = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    currentWalletAddress: string,
    decimals: number
  ) => {
    let gasEstimateGlobal: bigint;
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      const gasEstimate = await web3Service.estimateGasApproveNFT1155({
        contractAddress: nftData.root.contractAddress,
        walletAddress: currentWalletAddress,
      });
      gasEstimateGlobal = gasEstimate;
    } else {
      const gasEstimate = await web3Service.getGasLimitEstimatedERC721(
        currentWalletAddress,
        nftData.detail.nftId ?? 0,
        commissionContractAddress,
        decimals
      );
      if (!gasEstimate) {
        throw new Error("Could not get gas limit estimate");
      }
      gasEstimateGlobal = gasEstimate;
    }
    const convertedGasEstimate = Utils.convertBigIntFollowDecimals(
      gasEstimateGlobal,
      decimals
    );
    setGasFee(Number(convertedGasEstimate));
    showModalGivePermission.current?.present();
  };

  const handleOnClickContinue = async () => {
    Keyboard.dismiss();
    onShowLoading();
    try {
      //validate data
      const validateDataResult = validateData();

      if (!validateDataResult) {
        return;
      }

      //check system data
      const systemData = checkSystemData();

      if (!systemData) {
        showError(t(LanguageKey.common_server_busy));
        return;
      }

      const {
        currentProtocol,
        currentWallet,
        commissionContractAddress,
        beneficiary,
        rpcUrl,
        decimals,
      } = systemData;

      //instantiate web3 service
      const web3Service = new Web3Service({
        urpUrl: rpcUrl,
        contractAddress: nftData.root.contractAddress,
      });

      //check owner of NFT
      const checkOwnerResult = await processCheckOwnerNFT(
        web3Service,
        currentWallet?.address
      );

      if (!checkOwnerResult) {
        return;
      }

      const checkApproveResult = await processCheckApproveNFT(
        web3Service,
        commissionContractAddress,
        currentWallet?.address
      );
      // get commission from BE
      const commission = currentProtocol.nftTransferFee;

      if (checkApproveResult) {
        const estimateGas = await processEstimateGasTransferNFT(
          web3Service,
          commission,
          commissionContractAddress,
          beneficiary,
          currentWallet?.address,
          decimals
        );
        if (!estimateGas) {
          return;
        }

        const params: NFTConfirmationSendParamsType = {
          addressReceive: walletAddress,
          data: nftData,
          gasFee: estimateGas,
          adminFee: commission,
          sender: currentWallet.address,
          quantity: quantity,
        };
        navigation.dispatch(
          StackActions.push(HomeStackScreenKey.NFTConfirmationSend, params)
        );
      } else {
        //handle request permissions
        processRequestPermission(
          web3Service,
          commissionContractAddress,
          currentWallet?.address,
          decimals
        );
      }
    } catch (error) {
      console.log("🚀 ~ handleOnClickContinue ~ error:", error);
      handleCheckError(error + "");
      Utils.showToast({
        msg: "Error",
        type: AppToastType.error,
        visibilityTime: 2000,
      });
    } finally {
      onHideLoading();
    }
  };

  const handleConfirm = () => {
    showModalGivePermission.current?.close();
    setShowModalConfirmTransaction(true);
  };
  const onShowLoading = () => setIsLoadingPage(true);
  const onHideLoading = () => setIsLoadingPage(false);

  const processApproveNFT = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    slip0044: number,
    path: string,
    pinCode: string
  ): Promise<boolean> => {
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //approve ERC1155
      const result = await web3Service.approveNFTERC1155({
        pinCode,
        path,
        slip: slip0044,
        contractAddress: nftData.root.contractAddress,
        commissionContractAddress,
      });
      return Boolean(result);
    } else {
      //approve ERC721
      const result = await web3Service.approveNFTERC721({
        tokenId: nftData.detail.nftId ?? 0,
        pinCode: pinCode,
        nftSmartContract: nftData.root.contractAddress,
        smartContractUseForApproved: commissionContractAddress,
        slip: slip0044,
        path: path,
      });
      return Boolean(result);
    }
  };
  const closeRequirePinCode = () => {
    setShowModalConfirmTransaction(false);
  };
  const handleCallBackWhenCompleted = async (pinCode: string) => {
    closeRequirePinCode();
    onShowLoading();
    try {
      const validateDataResult = validateData();

      if (!validateDataResult) {
        return;
      }

      //check system data
      const systemData = checkSystemData();

      if (!systemData) {
        showError(t(LanguageKey.common_server_busy));
        return;
      }

      const { currentProtocol, commissionContractAddress, rpcUrl, path } =
        systemData;

      //instantiate web3 service
      const web3Service = new Web3Service({
        urpUrl: rpcUrl,
        contractAddress: nftData.root.contractAddress,
      });

      const approveResult = await processApproveNFT(
        web3Service,
        commissionContractAddress,
        currentProtocol.slip0044,
        path,
        pinCode
      );
      if (approveResult) {
        showModalGivePermission.current?.close();
        await handleOnClickContinue();
      }
    } catch (error) {
      handleCheckError(error + "");
      Utils.showToast({
        msg: `${t(LanguageKey.nft_give_permission_fail)}`,
        type: AppToastType.error,
        visibilityTime: 2000,
      });
    } finally {
      onHideLoading();
    }
  };

  const convertCurrency = useCallback(() => {
    if (cryptosCurrency && currentCurrency && nftData) {
      const getCurrencyNetwork = cryptosCurrency.find(
        (e) => e.symbol === nftData.root.protocol.symbol
      );
      if (!getCurrencyNetwork) {
        return "";
      }
      const fee = gasFee * getCurrencyNetwork.price * currentCurrency.rate;

      const formatCurrency = Utils.formattedCurrency(fee);
      if (+formatCurrency <= 0) {
        return "";
      }

      const result = `${currentCurrency.sign ?? ""} ${formatCurrency}`;

      return result;
    }
    return "";
  }, [currentCurrency, cryptosCurrency, nftData, gasFee]);

  const convertEstimatedGasFollowCryptoCurrency = () => {
    try {
      const { root } = nftData;
      return `${Utils.formattedBalanceCurrency(
        gasFee
      )} ${root.protocol.symbol}`;
    } catch (error) {
      console.log(
        "🚀 ~ convertEstimatedGasFollowCryptoCurrency ~ error:",
        error
      );
      Utils.showToast({
        msg: `${t(LanguageKey.common_get_data_error)}`,
        type: AppToastType.error,
        visibilityTime: 2000,
      });
      return "";
    }
  };

  const onCloseScanQr = () => {
    setShowScanQRCamera(false);
  };

  const handleCalculateFee = async () => {
    if (currentWallet?.address && currentProtocol) {
      const balance = await handleGetBalance(currentWallet?.address);
      const convertBalance = Utils.convertBigIntFollowDecimals(
        balance,
        currentProtocol?.nativeToken.decimal || 18
      );
      if (+convertBalance < currentProtocol?.nftTransferFee) {
        setError(
          t(LanguageKey.evm_not_enough_amount_to_cover_transaction_fee, {
            amount: currentProtocol?.nftTransferFee,
            coin_name: currentProtocol?.nativeToken.symbol,
          })
        );
      }
    }
  };

  const initialData = async () => {
    setIsLoadingSkeleton(true);
    //check system data
    const systemData = checkSystemData();

    if (!systemData) {
      showError(t(LanguageKey.common_server_busy));
      return;
    }
    const { currentWallet, rpcUrl } = systemData;

    const web3Service = new Web3Service({
      urpUrl: rpcUrl,
      contractAddress: nftData.root.contractAddress,
    });
    const result = await processCheckOwnerNFT(
      web3Service,
      currentWallet?.address
    );
    if (!result) {
      return;
    }
    await handleCalculateFee();
    setIsLoadingSkeleton(false);
  };

  const handleUnderstood = () => {
    navigation.dispatch(StackActions.popToTop());
  };
  const onSubmitWalletAddress = () => {
    quantityInputRef.current?.focus();
  };
  const disableERC1155 =
    nftData.detail.tokenStandard === NFTTokenStandard.ERC1155
      ? +quantity <= 0
      : false;

  const disableButton = !walletAddress || !!error || disableERC1155;

  useEffect(() => {
    initialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    handleOnClickContinue,
    walletAddress,
    setWalletAddress,
    t,
    handleCopyToClipboard,
    showScanQRCamera,
    isLoadingPage,
    showModalGivePermission,
    handleConfirm,
    feeFollowCurrency: convertCurrency,
    handleCallBackWhenCompleted,
    showModalConfirmTransaction,
    gasEstimate: convertEstimatedGasFollowCryptoCurrency(),
    handleCallBackScanQR,
    onShowScanQRCamera,
    onCloseScanQr,
    error,
    nftData,
    handleUnderstood,
    isNotOwner,
    isLoadingSkeleton,
    quantityInputRef,
    onSubmitWalletAddress,
    quantity,
    setQuantity,
    disableButton,
    currentProtocol,
    insets,
    closeRequirePinCode,
  };
};
export default useNFTSend;
