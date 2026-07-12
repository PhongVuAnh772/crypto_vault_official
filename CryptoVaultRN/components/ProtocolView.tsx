import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import appColors from "src/core/constants/AppColors";

import appStyles from "src/core/styles";
import { ProtocolDataWithSupportedTokensFormBEType } from "type/ProtocolType";
import AppText from "./AppText";
import TextVariantKeys from "src/core/constants/TextVariantKeys";
import useAppTheme from "hooks/useAppThemeHook";
import ProtocolItem from "./ProtocolItemView";

type BottomSheetProtocolViewType = {
  onCloseModalProtocol: () => void | undefined;
  protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[] | undefined;
  handlePressProtocol: (
    data: ProtocolDataWithSupportedTokensFormBEType
  ) => void;
  selectedProtocolId?: string;
  setLoadingImages: (uri: string, value: boolean) => void;
  refreshList: boolean;
  onRefresh?: () => void;
};

const AppSeparator = () => {
  const appSeparatorStyle = useAppSeparatorStyle();
  return <View style={appSeparatorStyle.separator} />;
};

const BottomSheetProtocolView: React.FC<BottomSheetProtocolViewType> = ({
  onCloseModalProtocol,
  protocolDataLists,
  handlePressProtocol,
  selectedProtocolId,
  setLoadingImages,
  refreshList,
  onRefresh,
}) => {
  const styles = useStyle();

  return (
    <View style={styles.container}>
      <View style={appStyles.center}>
        <AppText
          titleWithI18n={"Chọn giao thức"}
          variant={TextVariantKeys.TitleSmall}
          styles={[appStyles.textAlignCenter]}
          textColor={appColors.neutral.black}
        />
      </View>

      <View style={styles.protocolList}>
        <FlatList
          data={protocolDataLists}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?._id.toString()}
          refreshControl={
            refreshList && onRefresh ? (
              <RefreshControl refreshing={refreshList} onRefresh={onRefresh} />
            ) : undefined
          }
          renderItem={({ item }) => {
            const selected = item._id === selectedProtocolId;
            return (
              <ProtocolItem
                item={item}
                selected={selected}
                onPress={handlePressProtocol}
                setLoadingImages={setLoadingImages}
              />
            );
          }}
          ItemSeparatorComponent={AppSeparator}
        />
      </View>
    </View>
  );
};

const useStyle = () =>
  StyleSheet.create({
    closeIconStyle: { position: "absolute", right: 25, top: -5 },
    protocolList: {
      shadowColor: appColors.neutral.n500,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      ...appStyles.mt15,
      backgroundColor: appColors.neutral.white,
      borderRadius: 4,
      borderWidth: 0.6,
      marginBottom: 70,
    },
    container: {
      ...appStyles.pH25,
      ...appStyles.mt10,
      ...appStyles.flex1,
    },
  });

const useAppSeparatorStyle = () =>
  StyleSheet.create({
    separator: {
      height: 0.8,
      backgroundColor: appColors.neutral.white,
    },
  });

export default BottomSheetProtocolView;
