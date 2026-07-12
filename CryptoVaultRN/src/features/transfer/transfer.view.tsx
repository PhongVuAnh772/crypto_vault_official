import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import Slip0044 from "src/core/enum/Slip0044";
import { useProtocolSelected } from "src/core/redux/slice/account.selector";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "src/navigation/stacks/type/HomeStackParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { TransferParamListType } from "src/navigation/stacks/type/TransferParamListType";
import { useSelectorSelectedCryptoData } from "../home/slice/home.selector";
import TransferBitcoinComponent from "./bitcoin/bitcoin.transfer.view";
import SendTokenEVM from "./evm/send.evm.view";
import TransferJettonComponent from "./jetton/jetton.transfer.view";
import TransferTonComponent from "./ton/ton.transfer.view";

type TransferProp = RouteProp<
  HomeStackParamListType,
  HomeStackScreenKey.Transfer
>;

const TransferScreen = ({ navigation }: RootNavigationType) => {
  const currentProtocol = useProtocolSelected(); // Get the selected protocol

  const selectedCryptoData = useSelectorSelectedCryptoData();

  const transferData: TransferParamListType = useRoute<TransferProp>()?.params;

  const isFromHome = transferData?.isFromHome;

  const getView = () => {
    switch (currentProtocol?.slip0044) {
      case Slip0044.Ton:
        if (selectedCryptoData?.isNative) {
          return (
            <TransferTonComponent
              navigation={navigation}
              isFromHome={isFromHome}
            />
          );
        } else {
          return (
            <TransferJettonComponent
              navigation={navigation}
              isFromHome={isFromHome}
            />
          );
        }
      case Slip0044.Bitcoin:
        return (
          <TransferBitcoinComponent
            navigation={navigation}
            isFromHome={isFromHome}
          />
        );
      case Slip0044.Ethereum:
      case Slip0044.Binance:
      case Slip0044.SmartChain:
      case Slip0044.Polygon:
        return <SendTokenEVM navigation={navigation} />;
      default:
        return (
          <TransferTonComponent
            navigation={navigation}
            isFromHome={isFromHome}
          />
        );
    }
  };
  return getView();
};

export default TransferScreen;
