import { t } from "i18next";
import LanguageKey from "src/core/locales/LanguageKey";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import { NFTResponse } from "src/core/redux/slice/NFT/NFTImport.type";
import {
  default as commonUtils,
  default as Utils,
} from "src/core/utils/commonUtils";
import Web3 from "web3";
import { Numbers, Transaction } from "web3-types";
import { AbiItem } from "web3-utils";
import { isAddress } from "web3-validator";
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";
import { store } from "../../redux/store";
import AccountServices from "../AccountServices";
import { ThirdPartyService } from "../FirebaseAnalytics/type";
import { erc1155 } from "./abi/erc1155";
import erc20 from "./abi/erc20";
import { erc721 } from "./abi/erc721";
import { smartContractABIERC1155 } from "./abi/smartContractABIERC1155";
import { smartContractABIERC20 } from "./abi/smartContractABIERC20";
import {
  ApproveNFT1155Params,
  ApproveNFT1155ParamsSignTransactionType,
  approveNFTERC721Type,
  checkNFTResponse,
  EstimateGasFeeForTransferNFT1155,
  EstimateGasFeeTokenType,
  EstimateGasFeeTransferTokenType,
  GetApproveNFT1155Params,
  GetERC721DetailParams,
  GetOwnerOfNFTERC1155Params,
  getPrivateKeyAndNonceAddressReturn,
  GivePermissionParamsType,
  ImportNFTParams,
  NFTAddressType,
  NFTTokenStandard,
  NFTTransferType,
  transactionObjectType,
  TransferNativeTokenParamsType,
  TransferNFTERC1155Type,
  TransferTokenParamsType,
  Web3ServiceType,
} from "./type";

const _additionalFee = 5; // 5%;
class Web3Service {
  currentRPCUrl: string;
  abi?: [];
  contractAddress?: string;
  web3: Web3<RegisteredSubscription>;

  constructor({ urpUrl, address, abi, contractAddress }: Web3ServiceType) {
    this.currentRPCUrl = urpUrl;
    this.abi = abi;
    this.contractAddress = contractAddress;
    this.web3 = new Web3(this.currentRPCUrl);
  }

  initNetwork() {
    const web3 = new Web3(this.currentRPCUrl);
    return web3;
  }

  instantiateASmartContract(address?: string, abi?: AbiItem[]) {
    const contractABI = new this.web3.eth.Contract(
      abi || erc721,
      address || this.contractAddress
    );
    return {
      contractABI,
    };
  }
  async checkRPC() {
    const web3 = new Web3(this.currentRPCUrl);
    try {
      await web3.eth.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }
  async getPrivateKeyAndNonceAddress(
    pinCode: string,
    path: string,
    slip: number
  ): Promise<getPrivateKeyAndNonceAddressReturn | undefined> {
    const nativeWalletCoreModule = new NativeWalletCoreModule();
    const accountServices = new AccountServices();
    const currentWalletId = store.getState().account.selectAccountId;

    if (!currentWalletId) {
      throw new Error("Wallet not found");
    }

    const walletData = await accountServices.getCurrentAccount(
      pinCode,
      currentWalletId
    );
    if (walletData) {
      const resultEthereum =
        await nativeWalletCoreModule.getEVMKeyAndAddressFromSlip0044({
          mnemonic: walletData.mnemonic,
          slip0044: slip,
          derivationPath: path,
        });
      if (resultEthereum) {
        const nonce = await this.web3.eth.getTransactionCount(
          resultEthereum.address
        );
        return {
          nonce: Number(nonce),
          privateKey: resultEthereum.key,
          walletAddress: resultEthereum.address,
        };
      }
    }
  }
  async getOwnerOfNFT({
    nftSmartContract,
    tokenId,
  }: NFTAddressType): Promise<string | undefined> {
    try {
      const { contractABI } = this.instantiateASmartContract(nftSmartContract);

      const ownerAddress = await contractABI.methods?.ownerOf(tokenId)?.call();

      if (typeof ownerAddress === "string") {
        return ownerAddress;
      }
    } catch (error) {
    
      throw error;
    }
  }

  async getApproveNFTERC721({
    nftSmartContract,
    tokenId,
  }: NFTAddressType): Promise<string | undefined> {
    try {
      const { contractABI } = this.instantiateASmartContract(nftSmartContract);

      const getApproved = await contractABI.methods.getApproved(tokenId).call();
      if (typeof getApproved === "string") {
        return getApproved;
      }
    } catch (error) {
     
      throw error;
    }
  }

  async getCurrentGasPrice() {
    const gasPrice = await this.web3.eth.getGasPrice();
    return gasPrice;
  }

  async estimateGasLimit(data: transactionObjectType) {
    const estimatedGas = await this.web3.eth.estimateGas(data);
    return estimatedGas;
  }

  async getGasLimitEstimatedERC721(
    walletAddress: string,
    tokenId: number,
    smartContractWillBeApproved: string,
    decimals: number
  ): Promise<bigint | undefined> {
    try {
      const { contractABI } = this.instantiateASmartContract();

      if (!contractABI.options.address) {
        throw new Error("Could not find address in contract ABI");
      }

      const txData = contractABI.methods
        ?.approve(smartContractWillBeApproved, tokenId)
        ?.encodeABI();

      const gasLimit = await this.estimateGasLimit({
        from: walletAddress,
        to: contractABI.options.address,
        data: txData,
      });

      const getGasPrice = await this.getCurrentGasPrice();

      if (gasLimit && getGasPrice) {
        const gasEstimate = getGasPrice * gasLimit;
        return gasEstimate;
      }
    } catch (error) {
   
      throw error;
    }
  }
  /**
   * Approves a specific ERC721 token to be operated by another address (typically a smart contract).
   * This function enables the approved address to transfer the specified NFT on behalf of the owner.
   *
   * @param {Object} params - The parameters object
   * @param {number} params.tokenId - The ID of the NFT token to be approved
   * @param {string} params.pinCode - The PIN code for wallet access
   * @param {string} params.nftSmartContract - The address of the ERC721 contract containing the NFT
   * @param {string} params.smartContractUseForApproved - The address that will be approved to operate the NFT
   * @param {number} params.slip - The slip number for wallet derivation (typically 60 for Ethereum)
   * @param {string} params.path - The derivation path for the wallet (e.g., "m/44'/60'/0'/0/0")
   *
   * @returns {Promise<boolean>} Returns true if the approval transaction is successful
   *
   * @throws {Error} Throws an error if:
   * - Contract ABI or wallet address cannot be retrieved
   * - Transaction signing fails
   * - Transaction execution fails
   *
   * @example
   * const result = await web3Service.approveNFTERC721({
   *   tokenId: 123,
   *   pinCode: "1234",
   *   nftSmartContract: "0x123...",
   *   smartContractUseForApproved: "0x456...",
   *   slip: 60,
   *   path: "m/44'/60'/0'/0/0"
   * });
   */
  async approveNFTERC721({
    tokenId,
    pinCode,
    nftSmartContract,
    smartContractUseForApproved,
    slip,
    path,
  }: approveNFTERC721Type) {
    try {
      const { contractABI } = this.instantiateASmartContract(nftSmartContract);

      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      if (!data || !contractABI.options.address) {
        throw new Error(
          "Could not get address of contract api | wallet not found"
        );
      }

      const txData = contractABI.methods
        ?.approve(smartContractUseForApproved, tokenId)
        ?.encodeABI();

      const [gasLimit, gasPrice, chainId] = await Promise.all([
        this.estimateGasLimit({
          from: data.walletAddress,
          to: contractABI.options.address,
          data: txData,
        }),
        this.getCurrentGasPrice(),
        this.web3.eth.getChainId(),
      ]);

      const txObject: Transaction = {
        to: contractABI.options.address,
        data: txData,
        gasLimit: gasLimit,
        gasPrice,
        chainId,
        nonce: data.nonce,
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(
        txObject,
        data.privateKey
      );

      if (signedTx.rawTransaction) {
        const result = await new Promise((resolve, reject) => {
          this.web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on("receipt", (receipt) => {
              resolve(true);
            })
            .on("error", (error) => {
              reject(new Error(error + ""));
            });
        });
        return result;
      }
    } catch (error) {
    
      throw error;
    }
  }

  async transferNFT({
    beneficiaryAddress,
    pinCode,
    commission,
    nftAddress,
    nftId,
    recipient,
    smartContractUseForTransfer,
    callBackWhenSuccessful,
    path,
    slip,
    decimals,
  }: NFTTransferType) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        smartContractUseForTransfer,
        smartContractABIERC20
      );

      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      if (!data || !contractABI.options.address) {
        throw new Error(
          "Could not get address of contract api | wallet not found"
        );
      }

      const commissionAdmin = Utils.convertAmountToWeiFollowDecimals(
        commission,
        decimals
      );

      const transferMethod = contractABI.methods?.transferNFT(
        recipient,
        nftAddress,
        nftId,
        beneficiaryAddress
      );

      const txData = transferMethod?.encodeABI();

      const [estimatedGas, feeDataTransferTransaction, gasPrice] =
        await Promise.all([
          transferMethod?.estimateGas({
            from: data.walletAddress,
            value: commissionAdmin + "",
          }),
          this.web3.eth.calculateFeeData(),
          this.web3.eth.getGasPrice(),
        ]);

      let txRequest: Transaction = {
        from: data.walletAddress,
        to: smartContractUseForTransfer,
        data: txData,
        gas: estimatedGas,
        value: commissionAdmin,
      };

      if (
        feeDataTransferTransaction.maxFeePerGas &&
        feeDataTransferTransaction.maxPriorityFeePerGas
      ) {
        txRequest.maxFeePerGas = feeDataTransferTransaction.maxFeePerGas;
        txRequest.maxPriorityFeePerGas =
          feeDataTransferTransaction.maxPriorityFeePerGas;
      } else if (feeDataTransferTransaction.gasPrice) {
        txRequest.gasPrice = feeDataTransferTransaction.gasPrice;
      } else if (gasPrice) {
        txRequest.gasPrice = gasPrice;
      }
      const signedApproveTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        data.privateKey
      );

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedApproveTx.rawTransaction
      );
      callBackWhenSuccessful(receipt);
      return receipt;
    } catch (error) {
     
      throw error;
    }
  }

  async getEstimateGasForTransferNFT({
    commission,
    nftAddress,
    nftId,
    recipient,
    sender,
    smartContractUseForTransfer,
    beneficiaryAddress,
    decimals,
  }: Pick<
    NFTTransferType,
    | "sender"
    | "recipient"
    | "nftId"
    | "nftAddress"
    | "commission"
    | "smartContractUseForTransfer"
    | "beneficiaryAddress"
  > & {
    decimals: number;
  }): Promise<string | undefined> {
    try {
      const { contractABI } = this.instantiateASmartContract(
        smartContractUseForTransfer,
        smartContractABIERC20
      );
      const commissionFee = Utils.convertAmountToWeiFollowDecimals(
        commission,
        decimals
      );

      const estimateGas = await contractABI.methods
        ?.transferNFT(recipient, nftAddress, nftId, beneficiaryAddress)
        ?.estimateGas({
          from: sender,
          value: commissionFee + "",
        });

      const gasPrice = await this.getCurrentGasPrice();

      if (!estimateGas || !gasPrice) {
        throw new Error("Couldn't get gas price | estimate gas");
      }
      const resultCommissionFee = Utils.convertBigIntFollowDecimals(
        estimateGas * gasPrice,
        decimals
      );
      return resultCommissionFee;
    } catch (error) {
     
      throw error;
    }
  }
  calculateGasUsedForTransfer(
    effectiveGasPrice: Numbers | undefined,
    gasUsed: Numbers
  ) {
    try {
      if (!(effectiveGasPrice && gasUsed)) {
        return "";
      }
      const totalGasFeeInWei = BigInt(gasUsed) * BigInt(effectiveGasPrice);

      const totalGasFeeInETH = Web3.utils.fromWei(
        totalGasFeeInWei.toString(),
        "ether"
      );
      return totalGasFeeInETH;
    } catch (error) {
      return 0;
    }
  }
  async checkCustomToken() {
    try {
      const { contractABI } = this.instantiateASmartContract(
        this.contractAddress,
        erc20
      );

      const [symbol, name, decimals] = await Promise.all([
        contractABI.methods.symbol().call(),
        contractABI.methods.name().call(),
        contractABI.methods.decimals().call(),
      ]);
      if (!(symbol || name || decimals)) {
        throw new Error("Add custom token error");
      }
      return { symbol, name, decimals };
    } catch (error) {
    
      throw error;
    }
  }

  async getAmountTokenApproved(owner: string, sender: string): Promise<bigint> {
    try {
      const { contractABI } = this.instantiateASmartContract(
        this.contractAddress,
        erc20
      );
      const allowance = await contractABI.methods
        .allowance(owner, sender)
        .call();
      return allowance as unknown as bigint;
    } catch (error) {
     
      throw error;
    }
  }
  async estimateGasFeeForApproveToken({
    amount,
    smartContract,
    walletAddress,
    tokenContractAddress,
  }: EstimateGasFeeTokenType): Promise<bigint> {
    try {
      const { contractABI } = this.instantiateASmartContract(
        tokenContractAddress,
        erc20
      );
      const [estimateGas, gasPrice] = await Promise.all([
        contractABI.methods.approve(smartContract, amount).estimateGas({
          from: walletAddress,
        }),
        this.getCurrentGasPrice(),
      ]);
      if (!estimateGas || !gasPrice) {
        throw new Error("Couldn't get gas price | estimate gas");
      }
      return estimateGas * gasPrice;
    } catch (error) {
     
      throw error;
    }
  }
  async approveToken({
    pinCode,
    amount,
    smartContractToken,
    smartContractApproved,
    path,
    slip,
  }: GivePermissionParamsType) {
    try {
      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      const { contractABI } = this.instantiateASmartContract(
        smartContractToken,
        erc20
      );

      const [decimals, chainId, gasPrice, feeDataApproveTransaction] =
        await Promise.all([
          contractABI.methods.decimals().call(),
          this.web3.eth.getChainId(),
          this.getCurrentGasPrice(),
          this.web3.eth.calculateFeeData(),
        ]);
      if (
        typeof decimals !== "string" &&
        typeof decimals !== "number" &&
        typeof decimals !== "bigint"
      ) {
        throw new Error("Decimals don't match");
      }
      if (!data?.walletAddress || !contractABI.options.address) {
        throw new Error(
          "Could not get address of contract api | wallet not found"
        );
      }

      const contractApprove = contractABI.methods.approve(
        smartContractApproved,
        amount
      );

      const txData = contractApprove?.encodeABI();

      const estimateGas = await contractApprove.estimateGas({
        from: data.walletAddress,
      });

      const txObject: Transaction = {
        from: data.walletAddress,
        to: smartContractToken,
        data: txData,
        gas: estimateGas,
        nonce: data.nonce,
        chainId,
      };

      if (
        feeDataApproveTransaction.maxFeePerGas &&
        feeDataApproveTransaction.maxPriorityFeePerGas
      ) {
        txObject.maxFeePerGas = feeDataApproveTransaction.maxFeePerGas;
        txObject.maxPriorityFeePerGas =
          feeDataApproveTransaction.maxPriorityFeePerGas;
      } else if (feeDataApproveTransaction.gasPrice) {
        txObject.gasPrice = feeDataApproveTransaction.gasPrice;
      } else if (gasPrice) {
        txObject.gasPrice = gasPrice;
      }

      const signedTx = await this.web3.eth.accounts.signTransaction(
        txObject,
        data.privateKey
      );

      if (signedTx.rawTransaction) {
        const result = await new Promise((resolve, reject) => {
          this.web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on("receipt", (receipt) => {
              resolve(true);
            })
            .on("error", (error) => {
              reject(new Error(error + ""));
            });
        });
        return result;
      }
    } catch (error) {

      throw error;
    }
  }

  async transferNativeWithoutCommission({
    pinCode,
    recipientAddress,
    amount,
    path,
    slip,
  }: {
    pinCode: string;
    recipientAddress: string;
    amount: string | bigint;
    path: string;
    slip: number;
  }) {
    const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);
    if (!data) throw new Error("Could not get wallet");

    const [chainId, gasPrice, feeData, nonce] = await Promise.all([
      this.web3.eth.getChainId(),
      this.getCurrentGasPrice(),
      this.web3.eth.calculateFeeData(),
      this.web3.eth.getTransactionCount(data.walletAddress, "pending"),
    ]);

    // ⚠️ value PHẢI là Wei string
    const value = typeof amount === "bigint" ? amount.toString() : amount;

    let txRequest: any = {
      from: data.walletAddress,
      to: recipientAddress,
      value, // Wei
      chainId,
      nonce,
      data: "0x",
    };

    // ---- fee ----
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      txRequest.maxFeePerGas = feeData.maxFeePerGas;
      txRequest.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    } else if (feeData.gasPrice) {
      txRequest.gasPrice = feeData.gasPrice;
    } else if (gasPrice) {
      txRequest.gasPrice = gasPrice;
    }

    // ---- gas ----
    const MIN_NATIVE_GAS = 21000;
    const GAS_BUFFER = 1.2;

    let gasLimit: number;

    try {
      const estimatedGas = await this.web3.eth.estimateGas({
        from: data.walletAddress, // ❗ bug 1: bạn dùng senderAddress (không tồn tại)
        to: recipientAddress,
        value, // ❗ bug 2: bạn dùng amountInWei (không tồn tại)
        data: "0x",
      });

      gasLimit = Math.ceil(Number(estimatedGas) * GAS_BUFFER);
    } catch (e) {
      console.warn("estimateGas failed, fallback to MIN_NATIVE_GAS", e);
      gasLimit = MIN_NATIVE_GAS;
    }

    const balance = await this.web3.eth.getBalance(data.walletAddress);

    console.log("balance:", balance);
    console.log("value:", value);

    gasLimit = Math.max(gasLimit, MIN_NATIVE_GAS);

    txRequest.gas = gasLimit;

    const signedTx = await this.web3.eth.accounts.signTransaction(
      txRequest,
      data.privateKey
    );

    if (!signedTx.rawTransaction) {
      throw new Error("Failed to sign transaction");
    }

    return await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  }

  async transferToken({
    commission,
    beneficiaryAddress,
    pinCode,
    recipientAddress,
    smartContract,
    amount,
    tokenContractAddress,
    path,
    slip,
  }: TransferTokenParamsType) {
    try {
      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      if (!data) {
        throw new Error("Could not get wallet");
      }

      const { contractABI } = this.instantiateASmartContract(
        smartContract,
        smartContractABIERC20
      );
      const [chainId, gasPrice, feeData] = await Promise.all([
        this.web3.eth.getChainId(),
        this.getCurrentGasPrice(),
        this.web3.eth.calculateFeeData(),
      ]);

      const isNative =
        !tokenContractAddress ||
        tokenContractAddress === "0x0000000000000000000000000000000000000000";

      let contractTransfer;
      if (isNative) {
        contractTransfer = contractABI.methods.transferNativeToken(
          recipientAddress,
          amount,
          beneficiaryAddress,
          commission
        );
      } else {
        contractTransfer = contractABI.methods.transferToken(
          tokenContractAddress,
          recipientAddress,
          amount,
          beneficiaryAddress,
          commission
        );
      }
      const txData = contractTransfer.encodeABI();

      const totalAmountWei = BigInt(amount) + BigInt(commission);
      const estimateGas = await contractTransfer.estimateGas({
        from: data.walletAddress,
        value: isNative ? totalAmountWei.toString() : undefined,
      });

      let txRequest: Transaction = {
        from: data.walletAddress,
        to: smartContract,
        data: txData,
        gas: estimateGas,
        chainId,
        value: isNative ? totalAmountWei.toString() : undefined,
      };

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        txRequest.maxFeePerGas = feeData.maxFeePerGas;
        txRequest.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      } else if (feeData.gasPrice) {
        txRequest.gasPrice = feeData.gasPrice;
      } else if (gasPrice) {
        txRequest.gasPrice = gasPrice;
      }
      const signedTransferTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        data.privateKey
      );

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedTransferTx.rawTransaction
      );
      return receipt;
    } catch (error) {

      throw error;
    }
  }
  async estimateGasTransferNativeToken({
    sender,
    recipientAddress,
    amount,
  }: {
    sender: string;
    recipientAddress: string;
    amount: bigint;
  }): Promise<bigint> {
    try {
      const [estimateGas, gasPrice] = await Promise.all([
        this.web3.eth.estimateGas({
          from: sender,
          to: recipientAddress,
          value: amount.toString(),
        }),
        this.getCurrentGasPrice(),
      ]);

      return BigInt(estimateGas) * BigInt(gasPrice);
    } catch (error) {
   
      throw error;
    }
  }

  async estimateGasTransferToken({
    smartContract,
    amount,
    beneficiaryAddress,
    commission,
    recipientAddress,
    tokenContractAddress,
    sender,
  }: EstimateGasFeeTransferTokenType) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        smartContract,
        smartContractABIERC20
      );
      const isNative =
        !tokenContractAddress ||
        tokenContractAddress === "0x0000000000000000000000000000000000000000";

      let contractTransfer;
      if (isNative) {
        contractTransfer = contractABI.methods.transferNativeToken(
          recipientAddress,
          amount,
          beneficiaryAddress,
          commission
        );
      } else {
        contractTransfer = contractABI.methods.transferToken(
          tokenContractAddress,
          recipientAddress,
          amount,
          beneficiaryAddress,
          commission
        );
      }

      const totalAmountWei = BigInt(amount) + BigInt(commission);
      const [estimateGas, gasPrice] = await Promise.all([
        await contractTransfer.estimateGas({
          from: sender,
          value: isNative ? totalAmountWei.toString() : undefined,
        }),
        this.getCurrentGasPrice(),
      ]);
      if (!estimateGas || !gasPrice) {
        throw new Error("Couldn't get gas price | estimate gas");
      }
      return estimateGas * gasPrice;
    } catch (error) {
  
      throw error;
    }
  }
  async getOwnerOfNFTERC1155({
    contractAddress,
    nftId,
    walletAddress,
  }: GetOwnerOfNFTERC1155Params): Promise<number | undefined> {
    const contractABIERC1155 = this.instantiateASmartContract(
      contractAddress,
      erc1155
    );
    const balance = await contractABIERC1155.contractABI.methods
      .balanceOf(walletAddress, nftId)
      .call()
      .catch((e) => console.error(e));

    const convertedBalance = balance as unknown as number;
    if (convertedBalance > 0) {
      return Number(convertedBalance);
    }
  }
  async processCheckNFT({
    contractAddress,
    nftId,
    walletAddress,
  }: ImportNFTParams): Promise<checkNFTResponse> {
    const contractABIERC721 = this.instantiateASmartContract(
      contractAddress,
      erc721
    );
    const contractABIERC1155 = this.instantiateASmartContract(
      contractAddress,
      erc1155
    );
    const owner = await contractABIERC721.contractABI.methods
      .ownerOf(nftId)
      .call()
      .catch((e) => console.error(e));
    const convertedOwner = owner as unknown as string;

    if (typeof owner === "undefined") {
      const balance = await contractABIERC1155.contractABI.methods
        .balanceOf(walletAddress, nftId)
        .call()
        .catch((e) => console.error(e));

      const convertedBalance = balance as unknown as number;

      if (convertedBalance > 0) {
        return {
          owner: walletAddress,
          balance: Number(convertedBalance),
          nftType: NFTTokenStandard.ERC1155,
        };
      } else {
        throw new Error(t(LanguageKey.error_you_are_not_owner_of_this_nft));
      }
    } else if (convertedOwner.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error(t(LanguageKey.error_you_are_not_owner_of_this_nft));
    }
    return {
      owner: convertedOwner,
      balance: 1,
      nftType: NFTTokenStandard.ERC721,
    };
  }
  async importNFT({
    contractAddress,
    nftId,
    walletAddress,
  }: ImportNFTParams): Promise<NFTResponse | undefined> {
    try {
      // check valid address
      if (!checkValidAddressEVM(contractAddress)) {
        throw new Error(t(LanguageKey.common_invalid_contract_address));
      }

      // check is ERC-721 or ERC-1155
      const checkNFTResponse = await this.processCheckNFT({
        contractAddress,
        nftId,
        walletAddress,
      });
      if (checkNFTResponse.nftType === NFTTokenStandard.ERC721) {
        const { name, symbol, tokenURI } = await this.getERC721Details({
          contractAddress,
          nftId,
        });
        return {
          name,
          symbol,
          tokenURI,
          owner: walletAddress,
          tokenStandard: NFTTokenStandard.ERC721,
        };
      } else if (checkNFTResponse.nftType === NFTTokenStandard.ERC1155) {
        const data = await this.getERC1155Details({
          contractAddress,
          nftId,
        });
        return {
          tokenURI: data.tokenURI,
          owner: walletAddress,
          name: "",
          symbol: "",
          tokenStandard: NFTTokenStandard.ERC1155,
          quantity: checkNFTResponse.balance,
        };
      }
    } catch (e) {
      throw e;
    }
  }
  async getERC721Details({ contractAddress, nftId }: GetERC721DetailParams) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc721
      );
      const [name, symbol, tokenURI] = await Promise.all([
        contractABI.methods.name().call() as Promise<string>,
        contractABI.methods.symbol().call() as Promise<string>,
        contractABI.methods.tokenURI(nftId).call() as Promise<string>,
      ]);

      return {
        name,
        symbol,
        tokenURI,
      };
    } catch {
      throw new Error(t(LanguageKey.error_nft_import_get_data_error));
    }
  }
  async getERC1155Details({ contractAddress, nftId }: GetERC721DetailParams) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc1155
      );
      const [tokenURI] = await Promise.all([
        contractABI.methods.uri(nftId).call(),
      ]);

      if (typeof tokenURI !== "string") {
        throw new Error("Invalid token URI");
      }
      const convertedURI = tokenURI as string;
      // Convert token ID to hex and pad to 64 characters
      const paddedId = nftId.toString(16).padStart(64, "0");

      // Replace {id} in the URI with the padded hex token ID
      const formattedTokenURI = convertedURI.replace(/{id}/g, paddedId);

      return {
        tokenURI: formattedTokenURI,
      };
    } catch {
      throw new Error(t(LanguageKey.error_nft_import_get_data_error));
    }
  }
  async estimateGasApproveNFT1155({
    contractAddress,
    walletAddress,
  }: ApproveNFT1155Params) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc1155
      );
      const [estimateGas, gasPrice] = await Promise.all([
        contractABI.methods.setApprovalForAll(walletAddress, true).estimateGas({
          from: walletAddress,
        }),
        this.getCurrentGasPrice(),
      ]);
      if (!estimateGas || !gasPrice) {
        throw new Error("Couldn't get gas price | estimate gas");
      }
      const gas = estimateGas * gasPrice;
      return gas;
    } catch (error) {
 
      throw error;
    }
  }
  /**
   * Checks if a smart contract is approved to manage ERC1155 tokens on behalf of an address
   *
   * @param {Object} params - The parameters object
   * @param {string} params.commissionContractAddress - The address of the contract requesting approval (operator)
   * @param {string} params.contractAddress - The address of the ERC1155 contract
   *
   * @returns {Promise<boolean>} Returns true if the operator is approved to manage tokens, false otherwise
   *
   * @throws {Error} Throws and logs an error if the contract interaction fails
   *
   * @example
   * const isApproved = await web3Service.getApproveNFT1155({
   *   commissionContractAddress: "0x123...",
   *   contractAddress: "0x456..."
   * });
   */
  async getApproveNFT1155({
    commissionContractAddress,
    walletAddress,
    contractAddress,
  }: GetApproveNFT1155Params) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc1155
      );
      const approve = await contractABI.methods
        .isApprovedForAll(walletAddress, commissionContractAddress)
        .call();
      return approve;
    } catch (error) {
  
      throw error;
    }
  }

  /**
   * Approves an ERC1155 NFT contract to be operated by a commission contract address.
   * This function enables the commission contract to transfer NFTs on behalf of the owner.
   *
   * @param {Object} params - The parameters object
   * @param {string} params.pinCode - The PIN code for wallet access
   * @param {string} params.path - The derivation path for the wallet
   * @param {number} params.slip - The slip number for wallet derivation
   * @param {string} params.contractAddress - The ERC1155 contract address
   * @param {string} params.commissionContractAddress - The address of the contract that will be approved to operate the NFTs
   *
   * @returns {Promise<boolean>} Returns true if the approval transaction is successful
   *
   * @throws {Error} Throws an error if:
   * - Contract ABI or wallet address cannot be retrieved
   * - Transaction signing fails
   * - Transaction execution fails
   *
   * @example
   * const result = await web3Service.approveNFTERC1155({
   *   pinCode: "1234",
   *   path: "m/44'/60....',
   *   slip: 0,
   *   contractAddress: "0x...",
   *   commissionContractAddress: "0x..."
   * });
   */
  async approveNFTERC1155({
    pinCode,
    path,
    slip,
    contractAddress,
    commissionContractAddress,
  }: ApproveNFT1155ParamsSignTransactionType) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc1155
      );
      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      if (!data || !contractABI.options.address) {
        throw new Error(
          "Could not get address of contract api | wallet not found"
        );
      }
      const txData = await contractABI.methods
        .setApprovalForAll(commissionContractAddress, true)
        ?.encodeABI();

      const [gasLimit, gasPrice, chainId] = await Promise.all([
        this.estimateGasLimit({
          from: data.walletAddress,
          to: contractAddress,
          data: txData,
        }),
        this.getCurrentGasPrice(),
        this.web3.eth.getChainId(),
      ]);

      const txObject: Transaction = {
        to: contractAddress,
        data: txData,
        gasLimit: gasLimit,
        gasPrice,
        chainId,
        nonce: data.nonce,
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(
        txObject,
        data.privateKey
      );

      if (signedTx.rawTransaction) {
        const result = await new Promise((resolve, reject) => {
          this.web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .on("receipt", (receipt) => {
              resolve(true);
            })
            .on("error", (error) => {
              reject(new Error(error + ""));
            });
        });
        return result;
      }
    } catch (error) {
    
      throw error;
    }
  }
  async estimateGasForTransferNFT1155({
    recipientAddress,
    beneficiaryAddress,
    commission,
    commissionContractAddress,
    quantity,
    nftContractAddress,
    nftId,
    decimals,
    sender,
  }: EstimateGasFeeForTransferNFT1155) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        commissionContractAddress,
        smartContractABIERC1155
      );

      const commissionConvert = Utils.convertAmountToWeiFollowDecimals(
        commission,
        decimals
      );
      const [estimateGas, gasPrice] = await Promise.all([
        contractABI.methods
          .transferERC1155(
            recipientAddress,
            nftContractAddress,
            nftId,
            quantity,
            beneficiaryAddress
          )
          .estimateGas({
            from: sender,
            value: commissionConvert + "",
          }),
        this.getCurrentGasPrice(),
      ]);
      if (!estimateGas || !gasPrice) {
        throw new Error("Couldn't get gas price | estimate gas");
      }
      const resultCommissionFee = Utils.convertBigIntFollowDecimals(
        estimateGas * gasPrice,
        decimals
      );
      return resultCommissionFee;
    } catch (error) {
   
      throw error;
    }
  }
  async transferNFTERC1155({
    beneficiaryAddress,
    pinCode,
    commission,
    nftAddress,
    nftId,
    recipient,
    smartContractUseForTransfer,
    callBackWhenSuccessful,
    path,
    slip,
    decimals,
    quantity,
  }: TransferNFTERC1155Type) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        smartContractUseForTransfer,
        smartContractABIERC1155
      );

      const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);

      if (!data || !contractABI.options.address) {
        throw new Error(
          "Could not get address of contract api | wallet not found"
        );
      }

      const commissionAdmin = Utils.convertAmountToWeiFollowDecimals(
        commission,
        decimals
      );

      const transferMethod = contractABI.methods?.transferERC1155(
        recipient,
        nftAddress,
        nftId,
        quantity,
        beneficiaryAddress
      );

      const txData = transferMethod?.encodeABI();

      const [estimatedGas, feeDataTransferTransaction, gasPrice] =
        await Promise.all([
          transferMethod?.estimateGas({
            from: data.walletAddress,
            value: commissionAdmin + "",
          }),
          this.web3.eth.calculateFeeData(),
          this.web3.eth.getGasPrice(),
        ]);

      let txRequest: Transaction = {
        from: data.walletAddress,
        to: smartContractUseForTransfer,
        data: txData,
        gas: estimatedGas,
        value: commissionAdmin,
      };

      if (
        feeDataTransferTransaction.maxFeePerGas &&
        feeDataTransferTransaction.maxPriorityFeePerGas
      ) {
        txRequest.maxFeePerGas = feeDataTransferTransaction.maxFeePerGas;
        txRequest.maxPriorityFeePerGas =
          feeDataTransferTransaction.maxPriorityFeePerGas;
      } else if (feeDataTransferTransaction.gasPrice) {
        txRequest.gasPrice = feeDataTransferTransaction.gasPrice;
      } else if (gasPrice) {
        txRequest.gasPrice = gasPrice;
      }
      const signedApproveTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        data.privateKey
      );

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedApproveTx.rawTransaction
      );
      callBackWhenSuccessful(receipt);
      return receipt;
    } catch (error) {
  
      throw error;
    }
  }
  async estimateGasForNormalNativeTransfer(
    from: string,
    to: string,
    amount: string,
    decimals: number
  ) {
    const tx = {
      from,
      to,
      value: commonUtils.convertAmountToWeiFollowDecimals(amount, decimals),
    };
    const [estimateGas, gasPrice] = await Promise.all([
      this.web3.eth.estimateGas(tx),
      this.getCurrentGasPrice(),
    ]);
    const estimateGasBigInt = BigInt(estimateGas);
    const gasPriceBigInt = BigInt(gasPrice);

    let networkFee = estimateGasBigInt * gasPriceBigInt;

    const increaseFactor = BigInt(100 + _additionalFee);

    networkFee = (networkFee * increaseFactor) / 100n;

    return {
      networkFee: networkFee,
      estimateGas,
      gasPrice,
    };
  }

  async transferNativeTokenNormal(
    pinCode: string,
    path: string,
    slip0044: number,
    to: string,
    amount: string,
    decimals: number,
    from: string
  ) {
    try {
      const key = await this.getPrivateKeyAndNonceAddress(
        pinCode,
        path,
        slip0044
      );

      if (!key) {
        throw new Error("Invalid pinCode");
      }

      const { privateKey, nonce } = key;

      let txRequest: Transaction = {
        from,
        to,
        value: commonUtils.convertAmountToWeiFollowDecimals(amount, decimals),
      };

      const [{ estimateGas }, gasPrice] = await Promise.all([
        this.estimateGasForNormalNativeTransfer(from, to, amount, decimals),
        this.getCurrentGasPrice(),
      ]);

      txRequest.gasPrice = gasPrice;
      txRequest.nonce = nonce;
      txRequest.gas = estimateGas;

      const signedApproveTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        privateKey
      );

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedApproveTx.rawTransaction
      );
      return receipt.transactionHash;
    } catch (error) {
      console.log("🚀 ~ Web3Service ~ error:", error);
    }
  }

  async estimateGasForERC20NormalTransfer(
    contractAddress: string,
    from: string,
    to: string,
    amount: string,
    decimals: number
  ) {
    const { contractABI } = this.instantiateASmartContract(
      contractAddress,
      erc20
    );

    const convertedAmount = commonUtils.convertAmountToWeiFollowDecimals(
      amount,
      decimals
    );
    const [gasLimit, gasPrice] = await Promise.all([
      this.web3.eth.estimateGas({
        from,
        to: contractAddress,
        data: contractABI.methods.transfer(to, convertedAmount).encodeABI(),
      }),
      this.getCurrentGasPrice(),
    ]);

    return {
      networkFee: gasLimit * gasPrice,
      estimateGas: gasLimit,
      gasPrice,
    };
  }
  async transferTokenNormal(
    pinCode: string,
    path: string,
    slip0044: number,
    to: string,
    amount: string,
    from: string,
    contractAddress: string,
    decimals: number
  ) {
    try {
      const { contractABI } = this.instantiateASmartContract(
        contractAddress,
        erc20
      );
      const key = await this.getPrivateKeyAndNonceAddress(
        pinCode,
        path,
        slip0044
      );

      if (!key) {
        throw new Error("Invalid pinCode");
      }

      const { privateKey, nonce } = key;

      const [{ estimateGas }, gasPrice] = await Promise.all([
        this.estimateGasForERC20NormalTransfer(
          contractAddress,
          from,
          to,
          amount,
          decimals
        ),
        this.getCurrentGasPrice(),
      ]);

      const convertedAmount = commonUtils.convertAmountToWeiFollowDecimals(
        amount,
        decimals
      );
      const txRequest: Transaction = {
        from: from,
        to: contractAddress,
        data: contractABI.methods.transfer(to, convertedAmount).encodeABI(),
        gas: estimateGas,
        gasPrice: gasPrice,
        nonce: nonce,
      };

      const signedApproveTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        privateKey
      );

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedApproveTx.rawTransaction
      );
      return receipt;
    } catch (error) {
      console.log("🚀 ~ Web3Service ~ error:", error);
    }
  }

  async signMessage(
    message: string,
    pinCode: string,
    path: string,
    slip: number
  ) {
    const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);
    if (!data) {
      throw new Error("Could not get wallet");
    }
    const privateKey = Buffer.from(data.privateKey, "hex");
    const signedMessage = await this.web3.eth.accounts.sign(
      message,
      privateKey
    );
    return signedMessage.signature;
  }
  async sendTransaction(
    transaction: Transaction,
    pinCode: string,
    path: string,
    slip: number
  ) {
    const data = await this.getPrivateKeyAndNonceAddress(pinCode, path, slip);
    if (!data) {
      throw new Error("Could not get wallet");
    }
    const privateKey = Buffer.from(data.privateKey, "hex");
    try {
      let txRequest: Transaction = {
        ...transaction,
        gas: BigInt(transaction.gas + ""),
        value: BigInt(transaction.value + ""),
        gasPrice: await this.getCurrentGasPrice(),
        // maxFeePerGas:BigInt(transaction.maxFeePerGas+'')
      };
      const signedTx = await this.web3.eth.accounts.signTransaction(
        txRequest,
        privateKey
      );
      const receipt = await this.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error signing or sending transaction:", error);
    }
  }
}
export const checkValidAddressEVM = (address: string) => {
  if (isAddress(address)) {
    return true;
  }
  return false;
};

export default Web3Service;
