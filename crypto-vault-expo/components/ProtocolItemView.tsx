import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import appColors from "src/core/constants/AppColors";
import appStyles from "src/core/styles";
import { ProtocolDataWithSupportedTokensFormBEType } from "type/ProtocolType";
import TextVariantKeys from "../src/core/enum/TextVariantKeys";
import AppText from "./AppText";

type ProtocolType = {
  item: ProtocolDataWithSupportedTokensFormBEType;
  selected?: boolean | null;
  onPress?: (value: ProtocolDataWithSupportedTokensFormBEType) => void;
  setLoadingImages: (uri: string, value: boolean) => void;
};
const ProtocolItem = ({
  selected,
  onPress,
  item,
  setLoadingImages,
}: ProtocolType) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (onPress) {
          onPress(item);
        }
      }}
      style={[
        appStyles.flexRow,
        appStyles.alignItemsCenter,
        appStyles.justifyContentBetween,
        protocolItemStyle.listProtocolItem,
      ]}
    >
      <>
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
          {/* <ProtocolImage
            protocolData={item}
            size={28}
            bonusId={item._id}
            isLoadingImage={isLoadingImage[item.logo + item._id]?.loading}
            logoUri={item.logo}
            setLoadingImages={setLoadingImages}
          /> */}
          <AppText
            title={item.name}
            variant={TextVariantKeys.titleMedium}
            styles={protocolItemStyle.nameProtocol}
            textColor={appColors.neutral.black}
          />
          <View style={protocolItemStyle.shortCurrencyContainer}>
            <AppText
              title={item.symbol}
              variant={TextVariantKeys.titleSmall}
              textColor={appColors.neutral.black}
            />
          </View>
        </View>
        <View>
          {selected && <Feather name="check" size={24} color="black" />}
        </View>
      </>
    </TouchableOpacity>
  );
};

const protocolItemStyle = StyleSheet.create({
  listProtocolItem: {
    padding: 16,
  },
  nameProtocol: {
    marginHorizontal: 16,
  },
  markIconProtocol: {
    color: appColors.main.tokyoRed,
  },
  imageToken: {
    width: 28,
    height: 28,
    borderRadius: 28,
  },
  size24: {
    width: 24,
    height: 24,
    borderRadius: 100,
  },
  size28: {
    width: 28,
    height: 28,
    borderRadius: 100,
  },
  size16: {
    width: 16,
    height: 16,
    borderRadius: 100,
  },
  shortCurrencyContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: appColors.neutral.n200,
    borderRadius: 4,
    ...appStyles.center,
  },
});

export default ProtocolItem;
