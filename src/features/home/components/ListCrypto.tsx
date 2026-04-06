import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import AppText from "src/components/common/AppText";
import { ArrowForward2SvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import { ListCryptoDataType } from "../home.type";

type ListCryptoType = {
  cryptoDataLists?: ListCryptoDataType[];
  gotoManageCrypto: () => void;
  renderItem: ({
    item,
    index,
  }: {
    item: ListCryptoDataType;
    index: number;
  }) => React.JSX.Element;
};

const ListCrypto: React.FC<ListCryptoType> = ({
  cryptoDataLists,
  gotoManageCrypto,
  renderItem,
}) => {
  const theme: AppThemeType = useAppTheme();
  const styles = useStyles(theme);
  const [widthView, setWidthView] = useState(Utils.screenWidth);
  const [heightView, setHeightView] = useState(Utils.screenHeight);
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setWidthView(width);
    setHeightView(height);
  };
  return (
    <View style={[styles.manageCrypto]}>
      <FlatList
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        data={cryptoDataLists}
        renderItem={renderItem}
        scrollEnabled={false}
        style={styles.bodyContainer}
        ListFooterComponent={
          <Pressable style={styles.button_manage} onPress={gotoManageCrypto}>
            <View style={appStyles.mr5}>
              <AppText
                titleWithI18n={LanguageKey.title_manage_crypto}
                variant={TextVariantKeys.titleSmall}
                textColor={theme.colors.surface_surface_brand}
              />
            </View>
            <ArrowForward2SvgIcon />
          </Pressable>
        }
      />
    </View>
  );
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    manageCrypto: {
      borderRadius: 6,
      flex: 1,
    },
    bodyContainer: {
      borderRadius: 4,
    },
    button_manage: {
      ...appStyles.center,
      ...appStyles.flexRow,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface_surface_high,
    },
    view_content: { position: "absolute", zIndex: 222 },
  });

export default ListCrypto;
