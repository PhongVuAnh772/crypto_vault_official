import { StackActions } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import EnvConfig from "src/core/constants/EnvConfig";
import { TransactionType } from "src/core/enum/TransactionType";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useAccount,
  useBitcoinAddressData,
  useCurrentWallet,
  useProtocolSelected,
  useTonAddressData,
} from "src/core/redux/slice/account.selector";
import { getProtocolDataLists } from "src/core/redux/slice/account.slice";
import {
  APIResponseMoralis,
  Transaction,
} from "src/core/services/Moralis/type";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import Utils from "src/core/utils/commonUtils";
import {
  compareAddressesEVM,
  convertChainByProtocol,
} from "src/core/utils/evmUtils";
import WalletUtils from "src/core/utils/walletUtils";

import AppToastType from "src/core/enum/AppToastType";
import Slip0044 from "src/core/enum/Slip0044";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import GlobalUtils from "src/core/utils/globalUtils";
import { transactionHistoryUtils } from "src/core/utils/transactionsHistoryUtils";
import { getTransactionsHistoryEVM } from "src/features/transfer/evm/send.evm.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useTransaction = ({
  navigation,
  typeSelect,
}: RootNavigationType & {
  typeSelect: TransactionType;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentWallet = useAccount();
  const [isPressDisabled, setIsPressDisabled] = useState(false);
  const btcAddress = useBitcoinAddressData()?.address ?? "";
  const listProtocol = useAppSelector(getProtocolDataLists);
  const tonAddressData = useTonAddressData();
  const wallet = useCurrentWallet();
  const protocolBaseData = useProtocolSelected();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState<
    HistorySectionDataType[]
  >([]);

  const checkTypeTransaction = (transaction: Transaction) => {
    if (compareAddressesEVM(transaction.from_address, wallet?.address)) {
      return TransactionType.Sent;
    }
    return TransactionType.Receive;
  };

  const checkIfSmartContractOfSystem = (address: string): boolean => {
    const isSystem = listProtocol?.some((protocol) =>
      compareAddressesEVM(protocol.commissionContractAddress, address)
    );
    return !!isSystem;
  };

  const convertTransactionsData = useCallback(
    (walletHistory: APIResponseMoralis) => {
      try {
        if (!walletHistory || !protocolBaseData) return;
        const protocolDecimals = protocolBaseData?.nativeToken.decimal || 18;
        const nativeToken = protocolBaseData?.nativeToken;
        const baseTokenInfo = {
          name: nativeToken?.name,
          logo: protocolBaseData?.logo,
          symbol: nativeToken?.symbol,
        };

        const convertedData = walletHistory.result.map((transaction) => {
          const typeTransaction = checkTypeTransaction(transaction);
          const isReceived = typeTransaction === TransactionType.Receive;
          let data = transactionHistoryUtils.getBaseTransactionData(
            transaction,
            typeTransaction,
            isReceived,
            protocolBaseData
          );
          // Handle different transaction types
          if (
            transactionHistoryUtils.isSmartContractCallTransactionHistory(
              transaction
            )
          ) {
            let resultAirdropOrMint =
              transactionHistoryUtils.handleAirdropOrMint(
                data,
                transaction.value,
                baseTokenInfo
              );
            return transactionHistoryUtils.handleSetDataDefault(
              resultAirdropOrMint,
              isReceived,
              wallet?.address || "",
              transaction.internal_transactions,
              protocolDecimals,
              true,
              transaction
            );
          }

          // Handle internal transactions
          if (transaction.internal_transactions.length) {
            const isSystem = checkIfSmartContractOfSystem(
              transaction.to_address
            );

            if (!isSystem) {
              return transactionHistoryUtils.handleSetDataDefault(
                data,
                isReceived,
                wallet?.address || "",
                transaction.internal_transactions,
                protocolDecimals,
                true,
                transaction
              );
            }
          }

          // Handle different transfer types
          if (transaction.nft_transfers.length) {
            return transactionHistoryUtils.handleNFTTransfer(
              data,
              transaction.nft_transfers[0],
              isReceived,
              transaction,
              nativeToken,
              protocolDecimals
            );
          }
          if (transaction.native_transfers.length) {
            let nativeResult =
              transactionHistoryUtils.handleNativeTransactionsMoralis(
                data,
                transaction.internal_transactions,
                isReceived,
                protocolDecimals,
                transaction.from_address,
                protocolBaseData,
                transaction,
                baseTokenInfo,
                nativeToken,
                wallet?.address || ""
              );
            if (nativeResult.isShowDefaults) {
              const defaultResult =
                transactionHistoryUtils.handleSetDataDefault(
                  nativeResult,
                  isReceived,
                  wallet?.address || "",
                  transaction.internal_transactions,
                  protocolDecimals,
                  true,
                  transaction
                );
              nativeResult = defaultResult;
            }
            return nativeResult;
          }
          if (transaction.erc20_transfers.length) {
            let erc20Result = transactionHistoryUtils.handleERC20Transfers(
              data,
              transaction.erc20_transfers,
              typeTransaction,
              transaction.from_address,
              isReceived,
              protocolBaseData
            );
            if (erc20Result.isShowDefaults) {
              const defaultResult =
                transactionHistoryUtils.handleSetDataDefault(
                  erc20Result,
                  isReceived,
                  wallet?.address || "",
                  transaction.erc20_transfers,
                  protocolDecimals,
                  false,
                  transaction
                );
              erc20Result = defaultResult;
            }
            return erc20Result;
          }

          return data;
        });
        setTransactionHistory(
          WalletUtils.transactionHistoryTransformToSectionsData([
            ...convertedData,
          ])
        );
      } catch (error) {
        console.log("🚀 ~ useTransaction ~ error:", error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet?.address, protocolBaseData]
  );

  const handlingFetchDataEVM = async (wallet: AddressListItemType) => {
    if (protocolBaseData) {
      const chain = convertChainByProtocol(protocolBaseData?.slip0044);
      if (!chain) {
        Utils.showToast({
          msg: t(LanguageKey.common_server_busy),
          type: AppToastType.error,
        });
        return;
      }
      const response = await dispatch(
        getTransactionsHistoryEVM({
          walletAddress: wallet.address,
          data: {
            chain: chain,
            order: "DESC",
            include_internal_transactions: true,
            limit: 100,
          },
        })
      );
      if (getTransactionsHistoryEVM.fulfilled.match(response)) {
        convertTransactionsData(response.payload);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchData = async (handlingRefresh: boolean) => {
    try {
      if (handlingRefresh) {
        setRefreshing(true);
      }
      if (wallet) {
        await handlingFetchDataEVM(wallet);
      }
      setRefreshing(false);
    } catch (error) {
      console.error("fetchData Error:", error);
      setTransactionHistory([]);
      setRefreshing(false);
    } finally {
      setRefreshing(false);
    }
  };

  const filterHistoryByType = useCallback(() => {
    if (typeSelect === TransactionType.All) {
      return transactionHistory;
    } else {
      let newTransactionHistory: HistorySectionDataType[] = [];
      for (const section of transactionHistory) {
        const result = section.data.filter((transaction) => {
          return transaction.type === typeSelect;
        });
        if (result.length) {
          newTransactionHistory.push({
            title: section.title,
            data: result,
          });
        }
      }
      return newTransactionHistory;
    }
  }, [typeSelect, transactionHistory]);
  const listShow = filterHistoryByType();

  const typeSelectTitle =
    typeSelect === TransactionType.All
      ? LanguageKey.transaction_all_type
      : typeSelect;

  const goToDetails = (item: TransactionHistoryDataType) => {
    navigation.dispatch(
      StackActions.push(HomeStackScreenKey.TransactionDetails, {
        transactionData: item,
      })
    );
  };

  const onGoToDetails = (item: TransactionHistoryDataType) => {
    if (!isPressDisabled) {
      goToDetails(item);
      setIsPressDisabled(true);
      setTimeout(() => {
        setIsPressDisabled(false);
      }, 200);
    }
  };

  const viewMoreHistory = () => {
    switch (protocolBaseData?.slip0044) {
      case Slip0044.Ton:
        Linking.openURL(
          `${EnvConfig.TON_VIEWER_URL}${tonAddressData?.address}`
        );
        break;
      case Slip0044.Bitcoin:
        Linking.openURL(`${EnvConfig.BLOCK_CYPHER_ADDRESS_ULR}${btcAddress}`);
        break;
      default:
        Linking.openURL(
          `${protocolBaseData?.blockExplorerUrl}/address/${wallet?.address}`
        );
    }
  };

  useEffect(() => {
    fetchData(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocolBaseData, currentWallet]);

  const onRefresh = async () => {
    fetchData(true);
  };

  return {
    transactionHistory: listShow,
    typeSelectTitle,
    refreshing,
    onRefresh,
    onGoToDetails,
    loading,
    viewMoreHistory,
  };
};

export default useTransaction;
