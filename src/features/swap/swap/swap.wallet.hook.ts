import { Address } from '@ton/core';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import { NetworkType } from 'src/core/enum/ChangeNow';
import { WalletCoreCoinType } from 'src/core/enum/CoinType';
import VMType from 'src/core/enum/VMType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getAccountId,
    getAllAccount,
    getProtocolDataLists,
} from 'src/core/redux/slice/account.slice';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import BitcoinServices from 'src/core/services/BitcoinServices';
import { IBitcoinDataRes } from 'src/core/services/BitcoinServices/type';
import ChangeNowService from 'src/core/services/ChangeNow';
import { CurrencyChangeNow } from 'src/core/services/ChangeNow/types';
import TonServices from 'src/core/services/TonServices';
import {
    JettonBalanceDataType,
    TonAccountsType,
} from 'src/core/services/TonServices/type';
import JettonTransfer from 'src/core/services/TonTransactions/jettonTransfer';
import TonTransactions from 'src/core/services/TonTransactions/tonTransactions';
import { CreateSwapTransferParamType } from 'src/core/services/TonTransactions/tonTransactions.type';
import TransferUtils from 'src/core/services/TonTransactions/transferUtils';
import TonWallet from 'src/core/services/TonWallet';
import Web3Service from 'src/core/services/Web3';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import { convertChainByProtocol } from 'src/core/utils/evmUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { getNetworkFee } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice';
import {
    getBalanceNativeEVM,
    getBalanceTokensEVM,
    getPriceTokenEVM,
} from 'src/features/home/slice/home.slice';
import { getSlip0044ByNetwork } from '../index.utils';
import {
    BalanceType,
    BitCoinTransactionInformation,
    SwapTypeFrom,
    TonTransactionInformation,
    WalletManagement,
} from './swap.types';

const _extraFee = 1.1;

const useWallet = () => {
    const changeNowService = useMemo(() => new ChangeNowService(), []);
    const { t } = useTranslation();
    const protocolList = useAppSelector(getProtocolDataLists);
    const selectAccountId = useAppSelector(getAccountId);
    const accountLists = useAppSelector(getAllAccount);
    const dispatch = useAppDispatch();

    const tonTransactionInformation = useRef<TonTransactionInformation>({
        accountData: undefined,
        jettonWalletAddress: undefined,
        currentNetworkFee: undefined,
    });

    const bitcoinTransactionInformation = useRef<BitCoinTransactionInformation>(
        {
            feePerKb: undefined,
            itxRefs: undefined,
        },
    );

    const [walletManagement, setWalletManagement] = useState<WalletManagement>({
        fromWallet: null,
        toWallet: null,
    });

    /**
     * Updates the TON transaction information
     * @param {Partial<TonTransactionInformation>} newData - New transaction information to update
     */
    const updateTonTransactionInformation = (
        newData: Partial<TonTransactionInformation>,
    ) => {
        tonTransactionInformation.current = {
            ...tonTransactionInformation.current,
            ...newData,
        };
    };

    /**
     * Updates the current Bitcoin transaction information with the provided new data.
     *
     * @param {Partial<BitCoinTransactionInformation>} newData - An object containing one or more fields to update.
     */
    const updateBitcoinTransactionInformation = (
        newData: Partial<BitCoinTransactionInformation>,
    ) => {
        bitcoinTransactionInformation.current = {
            ...bitcoinTransactionInformation.current,
            ...newData,
        };
    };

    /**
     * Gets the protocol data for a given network
     * @param {string} network - Network identifier
     * @returns {ProtocolDataWithSupportedTokensFormBEType | undefined} Protocol data or undefined if not found
     */
    const getProtocol = useCallback(
        (network: NetworkType) => {
            const slip0044 = getSlip0044ByNetwork(network);

            if (slip0044 === null) {
                return;
            }
            const protocol = protocolList?.find(
                item => item?.slip0044 === slip0044,
            );
            return protocol;
        },
        [protocolList],
    );

    /**
     * Gets the current account information
     * @returns {AddressListItemType | undefined} Current account information or undefined if not found
     */
    const getCurrentAccount = useCallback(() => {
        if (accountLists !== undefined) {
            const accountWallet = [...accountLists].find(
                e => e?.id === selectAccountId,
            );
            return accountWallet;
        }
    }, [accountLists, selectAccountId]);

    /**
     * Retrieves wallet information and protocol data for a given currency.
     *
     * @param {CurrencyChangeNow} currency - The currency object to get wallet data for. The network field is used to determine the protocol.
     * @returns {{ protocol: Protocol; walletInfo: WalletInfo } | undefined} An object containing the matched protocol and wallet info,
     * or `undefined` if no matching protocol, account, or wallet data is found.
     */
    const getListWalletByCurrency = useCallback(
        (currency: CurrencyChangeNow) => {
            const protocol = getProtocol(currency.network as NetworkType);

            if (!protocol) {
                return;
            }
            const currentAccount = getCurrentAccount();

            if (!currentAccount) {
                return;
            }

            const walletInfo = currentAccount.protocolData?.find(
                item => item._id === protocol._id,
            );
            if (!walletInfo) {
                return;
            }
            return { protocol, walletInfo };
        },
        [getCurrentAccount, getProtocol],
    );

    /**
     * Gets wallet information for a specific currency
     * @param {CurrencyChangeNow} currency - Currency information
     * @returns {{ wallet: AddressListItemType, protocol: ProtocolDataWithSupportedTokensFormBEType } | undefined} Wallet and protocol information
     */
    const getWalletInformation = useCallback(
        (currency: CurrencyChangeNow, type: SwapTypeFrom) => {
            const wallet = getListWalletByCurrency(currency);

            if (!wallet) {
                return;
            }

            const { protocol, walletInfo } = wallet;

            let _addressSelectorId: string | null = null;
            const { selectedAddressId, addressList } = walletInfo;
            if (type === SwapTypeFrom.From && walletManagement.fromWallet) {
                _addressSelectorId = walletManagement.fromWallet.id;
            } else if (type === SwapTypeFrom.To && walletManagement.toWallet) {
                _addressSelectorId = walletManagement.toWallet.id;
            }

            const addressWalletInfo = addressList?.find(item => {
                const id = _addressSelectorId ?? selectedAddressId;
                return item.id === id;
            });
            if (!addressWalletInfo) {
                return;
            }

            if (type === SwapTypeFrom.From && !walletManagement.fromWallet) {
                setWalletManagement(prev => ({
                    ...prev,
                    fromWallet: addressWalletInfo,
                }));
            } else if (type === SwapTypeFrom.To) {
                setWalletManagement(prev => ({
                    ...prev,
                    toWallet: addressWalletInfo,
                }));
            }
            return { wallet: addressWalletInfo, protocol };
        },
        [getListWalletByCurrency, walletManagement],
    );
    /**
     * Gets the balance of native EVM tokens
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {string} walletAddress - Wallet address
     * @returns {Promise<BalanceType | undefined>} Balance information
     */
    const getBalanceCoinEVM = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        walletAddress: string,
    ) => {
        const chain = convertChainByProtocol(protocol.slip0044);
        if (!chain) {
            return;
        }
        const balance = await dispatch(
            getBalanceNativeEVM({
                contractAddress: protocol.nativeToken.address,
                walletAddress,
                params: {
                    chain: chain,
                    cursor: null,
                    limit: 2,
                },
            }),
        ).unwrap();
        if (!balance) {
            return;
        }

        return balance;
    };

    /**
     * Gets the balance of TON
     * @param {AddressListItemType} wallet - Wallet information
     * @returns {Promise<string | undefined>} Balance amount
     */
    const getBalanceTon = async (
        wallet: AddressListItemType,
        isTo: boolean,
    ) => {
        const tonService = new TonTransactions();
        const tonWallet = new TonWallet();
        const dummyWallet = await tonWallet.createDummyWallet();
        if (isTo) {
            const tonServices = new TonServices();
            const getAccountRes = await tonServices.getAccounts({
                address: Address.parse(wallet.address),
            });
            if (!getAccountRes?.isSuccess) {
                return;
            }
            const parseAccountData = getAccountRes.data as TonAccountsType;
            return parseAccountData.balance;
        } else {
            const accountResponse = await tonService.estimateMax({
                adminAddress: '',
                privateKey: wallet.privateKey,
                recipientAddress: dummyWallet.wallet.address.toString(),
                publicKey: wallet.publicKey,
                adminPercent: 0,
            });

            if (!accountResponse || accountResponse.maxAmount < 0) {
                return;
            }
            return accountResponse.maxAmount;
        }
    };

    /**
     * Retrieves the Bitcoin balance for a given wallet address.
     *
     * If `isTo` is `true`, it returns the final balance of the address.
     * If `isTo` is `false`, it calculates the maximum amount that can be sent,
     * considering UTXOs and the current network fee.
     *
     * @param {AddressListItemType} wallet - The wallet object containing the Bitcoin address.
     * @param {boolean} isTo - Flag indicating whether the wallet is the recipient (`true`) or sender (`false`).
     * @returns {Promise<number | undefined>} A promise that resolves to the final balance or max sendable amount,
     * or `undefined` if an error occurs or no data is returned.
     */
    const getBalanceBitCoin = async (
        wallet: AddressListItemType,
        isTo: boolean,
    ) => {
        const bitcoinServices = new BitcoinServices();
        const getBitcoinDataRes = await bitcoinServices.getBitcoinData(
            wallet.address,
        );
        if (!getBitcoinDataRes.isSuccess) {
            Utils.showToast({
                msg: t(LanguageKey.common_text_error_title),
                type: AppToastType.error,
            });
            return;
        }

        const data = getBitcoinDataRes.data as IBitcoinDataRes;

        if (isTo) {
            return data.final_balance;
        } else {
            const networkPerKb = await dispatch(getNetworkFee()).unwrap();

            const maxAmount =
                await BitcoinUtils.getMaxBalanceCompareWithUTXOandNetworkFee(
                    getBitcoinDataRes.data?.txrefs ?? [],
                    networkPerKb.high_fee_per_kb,
                );
            updateBitcoinTransactionInformation({
                feePerKb: networkPerKb.high_fee_per_kb,
                itxRefs: getBitcoinDataRes.data?.txrefs,
            });
            return maxAmount;
        }
    };

    /**
     * Processes balance checking for EVM chains
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @returns {Promise<BalanceType>} Balance information
     */
    const processCheckBalanceEVM = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        isTo: boolean,
    ) => {
        if (!protocol.rpcUrl) {
            throw new Error('Failed to get balance');
        }

        const web3Service = new Web3Service({
            urpUrl: protocol.rpcUrl,
        });

        const isRPCWorking = await web3Service.checkRPC();

        if (!isRPCWorking) {
            Utils.showToast({
                msg: t(LanguageKey.web3_rpc_busy),
                type: AppToastType.error,
            });

            return {
                balance: '0',
                decimals: 0,
                balanceFormatted: '0',
                price: 0,
            };
        }

        const balance = await getBalanceCoinEVM(protocol, wallet.address);

        if (!balance) {
            throw new Error('Failed to get balance');
        }

        let estimateGasGlobal = 0;

        if (balance.balance !== '0' && !isTo) {
            const { networkFee } =
                await web3Service.estimateGasForNormalNativeTransfer(
                    wallet.address,
                    wallet.address,
                    balance.balance_formatted,
                    +balance.decimals,
                );
            estimateGasGlobal = Number(networkFee);
        }

        const balanceAfterMinusNetworkFee =
            BigInt(balance.balance) - BigInt(estimateGasGlobal);

        const convertedBalance = Utils.convertBigIntFollowDecimals(
            balanceAfterMinusNetworkFee,
            +balance.decimals,
        );

        const balanceFormatted =
            Utils.formattedBalanceCurrency(+convertedBalance);

        if (balanceAfterMinusNetworkFee <= 0n) {
            return {
                balance: '0',
                decimals: +balance.decimals,
                balanceFormatted: '0',
                price: +balance.usd_price,
            };
        }

        return {
            balance: balanceAfterMinusNetworkFee + '',
            decimals: +balance.decimals,
            balanceFormatted,
            price: +balance.usd_price,
        };
    };

    /**
     * Processes balance checking for TON chain
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @returns {Promise<BalanceType>} Balance information
     */
    const processCheckBalanceTon = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        isTo: boolean,
    ) => {
        const balance = await getBalanceTon(wallet, isTo);

        if (!balance) {
            return {
                balance: '0',
                decimals: 0,
                balanceFormatted: '0',
                price: 0,
            };
        }

        const formatBalance = TonUtils.formatBigNumber(
            balance.toString(),
            protocol.nativeToken.decimal,
        );

        const balanceFormatted = TonUtils.formatTonBalance(formatBalance);
        const price = protocol.price ?? 0;

        return {
            balance: balance + '',
            decimals: protocol.nativeToken.decimal,
            balanceFormatted: balanceFormatted + '',
            price: price,
        };
    };

    /**
     * Processes and returns the Bitcoin balance information for a given wallet and protocol.
     *
     * It checks the raw balance using `getBalanceBitCoin`, then formats and converts it
     * based on the protocol's native token decimals. If the balance is unavailable,
     * it returns a default object with zeroed values.
     *
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - The protocol object containing token and price information.
     * @param {AddressListItemType} wallet - The wallet object containing the Bitcoin address.
     * @param {boolean} isTo - Flag indicating whether the wallet is the recipient (`true`) or sender (`false`).
     * @returns {Promise<{
     *   balance: string,
     *   decimals: number,
     *   balanceFormatted: string,
     *   price: number
     * }>} A promise resolving to an object containing the balance (as string), decimals, formatted balance, and token price.
     */
    const processCheckBalanceBitcoin = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        isTo: boolean,
    ) => {
        const balance = await getBalanceBitCoin(wallet, isTo);

        if (!balance) {
            return {
                balance: '0',
                decimals: 0,
                balanceFormatted: '0',
                price: 0,
            };
        }

        const convertedBalance = Utils.convertBigIntFollowDecimals(
            balance.toString(),
            protocol.nativeToken.decimal,
        );

        const balanceFormatted =
            Utils.formattedBalanceCurrency(+convertedBalance);

        const price = protocol.price ?? 0;

        return {
            balance: balance + '',
            decimals: protocol.nativeToken.decimal,
            balanceFormatted: balanceFormatted + '',
            price: price,
        };
    };

    /**
     * Gets balance for a specific protocol
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @returns {Promise<BalanceType>} Balance information
     */
    const getBalanceCoinByProtocol = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        isTo: boolean = false,
    ): Promise<BalanceType> => {
        if (protocol.VM === VMType.EVM) {
            return processCheckBalanceEVM(protocol, wallet, isTo);
        } else if (protocol.VM === VMType.Ton) {
            return processCheckBalanceTon(protocol, wallet, isTo);
        } else if (protocol.slip0044 === WalletCoreCoinType.bitcoin) {
            return processCheckBalanceBitcoin(protocol, wallet, isTo);
        } else {
            throw new Error('Failed to get balance');
        }
    };

    /**
     * Retrieves the native coin balance for a given wallet and protocol,
     * used when transferring tokens (e.g., to ensure enough balance for gas fees).
     *
     * The function handles different VM types: EVM and Ton.
     * For EVM, it fetches the balance via `getBalanceCoinEVM`.
     * For Ton, it uses `processCheckBalanceTon`.
     *
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - The protocol object containing VM type and native token info.
     * @param {AddressListItemType} wallet - The wallet object containing the address to check the balance for.
     * @returns {Promise<BalanceType>} A promise that resolves to the balance object including raw balance, formatted balance, decimals, and USD price.
     *
     * @throws {Error} If the VM type is unsupported.
     */
    const getBalanceCoinForTransferToken = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
    ): Promise<BalanceType> => {
        let defaultResult: BalanceType = {
            balance: '0',
            balanceFormatted: '0',
            decimals: 0,
            price: 0,
        };
        if (protocol.VM === VMType.EVM) {
            const result = await getBalanceCoinEVM(protocol, wallet.address);
            if (!result) {
                return defaultResult;
            }
            defaultResult.balance = result.balance;
            defaultResult.balanceFormatted = result.balance_formatted;
            defaultResult.decimals = +result.decimals;
            defaultResult.price = result.usd_price;
        } else if (protocol.VM === VMType.Ton) {
            const result = await processCheckBalanceTon(
                protocol,
                wallet,
                false,
            );
            defaultResult.balance = result.balance;
            defaultResult.balanceFormatted = result.balanceFormatted;
            defaultResult.decimals = +result.decimals;
            defaultResult.price = result.price;
        } else {
            throw new Error('Failed to get balance');
        }
        return defaultResult;
    };

    /**
     * Gets balance for EVM tokens
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {string} walletAddress - Wallet address
     * @param {string} contractAddress - Token contract address
     * @returns {Promise<BalanceType | undefined>} Balance information
     */
    const getBalanceTokenEVM = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        walletAddress: string,
        contractAddress: string,
    ) => {
        const chain = convertChainByProtocol(protocol.slip0044);

        if (!chain) {
            return;
        }

        const balance = await dispatch(
            getBalanceTokensEVM({
                params: {
                    chain: chain,
                    limit: 1,
                    tokenAddresses: [contractAddress],
                },
                walletAddress,
            }),
        ).unwrap();

        if (!balance || balance.result.length === 0) {
            let result = {
                balance: '0',
                decimals: 0,
                balanceFormatted: '0',
                price: 0,
            };
            const getPrice = await dispatch(
                getPriceTokenEVM({
                    chain: chain,
                    tokenAddresses: [
                        {
                            token_address: contractAddress,
                        },
                    ],
                }),
            ).unwrap();

            if (!getPrice || getPrice.length === 0) {
                return result;
            }

            result.price = getPrice[0].usdPrice;

            return result;
        }

        return {
            balance: balance.result[0].balance,
            decimals: +balance.result[0].decimals,
            balanceFormatted: balance.result[0].balance_formatted,
            price: balance.result[0].usd_price,
        };
    };

    /**
     * Gets balance for TON Jettons
     * @param {string} walletAddress - Wallet address
     * @param {string} contractAddress - Token contract address
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @returns {Promise<BalanceType | undefined>} Balance information
     */
    const getBalanceJetton = async (
        walletAddress: string,
        contractAddress: string,
        protocol: ProtocolDataWithSupportedTokensFormBEType,
    ): Promise<BalanceType | undefined> => {
        const tonService = new TonServices();

        const balanceJettons = await tonService.getJettons({
            address: walletAddress,
        });
        if (!balanceJettons) {
            return;
        }
        const jettonDataRes = balanceJettons as JettonBalanceDataType;

        const balance = jettonDataRes.balances?.find(
            balance =>
                balance.jetton.address ===
                Address.parse(contractAddress).toRawString(),
        );

        if (!balance) {
            let defaultResult = {
                balance: '0',
                decimals: 0,
                balanceFormatted: '0',
                price: 0,
            };
            const rateJetton = await tonService.getRate({
                address: contractAddress,
            });

            if (!rateJetton) {
                return defaultResult;
            }

            const rate = rateJetton.data.rates?.[contractAddress];
            if (!rate) {
                return defaultResult;
            }
            defaultResult.price = rate.prices.TON * (protocol.price ?? 0);

            return defaultResult;
        }

        const balanceToNumber = TonUtils.formatBigNumber(
            balance.balance,
            +balance.jetton.decimals,
        );
        updateTonTransactionInformation({
            jettonWalletAddress: balance?.wallet_address.address,
        });

        return {
            balance: balance.balance,
            decimals: +balance.jetton.decimals,
            balanceFormatted: balanceToNumber + '',
            price: balance.price.prices.TON * (protocol.price ?? 0),
        };
    };

    /**
     * Gets balance for tokens based on protocol
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {string} walletAddress - Wallet address
     * @param {string} contractAddress - Token contract address
     * @returns {Promise<BalanceType>} Balance information
     */
    const getBalanceTokenByProtocol = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        walletAddress: string,
        contractAddress: string,
    ): Promise<BalanceType> => {
        const defaultData = {
            balance: '0',
            decimals: 0,
            balanceFormatted: '',
            price: 0,
        };

        if (protocol.VM === VMType.EVM) {
            const balance = await getBalanceTokenEVM(
                protocol,
                walletAddress,
                contractAddress,
            );
            if (!balance) {
                return defaultData;
            }
            return balance;
        } else if (protocol.VM === VMType.Ton) {
            const balance = await getBalanceJetton(
                walletAddress,
                contractAddress,
                protocol,
            );
            if (!balance) {
                return defaultData;
            }
            return balance;
        } else {
            throw new Error('Failed to get balance');
        }
    };

    /**
     * Estimates network fee for token transfers
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} contractAddress - Token contract address
     * @param {number} decimalsToken - Token decimals
     * @returns {Promise<bigint>} Estimated network fee
     */
    const handleEstimateNetworkFeeToken = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        contractAddress: string,
        decimalsToken: number,
    ) => {
        if (protocol.VM === VMType.EVM) {
            if (!protocol.rpcUrl || !wallet.path) {
                throw new Error('Failed to get rpcUrl');
            }

            const web3Service = new Web3Service({
                urpUrl: protocol.rpcUrl,
            });

            const { networkFee } =
                await web3Service.estimateGasForERC20NormalTransfer(
                    contractAddress,
                    wallet.address,
                    wallet.address,
                    amount,
                    decimalsToken,
                );
            return networkFee ?? 0n;
        } else if (protocol.VM === VMType.Ton) {
            return await handleEstimateNetworkFeeJetton(
                wallet,
                amount,
                decimalsToken,
            );
        }
        return 0n;
    };

    /**
     * Estimates network fee for TON Jetton transfers
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {number} decimalsToken - Token decimals
     * @returns {Promise<bigint>} Estimated network fee
     */
    const handleEstimateNetworkFeeJetton = async (
        wallet: AddressListItemType,
        amount: string,
        decimalsToken: number,
    ) => {
        const tonServices = new TonServices();
        const jettonTransfer = new JettonTransfer();
        const tonWallet = new TonWallet();

        const dummyWallet = await tonWallet.createDummyWallet();

        const accountResponse = await tonServices.getAccounts({
            address: Address.parse(wallet.address),
        });

        if (
            !accountResponse.data ||
            !tonTransactionInformation.current.jettonWalletAddress
        ) {
            throw new Error('Failed to get account');
        }

        const currentAmount = TonUtils.toBigNumber(amount, decimalsToken);

        let jettonTransferData: CreateSwapTransferParamType = {
            publicKey: wallet.publicKey,
            valueNano: BigInt(currentAmount),
            recipientAddress: dummyWallet.wallet.address.toString(),
            estimateFee: true,
            fromAccountData: accountResponse.data as TonAccountsType,
            jettonAddress:
                tonTransactionInformation.current.jettonWalletAddress,
            secretKey: dummyWallet.key.secretKey,
            networkFee: 0n,
        };

        const transferData =
            await jettonTransfer.createSwapTransfer(jettonTransferData);

        if (!transferData) {
            throw new Error('Failed to get transferData');
        }
        const currentNetworkFee = BigInt(
            Math.ceil(Math.abs(transferData.fee?.event.extra ?? 0) * _extraFee),
        );

        updateTonTransactionInformation({
            currentNetworkFee: currentNetworkFee.toString(),
        });

        return currentNetworkFee;
    };

    /**
     * Processes network fee estimation for TON transfers
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {number} decimals - Token decimals
     * @returns {Promise<bigint>} Estimated network fee
     */
    const processEstimateNetworkFeeTon = async (
        wallet: AddressListItemType,
        amount: string,
        decimals: number,
    ) => {
        const tonServices = new TonServices();

        const accountResponse = await tonServices.getAccounts({
            address: Address.parse(wallet.address),
        });

        if (!accountResponse.data) {
            throw new Error('Failed to get account');
        }

        const convertAmountToBigInt = TonUtils.toBigNumber(amount, decimals);

        const tonTransaction = new TonTransactions();
        const tonWallet = new TonWallet();
        const dummyWallet = await tonWallet.createDummyWallet();

        const transferData = await tonTransaction.createTransferForSwap({
            privateKey: wallet.privateKey,
            recipientAddress: dummyWallet.wallet.address.toString(),
            publicKey: wallet.publicKey,
            valueNano: convertAmountToBigInt,
            accountData: accountResponse.data as TonAccountsType,
            estimateFee: true,
        });
        if (!transferData) {
            throw new Error('Failed to get transferData');
        }

        updateTonTransactionInformation({
            accountData: accountResponse.data as TonAccountsType,
        });

        return BigInt(transferData.fee ?? 0n);
    };

    /**
     * Processes network fee estimation for EVM native transfers
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {number} decimals - Token decimals
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @returns {Promise<bigint>} Estimated network fee
     */
    const processEstimateNetworkFeeNativeEVM = async (
        wallet: AddressListItemType,
        amount: string,
        decimals: number,
        protocol: ProtocolDataWithSupportedTokensFormBEType,
    ) => {
        if (!protocol.rpcUrl) {
            throw new Error('Failed to get rpcUrl');
        }

        const web3Service = new Web3Service({
            urpUrl: protocol.rpcUrl,
        });

        const { networkFee } =
            await web3Service.estimateGasForNormalNativeTransfer(
                wallet.address,
                wallet.address,
                amount,
                decimals,
            );

        return networkFee ?? 0n;
    };

    /**
     * Estimates the Bitcoin network fee for a transaction based on current UTXOs, fee rate, and amount.
     *
     * This function simulates a transaction without broadcasting it, using the stored transaction data
     * (`itxRefs` and `feePerKb`) along with the destination address and amount.
     *
     * @param {AddressListItemType} wallet - The recipient wallet containing the Bitcoin address.
     * @param {string} amount - The amount to send, in BTC (as a string).
     * @returns {Promise<bigint>} A promise resolving to the estimated network fee in satoshis as a `bigint`.
     *
     * @throws {Error} If required data (account, UTXOs, fee rate) is missing.
     */
    const processEstimateNetworkFeeBitcoin = async (
        wallet: AddressListItemType,
        amount: string,
    ) => {
        const currentAccount = getCurrentAccount();

        if (!currentAccount) {
            throw new Error('Failed to get currentAccount');
        }

        const fakeTransactionInformation =
            await BitcoinUtils.createBitcoinTransactionNoAdmin({
                amountSend: parseFloat(
                    BitcoinUtils.getSatoshiFromBitcoin(amount).toString(),
                ),
                bitcoinUTXO:
                    bitcoinTransactionInformation.current.itxRefs ?? [],
                feePerKb: bitcoinTransactionInformation.current.feePerKb,
                mnemonic: currentAccount?.mnemonic,
                toAddress: wallet.address,
            });
        return BigInt(fakeTransactionInformation?.fee ?? 0);
    };

    /**
     * Handles network fee estimation for native token transfers
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {number} decimals - Token decimals
     * @returns {Promise<bigint>} Estimated network fee
     */
    const handleEstimateNetworkFeeNative = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        decimals: number,
    ): Promise<bigint> => {
        if (protocol.VM === VMType.EVM) {
            return await processEstimateNetworkFeeNativeEVM(
                wallet,
                amount,
                decimals,
                protocol,
            );
        } else if (protocol.VM === VMType.Ton) {
            return await processEstimateNetworkFeeTon(wallet, amount, decimals);
        } else if (protocol.slip0044 === WalletCoreCoinType.bitcoin) {
            return await processEstimateNetworkFeeBitcoin(wallet, amount);
        }
        return 0n;
    };

    /**
     * Processes TON token transfers
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} to - Recipient address
     * @returns {Promise<any>} Transfer result
     */
    const processTransferTon = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        to: string,
    ) => {
        const tonTransaction = new TonTransactions();
        const tonServices = new TonServices();

        const convertAmountToBigInt = TonUtils.toBigNumber(
            amount,
            protocol.nativeToken.decimal,
        );

        const transferData = await tonTransaction.createTransferForSwap({
            valueNano: convertAmountToBigInt,
            recipientAddress: to,
            privateKey: wallet.privateKey,
            estimateFee: false,
            publicKey: wallet.publicKey,
            accountData: tonTransactionInformation.current.accountData,
        });
        if (transferData?.transferData?.messageBOCString) {
            const sendMessageToBlockchainRes =
                await tonServices.sendMessageToBlockchain({
                    boc: transferData?.transferData?.messageBOCString,
                });

            return sendMessageToBlockchainRes.isSuccess;
        }
        return false;
    };

    /**
     * Processes native token transfers for EVM chains
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} to - Recipient address
     * @param {string} pinCode - PIN code for transaction
     * @returns {Promise<any>} Transfer result
     */
    const processTransferNativeToken = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        to: string,
        pinCode: string,
    ) => {
        if (!protocol.rpcUrl || !wallet.path) {
            throw new Error('Failed to get rpcUrl');
        }

        const web3Service = new Web3Service({
            urpUrl: protocol.rpcUrl,
        });

        await web3Service.transferNativeTokenNormal(
            pinCode,
            wallet.path,
            protocol.slip0044,
            to,
            amount,
            protocol.nativeToken.decimal,
            wallet.address,
        );
        return true;
    };

    /**
     * Processes and sends a Bitcoin transaction to a specified address.
     *
     * This function builds a raw Bitcoin transaction using the stored UTXOs,
     * fee per kilobyte, and user's mnemonic, then pushes it to the Bitcoin network.
     *
     * @param {string} amount - The amount to send, in BTC (as a string).
     * @param {string} toAddress - The destination Bitcoin address.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the transaction was successfully broadcasted,
     * or `false` otherwise.
     *
     * @throws {Error} If required transaction data (account, UTXOs, fee) is missing,
     * or if the transaction cannot be created.
     */
    const processTransferBitcoin = async (
        amount: string,
        toAddress: string,
    ) => {
        const currentAccount = getCurrentAccount();
        const bitcoinServices = new BitcoinServices();

        if (!currentAccount) {
            throw new Error('Failed to get data for transaction');
        }

        const transactionInformation =
            await BitcoinUtils.createBitcoinTransactionNoAdmin({
                amountSend: parseFloat(
                    BitcoinUtils.getSatoshiFromBitcoin(amount).toString(),
                ),
                bitcoinUTXO:
                    bitcoinTransactionInformation.current.itxRefs ?? [],
                feePerKb: bitcoinTransactionInformation.current.feePerKb,
                mnemonic: currentAccount?.mnemonic,
                toAddress: toAddress,
            });

        if (!transactionInformation) {
            throw new Error('Can not create transactionInformation');
        }

        const pushBitcoinTransactionActionRes =
            await bitcoinServices.pushBitcoinTransactionAction(
                transactionInformation?.base64EncodedTransaction,
            );

        return pushBitcoinTransactionActionRes.isSuccess;
    };

    /**
     * Handles native token transfers
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} to - Recipient address
     * @param {string} pinCode - PIN code for transaction
     * @returns {Promise<boolean>} Transfer result
     */
    const handleNativeTransfer = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        to: string,
        pinCode: string,
    ): Promise<boolean> => {
        if (protocol.VM === VMType.EVM) {
            return processTransferNativeToken(
                protocol,
                wallet,
                amount,
                to,
                pinCode,
            );
        } else if (protocol.VM === VMType.Ton) {
            return processTransferTon(protocol, wallet, amount, to);
        } else if (protocol.slip0044 === WalletCoreCoinType.bitcoin) {
            return processTransferBitcoin(amount, to);
        } else {
            throw new Error('Failed to get VMType or slip0044');
        }
    };

    /**
     * Processes token transfers for EVM chains
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} to - Recipient address
     * @param {string} contractAddress - Token contract address
     * @param {number} decimals - Token decimals
     * @param {string} pinCode - PIN code for transaction
     * @returns {Promise<boolean>} Transfer result
     */
    const processTransferTokenEVM = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        to: string,
        contractAddress: string,
        decimals: number,
        pinCode: string,
    ): Promise<boolean> => {
        if (!protocol.rpcUrl || !wallet.path) {
            throw new Error('Failed to get rpcUrl');
        }

        const web3Service = new Web3Service({
            urpUrl: protocol.rpcUrl,
        });

        await web3Service.transferTokenNormal(
            pinCode,
            wallet.path,
            protocol.slip0044,
            to,
            amount,
            wallet.address,
            contractAddress,
            decimals,
        );
        return true;
    };

    /**
     * Handles token transfers
     * @param {ProtocolDataWithSupportedTokensFormBEType} protocol - Protocol information
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {string} to - Recipient address
     * @param {string} contractAddress - Token contract address
     * @param {number} decimals - Token decimals
     * @param {string} pinCode - PIN code for transaction
     * @returns {Promise<boolean>} Transfer result
     */
    const handleTokenTransfer = async (
        protocol: ProtocolDataWithSupportedTokensFormBEType,
        wallet: AddressListItemType,
        amount: string,
        to: string,
        contractAddress: string,
        decimals: number,
        pinCode: string,
    ): Promise<boolean> => {
        if (protocol.VM === VMType.EVM) {
            return await processTransferTokenEVM(
                protocol,
                wallet,
                amount,
                to,
                contractAddress,
                decimals,
                pinCode,
            );
        } else if (protocol.VM === VMType.Ton) {
            return await handleJettonTransfer(wallet, amount, decimals, to);
        } else {
            throw new Error('Failed to get VMType');
        }
    };

    /**
     * Handles TON Jetton transfers
     * @param {AddressListItemType} wallet - Wallet information
     * @param {string} amount - Transfer amount
     * @param {number} decimals - Token decimals
     * @param {string} to - Recipient address
     * @returns {Promise<boolean>} Transfer result
     */
    const handleJettonTransfer = async (
        wallet: AddressListItemType,
        amount: string,
        decimals: number,
        to: string,
    ): Promise<boolean> => {
        const jettonTransfer = new JettonTransfer();
        const tonServices = new TonServices();

        const secretKey = TransferUtils.getSecretKey({
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
        });

        if (
            !secretKey ||
            !tonTransactionInformation.current.jettonWalletAddress ||
            !tonTransactionInformation.current.currentNetworkFee
        ) {
            throw new Error('Failed to get secretKey or jettonWalletAddress');
        }

        const currentAmount = TonUtils.toBigNumber(amount, decimals);

        const jettonTransferData: CreateSwapTransferParamType = {
            publicKey: wallet.publicKey,
            valueNano: BigInt(currentAmount),
            recipientAddress: to,
            estimateFee: false,
            fromAccountData: tonTransactionInformation.current.accountData,
            jettonAddress:
                tonTransactionInformation.current.jettonWalletAddress,
            secretKey: secretKey,
            networkFee: BigInt(
                tonTransactionInformation.current.currentNetworkFee,
            ),
        };
        const transferData =
            await jettonTransfer.createSwapTransfer(jettonTransferData);

        if (transferData?.transferData?.messageBOCString) {
            const sendMessageToBlockchainRes =
                await tonServices.sendMessageToBlockchain({
                    boc: transferData?.transferData?.messageBOCString,
                });
            return sendMessageToBlockchainRes.isSuccess;
        }
        return false;
    };

    /**
     * Gets balance for a specific currency
     * @param {CurrencyChangeNow} currency - Currency information
     * @returns {Promise<BalanceType>} Balance information
     */
    const getBalance = (
        currency: CurrencyChangeNow,
        type: SwapTypeFrom,
        isTo: boolean,
    ) => {
        const walletInfo = getWalletInformation(currency, type);
        if (!walletInfo) {
            throw new Error('Failed to get walletInfo');
        }
        const { wallet, protocol } = walletInfo;

        //is token
        if (currency.tokenContract) {
            const balanceTokenByProtocol = getBalanceTokenByProtocol(
                protocol,
                wallet.address,
                currency.tokenContract,
            );
            return balanceTokenByProtocol;
        }
        //is coin
        else {
            const balanceCoinByProtocol = getBalanceCoinByProtocol(
                protocol,
                wallet,
                isTo,
            );
            return balanceCoinByProtocol;
        }
    };

    /**
     * Executes a transfer between currencies
     * @param {CurrencyChangeNow} from - Source currency
     * @param {CurrencyChangeNow} to - Destination currency
     * @param {string} amount - Transfer amount
     * @param {number} decimals - Token decimals
     * @param {string} pinCode - PIN code for transaction
     * @returns {Promise<boolean>} Transfer result
     */
    const transfer = async (
        from: CurrencyChangeNow,
        to: CurrencyChangeNow,
        amount: string,
        decimals: number,
        pinCode: string,
    ): Promise<boolean> => {
        const walletInfoFrom = getWalletInformation(from, SwapTypeFrom.From);
        const walletInfoTo = getWalletInformation(to, SwapTypeFrom.To);

        if (!walletInfoFrom || !walletInfoTo) {
            throw new Error('Failed to get walletInfo');
        }
        const { wallet: walletFrom, protocol: protocolFrom } = walletInfoFrom;
        const { wallet: walletTo } = walletInfoTo;

        const transactionInformation = await changeNowService.createTransaction(
            {
                fromAmount: amount,
                fromCurrency: from.ticker,
                fromNetwork: from.network,
                toCurrency: to.ticker,
                toNetwork: to.network,
                address: walletTo.address,
                userId: walletFrom.address,
            },
        );
        if (from.tokenContract) {
            const transactionData = await handleTokenTransfer(
                protocolFrom,
                walletFrom,
                amount,
                transactionInformation.payinAddress,
                from.tokenContract,
                decimals,
                pinCode,
            );
            return transactionData;
        }
        //is coin
        else {
            const transactionData = await handleNativeTransfer(
                protocolFrom,
                walletFrom,
                amount,
                transactionInformation.payinAddress,
                pinCode,
            );
            return transactionData;
        }
    };

    /**
     * Estimates network fee for a transfer
     * @param {CurrencyChangeNow} from - Source currency
     * @param {string} amount - Transfer amount
     * @param {number} decimalsNative - Native token decimals
     * @param {number} decimalsToken - Token decimals
     * @returns {Promise<number>} Estimated network fee
     */
    const estimateNetworkFee = async (
        from: CurrencyChangeNow,
        amount: string,
        decimalsNative: number,
        decimalsToken: number,
    ) => {
        const walletInfo = getWalletInformation(from, SwapTypeFrom.From);
        if (!walletInfo) {
            throw new Error('Failed to get walletInfo');
        }
        const { protocol } = walletInfo;
        let networkFeeReturn: bigint = 0n;

        if (from.tokenContract) {
            networkFeeReturn = await handleEstimateNetworkFeeToken(
                protocol,
                walletInfo.wallet,
                amount,
                from.tokenContract,
                decimalsToken,
            );
        } else {
            networkFeeReturn = await handleEstimateNetworkFeeNative(
                protocol,
                walletInfo.wallet,
                amount,
                decimalsNative,
            );
        }

        if (networkFeeReturn === 0n) {
            return 0n;
        }

        return Utils.convertBigIntFollowDecimals(
            networkFeeReturn,
            decimalsNative,
        );
    };

    return {
        getBalance,
        transfer,
        estimateNetworkFee,
        getListWalletByCurrency,
        walletManagement,
        setWalletManagement,
        getBalanceCoinByProtocol,
        getBalanceCoinForTransferToken,
    };
};
export default useWallet;
