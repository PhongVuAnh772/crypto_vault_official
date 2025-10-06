import { StackActions, useIsFocused } from "@react-navigation/native";
import { Address } from "@ton/core";
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
  useTonAddressData,
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
  getBlockTonTransfer,
  getHeightBottomTab,
  getThemeMode,
  getUpdateBalance,
  setShowCommonErrorModal,
  setUpdateBalance,
} from "src/core/redux/slice/app.slice";
import TonServices from "src/core/services/TonServices";
import {
  JettonBalanceDataType,
  TonAccountsType,
} from "src/core/services/TonServices/type";
import Utils from "src/core/utils/commonUtils";
import TonUtils from "src/core/utils/tonUtils";
import { getNetworkFee } from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import {
  getJettons,
  getRedXPrice,
} from "src/features/coinDetails/ton/ton.coinDetails.slice";
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
import appTokens from "src/core/constants/AppTokens";
import { filterTokenAvailable } from "src/core/redux/slice/customToken/addCustomToken.slice";
import {
  SupportedNativeTokenWithProtocol,
  SupportedTokenItemWithProtocol,
} from "src/core/redux/slice/customToken/addCustomToken.type";
import GlobalUtils from "src/core/utils/globalUtils";
import { ListCryptoDataType } from "../home.type";
import HomeUtils from "../home.utils";

const useTonHome = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const protocolDataLists = useAppSelector(getProtocolDataLists);
  const accountProtocolSelected = useAccountProtocolSelected();
  const updateBalanceState = useAppSelector(getUpdateBalance);
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;
  const blockTonTransfer = useAppSelector(getBlockTonTransfer);
  const wallet = useCurrentWallet();
  const protocolBaseData = useProtocolSelected();
  const tonAddressData = useTonAddressData();
  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;
  const listToken = useAppSelector(filterTokenAvailable);
  const [isFirstInitial, setIsFirstInitial] = useState<boolean>(false);
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [walletBalanceCurrency, setWalletBalanceCurrency] = useState<number>(0);
  const listCryptoData = useAppSelector(selectorListCryptoData);

  const getActiveOtherTokenInLocal = (contractAddress: string) => {
    return listToken.find(
      (
        e: SupportedTokenItemWithProtocol | SupportedNativeTokenWithProtocol
      ) => {
        const newData = e as SupportedTokenItemWithProtocol;
        return e.active === true && newData.contractAddress === contractAddress;
      }
    );
  };

  const createCryptoData = async (
    currentProtocolBaseData?: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    console.log("==============================");
    console.log("Call createCryptoData");
    console.log("==============================");

    const finalProtocolBaseData = currentProtocolBaseData ?? protocolBaseData;

    const { supportedToken = [] } = finalProtocolBaseData ?? {};

    const nativeTokenData = supportedToken.find(
      ({ isNativeToken }) => isNativeToken
    ) as SupportedNativeTokenType | undefined;

    const uniqueTokens: (SupportedTokenItemType | SupportedNativeTokenType)[] =
      [];
    const seenAddresses = new Set<string>();

    for (const token of listToken) {
      if (!token.isNativeToken) {
        try {
          const parsedAddress = Address.parse(
            token.contractAddress
          ).toRawString();

          if (!seenAddresses.has(parsedAddress)) {
            seenAddresses.add(parsedAddress);
            uniqueTokens.push(token);
          }
        } catch (error) {
          console.log("parsedAddress failed", error);
        }
      }
    }

    const otherToken = uniqueTokens.filter(
      ({ isNativeToken }) => !isNativeToken
    ) as SupportedTokenItemType[] | undefined;

    const newListCryptoData: ListCryptoDataType[] = [];

    const cryptoDataNative = await createCryptoItemData(
      nativeTokenData,
      finalProtocolBaseData
    );
    if (cryptoDataNative) {
      newListCryptoData.push(cryptoDataNative);
    }

    if (otherToken) {
      let jettonData: JettonBalanceDataType | undefined;
      const res = await dispatch(getJettons(tonAddressData));
      if (getJettons.fulfilled.match(res)) {
        jettonData = res.payload;
      }
      for await (const e of otherToken) {
        const activeTokenLocal = getActiveOtherTokenInLocal(e.contractAddress);
        if (activeTokenLocal) {
          const cryptoDataOther = await createCryptoItemData(
            e,
            finalProtocolBaseData,
            jettonData
          );
          if (cryptoDataOther) {
            newListCryptoData.push(cryptoDataOther);
          }
        }
      }
    }

    updateTotalBalance(newListCryptoData);

    dispatch(setListCryptoDataSyn(newListCryptoData));
    setIsFirstInitial(false);
  };

  const handleGetRedXPrice = async () => {
    try {
      const redXPrice = await dispatch(getRedXPrice()).unwrap();
      return redXPrice.price;
    } catch {
      return;
    }
  };
  const createCryptoItemData = async (
    tokenData?: SupportedNativeTokenType | SupportedTokenItemType,
    currentProtocolBaseData?: ProtocolDataWithSupportedTokensFormBEType,
    jettonData?: JettonBalanceDataType
  ) => {
    const finalProtocolBaseData = currentProtocolBaseData ?? protocolBaseData;

    const navigationKey = HomeStackScreenKey.Ton;

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
        balance: fetchDataCryptoRes ? balance : 0,
        rateCurrency: protocolBaseData?.price,
        baseData: protocolBaseData,
        navigationKey: navigationKey,
        decimal: finalProtocolBaseData?.nativeToken.decimal,
        slip0044: finalProtocolBaseData?.slip0044,
        isNative: tokenData?.isNativeToken,
      };
      return cryptoData;
    } else {
      const address1 = TonUtils.getRawAddress(
        (tokenData as SupportedTokenItemType).contractAddress
      );
      const currentJettonData = jettonData?.balances?.find((e) => {
        const address2 = e.jetton.address;

        return address1 === address2;
      });

      const balanceTokenFormat = TonUtils.formatBigNumber(
        currentJettonData?.balance ?? "0",
        tokenData?.decimal ?? 9
      );
      const priceTon = currentJettonData?.price?.prices?.TON;
      const id = Utils.generateUniqueId();

      let cryptoData: ListCryptoDataType = {
        id,
        name: tokenData?.name,
        symbol: tokenData?.symbol,
        logo: currentJettonData
          ? currentJettonData.jetton.image
          : tokenData?.logo,
        contractAddress: currentJettonData?.jetton.address ?? address1,
        balance: balanceTokenFormat * (priceTon ?? 0),
        balanceToken: balanceTokenFormat,
        tokenRateCurrency: currentJettonData?.price?.prices?.TON,
        baseData: protocolBaseData,
        decimal: tokenData?.decimal,
        slip0044: finalProtocolBaseData?.slip0044,
        isNative: false,
        tokenAddress: currentJettonData?.wallet_address.address,
        rateCurrency: protocolBaseData?.price ?? 1,
      };

      const navigationParams = {
        jettonData: currentJettonData,
        cryptoData: cryptoData,
      };

      // Get replace redX price
      const redxTokenParsed = TonUtils.getRawAddress(appTokens.REDX_TOKEN);
      if (redxTokenParsed === address1) {
        cryptoData.isRedXToken = true;
        const redXPrice = await handleGetRedXPrice();
        if (redXPrice) {
          cryptoData.tokenRateCurrency = redXPrice;
        }
      }

      cryptoData = {
        ...cryptoData,
        navigationKey: HomeStackScreenKey.Jetton,
        navigationParams,
      };

      return cryptoData;
    }
  };

  const fetchDataCrypto = async () => {
    try {
      if (selectedAddress) {
        try {
          const tonServices = new TonServices();
          const getAccountsRes = await tonServices.getAccounts({
            address: Address.parse(selectedAddress.address),
          });
          if (getAccountsRes.isSuccess) {
            const account = getAccountsRes?.data as TonAccountsType;
            return account.balance;
          }
        } catch (error) {
          console.error("fetchDataCrypto Ton error:", error);
          Utils.showToast({
            msg: t(LanguageKey.common_server_busy),
            type: AppToastType.error,
            contentOffSet: contentOffsetToast,
          });
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
    dispatch(setTransferSlip0044(Slip0044.Ton));

    const nativeCoinCryptoData = listCryptoData?.find((e) => e.isNative);
    if (nativeCoinCryptoData) {
      dispatch(setSelectedCryptoDataId(nativeCoinCryptoData.id));
      navigation.navigate(HomeStackScreenKey.Transfer, {
        isFromHome: true,
      });
    } else {
      console.error("goToSendScreen error");
      dispatch(setShowCommonErrorModal(true));
    }
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

  const updateTotalBalance = (currentListCryptoData: ListCryptoDataType[]) => {
    const walletBalance = currentListCryptoData.reduce(
      (acc: number, e: ListCryptoDataType) => {
        const { balanceFiat } = TonUtils.convertBalanceWithFiat({
          balance: e.balance,
          balanceToken: e.balanceToken,
          isNative: e.isNative ?? false,
          tokenRate: e.tokenRateCurrency,
          protocolRate: e.rateCurrency,
          settingCurrencyRate: selectedCurrencySetting.rate,
          isRedXToken: e.isRedXToken,
        });
        return acc + balanceFiat;
      },
      0
    );
    setWalletBalanceCurrency(walletBalance);
  };

  useEffect(() => {
    updateTotalBalance(listCryptoData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listCryptoData, selectedCurrencySetting]);

  useEffect(() => {
    if (isFocused) {
      dispatch(getNetworkFee());
    }
  }, [dispatch, isFocused]);

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

  const updateBalance = async () => {
    await createCryptoData();
    dispatch(setUpdateBalance(false));
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
  const getBackgroundImage = () => {
    return lightMode ? appImages.background1Dark : appImages.background1;
  };

  return {
    lightMode,
    goToSendScreen,
    goToReceive,
    goToMangeCryptoScreen,
    refreshingHome,
    handleHomeRefresh,
    listCryptoData,
    selectedAddress,
    isFirstInitial,
    goToStakeScreen,
    walletBalanceCurrency,
    selectedCurrencySetting,
    getBackgroundImage,
    dispatch,
  };
};

export default useTonHome;
