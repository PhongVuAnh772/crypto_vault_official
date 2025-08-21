import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import AppText from "components/AppText";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appColors from "src/core/constants/AppColors";
import ListHeaderToken from "../components/ListHeaderToken";
import TokenItem from "../components/TokenItem";
import {
  getMobileProtocolListsWithSupportedTokens,
  getProtocolDataLists,
  getSelectedProtocolId,
  setSelectedProtocol,
  useAccountProtocolSelected,
} from "src/core/redux/slices/app.slice";
import Utils from "src/utils/commonUtils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheetModalGorhom from "components/BottomSheetProvider";
import BottomSheetProtocolView from "components/ProtocolView";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { ProtocolDataWithSupportedTokensFormBEType } from "type/ProtocolType";
import { LoadingImage } from "src/core/redux/type/nft.type";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import {
  HomeStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const accountProtocolSelected = useAccountProtocolSelected();
  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);
  const protocolImage = "https://cryptologos.cc/logos/toncoin-ton-logo.png";
  const [protocolSelect, setProtocolSelect] =
    useState<ProtocolDataWithSupportedTokensFormBEType | null>(null);
  const walletName = selectedAddress?.name || "My Wallet";
  const bottomSheetProtocolRef = useRef<BottomSheetModal>(null);
  const onShowModalProtocol = () => bottomSheetProtocolRef.current?.present();
  const onCloseModalProtocol = () => bottomSheetProtocolRef.current?.close();
  const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
  const selectedProtocolId = useAppSelector(getSelectedProtocolId);
  const protocolSelected = [
    ...(protocolDataLists.length > 0 ? protocolDataLists : []),
  ]?.find((e) => e?._id === selectedProtocolId);
  const protocolListSort = protocolDataLists.slice().sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
  const [refreshProtocolList, setRefreshProtocolList] = useState(false);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(selectedAddress?.address ?? "");
  };
  const handlePressProtocol = (
    data: ProtocolDataWithSupportedTokensFormBEType
  ) => {
    setProtocolSelect(data);
    onCloseModalProtocol();
  };
  const onDismissModalProtocol = () => {
    if (protocolSelect) {
      dispatch(setSelectedProtocol(protocolSelect._id));
      setProtocolSelect(null);
    }
  };
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
  const onProtocolListRefresh = async () => {
    setRefreshProtocolList(true);
    await dispatch(getMobileProtocolListsWithSupportedTokens());
    setRefreshProtocolList(false);
  };
  const tokenData = [
    {
      id: "eth",
      name: "ETH",
      icon: { uri: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      value: 0.6354,
      price: 2580.2,
      change: 1.05,
    },
    {
      id: "flow",
      name: "FLOW",
      icon: { uri: "https://cryptologos.cc/logos/flow-flow-logo.png" },
      value: 160.03,
      price: 256.02,
      change: -7.55,
    },
    {
      id: "xrp",
      name: "XRP",
      icon: { uri: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
      value: 370.4154,
      price: 525.55,
      change: 1.42,
    },
  ];

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar
          translucent
          backgroundColor="black"
          barStyle="dark-content"
        />
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={[styles.container]}>
            <View style={{ paddingHorizontal: 24 }}>
              <View style={styles.header}>
                <View style={styles.headerAction}>
                  <MaterialIcons name="history" size={24} color="white" />
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.walletNameContainer}>
                  <AppText
                    titleWithI18n={walletName}
                    styles={styles.walletName}
                  />
                  <Feather name="chevron-down" size={16} color="white" />
                </View>

                <Pressable onPress={onShowModalProtocol}>
                  <Image
                    source={{ uri: protocolImage }}
                    style={styles.protocolImage}
                  />
                </Pressable>
              </View>
              <View style={styles.contentWallet}>
                <Pressable
                  style={styles.walletContainer}
                  onPress={() => handleCopy()}
                >
                  <AppText
                    titleWithI18n={`${Utils.getShortAddress(selectedAddress?.address)}`}
                    styles={styles.walletAddress}
                  />
                  <Feather name="copy" size={15} color="rgb(187, 238, 48)" />
                </Pressable>
                <AppText titleWithI18n={"$169.50"} styles={styles.balance} />
                <View style={styles.actionContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 16,
                      marginTop: 16,
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        navigation.navigate(NavigationStackKey.HomeStack, {
                          screen: HomeStackScreenKey.TonSendCoin,
                        })
                      }
                      style={[
                        styles.action,
                        { backgroundColor: "rgb(187, 238, 48)" },
                      ]}
                    >
                      <AppText
                        titleWithI18n="Send"
                        styles={styles.actionText}
                      />
                      <MaterialIcons
                        name="arrow-outward"
                        size={18}
                        color="black"
                      />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.action,
                        { backgroundColor: "rgb(55, 40, 235)" },
                      ]}
                    >
                      <AppText
                        titleWithI18n="Receive"
                        styles={[styles.actionText, { color: "white" }]}
                      />
                      <AntDesign name="arrowdown" size={16} color="white" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.contentToken}>
              <View style={styles.defaultToken}>
                <ListHeaderToken />
              </View>
              <View style={styles.tokenListWrapper}>
                <FlatList
                  data={tokenData}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <TokenItem item={item} />}
                  contentContainerStyle={{ padding: 24 }}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <BottomSheetModalGorhom
        refModal={bottomSheetProtocolRef as any}
        onDismiss={onDismissModalProtocol}
        enableContentPanningGesture={!Utils.isAndroid}
      >
        <BottomSheetProtocolView
          onCloseModalProtocol={onCloseModalProtocol}
          protocolDataLists={protocolListSort as any}
          selectedProtocolId={selectedProtocolId}
          handlePressProtocol={handlePressProtocol}
          setLoadingImages={setLoadingImages}
          refreshList={refreshProtocolList}
          onRefresh={onProtocolListRefresh}
        />
      </BottomSheetModalGorhom>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "black",
    gap: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerAction: {
    flexDirection: "row",
    gap: 12,
  },
  protocolImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  walletName: {
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  walletNameContainer: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    marginLeft: -5,
  },
  contentWallet: {
    paddingTop: 55,
    justifyContent: "center",
  },
  contentToken: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "rgb(26, 26, 26)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  walletContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: appColors.neutral.n800,
    alignSelf: "center",
    borderRadius: 50,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  walletAddress: {
    fontSize: 11,
    color: "rgb(210, 204, 204)",
  },
  balance: {
    color: "white",
    alignSelf: "center",
    marginTop: 16,
    fontSize: 40,
    fontWeight: "500",
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 15,
  },

  action: {
    width: 170,
    height: 60,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingLeft: 10,
  },

  actionText: {
    color: "black",
    fontWeight: "500",
  },
  defaultToken: {
    backgroundColor: "rgb(26, 26, 26)",
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 0,
  },
  tokenListWrapper: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
});

export default HomeScreen;
