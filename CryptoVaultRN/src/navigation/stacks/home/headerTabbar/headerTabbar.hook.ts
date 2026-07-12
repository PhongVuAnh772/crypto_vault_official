import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  ParamListBase,
  StackActions,
  StackActionType,
} from "@react-navigation/native";
import i18next from "i18next";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { LoadingImage } from "src/components/common/AppImage/type";
import AppToastType from "src/core/enum/AppToastType";
import AuthAction from "src/core/enum/AuthAction";
import LanguageType from "src/core/enum/LanguageType";
import Slip0044 from "src/core/enum/Slip0044";
import VMType from "src/core/enum/VMType";
import WalletModalType from "src/core/enum/WalletModalType";
import LanguageKey from "src/core/locales/LanguageKey";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useAccount,
  useTonAddressData,
} from "src/core/redux/slice/account.selector";
import {
  changeAccount,
  editAccount,
  getAccountId,
  getAllAccount,
  getMobileProtocolListsWithSupportedTokens,
  getProtocolDataLists,
  getResetAction,
  getSelectedProtocolId,
  removeAccount,
  setResetAction,
  setSelectedProtocol,
  setTemporaryMnemonic,
} from "src/core/redux/slice/account.slice";
import {
  AccountType,
  ProtocolDataWithSupportedTokensFormBEType,
} from "src/core/redux/slice/account.type";
import {
  getHeightBottomTab,
  getIsTestnet,
  resetAllSlice,
  setAuthAction,
} from "src/core/redux/slice/app.slice";
import { deleteTokensByAccount } from "src/core/redux/slice/customToken/addCustomToken.slice";
import TonConnectUtils from "src/core/services/TonConnect/TonConnectUntil";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { clearBitcoinTransactionData } from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import {
  setMaxTonEventList,
  setTonEvents,
} from "src/features/coinDetails/ton/ton.coinDetails.slice";
import { MenuActionType } from "src/features/home/components/WalletBottomSheet/WalletBottomSheet.type";
import { setHomeSearchKeyword } from "src/features/home/slice/home.slice";
import { filterTokenAvailable } from "src/core/redux/slice/customToken/addCustomToken.slice";
import {
  getAppConnection,
  getDAppBrowse,
} from "src/features/tonConnect/slice/tonConnect.slice";
import {
  AuthStackScreenKey,
  HomeStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";

const useHeaderTabBar = (
  title: string,
  navigation: BottomTabNavigationProp<ParamListBase>
) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const tokenSuggestions = useAppSelector(filterTokenAvailable) || [];
  const actionSuggestions = [
    { key: "swap", label: "Swap", keywords: ["swap", "exchange"], screen: HomeStackScreenKey.Swap },
    { key: "trading", label: "Trading", keywords: ["trade", "trading", "market"], screen: HomeStackScreenKey.Trading },
    { key: "send", label: "Send", keywords: ["send", "transfer"], screen: HomeStackScreenKey.Transfer },
    { key: "scan", label: "Scan", keywords: ["scan", "qr"], screen: HomeStackScreenKey.ScanEvm },
    { key: "nft-market", label: "NFT Marketplace", keywords: ["nft", "marketplace"], screen: HomeStackScreenKey.MarketplaceHomeScreen },
    { key: "mint", label: "Mint NFT", keywords: ["mint", "create nft"], screen: HomeStackScreenKey.MintNftScreen },
    { key: "offerwall", label: "Offerwall", keywords: ["offer", "reward"], screen: HomeStackScreenKey.Offerwall },
    { key: "social", label: "Social Feed", keywords: ["feed", "social", "post"], screen: HomeStackScreenKey.FeedScreen },
    { key: "live", label: "Live Broadcast", keywords: ["live", "stream"], screen: HomeStackScreenKey.LiveBroadcastScreen },
    { key: "connect", label: "DApp Connections", keywords: ["dapp", "connect", "walletconnect"], screen: HomeStackScreenKey.ConnectionScreen },
    { key: "chat", label: "AI Chat", keywords: ["chat", "ai"], screen: HomeStackScreenKey.ChatScreen },
  ];
  const [quantityConnect, setQuantityConnect] = useState(0);
  const [quantityBrowse, setQuantityBrowse] = useState(0);
  const listDAppBrowse = useAppSelector(getDAppBrowse);
  const tonAddressData = useTonAddressData();
  const getAllConnect = useAppSelector(getAppConnection);
  const isTestNet = useAppSelector(getIsTestnet);
  const allWallets = useAppSelector(getAllAccount);
  const heightBottomTab = useAppSelector(getHeightBottomTab);
  const contentOffsetToast = heightBottomTab ? heightBottomTab + 10 : undefined;
  const walletMnemonic = useAppSelector(getAccountId);
  const currentWallet = useAccount();
  const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
  const selectedProtocolId = useAppSelector(getSelectedProtocolId);
  const protocolSelected = [
    ...(protocolDataLists.length > 0 ? protocolDataLists : []),
  ]?.find((e) => e?._id === selectedProtocolId);
  const [refreshProtocolList, setRefreshProtocolList] = useState(false);
  const onProtocolListRefresh = async () => {
    setRefreshProtocolList(true);
    await dispatch(getMobileProtocolListsWithSupportedTokens());
    setRefreshProtocolList(false);
  };
  const resetAction = useAppSelector(getResetAction);
  const [editWalletName, setEditWalletName] = useState<string>("");
  const [protocolSelect, setProtocolSelect] =
    useState<ProtocolDataWithSupportedTokensFormBEType | null>(null);
  const [walletModalType, setWalletModalType] = useState<WalletModalType>(
    WalletModalType.management
  );
  const nativeWalletCoreModule = new NativeWalletCoreModule();
  const isManagementBottomSheetWallet =
    walletModalType === WalletModalType.management;
  const [
    actionNavigationAfterWalletModalDismiss,
    setActionNavigationAfterWalletModalDismiss,
  ] = useState<StackActionType>();
  const [showBottomSheetModal, setShowBottomSheetModal] = useState(false);
  const [openWarningModalAction, setOpenWarningModalAction] = useState(false);
  const [
    isVisibleWarningCreateWalletModal,
    setIsVisibleWarningCreateWalletModal,
  ] = useState(false);
  const changeToAddWalletType = () => setWalletModalType(WalletModalType.add);
  const [selectedWallet, setSelectedWallet] = useState<AccountType | null>(
    null
  );
  const buttonRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const remainWallet = allWallets?.filter((e) => e.id !== walletMnemonic);
  const showMenuWallet = selectedWallet !== null;
  const dispatch = useAppDispatch();

  const [
    actionNavigationAfterWalletWarningModalDismiss,
    setActionNavigationAfterWalletWarningModalDismiss,
  ] = useState<StackActionType>();

  const onCloseMenuWallet = () => {
    setSelectedWallet(null);
    setMenuActionType(null);
  };
  const [menuActionType, setMenuActionType] = useState<MenuActionType | null>(
    null
  );
  const onChangeMenuActionType = (type: MenuActionType) => {
    setMenuActionType(type);
  };
  const onWalletModalDismiss = async () => {
    if (actionNavigationAfterWalletModalDismiss) {
      navigation.dispatch(actionNavigationAfterWalletModalDismiss);
    }
    if (openWarningModalAction) {
      setOpenWarningModalAction(false);
      setIsVisibleWarningCreateWalletModal(true);
    }
    setActionNavigationAfterWalletModalDismiss(undefined);
  };
  const closeShowBottomSheetModal = () => {
    setShowBottomSheetModal(false);
    setWalletModalType(WalletModalType.management);
  };

  const handleOnPressImport = () => {
    switch (protocolSelected?.VM) {
      case VMType.Ton:
        navigation.dispatch(StackActions.push(HomeStackScreenKey.NFTTonImport));
        break;
      case VMType.EVM:
        navigation.dispatch(StackActions.push(HomeStackScreenKey.NFTImport));
        break;
      default:
        break;
    }
  };

  const onScanPress = () => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.ScanEvm));
  };

  const gotoNotificationListScreen = () => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.NotificationList));
  };
  const onConfirmRemoveAccount = () => {
    if (selectedWallet !== null) {
      dispatch(removeAccount(selectedWallet));
      onCloseMenuWallet();
      handleDeleteTokenByAccount();
    }
  };

  const handleDeleteTokenByAccount = () => {
    const listAddress: Set<string> = new Set();
    selectedWallet?.protocolData.forEach((item) => {
      item.addressList.forEach((item) => {
        listAddress.add(item.address);
      });
    });
    const convertedList = Array.from(listAddress);
    dispatch(deleteTokensByAccount(convertedList));
  };

  const onEditWalletName = async () => {
    if (editWalletName?.length > 0 && selectedWallet) {
      const newWalletData: AccountType = {
        ...selectedWallet,
        name: editWalletName,
      };
      const editRes = await dispatch(editAccount(newWalletData));
      if (editAccount.fulfilled.match(editRes)) {
        onCloseMenuWallet();
      }
    }
  };

  const changeWalletAction = async (item: AccountType) => {
    closeShowBottomSheetModal();
    setTimeout(async () => {
      const res = await dispatch(changeAccount(item));

      if (changeAccount.fulfilled.match(res)) {
        Utils.showToast({
          msg: t(LanguageKey.common_switch_to_name_successfully, {
            name: item.name,
          }),
          type: AppToastType.success,
          contentOffSet: contentOffsetToast,
        });
        const payload = res.payload;
        if (!payload) {
          Utils.showToast({
            type: AppToastType.error,
            msg: "Change wallet error",
            contentOffSet: contentOffsetToast,
          });
        }
      } else {
        Utils.showToast({
          type: AppToastType.error,
          msg: "Change wallet error",
          contentOffSet: contentOffsetToast,
        });
      }
    }, 500);
  };

  const onShowMenuWallet = (wallet: AccountType, index: number) => {
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
          setEditWalletName(wallet.name);
        }
      );
    }
  };

  const onSwipeEdit = (wallet: AccountType) => {
    setSelectedWallet(wallet);
    setEditWalletName(wallet.name);
    setMenuActionType(MenuActionType.edit);
  };

  const onSwipeRemove = (wallet: AccountType) => {
    setSelectedWallet(wallet);
    setMenuActionType(MenuActionType.remove);
  };

  const editMainWallet = (
    ref: React.MutableRefObject<TouchableOpacity | null>
  ) => {
    if (currentWallet && ref.current) {
      ref.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setMenuPosition({
            x: pageX + width * 4.5,
            y: pageY,
          });
          setSelectedWallet(currentWallet);
          setEditWalletName(currentWallet.name);
        }
      );
    }
  };

  const closeModalCreateNewWallet = () => {
    setIsVisibleWarningCreateWalletModal(false);
  };

  const createWalletAction = async () => {
    try {
      const mnemonic = await nativeWalletCoreModule.createWallet();
      if (mnemonic) {
        setActionNavigationAfterWalletWarningModalDismiss(
          StackActions.push(NavigationStackKey.AuthStack, {
            screen: NavigationStackKey.CreateWalletStack,
          })
        );
        dispatch(setAuthAction(AuthAction.newWallet));
        setIsVisibleWarningCreateWalletModal(false);
        dispatch(setTemporaryMnemonic(mnemonic));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const closeAddWalletView = () =>
    setWalletModalType(WalletModalType.management);

  const showWalletWarningAction = () => {
    closeShowBottomSheetModal();
    setOpenWarningModalAction(true);
  };

  const createRestoreWalletAction = () => {
    closeShowBottomSheetModal();
    setActionNavigationAfterWalletModalDismiss(
      StackActions.push(NavigationStackKey.AuthStack, {
        screen: NavigationStackKey.RestoreWalletStack,
      })
    );
  };

  const onWalletWarningModalDismiss = () => {
    if (actionNavigationAfterWalletWarningModalDismiss) {
      navigation.dispatch(actionNavigationAfterWalletWarningModalDismiss);
    }
    setActionNavigationAfterWalletWarningModalDismiss(undefined);
  };

  const showBottomSheetModalAction = () => {
    setShowBottomSheetModal(true);
  };

  useEffect(() => {
    if (resetAction) {
      closeShowBottomSheetModal();
      setActionNavigationAfterWalletModalDismiss(
        StackActions.replace(NavigationStackKey.AuthStack, {
          screen: AuthStackScreenKey.OnboardingScreen,
        })
      );
      dispatch(resetAllSlice());
      i18next.changeLanguage(LanguageType.en);
      dispatch(setResetAction(false));
    }
  }, [dispatch, navigation, resetAction]);
  const bottomSheetProtocolRef = useRef<BottomSheetModal>(null);
  const onShowModalProtocol = async () => {
    if (protocolDataLists.length === 0) {
      const fetchRes = await dispatch(getMobileProtocolListsWithSupportedTokens());
      if (getMobileProtocolListsWithSupportedTokens.rejected.match(fetchRes)) {
        Utils.showToast({
          type: AppToastType.error,
          msg: "Cannot load protocols",
          contentOffSet: contentOffsetToast,
        });
        return;
      }
    }
    bottomSheetProtocolRef.current?.present();
  };
  const onCloseModalProtocol = () => bottomSheetProtocolRef.current?.close();

  const handlePressProtocol = (
    data: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    switch (protocolSelected?.slip0044) {
      case Slip0044.Bitcoin:
        dispatch(clearBitcoinTransactionData());
        break;
      case Slip0044.Ton:
        dispatch(setTonEvents(undefined));
        dispatch(setMaxTonEventList(false));
        break;
      default:
        break;
    }
    setProtocolSelect(data);
    Utils.showToast({
      msg: t(LanguageKey.common_change_protocol, {
        name: data.name,
      }),
      subMsg: data.logo,
      type: AppToastType.changeProtocol,
      visibilityTime: 3000,
      contentOffSet: contentOffsetToast,
    });
    onCloseModalProtocol();
  };

  const onDismissModalProtocol = () => {
    if (protocolSelect) {
      dispatch(setSelectedProtocol(protocolSelect._id));
      setProtocolSelect(null);
    }
  };
  const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
  const setLoadingImages = (uri: string, value: boolean) => {
    const imageLoading = isLoadingImages[uri];
    if (!imageLoading || imageLoading.loading) {
      setIsLoadingImages((prev) => {
        return {
          ...prev,
          [uri]: {
            uri: uri,
            loading: value,
          },
        };
      });
    }
  };
  const protocolListSort = protocolDataLists.slice().sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  // useEffect(() => {
  //   const listConnected = TonConnectUtils.convertDataAllConnect(
  //     isTestNet,
  //     tonAddressData?.address!,
  //     getAllConnect
  //   );
  //   const connectArray = listConnected.flatMap((group) =>
  //     group.connections.map((item) => ({
  //       item,
  //       image: group.iconUrl,
  //       name: group.name,
  //       url: group.url,
  //     }))
  //   );
  //   setQuantityConnect(connectArray.length);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [getAllConnect]);

  useEffect(() => {
    if (tonAddressData?.address) {
      const listConnected = TonConnectUtils.convertDataAllConnect(
        isTestNet,
        tonAddressData.address,
        getAllConnect
      );
      const connectArray = listConnected.flatMap((group) =>
        group.connections.map((item) => ({
          item,
          image: group.iconUrl,
          name: group.name,
          url: group.url,
        }))
      );
      setQuantityConnect(connectArray.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllConnect, tonAddressData?.address]);
  useEffect(() => {
    if (protocolDataLists.length === 0) {
      dispatch(getMobileProtocolListsWithSupportedTokens());
    }
  }, [dispatch, protocolDataLists.length]);

  useEffect(() => {
    if (protocolDataLists.length === 0) return;
    const stillValid = protocolDataLists.some((p) => p?._id === selectedProtocolId);
    if (!stillValid) {
      const fallbackId = protocolDataLists[0]?._id;
      if (fallbackId) {
        dispatch(setSelectedProtocol(fallbackId));
      }
    }
  }, [dispatch, protocolDataLists, selectedProtocolId]);

  useEffect(() => {
    setQuantityBrowse(listDAppBrowse.length);
  }, [listDAppBrowse]);

  useEffect(() => {
    if (title !== LanguageKey.home_tab_crypto_title && searchValue) {
      setSearchValue("");
      dispatch(setHomeSearchKeyword(""));
    }
  }, [title, searchValue, dispatch]);

  const onChangeSearchValue = (value: string) => {
    setSearchValue(value);
    dispatch(setHomeSearchKeyword(value));
  };

  const suggestionList = searchValue.trim()
    ? (() => {
        const keyword = searchValue.trim().toLowerCase();
        const tokenMatches = tokenSuggestions
          .filter((token: any) => {
            const name = String(token?.name ?? "").toLowerCase();
            const symbol = String(token?.symbol ?? "").toLowerCase();
            const contractAddress = String(token?.contractAddress ?? "").toLowerCase();
            return (
              name.includes(keyword) ||
              symbol.includes(keyword) ||
              contractAddress.includes(keyword)
            );
          })
          .slice(0, 5)
          .map((token: any) => ({
            type: "token" as const,
            key: `token-${String(token?.symbol ?? token?.name ?? "")}-${String(token?.contractAddress ?? "")}`,
            symbol: String(token?.symbol ?? ""),
            name: String(token?.name ?? ""),
            onPress: () => {
              const value = String(token?.symbol ?? token?.name ?? "");
              setSearchValue(value);
              dispatch(setHomeSearchKeyword(value));
            },
          }));

        const actionMatches = actionSuggestions
          .filter((action) => {
            const label = action.label.toLowerCase();
            return (
              label.includes(keyword) ||
              action.keywords.some((k) => k.includes(keyword) || keyword.includes(k))
            );
          })
          .slice(0, 5)
          .map((action) => ({
            type: "action" as const,
            key: `action-${action.key}`,
            symbol: "Action",
            name: action.label,
            onPress: () => {
              setSearchValue("");
              dispatch(setHomeSearchKeyword(""));
              navigation.navigate(action.screen as never);
            },
          }));

        return [...actionMatches, ...tokenMatches].slice(0, 6);
      })()
    : [];

  const onPressSuggestion = (item: { onPress: () => void }) => {
    item.onPress();
  };

  return {
    isVisibleWarningCreateWalletModal,
    protocolListSort,
    isManagementBottomSheetWallet,
    bottomSheetProtocolRef,
    showBottomSheetModal,
    showMenuWallet,
    menuActionType,
    editWalletName,
    menuPosition,
    buttonRefs,
    remainWallet,
    currentWallet,
    quantityConnect,
    quantityBrowse,
    showBottomSheetModalAction,
    editMainWallet,
    onConfirmRemoveAccount,
    handleOnPressImport,
    gotoNotificationListScreen,
    onWalletModalDismiss,
    closeShowBottomSheetModal,
    onCloseMenuWallet,
    setEditWalletName,
    onEditWalletName,
    onChangeMenuActionType,
    changeToAddWalletType,
    changeWalletAction,
    onShowMenuWallet,
    closeAddWalletView,
    showWalletWarningAction,
    createRestoreWalletAction,
    closeModalCreateNewWallet,
    createWalletAction,
    onWalletWarningModalDismiss,
    onCloseModalProtocol,
    onShowModalProtocol,
    handlePressProtocol,
    selectedProtocolId,
    protocolSelected,
    isLoadingImages,
    setLoadingImages,
    selectedWallet,
    refreshProtocolList,
    onScanPress,
    onProtocolListRefresh,
    onDismissModalProtocol,
    searchValue,
    onChangeSearchValue,
    suggestionList,
    onPressSuggestion,
    onSwipeEdit,
    onSwipeRemove,
  };
};

export default useHeaderTabBar;
