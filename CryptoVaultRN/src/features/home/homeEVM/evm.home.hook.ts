import { StackActions } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import AppToastType from "src/core/enum/AppToastType";
import Slip0044 from "src/core/enum/Slip0044";
import ThemeKey from "src/core/enum/ThemeKey";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useAccountProtocolSelected,
  useCurrencyRateConversion,
  useCurrentWallet,
  useProtocolSelected,
  useSelectedCurrencySetting,
} from "src/core/redux/slice/account.selector";
import {
  changWallet,
  editWallet,
  getAccountId,
  getProtocolDataLists,
  removeWallet,
  setSelectedProtocol,
} from "src/core/redux/slice/account.slice";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import {
  getHeightBottomTab,
  getThemeMode,
  getUpdateBalance,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import {
  deleteEVMCollectionByWallet,
  migrateNFTCollection,
} from "src/core/redux/slice/NFT/NFTImport.slice";
import { checkValidAddressEVM } from "src/core/services/Web3";
import Utils from "src/core/utils/commonUtils";
import {
  getBalanceNativeEVM,
  getBalanceTokensEVM,
} from "src/features/home/slice/home.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ReceiveParamListType } from "src/navigation/stacks/type/ReceiveParamListType";

import { appImages } from "src/core/constants/AppImages";
import {
  deleteTokensByWallet,
  filterTokenAvailable,
  updateBalanceTokens,
  updateNativeBalance,
} from "src/core/redux/slice/customToken/addCustomToken.slice";
import { SupportTokenDataType } from "src/core/redux/slice/customToken/addCustomToken.type";
import { TokenBalance } from "src/core/services/Moralis/type";
import { convertChainByProtocol } from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { MenuActionType } from "../components/WalletBottomSheet/WalletBottomSheet.type";
import { ListCryptoDataType, TokensObject } from "../home.type";
import { fetchEvmBalances } from "src/core/worker/evmBalance";

const batchSize = 40;
const updateInterval = 1000;

const useEVMHome = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currencyRateConversion = useCurrencyRateConversion();
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const buttonRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});
  const protocolDataLists = useAppSelector(getProtocolDataLists);
  const accountProtocolSelected = useAccountProtocolSelected();
  const selectedAccountId = useAppSelector(getAccountId);
  const updateBalanceState = useAppSelector(getUpdateBalance);
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;

  const wallet = useCurrentWallet();
  const protocolBaseData = useProtocolSelected();

  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;

  const listToken = useAppSelector(filterTokenAvailable);
  const appConfig = useAppSelector((state) => state.appConfig);
  const queueRef = useRef<SupportTokenDataType>([]);

  const isProcessingRef = useRef(false);
  const [isAddView, setIsAddView] = useState(false);
  const [isFirstInitial, setIsFirstInitial] = useState<boolean>(true);
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [isFirstInitGenerateData, setIsFirstInitGenerateData] =
    useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] =
    useState<AddressListItemType | null>(null);
  const [walletBalanceCurrency, setWalletBalanceCurrency] = useState<number>(0);
  const [listCryptoData, setListCryptoData] = useState<ListCryptoDataType[]>(
    []
  );
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [menuActionType, setMenuActionType] = useState<MenuActionType | null>(
    null
  );
  const showMenuWallet = selectedWallet !== null;
  const [showBottomSheetModal, setShowBottomSheetModal] = useState(false);

  const showSkeletonLoading = () => setIsFirstInitial(true);
  const hideSkeletonLoading = () => setIsFirstInitial(false);

  const onChangeMenuActionType = (type: MenuActionType) => {
    setMenuActionType(type);
  };
  const onCloseMenuWallet = () => {
    setSelectedWallet(null);
    setMenuActionType(null);
  };
  const showBottomSheetModalAction = () => {
    setShowBottomSheetModal(true);
  };
  const closeShowBottomSheetModal = () => {
    setShowBottomSheetModal(false);
  };

  const createCryptoData = async () => {
    try {
      await handleGenerateListToken();
    }
    catch (e) {
      console.log(e);
    }
    finally {
      hideSkeletonLoading();
    }
  };

  const handleMigrateNFT = () => {
    if (
      wallet?.address &&
      selectedAccountId &&
      typeof protocolBaseData?.chainId === "number"
    ) {
      dispatch(
        migrateNFTCollection({
          accountId: selectedAccountId,
          walletAddress: wallet?.address,
          chainId: protocolBaseData?.chainId,
          idCollection: `${wallet?.address}_${protocolBaseData?.slip0044}`,
        })
      );
    }
  };

  const handleInitData = async () => {
    handleMigrateNFT();
    await createCryptoData();

  };

  const handleHomeRefresh = useCallback(async () => {
    if (!refreshingHome) {
      try {
        setRefreshingHome(true);
        await createCryptoData();
        fetchNativeBalanceOnce();
        setRefreshingHome(false);
      } catch (error) {
        console.error("handleHomeRefresh Error:", error);
        setRefreshingHome(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountProtocolSelected, listToken]);

  const goToSendScreen = () => {
    navigation.navigate(HomeStackScreenKey.Transfer);
  };
  const goToMangeCryptoScreen = () => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.ManageCrypto));
  };

  const goToReceive = () => {
    const symbol = protocolBaseData?.symbol;
    const address = selectedAddress?.address;
    if (symbol != null && address != null) {
      const receiveProp: ReceiveParamListType = {
        currency: symbol,
        address: address,
      };
      navigation.dispatch(
        StackActions.push(HomeStackScreenKey.Receive, receiveProp)
      );
    } else {
      Utils.showToast({
        msg: t(LanguageKey.send_push_error_title),
        type: AppToastType.error,
        contentOffSet: contentOffsetToast,
      });
    }
  };

  const handlePressWallet = (data: AddressListItemType) => {
    closeShowBottomSheetModal();
    setTimeout(() => {
      dispatch(changWallet(data.id));
      Utils.showToast({
        msg: t(LanguageKey.common_switch_to_name_successfully, {
          name: data.name,
        }),
        type: AppToastType.success,
        contentOffSet: contentOffsetToast,
      });
    }, 700);
  };

  const onShowMenuWallet = (wallet: AddressListItemType, index: number) => {
    const buttonRef = buttonRefs.current[index.toString()];
    if (buttonRef) {
      buttonRef.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setMenuPosition({ x: pageX + width, y: pageY });
          setSelectedWallet(wallet);
          setNewWalletAddress(wallet.name);
        }
      );
    }
  };

  const onSwipeEdit = (wallet: AddressListItemType) => {
    setSelectedWallet(wallet);
    setNewWalletAddress(wallet.name);
    setMenuActionType(MenuActionType.edit);
  };

  const onSwipeRemove = (wallet: AddressListItemType) => {
    setSelectedWallet(wallet);
    setMenuActionType(MenuActionType.remove);
  };

  const removeWalletAction = async () => {
    if (!selectedWallet) return;
    if (!selectedAccountId) return;

    dispatch(
      deleteEVMCollectionByWallet({
        accountId: selectedAccountId,
        walletAddress: `${selectedWallet.address}_${protocolBaseData?.slip0044}`,
      })
    );
    dispatch(
      deleteTokensByWallet(
        `${selectedWallet.address}_${protocolBaseData?.slip0044}`
      )
    );
    await dispatch(removeWallet(selectedWallet));
    onCloseMenuWallet();
  };
  const editWalletAction = async () => {
    if (newWalletAddress !== selectedWallet?.name && selectedWallet) {
      const newWalletData: AddressListItemType = {
        ...selectedWallet,
        name: newWalletAddress,
      };
      await dispatch(editWallet(newWalletData));
    }
    onCloseMenuWallet();
  };

  const fetchNativeBalanceOnce = async () => {
    // Get RPC URL from Config or Protocol Data
    const rpcUrlFromConfig = appConfig.rpcUrls?.[protocolBaseData?.chainId?.toString() || ""];
    const rpcUrl = rpcUrlFromConfig || protocolBaseData?.rpcUrl;

    if (!wallet?.address || !rpcUrl) return;

    const balances = await fetchEvmBalances({
      rpcUrl: rpcUrl,
      walletAddress: wallet.address,
      tokens: [],
    });

    if (balances.native && protocolBaseData?._id && protocolBaseData?.slip0044 !== undefined) {
      dispatch(
        updateNativeBalance({
          walletAddress: wallet.address,
          protocolData: {
            _id: protocolBaseData._id,
            slip0044: protocolBaseData.slip0044,
          },
          balance: balances.native.balance,
          usd_price: balances.native.usd_price,
        })
      );
    }
  };

  const handleGenerateListToken = useCallback(async () => {
    try {
      // Filter out disabled tokens from remote config
      const listCustomCryptoConverted = listToken
        .filter((tok) => {
          const config = appConfig.tokens.find(t => t.symbol.toLowerCase() === tok.symbol.toLowerCase());
          return config ? config.enabled : true; // Default enable if not in config
        })
        .map((item) => {
          const id = Utils.generateUniqueId();
          const data: ListCryptoDataType = {
            id,
            name: item?.name,
            symbol: item?.symbol,
            logo: item?.logo,
            balance: item?.balance ?? 0,
            isNative: item.isNativeToken,
            contractAddress: item?.contractAddress,
            decimal: item.decimal,
            baseData: protocolBaseData,
            rateCurrency: item.balanceCurrency ?? 0,
          };
          return data;
        });
      setListCryptoData((prev) => {
        if (Utils.deepEqual(prev, listCustomCryptoConverted)) {
          return prev;
        }
        return listCustomCryptoConverted;
      });

      if (listToken.length === 0) {
        setIsFirstInitGenerateData(true);
      } else {
        fetchNativeBalanceOnce();
        hideSkeletonLoading();
        await processUpdateToken();
      }
    } catch (error) {
      console.error("handleGenerateListToken Error:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listToken.length, protocolBaseData?.rpcUrl, wallet?.address]);

  const processUpdateToken = async () => {
    queueRef.current = [...listToken];
    setTimeout(async () => {
      await processQueue();
    }, 500);
  };

  const onPressTokenDetailEVM = (token: ListCryptoDataType) => {
    navigation.dispatch(
      StackActions.push(HomeStackScreenKey.TokenDetailEVM, token)
    );
  };

  const updateTokenBalance = useCallback(
    async (tokensAddress: string[]) => {
      if (!wallet?.address || !protocolBaseData) {
        return;
      }
      const walletAddress = wallet.address;
      const getChain = convertChainByProtocol(protocolBaseData.slip0044);

      if (!getChain) {
        return;
      }

      const hasNative = tokensAddress.includes(
        protocolBaseData.nativeToken.address
      );

      const [getTokensBalanceResponse, nativeBalance] = await Promise.all([
        dispatch(
          getBalanceTokensEVM({
            walletAddress: walletAddress,
            params: {
              chain: getChain,
              cursor: null,
              limit: batchSize,
              tokenAddresses: tokensAddress,
            },
          })
        ).unwrap(),
        hasNative
          ? dispatch(
            getBalanceNativeEVM({
              walletAddress: walletAddress,
              params: {
                chain: getChain,
                cursor: null,
                limit: 2,
              },
              contractAddress: protocolBaseData.nativeToken.address,
            })
          ).unwrap()
          : Promise.resolve(null),
      ]);

      const listToken = getTokensBalanceResponse?.result;

      if (!listToken) {
        return;
      }
      const result: TokensObject = listToken.reduce(
        (acc: TokensObject, token: TokenBalance) => {
          acc[token.token_address] = token;
          return acc;
        },
        {}
      );

      if (nativeBalance && hasNative) {
        result[protocolBaseData.nativeToken.address] = {
          ...nativeBalance,
          token_address: protocolBaseData.nativeToken.address,
          symbol: protocolBaseData.nativeToken.symbol,
          name: protocolBaseData.nativeToken.name,
          decimals: protocolBaseData.nativeToken.decimal.toString(),
          logo: "",
          thumbnail: "",
          possible_spam: "false",
          verified_contract: true,
          native_token: true,
          usd_price: protocolBaseData?.price || 0,
        } as TokenBalance;
      }

      dispatch(
        updateBalanceTokens({
          walletAddress: wallet.address,
          protocolData: protocolBaseData,
          tokens: result,
        })
      );
      setListCryptoData((prevTokens) =>
        prevTokens.map((token) => {
          const contractAddress = token?.contractAddress?.toLowerCase() || "";
          const matchToken = result[contractAddress];
          let updatedToken = { ...token };

          if (matchToken) {
            updatedToken.balance = +matchToken.balance;
            updatedToken.rateCurrency = matchToken.usd_price;
          }

          return updatedToken;
        })
      );

      hideSkeletonLoading();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet?.address, protocolBaseData?.rpcUrl, listToken.length]
  );
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const batch = queueRef.current.splice(0, batchSize);
    const tokensAddress: string[] = [];

    batch.forEach((token) => {
      if (token.contractAddress) {
        tokensAddress.push(token.contractAddress);
      }
    });

    try {
      await updateTokenBalance(tokensAddress);
    } catch (error) {
      console.error("processQueue Error:", error);
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
        contentOffSet: contentOffsetToast,
      });
    } finally {
      if (queueRef.current.length > 0) {
        setTimeout(() => {
          isProcessingRef.current = false;
          processQueue();
        }, updateInterval);
      } else {
        isProcessingRef.current = false;
      }
      hideSkeletonLoading();
    }
  }, [t, updateTokenBalance, contentOffsetToast]);

  const getTotalBalanceToCurrency = (
    listToken: ListCryptoDataType[]
  ): number => {
    return listToken.reduce((total, item) => {
      const balance = item?.balance?.toString() || "";
      if (!item.decimal || !balance || !item?.rateCurrency) {
        return total + 0;
      }
      const convertBalance = Utils.convertBigIntFollowDecimals(
        balance,
        item.decimal
      );
      const formattedBalance = Utils.formattedBalanceCurrency(+convertBalance);
      const coinAmount =
        selectedCurrencySetting.rate *
        item.rateCurrency *
        currencyRateConversion;

      const cutCoinAmount = Utils.truncateToNumberDecimals(coinAmount, 2);

      const parsedBalance = parseFloat(formattedBalance.replace(/,/g, ""));
      const currency = cutCoinAmount * parsedBalance;
      const cutCurrency = Utils.truncateToNumberDecimals(currency, 2);

      return total + cutCurrency;
    }, 0);
  };

  const handleChangeProtocol = async () => {
    showSkeletonLoading();
    await createCryptoData();
  };

  const updateBalance = async () => {
    await createCryptoData();
    dispatch(setUpdateBalance(false));
  };
  useEffect(() => {
    handleInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const balance = getTotalBalanceToCurrency(listCryptoData);
    setWalletBalanceCurrency(balance);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listCryptoData, selectedCurrencySetting.rate]);

  useEffect(() => {
    if (!isFirstInitial) {
      handleChangeProtocol();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountProtocolSelected?._id,
    protocolBaseData?._id,
    listToken.length,
    wallet?.address,
  ]);

  useEffect(() => {
    if (
      listToken.length > 0 &&
      isFirstInitGenerateData &&
      wallet?.address
    ) {
      const isEVMAddress = checkValidAddressEVM(wallet?.address);
      if (isEVMAddress) {
        handleGenerateListToken();
        setIsFirstInitGenerateData(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    listToken.length,
    listCryptoData.length,
    protocolBaseData?.rpcUrl,
    isFirstInitGenerateData,
    wallet?.address,
  ]);
  useEffect(() => {
    if (!protocolBaseData && protocolDataLists && protocolDataLists.length > 0) {
      const polProtocolData = protocolDataLists.find(
        (e) => e.slip0044 === Slip0044.Polygon
      );
      const targetProtocol = polProtocolData || protocolDataLists[0];
      if (targetProtocol?._id) {
        dispatch(setSelectedProtocol(targetProtocol._id));
      }
    }
  }, [protocolBaseData, protocolDataLists, dispatch]);

  useEffect(() => {
    if (!isFirstInitial) {
      handleMigrateNFT();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  useEffect(() => {
    if (!listCryptoData.length || !listToken.length) return;

    const nativeBalance = listToken.find((item) => item.isNativeToken === true);

    if (!nativeBalance) return;

    setListCryptoData((prev) =>
      prev.map((token) => {
        if (!token.isNative) return token;

        return {
          ...token,
          balance: nativeBalance.balance ?? token.balance,
          rateCurrency: nativeBalance.balanceCurrency ?? token.rateCurrency,
        };
      })
    );
  }, [listToken.length]);



  useEffect(() => {
    try {
      if (updateBalanceState) {
        updateBalance();
        fetchNativeBalanceOnce();
      }
    }
    catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateBalanceState]);


  const goToScan = () => {
    navigation.navigate(HomeStackScreenKey.ScanEvm);
  };

  const goToAIDetail = () => {
    navigation.navigate(HomeStackScreenKey.AIDetailScreen);
  };

  return {
    goToSendScreen,
    goToReceive,
    goToMangeCryptoScreen,
    goToScan,
    goToAIDetail,
    refreshingHome,
    handleHomeRefresh,
    walletBalanceCurrency,
    protocolBaseData,
    listCryptoData,
    handlePressWallet,
    selectedAddress,
    addressList,
    selectedAddressId,
    menuPosition,
    buttonRefs,
    showMenuWallet,
    onCloseMenuWallet,
    onShowMenuWallet,
    onSwipeEdit,
    onSwipeRemove,
    onChangeMenuActionType,
    showBottomSheetModal,
    closeShowBottomSheetModal,
    setNewWalletAddress,
    newWalletAddress,
    isAddView,
    setIsAddView,
    removeWalletAction,
    editWalletAction,
    isFirstInitial,
    onPressTokenDetailEVM,
    showBottomSheetModalAction,
    selectedCurrencySetting,
    menuActionType,
    currencyRateConversion,
  };
};

export default useEVMHome;
