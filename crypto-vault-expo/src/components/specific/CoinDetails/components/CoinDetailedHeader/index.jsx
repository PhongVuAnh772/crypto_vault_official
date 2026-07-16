import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { useWatchlist } from "../../Contexts/WatchlistContext";
import AppText from "components/AppText";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appColors from "src/core/constants/AppColors";
import Feather from "@expo/vector-icons/Feather";
import * as DropdownMenu from "zeego/dropdown-menu";

const CoinDetailedHeader = (props) => {
  const { coinId, image, symbol, name, networkName } = props;
  const navigation = useNavigation();
  const { watchlistCoinIds, storeWatchlistCoinId, removeWatchlistCoinId } =
    useWatchlist();

  const checkIfCoinIsWatchlisted = () =>
    watchlistCoinIds.some((coinIdValue) => coinIdValue === coinId);

  const handleWatchlistCoin = () => {
    if (checkIfCoinIsWatchlisted()) {
      return removeWatchlistCoinId(coinId);
    }
    return storeWatchlistCoinId(coinId);
  };

  return (
    <View style={styles.headerContainer}>
      <Ionicons
        name="chevron-back-sharp"
        size={24}
        color="black"
        onPress={() => navigation.goBack()}
      />
      <View style={styles.tickerContainer}>
        <AppText
          title={name || symbol || "Coin"}
          variant={TextVariantKeys.TitleMedium}
          textColor={appColors.neutral.black}
          style={{ fontWeight: "700" }}
        />
        <View style={{ height: 4 }} />
        <AppText
          title={networkName || "Network"}
          variant={TextVariantKeys.bodyRSmall}
          textColor={"rgb(153, 157, 166)"}
        />
      </View>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Feather name="more-vertical" size={24} color="black" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          {/* Nhãn (optional) */}
          <DropdownMenu.Label>Options</DropdownMenu.Label>

          <DropdownMenu.Item key="watchlist" onSelect={handleWatchlistCoin}>
            <DropdownMenu.ItemTitle>
              {checkIfCoinIsWatchlisted()
                ? "Remove from Watchlist"
                : "Add to Watchlist"}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>

          {/* Group */}
          <DropdownMenu.Group>
            <DropdownMenu.Item key="info" onSelect={() => console.log("Info")}>
              <DropdownMenu.ItemTitle>Coin Info</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          {/* Checkbox */}
          <DropdownMenu.CheckboxItem
            key="alerts"
            checked={true}
            onCheckedChange={(val) => console.log("Alerts:", val)}
          >
            <DropdownMenu.ItemIndicator />
            <DropdownMenu.ItemTitle>Enable Alerts</DropdownMenu.ItemTitle>
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Sub key="more_sub">
            <DropdownMenu.SubTrigger key="more_trigger">
              <DropdownMenu.ItemTitle>More</DropdownMenu.ItemTitle>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent key="more_content">
              <DropdownMenu.Item key="share">
                <DropdownMenu.ItemTitle>Share</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator />
          <DropdownMenu.Arrow />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  );
};

export default CoinDetailedHeader;
