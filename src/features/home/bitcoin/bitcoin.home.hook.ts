import { StackActions, useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AppToastType from "src/core/enum/AppToastType";
import Slip0044 from "src/core/enum/Slip0044";
import ThemeKey from "src/core/enum/ThemeKey";
import { TransactionType } from "src/core/enum/TransactionType";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useAccountProtocolSelected,
  useBitcoinAddressData,
  useCurrentWallet,
  useProtocolSelected,
  useSelectedCurrencySetting,
} from "src/core/redux/slice/account.selector";
import {
  getProtocolDataLists,
  setSelectedProtocol,
} from "src/core/redux/slice/account.slice";
import {
  ProtocolDataWithSupportedTokensFormBEType,
  SupportedNativeTokenType,
  SupportedTokenItemType,
  AddressListItemType,
} from "src/core/redux/slice/account.type";
import { MenuActionType } from "../components/WalletBottomSheet/WalletBottomSheet.type";
import {
  getBlockBitcoinTransfer,
  getHeightBottomTab,
  getThemeMode,
  getUpdateBalance,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import BitcoinUtils from "src/core/utils/bitcoinUtils";
import Utils from "src/core/utils/commonUtils";
import {
  getBitcoinData,
  getBitcoinFullData,
  getNetworkFee,
  selectorBitcoinFullData,
} from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import {
  selectorListCryptoData,
  setListCryptoDataSyn,
} from "src/features/home/slice/home.slice";
import { setTransferSlip0044 } from "src/features/transfer/transfer.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ReceiveParamListType } from "src/navigation/stacks/type/ReceiveParamListType";

import { appImages } from "src/core/constants/AppImages";
import { filterTokenAvailable } from "src/core/redux/slice/customToken/addCustomToken.slice";
import { ListCryptoDataType } from "../home.type";
import HomeUtils from "../home.utils";

const useBitcoinHome = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const wallet = useCurrentWallet();
  const dispatch = useAppDispatch();
  const protocolDataLists = useAppSelector(getProtocolDataLists);
  const accountProtocolSelected = useAccountProtocolSelected();
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;
  const protocolBaseData = useProtocolSelected();
  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;
  const listToken = useAppSelector(filterTokenAvailable);
  const [isFirstInitial, setIsFirstInitial] = useState<boolean>(false);
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [walletBalanceCurrency, setWalletBalanceCurrency] = useState<number>(0);
  const listCryptoData = useAppSelector(selectorListCryptoData);

  const [btcTransactionHistory, setBTCTransactionHistory] = useState<any[]>([]);
  const bitcoinData = useBitcoinAddressData();
  const btcAddress = bitcoinData?.address ?? "";
  const bitcoinFullData = useAppSelector(selectorBitcoinFullData);
  const bitcoinFullDataTxs = bitcoinFullData?.txs ?? [];

  const transformBitcoinTransactionHistory = async ({
    txsData,
  }: {
    txsData?: any[];
  }) => {
    const adminAddress = protocolBaseData?.beneficiary?.walletAddress;
    const result = await BitcoinUtils.transformBitcoinTransactionHistory({
      currentType: TransactionType.All,
      txsData,
      typeSelect: TransactionType.All,
      bitcoinFullDataTxs,
      btcAddress,
      adminAddress: adminAddress,
    });
    setBTCTransactionHistory(result);
  };

  const fetchData = async () => {
    if (btcAddress) {
      const res = await dispatch(
        getBitcoinFullData({ bitcoinAddress: btcAddress })
      );
      if (getBitcoinFullData.fulfilled.match(res)) {
        transformBitcoinTransactionHistory({
          txsData: res.payload?.txs,
        });
      }
    }
  };

  const createCryptoData = async (
    currentProtocolBaseData?: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    try {
      const newListCryptoData: ListCryptoDataType[] = [];

      const finalProtocolBaseData = currentProtocolBaseData ?? protocolBaseData;

      const { supportedToken = [] } = finalProtocolBaseData ?? {};

      const nativeTokenData = supportedToken.find(
        ({ isNativeToken }) => isNativeToken
      ) as SupportedNativeTokenType | undefined;

      const cryptoDataNative = await createCryptoItemData(
        nativeTokenData,
        finalProtocolBaseData
      );
      if (cryptoDataNative) {
        newListCryptoData.push(cryptoDataNative);
      }

      const walletBalance = newListCryptoData.reduce(
        (acc: number, e: ListCryptoDataType) =>
          acc + parseFloat((e?.balance ?? 0)?.toString()),
        0
      );
      setWalletBalanceCurrency(
        walletBalance * (finalProtocolBaseData?.price ?? 1)
      );

      dispatch(setListCryptoDataSyn(newListCryptoData));
    } catch (error) {
      console.log("createCryptoData error", error);
    } finally {
      setIsFirstInitial(false);
    }
  };

  const createCryptoItemData = async (
    tokenData?: SupportedNativeTokenType | SupportedTokenItemType,
    currentProtocolBaseData?: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    const finalProtocolBaseData = currentProtocolBaseData ?? protocolBaseData;

    const navigationKey = HomeStackScreenKey.Bitcoin;

    if (tokenData?.isNativeToken) {
      const fetchDataCryptoRes = await fetchDataCrypto();

      const balance = HomeUtils.getBalance(
        fetchDataCryptoRes,
        finalProtocolBaseData
      );
      const id = Utils.generateUniqueId();

      const cryptoData: ListCryptoDataType = {
        id,
        name: tokenData?.name,
        symbol: tokenData?.symbol,
        logo: tokenData?.logo ?? finalProtocolBaseData?.logo,
        balance: balance,
        rateCurrency: protocolBaseData?.price,
        baseData: protocolBaseData,
        navigationKey: navigationKey,
        decimal: finalProtocolBaseData?.nativeToken.decimal,
        slip0044: finalProtocolBaseData?.slip0044,
        isNative: tokenData?.isNativeToken,
      };
      return cryptoData;
    }
  };

  const fetchDataCrypto = async () => {
    try {
      if (selectedAddress) {
        const resData = await dispatch(
          getBitcoinData({
            bitcoinAddress: selectedAddress.address,
            includeGetMaxAmount: false,
          })
        );
        if (getBitcoinData.fulfilled.match(resData)) {
          return resData.payload;
        }
      }
    } catch (error) {
      console.error("fetchDataCrypto Error:", error);
    }
  };

  const handleHomeRefresh = useCallback(async () => {
    if (!refreshingHome) {
      try {
        setRefreshingHome(true);
        await Promise.all([createCryptoData(), fetchData()]);
        setRefreshingHome(false);
      } catch (error) {
        console.error("handleHomeRefresh Error:", error);
        setRefreshingHome(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, btcAddress, dispatch, protocolBaseData]);

  const goToSendScreen = () => {
    dispatch(setTransferSlip0044(Slip0044.Bitcoin));
    navigation.navigate(HomeStackScreenKey.Transfer, {
      isFromHome: true,
    });
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

  useEffect(() => {
    if (isFocused) {
      dispatch(getNetworkFee());
      fetchData();
    }
  }, [dispatch, isFocused, btcAddress]);

  useEffect(() => {
    if (!isFirstInitial) {
      createCryptoData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, protocolDataLists, listToken.length, wallet?.address]);

  const getBackgroundImage = () => {
    return appImages.newBgDark;
  };

  const [isAddView, setIsAddView] = useState(false);
  const [showBottomSheetModal, setShowBottomSheetModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AddressListItemType | null>(null);
  const [menuActionType, setMenuActionType] = useState<MenuActionType | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [newWalletAddress, setNewWalletAddress] = useState("");

  const showMenuWallet = selectedWallet !== null;

  const showBottomSheetModalAction = () => {
    setShowBottomSheetModal(true);
  };

  const closeShowBottomSheetModal = () => {
    setShowBottomSheetModal(false);
  };

  const onChangeMenuActionType = (type: MenuActionType) => {
    setMenuActionType(type);
  };

  const onCloseMenuWallet = () => {
    setSelectedWallet(null);
    setMenuActionType(null);
  };

  const onShowMenuWallet = (wallet: AddressListItemType, index: number) => {
    setSelectedWallet(wallet);
    setNewWalletAddress(wallet.name);
  };

  const handlePressWallet = (data: AddressListItemType) => {
    closeShowBottomSheetModal();
  };

  return {
    goToSendScreen,
    goToReceive,
    goToMangeCryptoScreen,
    refreshingHome,
    handleHomeRefresh,
    walletBalanceCurrency,
    btcTransactionHistory,
    selectedAddress,
    selectedCurrencySetting,
    listCryptoData,
    isFirstInitial,
    dispatch,
    getBackgroundImage,
    showBottomSheetModal,
    showBottomSheetModalAction,
    closeShowBottomSheetModal,
    isAddView,
    setIsAddView,
    accountProtocolSelected,
    menuActionType,
    onCloseMenuWallet,
    showMenuWallet,
    newWalletAddress,
    setNewWalletAddress,
    menuPosition,
    addressList,
    selectedAddressId,
    protocolBaseData,
    handlePressWallet,
    onShowMenuWallet,
    onChangeMenuActionType,
    t,
  };
};

export default useBitcoinHome;
