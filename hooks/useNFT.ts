import { Seqno } from "@ton-api/client";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { Address, beginCell, internal, SendMode, toNano } from "@ton/ton";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useWalletSecureActionLayout } from "../context/WalletSecure";
import { BurntAddress } from "../enum/BurntAddress";
import { NFTCollectionTab } from "../enum/NFTCollectionTab";
import { TonOpCodes } from "../enum/TonOpCode";
import { TransactionNFTEmulateStatusType } from "../enum/TransactionType";
import LanguageKey from "../locales/LanguageKey";
import { sendGet } from "../network/requests";
import { useAppDispatch } from "../redux/hooks";
import {
  BeneficiaryType,
  ProtocolData,
  WalletInfo,
} from "../redux/slice/account/account.type";
import { TokenDataType } from "../redux/slice/crypto/crypto.types";
import { getAllCollection } from "../redux/slice/NFT/NFTImport.selector";
import {
  addEVMNFTToCollection,
  addTonNFTToCollection,
  setDeleteNFT,
  setUpdateNFT,
} from "../redux/slice/NFT/NFTImport.slice";
import {
  ImportNFTTonParams,
  NFTData,
  NFTDetailEVMCollectionType,
  NFTType,
} from "../redux/slice/NFT/NFTImport.type";
import TonServices from "../services/TonServices";
import {
  Nftitem,
  NftTonNewItem,
  TonAccountsType,
} from "../services/TonServices/type";
import Web3Service from "../services/Web3";
import {
  NFTEVMLocalImport,
  NFTTokenStandard,
  TransactionWeb3Response,
} from "../services/Web3/type";
import {
  EmulateMessageToWalletResType,
  NFTTransferResponseType,
  TransferDataType,
} from "../types/ton";
import Utils from "../utils/commonUtils";
import { dispatchAsyncAction } from "../utils/reduxActionUtils";
import { default as tonUtils, default as TonUtils } from "../utils/tonUtils";
import { useGetCurrentAccountFromStore } from "./useAccount";
import { useWalletBalanceCustomize } from "./useBalance";
import { useCurrencyRateConversion } from "./useCrypto";
import { useCurrentProtocolSelected } from "./useProtocols";
import { useCurrentWalletSelected } from "./useWallet";

export const useNFTImport = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const collection = useSelector(getAllCollection);
  const currentProtocol = useCurrentProtocolSelected();
  const wallet = useCurrentWalletSelected();
  const selectAccountId = useGetCurrentAccountFromStore();
  const onShowLoading = () => setLoading(true);
  const onHideLoading = () => setLoading(false);
  const [isShowModalBurn, setIsShowModalBurn] = useState(false);

  const web3 = useMemo(() => {
    return new Web3Service({
      urpUrl: currentProtocol?.rpcUrl ?? "",
    });
  }, [currentProtocol?.rpcUrl]);
  // TON :
  const handleCloseModalBurn = () => {
    setIsShowModalBurn(false);
  };
  const creatingParamsImportTonNFT = (
    addressNFT: string,
    resDetailNFT: NftTonNewItem,
    collectionId?: string
  ) => {
    if (!currentProtocol || !wallet || !selectAccountId) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const data = {
      contractAddress: addressNFT,
      id: `${wallet.address}_${currentProtocol.slip0044}`,
      protocolData: currentProtocol,
      accountId: selectAccountId.id ?? "",
      dataTonNFT: resDetailNFT,
      collectionId: collectionId ?? NFTCollectionTab.noCollectionId,
    };
    return data;
  };
  const handleDeleteEVMNFT = (nftData: NFTData) => {
    if (
      nftData.detail?.tokenStandard === NFTTokenStandard.ERC1155 &&
      nftData.detail?.quantity
    ) {
      const remainingQuantity =
        (nftData.detail?.quantity ?? 0) - Number(nftData.detail?.quantity);
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
  };
  const checkOnChainTonNFT = async (addressNFT: string) => {
    const tonServices = new TonServices();
    if (!wallet?.address) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const walletAddress = Address.parse(wallet.address).toRawString();

    const resDetailNFT = await tonServices.getDetailNFTByAddressUsingAPI({
      address: addressNFT,
    });

    if (!resDetailNFT.data?.owner?.address) {
      throw new Error(t(LanguageKey.common_invalid_contract_address));
    }
    if (
      TonUtils.compareExactOwnerAddress(
        resDetailNFT.data.owner.address,
        BurntAddress.DummyAddressTon
      ) ||
      TonUtils.compareExactOwnerAddress(
        resDetailNFT.data.owner.address,
        BurntAddress.ZeroAddressTon
      )
    ) {
      setLoading(false);
      setIsShowModalBurn(true);
      throw new Error();
    }
    if (
      !TonUtils.compareExactOwnerAddress(
        resDetailNFT.data?.owner?.address,
        walletAddress
      )
    ) {
      throw new Error(t(LanguageKey.import_nft_not_owned));
    }

    const dataExported = creatingParamsImportTonNFT(
      addressNFT,
      resDetailNFT.data,
      resDetailNFT.data?.collection?.address
    );

    return {
      resDetailNFT: resDetailNFT,
      dataExported: dataExported,
    };
  };

  const validateTonNFT = async (detail: Nftitem) => {
    try {
      const protocol = currentProtocol;

      if (!protocol || !wallet || !selectAccountId) {
        console.log("protocol, wallet or selectAccountId is null");
        throw new Error(t(LanguageKey.common_text_error_title));
      }
      if (
        !detail?.address ||
        !TonUtils.checkValidTonAddress(detail.address.toString())
      ) {
        throw new Error(t(LanguageKey.common_invalid_contract_address));
      }
      const resDetailNFT = await checkOnChainTonNFT(detail.address);

      if (!resDetailNFT) {
        throw new Error(t(LanguageKey.common_invalid_contract_address));
      }
      const dataExported = creatingParamsImportTonNFT(
        detail.address,
        resDetailNFT.resDetailNFT.data,
        detail.collection?.address
      );

      return dataExported;
    } catch (error) {
      if (typeof error === "string") {
        throw new Error(error);
      }

      throw new Error(t(LanguageKey.nft_import_error));
    }
  };

  const importTonNFT = async (params: ImportNFTTonParams) => {
    onShowLoading();
    const dataTonNFT = tonUtils.createNFTTonData(params);
    if (tonUtils.checkExistsTonNFT(dataTonNFT, params, collection)) {
      console.log("Error check exist import nft");
      onHideLoading();
      throw new Error(t(LanguageKey.nft_already_exists));
    }
    dispatchAsyncAction(addTonNFTToCollection(dataTonNFT), dispatch);
  };

  // EVM :
  const creatingWeb3ImportNFT = async (detail: NFTDetailEVMCollectionType) => {
    const protocol = currentProtocol;

    if (!protocol || !wallet) {
      console.log("protocol or wallet is null");
      return;
    }

    const resImport = await web3.importNFT({
      contractAddress: detail.token_address,
      nftId: Number(detail.token_id),
      walletAddress: wallet.address,
    });
    if (!resImport) {
      console.log("resImport is null");
      return;
    }
    return resImport;
  };
  const creatingParamsImportEVMNFT = async (
    detail: NFTDetailEVMCollectionType
  ) => {
    if (!currentProtocol || !wallet || !selectAccountId) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const resImport = await creatingWeb3ImportNFT(detail);

    if (!resImport) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const data: NFTEVMLocalImport = {
      contractAddress: detail.token_address,
      nftId: Number(detail.token_id),
      id: `${wallet.address}_${currentProtocol.slip0044}`,
      protocolData: currentProtocol,
      accountId: selectAccountId.id ?? "",
      nftData: resImport,
    };
    return data;
  };

  const getSanitizedData = async (params: NFTEVMLocalImport) => {
    let nftDataDetail;
    const getNFT = await sendGet<NFTType | string>({
      endPoint: Utils.convertIpfsUrl(params.nftData.tokenURI),
    });
    if (typeof getNFT.data === "string") {
      try {
        const sanitizedData = getNFT.data.replace(/,\s*}/, "}");
        nftDataDetail = JSON.parse(sanitizedData);
      } catch (error) {
        console.log("JSON parse nftDataDetail error: ", error);
        throw new Error(t(LanguageKey.nft_metadata_not_found));
      }
    } else {
      nftDataDetail = getNFT.data;
    }

    if (!nftDataDetail) {
      throw new Error(t(LanguageKey.nft_import_error));
    }
    return nftDataDetail;
  };
  const importEVMNFT = async (params: NFTEVMLocalImport) => {
    onShowLoading();
    const nftDataDetail = await getSanitizedData(params);
    if (!nftDataDetail) {
      throw new Error(t(LanguageKey.nft_import_error));
    }
    const nftEVMData = evmUtils.createNFTEVMData(params, nftDataDetail);
    if (evmUtils.checkExistsEVMNFT(nftEVMData, params, collection)) {
      console.log("Error check exist import nft");
      onHideLoading();
      throw new Error(t(LanguageKey.nft_already_exists));
    }
    dispatchAsyncAction(addEVMNFTToCollection(nftEVMData), dispatch);
  };

  return {
    isShowModalBurn,
    handleCloseModalBurn,
    importEVMNFT,
    loading,
    onShowLoading,
    onHideLoading,
    importTonNFT,
    validateTonNFT,
    checkOnChainTonNFT,
    creatingParamsImportEVMNFT,
    handleDeleteEVMNFT,
  };
};

export const useNFTTransfer = () => {
  const wallet = useCurrentWalletSelected();
  const dispatch = useAppDispatch();
  const currentWallet = useCurrentWalletSelected();
  const currentProtocol = useCurrentProtocolSelected();
  const { executeWithAuth } = useWalletSecureActionLayout();
  const currencySelected = useCurrencyRateConversion();
  const [nftData, setNftData] = useState<NFTData>();

  const web3 = useMemo(() => {
    return new Web3Service({
      urpUrl: currentProtocol?.rpcUrl ?? "",
    });
  }, [currentProtocol?.rpcUrl]);

  const [isNotOwnerEVM, setIsNotOwnerEVM] = useState<boolean>(false);

  const { tokenInfo } = useWalletBalanceCustomize();

  const adminFee = useMemo(() => {
    return currentProtocol?.nftTransferFee;
  }, [currentProtocol]);

  const validateProtocolData = (
    protocol: ProtocolData | undefined,
    wallet: WalletInfo | undefined,
    tokenInfo: TokenDataType | undefined
  ) => {
    const currentAdminFee = protocol?.nftTransferFee ?? 0;
    const adminAddress = protocol?.beneficiary?.walletAddress;
    const senderAddress = wallet?.address;
    const walletBalance = tokenInfo?.balance;

    if (!adminAddress) {
      throw new Error("Admin address is missing");
    }
    if (!senderAddress) {
      throw new Error("Sender address is missing");
    }
    if (walletBalance === undefined || walletBalance === null) {
      throw new Error("Wallet balance is invalid");
    }

    return {
      currentAdminFee,
      adminAddress,
      senderAddress,
      walletBalance,
    };
  };

  const handleDeleteEVMNFT = (
    addressReceive: string,
    nftData: NFTData,
    quantity?: string
  ) => {
    if (!evmUtils.compareAddressesEVM(addressReceive, wallet?.address)) {
      if (
        nftData.detail?.tokenStandard === NFTTokenStandard.ERC1155 &&
        nftData.detail?.quantity &&
        quantity
      ) {
        const remainingQuantity =
          (nftData.detail?.quantity ?? 0) - Number(quantity);
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

  const handleBalanceAndFeeTon = ({
    emulateTransferData,
  }: {
    emulateTransferData: NFTTransferResponseType;
  }) => {
    const feeMutiplier = 1.05;
    const { emulateTransfer } = emulateTransferData;
    const { currentAdminFee } = validateProtocolData(
      currentProtocol,
      currentWallet,
      tokenInfo
    );

    const bigAdminFee = BigInt(
      TonUtils.toBigNumber(
        currentAdminFee,
        currentProtocol?.nativeToken.decimal
      )
    );

    const emulateTransferDataResult =
      emulateTransfer as EmulateMessageToWalletResType;
    const emulatedNetworkFee = Math.ceil(
      Math.abs(emulateTransferDataResult?.event.extra ?? 0) * feeMutiplier
    );
    const emulatedNetworkFeeWithDecimal = Utils.formatBigNumber(
      emulatedNetworkFee.toString(),
      currentProtocol?.nativeToken.decimal
    );

    const totalFeeBigNumberWithDecimal =
      emulatedNetworkFeeWithDecimal + currentAdminFee;

    const formattedAdminFee = Utils.formatBigNumber(
      bigAdminFee.toString(),
      currentProtocol?.nativeToken.decimal
    );

    const formattedNetworkFee = Utils.formatBigNumber(
      emulatedNetworkFee.toString(),
      currentProtocol?.nativeToken.decimal
    );

    const subNetworkFee = Utils.formattedCurrency(
      (formattedNetworkFee ?? 1) *
        (currentProtocol?.price ?? 1) *
        (currencySelected?.rate ?? 1)
    );

    const subAdminFee = Utils.formattedCurrency(
      (formattedAdminFee ?? 1) *
        (currentProtocol?.price ?? 1) *
        (currencySelected?.rate ?? 1)
    );
    const formattedTotalFeeBigAmount = formattedAdminFee + formattedNetworkFee;

    const subTotalFee = Utils.formattedCurrency(
      (formattedNetworkFee ?? 1) *
        (currentProtocol?.price ?? 1) *
        (currencySelected?.rate ?? 1)
    );
    return {
      balanceWallet: Number(tokenInfo?.balanceFormatted),
      totalFeeBigNumberWithDecimal: totalFeeBigNumberWithDecimal,
      emulatedNetworkFee: emulatedNetworkFee,
      bigAdminFee: bigAdminFee,
      subNetworkFee: subNetworkFee,
      subAdminFee: subAdminFee,
      formattedNetworkFee: formattedNetworkFee,
      formattedAdminFee: formattedAdminFee,
      formattedTotalFeeBigAmount: formattedTotalFeeBigAmount,
      subTotalFee: subTotalFee,
    };
  };

  const buildTransferBodyTon = ({
    recipientAddress,
    senderAddress,
  }: {
    recipientAddress: string;
    senderAddress: string;
  }) => {
    return beginCell()
      .storeUint(TonOpCodes.NFT_TRANSFER, 32)
      .storeUint(tonUtils.getWalletQueryId(), 64)
      .storeAddress(Address.parse(recipientAddress))
      .storeAddress(Address.parse(senderAddress))
      .storeUint(0, 1)
      .storeCoins(1)
      .storeUint(0, 1)
      .endCell();
  };
  const getTonAccountInfo = async (
    address: string
  ): Promise<TonAccountsType | undefined> => {
    try {
      const tonServices = new TonServices();
      const tonAccountResponse = await tonServices.getAccounts(address);
      return tonAccountResponse.data as TonAccountsType;
    } catch (error) {
      console.error("Error fetching account info:", error);
      return undefined;
    }
  };
  const emulateNFTTransferTon = async ({
    senderAddress,
    walletBalance,
    transferData,
    isRealisticTransaction = false,
  }: {
    senderAddress: string;
    walletBalance: string;
    transferData: TransferDataType;
    isRealisticTransaction?: boolean;
  }) => {
    try {
      if (!transferData?.messageBOCString) return undefined;

      const tonServices = new TonServices();
      const emulateBalanceData = Number(toNano(1));

      const emulateTransferData = await tonServices.emulateMessageToWallet({
        boc: transferData.messageBOCString,
        params: [
          {
            address: senderAddress,
            balance: isRealisticTransaction
              ? Number(walletBalance)
              : emulateBalanceData,
          },
        ],
      });

      if (!emulateTransferData?.data) return undefined;

      const emulateTransferDataResult =
        emulateTransferData.data as EmulateMessageToWalletResType;
      const hasTransferError = emulateTransferDataResult.event.actions.some(
        (action) => action.status === TransactionNFTEmulateStatusType.Failed
      );

      return hasTransferError ? undefined : emulateTransferDataResult;
    } catch (error) {
      console.error("Error emulating transfer:", error);
      return undefined;
    }
  };
  const createNFTTransferDataTon = async ({
    recipientAddress,
    nftAddressString,
    publicKey,
    amountSending,
    tonAdminBounce,
    secretKey,
  }: {
    recipientAddress: string;
    nftAddressString: string;
    publicKey: string;
    amountSending: bigint;
    tonAdminBounce: boolean;
    secretKey: Buffer<ArrayBufferLike>;
  }) => {
    try {
      const tonServices = new TonServices();
      const { contract } = await TonUtils.initializeWallet(publicKey);
      const { senderAddress, currentAdminFee, adminAddress } =
        validateProtocolData(currentProtocol, currentWallet, tokenInfo);

      const bigAdminFee = BigInt(
        TonUtils.toBigNumber(
          currentAdminFee,
          currentProtocol?.nativeToken.decimal
        )
      );

      if (!senderAddress) {
        return;
      }
      const tonSeqnoData = (await tonServices.getAccountSeqno({
        address: senderAddress,
      })) as Seqno;
      if (!tonSeqnoData) return undefined;

      const bodyNFTTransfer = buildTransferBodyTon({
        recipientAddress,
        senderAddress,
      });

      const internalMessages = [
        internal({
          to: nftAddressString,
          bounce: true,
          value: amountSending,
          body: bodyNFTTransfer,
        }),
      ];

      if (!adminAddress) {
        return undefined;
      }
      if (currentAdminFee > 0) {
        internalMessages.push(
          internal({
            to: adminAddress,
            bounce: tonAdminBounce,
            value: bigAdminFee,
            body: "Admin Fee",
          })
        );
      }

      return await TonUtils.createExternalTransfer({
        internalMessages,
        secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        contract,
        seqno: tonSeqnoData.seqno,
      });
    } catch (error) {
      console.error("Error creating NFT transfer:", error);
      return undefined;
    }
  };
  const handleEmulateTransferTon = async ({
    recipientAddress,
    nftAddressString,
  }: {
    recipientAddress: string;
    nftAddressString: string;
  }) => {
    try {
      const { senderAddress, walletBalance } = validateProtocolData(
        currentProtocol,
        currentWallet,
        tokenInfo
      );
      const { secretKey } = await mnemonicToPrivateKey(await mnemonicNew());

      const amountSending = toNano(0.2);
      if (!senderAddress) return undefined;

      const tonAccountData = await getTonAccountInfo(senderAddress);
      if (!tonAccountData || !currentWallet || !currentWallet.publicKey)
        return undefined;
      const transferData = await createNFTTransferDataTon({
        recipientAddress,
        nftAddressString,
        publicKey: currentWallet.publicKey,
        amountSending,
        tonAdminBounce: false,
        secretKey,
      });

      if (!transferData || !walletBalance) return undefined;

      const emulateTransferData = await emulateNFTTransferTon({
        senderAddress,
        walletBalance,
        transferData,
      });
      return {
        emulateTransfer: emulateTransferData,
        transferData,
        balanceWallet: tonAccountData.balance,
      };
    } catch (error) {
      console.error("handleNFTTransfer error:", error);
      return undefined;
    }
  };
  const handleNFTTransferTon = async ({
    recipientAddress,
    nftAddressString,
    amountSending,
    tonAdminBounce = false,
  }: {
    recipientAddress: string;
    nftAddressString: string;
    amountSending: bigint;
    tonAdminBounce?: boolean;
  }) => {
    try {
      const walletKey = await executeWithAuth();

      if (walletKey === null) {
        return null;
      }

      const { senderAddress, walletBalance } = validateProtocolData(
        currentProtocol,
        currentWallet,
        tokenInfo
      );

      if (!senderAddress || !walletKey) return undefined;
      const tonAccountData = await getTonAccountInfo(senderAddress);
      const secretKey = await TonUtils.getSecretKey({
        publicKey: walletKey.publicKey,
        privateKey: walletKey.privateKey,
      });

      if (!tonAccountData || !secretKey) return undefined;

      const transferData = await createNFTTransferDataTon({
        recipientAddress,
        nftAddressString,
        publicKey: walletKey.publicKey,
        amountSending,
        tonAdminBounce,
        secretKey,
      });

      if (!transferData || !walletBalance) return undefined;

      const emulateTransferData = await emulateNFTTransferTon({
        senderAddress,
        walletBalance,
        transferData,
      });

      return emulateTransferData
        ? {
            emulateTransfer: emulateTransferData,
            transferData,
            balanceWallet: tonAccountData.balance,
          }
        : undefined;
    } catch (error) {
      console.error("handleNFTTransfer error:", error);
      return undefined;
    }
  };

  const formattedFeeWithDecimal = (networkFee: string, adminFee: string) => {
    if (!currentProtocol) {
      return {
        formattedAdminFee: adminFee,
        formattedNetworkFee: networkFee,
      };
    }
    const formattedAdminFee = Utils.formattedBalance(Number(adminFee));
    const formattedNetworkFee = Utils.formattedBalance(Number(networkFee));
    return {
      formattedAdminFee: formattedAdminFee,
      formattedNetworkFee: formattedNetworkFee,
    };
  };

  const handleWhenCompletedTransferEVMNFT = (
    dataTransaction: TransactionWeb3Response,
    data: NFTData,
    web3Service: Web3Service,
    adminFee: number,
    addressReceive: string,
    networkFee: number,
    txHash: string
  ) => {
    if (!currentProtocol?.nativeToken.decimal) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const estimatedGasFee = web3Service.calculateGasUsedForTransfer(
      dataTransaction.effectiveGasPrice,
      dataTransaction.gasUsed,
      currentProtocol?.nativeToken.decimal
    );
    const totalFee = Utils.formattedBalance(adminFee + Number(estimatedGasFee));

    const params = {
      toAddress: addressReceive,
      networkFee: `${networkFee}`,
      adminFee: `${adminFee}`,
      totalAmount: `#${data.detail.nftId ?? ""} / ${totalFee} \n ${
        currentProtocol?.symbol
      }`,
      txHash: txHash,
      nft: data,
    };
    return params;
  };
  const handleDataProcessTransfer = () => {
    if (
      currentProtocol?.beneficiary?.walletAddress &&
      currentProtocol?.commissionContractAddress &&
      currentProtocol.nativeToken?.decimal &&
      wallet
    ) {
      return {
        beneficiaryAddress: currentProtocol?.beneficiary?.walletAddress,
        commission: currentProtocol.nftTransferFee,
        commissionContractAddress: currentProtocol?.commissionContractAddress,
        decimals: currentProtocol.nativeToken?.decimal,
        currentWalletAddress: wallet.address,
      };
    }
  };
  const processTransferNFTEVM = async (
    nftData: NFTData,
    addressReceive: string,
    privateKey: string,
    quantity?: string
  ) => {
    const transferData = handleDataProcessTransfer();

    if (!transferData || adminFee === undefined) {
      console.error("Missing transfer data");
      throw new Error(t(LanguageKey.common_text_error_title));
    }

    const {
      beneficiaryAddress,
      commission,
      commissionContractAddress,
      decimals,
      currentWalletAddress,
    } = transferData;
    const web3Service = new Web3Service({
      urpUrl: currentProtocol?.rpcUrl ?? "",
      contractAddress: nftData.root.contractAddress,
    });
    const params = {
      beneficiaryAddress: beneficiaryAddress,
      commission: commission,
      nftAddress: nftData.root.contractAddress,
      nftId: nftData.detail.nftId,
      recipient: addressReceive,
      smartContractUseForTransfer: commissionContractAddress,
      decimals: decimals,
      currentWalletAddress: currentWalletAddress,
      privateKey: privateKey,
    };
    let receipt;
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //transfer ERC1155
      if (!quantity) {
        throw new Error(t(LanguageKey.common_text_error_title));
      }
      receipt = await web3.transferNFTERC1155({
        ...params,
        quantity: quantity,
      });
    } else {
      //transfer ERC721
      receipt = await web3.transferNFT({
        ...params,
      });
    }
    if (
      !receipt.effectiveGasPrice ||
      !receipt.gasUsed ||
      !currentProtocol?.nativeToken.decimal
    ) {
      throw new Error(t(LanguageKey.common_text_error_title));
    }
    const gasUsedNumber =
      BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice);
    const totalGasFeeInETH = Utils.bigIntToDecimal(
      gasUsedNumber.toString(),
      currentProtocol?.nativeToken.decimal
    );
    const paramTransfer = handleWhenCompletedTransferEVMNFT(
      receipt,
      nftData,
      web3Service,
      adminFee,
      addressReceive,
      Number(totalGasFeeInETH),
      receipt.transactionHash.toString()
    );
    handleDeleteEVMNFT(addressReceive, nftData, quantity);
    return paramTransfer;
  };
  const validateData = ({
    walletAddress,
    quantity,
    nftData,
  }: {
    walletAddress: string;
    quantity: number;
    nftData: NFTData;
  }) => {
    if (!checkValidAddressEVM(walletAddress)) {
      return {
        success: false,
        msg: t(LanguageKey.common_invalid_address),
      };
    }
    if (quantity && +quantity > (nftData.detail.quantity || 0)) {
      return {
        success: false,
        msg: t(LanguageKey.nft_not_enough_quantity),
      };
    }
    return {
      success: true,
      msg: "",
    };
  };

  const checkSystemData = () => {
    if (
      wallet &&
      currentProtocol?.commissionContractAddress &&
      currentProtocol?.beneficiary &&
      currentProtocol.rpcUrl &&
      currentProtocol.nativeToken?.decimal &&
      wallet.derivationPath
    ) {
      return {
        currentProtocol,
        wallet,
        commissionContractAddress: currentProtocol?.commissionContractAddress,
        beneficiary: currentProtocol?.beneficiary,
        rpcUrl: currentProtocol.rpcUrl,
        decimals: currentProtocol.nativeToken.decimal,
        path: wallet.derivationPath,
      };
    }
  };

  const processCheckOwnerNFTEVM = async (
    web3Service: Web3Service,
    currentWalletAddress: string,
    nftData: NFTData,
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
        throw new Error(t(LanguageKey.common_server_busy));
      }
      if (quantity && balance < quantity) {
        throw new Error(t(LanguageKey.nft_not_enough_quantity));
      }
      if (balance === 0) {
        dispatch(setDeleteNFT(nftData));
        setIsNotOwnerEVM(true);
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
      if (
        getOwner &&
        !evmUtils.compareAddressesEVM(getOwner, currentWalletAddress)
      ) {
        dispatch(setDeleteNFT(nftData));
        setIsNotOwnerEVM(true);
        return false;
      }
    }
    return true;
  };
  const processCheckApproveNFTEVM = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    walletAddress: string,
    nftData: NFTData
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
      if (
        evmUtils.compareAddressesEVM(currentApprove, commissionContractAddress)
      ) {
        return true;
      }
    }
    return false;
  };

  const processRequestPermissionEVM = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    currentWalletAddress: string,
    decimals: number,
    nftData: NFTData
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
        commissionContractAddress
      );
      if (!gasEstimate) {
        throw new Error("Could not get gas limit estimate");
      }
      gasEstimateGlobal = gasEstimate;
    }
    const convertedGasEstimate = Utils.bigIntToDecimal(
      gasEstimateGlobal,
      decimals
    );
    return Number(convertedGasEstimate);
  };

  const processEstimateGasTransferNFTEVM = async (
    web3Service: Web3Service,
    commission: number,
    commissionContractAddress: string,
    beneficiary: BeneficiaryType,
    currentWalletAddress: string,
    decimals: number,
    nftData: NFTData,
    recipientAddress: string,
    quantity: string
  ): Promise<string | undefined> => {
    let estimateGas: string;
    if (!wallet) throw new Error(t(LanguageKey.common_text_error_title));
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      estimateGas = await web3Service.estimateGasForTransferNFT1155({
        commission: commission,
        commissionContractAddress,
        beneficiaryAddress: beneficiary.walletAddress,
        recipientAddress: recipientAddress,
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
          recipient: recipientAddress,
          sender: currentWalletAddress,
          smartContractUseForTransfer: commissionContractAddress,
          beneficiaryAddress: beneficiary.walletAddress,
          decimals,
        })) || "0";
    }
    return estimateGas;
  };
  const handleCheckErrorEVM = (error: string) => {
    const errorMessage = error + "";
    const checkError = errorMessage.includes("insufficient funds");
    if (checkError) {
      throw new Error(t(LanguageKey.send_input_error_2));
    }
  };

  const processApproveNFTEVM = async (
    web3Service: Web3Service,
    commissionContractAddress: string,
    nftData: NFTData,
    walletAddress: string,
    privateKey: string
  ): Promise<boolean> => {
    if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
      //approve ERC1155
      const result = await web3Service.approveNFTERC1155({
        contractAddress: nftData.root.contractAddress,
        commissionContractAddress,
        walletAddress,
        privateKey,
      });

      return Boolean(result);
    } else {
      //approve ERC721
      const result = await web3Service.approveNFTERC721({
        tokenId: nftData.detail.nftId ?? 0,
        nftSmartContract: nftData.root.contractAddress,
        smartContractUseForApproved: commissionContractAddress,
        walletAddress,
        privateKey,
      });
      return Boolean(result);
    }
  };

  return {
    handleNFTTransferTon,
    handleBalanceAndFeeTon,
    handleEmulateTransferTon,
    currencySelected,
    validateData,
    checkSystemData,
    processCheckOwnerNFTEVM,
    processEstimateGasTransferNFTEVM,
    processRequestPermissionEVM,
    processCheckApproveNFTEVM,
    isNotOwnerEVM,
    handleCheckErrorEVM,
    processApproveNFTEVM,
    processTransferNFTEVM,
    handleWhenCompletedTransferEVMNFT,
    tokenInfo,
    wallet,
    formattedFeeWithDecimal,
    nftData,
  };
};
