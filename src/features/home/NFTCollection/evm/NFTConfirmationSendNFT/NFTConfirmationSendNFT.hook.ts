import { StackActions } from "@react-navigation/native";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AppToastType from "src/core/enum/AppToastType";
import { CoinType } from "src/core/enum/CoinType";
import { TransactionType } from "src/core/enum/TransactionType";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";
import { setUpdateBalance } from "src/core/redux/slice/app.slice";
import Web3Service from "src/core/services/Web3";
import {
  NFTTokenStandard,
  TransactionWeb3Response,
} from "src/core/services/Web3/type";
import Utils from "src/core/utils/commonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { compareAddressesEVM } from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import {
  setDeleteNFT,
  setUpdateNFT,
} from "../../../../../core/redux/slice/NFT/NFTImport.slice";
import { NFTData } from "../../../../../core/redux/slice/NFT/NFTImport.type";
import { NFTConfirmationSendParamsType } from "../NFTSend/NFTSend.type";
import { paramsTransactions } from "./NFTConfirmationSendNFT.type";

const useNFTConfirmationSend = (
  { navigation }: RootNavigationType,
  data: NFTConfirmationSendParamsType
) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const nftData = data.data;
  const web3Service = new Web3Service({
    urpUrl: nftData.root.protocol.rpcUrl ?? "",
  });
  const theme = useAppTheme();
  const [isNotOwner, setIsNotOwner] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [showModalConfirmTransaction, setShowModalConfirmTransaction] =
    useState<boolean>(false);
  const dispatch = useAppDispatch();

  const currentProtocol = useProtocolSelected();
  const currentWallet = useCurrentWallet();

  const adminFee = `${data.adminFee} ${nftData.root.symbol}`;
  const isERC1155 = nftData.detail.tokenStandard === NFTTokenStandard.ERC1155;
  const handleConfirm = () => {
    setShowModalConfirmTransaction(true);
  };

  const convertEstimatedGasFollowCryptoCurrency = () => {
    try {
      const gasResult = `${Utils.formattedBalanceCurrency(
        Number(data.gasFee)
      )} ${nftData.root.symbol}`;
      return gasResult;
    } catch {
      Utils.showToast({
        msg: `${t(LanguageKey.common_get_data_error)}`,
        type: AppToastType.error,
        visibilityTime: 2000,
      });
      return "";
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
  const processCheckOwnerNFT = async (
    web3Service: Web3Service,
    currentWalletAddress: string,
    quantity?: number
  ): Promise<boolean> => {
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //check owner of ERC1155
      const balance = await web3Service.getOwnerOfNFTERC1155({
        contractAddress: nftData.root.contractAddress,
        nftId: nftData.detail.nftId,
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
      }
    } else {
      //check owner of ERC721
      const getOwner = await web3Service.getOwnerOfNFT({
        nftSmartContract: nftData.root.contractAddress,
        tokenId: nftData.detail.nftId,
      });
      if (getOwner && !compareAddressesEVM(getOwner, currentWalletAddress)) {
        dispatch(setDeleteNFT(nftData));
        setIsNotOwner(true);
        return false;
      }
    }
    return true;
  };
  const handleDeleteNFT = () => {
    if (!compareAddressesEVM(data.addressReceive, currentWallet?.address)) {
      if (
        nftData.detail?.tokenStandard === NFTTokenStandard.ERC1155 &&
        data.quantity
      ) {
        const remainingQuantity =
          (nftData.detail?.quantity ?? 0) - Number(data.quantity);
        if (remainingQuantity > 0) {
          dispatch(
            setUpdateNFT({
              ...nftData,
              detail: {
                ...nftData.detail,
                quantity: remainingQuantity,
              },
            })
          );
        } else {
          dispatch(setDeleteNFT(nftData));
        }
      } else {
        dispatch(setDeleteNFT(nftData));
      }
    }
  };
  const handleWhenCompleted = (dataTransaction: TransactionWeb3Response) => {
    handleDeleteNFT();
    const {
      data: { detail, root },
    } = data;
    const estimatedGasFeeEth = web3Service.calculateGasUsedForTransfer(
      dataTransaction.effectiveGasPrice,
      dataTransaction.gasUsed
    );
    const totalFee = Utils.formattedBalanceCurrency(
      data.adminFee + Number(estimatedGasFeeEth)
    );

    const params: paramsTransactions = {
      transactionData: {
        totalNFT: `#${detail.nftId ?? ""} / ${totalFee} \n ${root.protocol.symbol}`,
        amountSend: 0,
        coinType: CoinType.Ethereum,
        txHash: dataTransaction.transactionHash.toString(),
        createdAt: moment().toString(),
        adminFee: data.adminFee,
        to: data.addressReceive,
        from: currentWallet?.address || "",
        estimatedGasFee: +estimatedGasFeeEth,
        tokenId: detail.nftId,
        type: TransactionType.Sent,
        isSendNFT: true,
        protocolData: currentProtocol,
        confirmations: 2, //pending
        quantity: isERC1155 ? data.quantity : undefined,
        backToTop: true,
      },
    };
    dispatch(setUpdateBalance(true));
    navigation.dispatch(
      StackActions.replace(HomeStackScreenKey.TransactionDetails, params)
    );
  };

  const processTransferNFT = async (
    pinCode: string,
    commissionContractAddress: string,
    beneficiaryAddress: string,
    path: string,
    decimals: number,
    commission: number,
    slip0044: number
  ) => {
    const params = {
      beneficiaryAddress: beneficiaryAddress,
      commission: commission,
      nftAddress: nftData.root.contractAddress,
      nftId: nftData.detail.nftId,
      recipient: data.addressReceive,
      smartContractUseForTransfer: commissionContractAddress,
      pinCode: pinCode,
      callBackWhenSuccessful: handleWhenCompleted,
      path: path,
      slip: slip0044,
      decimals: decimals,
    };

    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //transfer ERC1155
      await web3Service.transferNFTERC1155({
        ...params,
        quantity: data.quantity ?? "",
      });
    } else {
      //transfer ERC721
      await web3Service.transferNFT({
        ...params,
      });
    }
  };
  const handleCloseConfirmation = () => {
    setShowModalConfirmTransaction(false);
  };
  const handleConfirmSendNFTCallBack = async (pinCode: string) => {
    handleCloseConfirmation();
    setIsLoadingPage(true);
    try {
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
        path,
      } = systemData;

      //instantiate web3 service
      const web3Service = new Web3Service({
        urpUrl: rpcUrl,
        contractAddress: nftData.root.contractAddress,
      });

      const isOwner = await processCheckOwnerNFT(
        web3Service,
        currentWallet.address,
        data.quantity ? Number(data.quantity) : undefined
      );
      if (!isOwner) {
        return;
      }
      await processTransferNFT(
        pinCode,
        commissionContractAddress,
        beneficiary.walletAddress,
        path,
        currentProtocol.nativeToken.decimal,
        currentProtocol.nftTransferFee,
        currentProtocol.slip0044
      );
    } catch (error) {
      console.log("🚀 ~ handleConfirmSendNFTCallBack ~ error:", error);
      Utils.showToast({
        msg: `${t(LanguageKey.nft_transfer_nft_fail)}`,
        type: AppToastType.error,
        visibilityTime: 2000,
      });
    } finally {
      setIsLoadingPage(false);
    }
  };
  const handleUnderstood = () => {
    navigation.dispatch(StackActions.popToTop());
  };
  return {
    handleConfirm,
    isLoadingPage,
    gasFee: convertEstimatedGasFollowCryptoCurrency(),
    adminFee,
    handleConfirmSendNFTCallBack,
    showModalConfirmTransaction,
    isNotOwner,
    t,
    handleUnderstood,
    handleCloseConfirmation,
    theme,
    insets,
  };
};
export default useNFTConfirmationSend;
