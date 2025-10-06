import { StackActions, useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AppToastType from "src/core/enum/AppToastType";
import Slip0044 from "src/core/enum/Slip0044";
import ThemeKey from "src/core/enum/ThemeKey";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useAccountProtocolSelected,
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
} from "src/core/redux/slice/account.type";
import {
  getBlockBitcoinTransfer,
  getHeightBottomTab,
  getThemeMode,
  getUpdateBalance,
  setShowCommonErrorModal,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import Utils from "src/core/utils/commonUtils";
import {
  getBitcoinData,
  getNetworkFee,
} from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import {
  selectorListCryptoData,
  setListCryptoDataSyn,
  setSelectedCryptoDataId,
} from "src/features/home/slice/home.slice";
import { setTransferSlip0044 } from "src/features/transfer/transfer.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ReceiveParamListType } from "src/navigation/stacks/type/ReceiveParamListType";

import { appImages } from "src/core/constants/AppImages";
import { filterTokenAvailable } from "src/core/redux/slice/customToken/addCustomToken.slice";
import GlobalUtils from "src/core/utils/globalUtils";
import { ListCryptoDataType } from "../home.type";
import HomeUtils from "../home.utils";

const useBitcoinHome = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const wallet = useCurrentWallet();
  const dispatch = useAppDispatch();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const protocolDataLists = useAppSelector(getProtocolDataLists);
  const accountProtocolSelected = useAccountProtocolSelected();
  const updateBalanceState = useAppSelector(getUpdateBalance);
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;
  const blockBitcoinTransfer = useAppSelector(getBlockBitcoinTransfer);
  const protocolBaseData = useProtocolSelected();
  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;
  const listToken = useAppSelector(filterTokenAvailable);
  const [isFirstInitial, setIsFirstInitial] = useState<boolean>(false);
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [walletBalanceCurrency, setWalletBalanceCurrency] = useState<number>(0);
  const listCryptoData = useAppSelector(selectorListCryptoData);
  const createCryptoData = async (
    currentProtocolBaseData?: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    try {
      console.log("==============================");
      console.log("Call createCryptoData");
      console.log("==============================");

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
      console.log("==============================");
      console.log("Call createCryptoData error", error);
      console.log("==============================");
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
          const payload = resData.payload;
          return payload;
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
        await createCryptoData();
        setRefreshingHome(false);
      } catch (error) {
        console.error("handleHomeRefresh Error:", error);
        setRefreshingHome(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountProtocolSelected, listToken]);

  const goToSendScreen = () => {
    dispatch(setTransferSlip0044(Slip0044.Bitcoin));

    const nativeCoinCryptoData = listCryptoData?.find((e) => e.isNative);
    navigation.navigate(HomeStackScreenKey.Transfer, {
      isFromHome: true,
    });
    // if (nativeCoinCryptoData) {
    //   dispatch(setSelectedCryptoDataId(nativeCoinCryptoData.id));

    // } else {
    //   console.error("goToSendScreen error");
    //   dispatch(setShowCommonErrorModal(true));
    // }
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

  const goToStakeScreen = () => {
    navigation.dispatch(
      StackActions.push(HomeStackScreenKey.Stake, { test: "1234565" })
    );
  };

  useEffect(() => {
    if (updateBalanceState) {
      console.log("===================");
      console.log("Update Balance");
      console.log("===================");
      updateBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateBalanceState]);

  useEffect(() => {
    if (isFocused) {
      dispatch(getNetworkFee());
    }
  }, [dispatch, isFocused]);

  useEffect(() => {
    if (!protocolBaseData && protocolDataLists) {
      const polProtocolData = protocolDataLists.find(
        (e) => e.slip0044 === Slip0044.Polygon
      );
      dispatch(
        setSelectedProtocol(
          polProtocolData ? polProtocolData._id : protocolDataLists[0]?._id
        )
      );
    }
  }, [protocolBaseData, protocolDataLists, dispatch]);

  const handleChangeProtocol = async () => {
    setIsFirstInitial(true);
    await createCryptoData();
  };

  useEffect(() => {
    if (!isFirstInitial) {
      handleChangeProtocol();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountProtocolSelected,
    protocolDataLists,
    listToken.length,
    wallet?.address,
  ]);

  const updateBalance = async () => {
    await createCryptoData();
    dispatch(setUpdateBalance(false));
  };
  const getBackgroundImage = () => {
    return lightMode ? appImages.background1Dark : appImages.background1;
  };

  return {
    goToSendScreen,
    goToReceive,
    goToMangeCryptoScreen,
    refreshingHome,
    handleHomeRefresh,
    walletBalanceCurrency,
    listCryptoData,
    selectedAddress,
    isFirstInitial,
    goToStakeScreen,
    selectedCurrencySetting,
    dispatch,
    getBackgroundImage,
  };
};

export default useBitcoinHome;
