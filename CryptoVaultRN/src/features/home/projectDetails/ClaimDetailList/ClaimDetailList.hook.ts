import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeKey from "src/core/enum/ThemeKey";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppSelector } from "src/core/redux/hooks";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getDataClaimable,
  getDataGetOwned,
  getDataPriceFeed,
  getStatusLoadingYouGot,
} from "../../bottomTab/explore/explore.slice";
import { OwnedNFTType } from "../../bottomTab/explore/explore.type";
import { NFTItem } from "./ClaimDetailList.type";

export const useClaimDetailList = ({
  navigation,
  route,
}: RootNavigationType) => {
  const { data } = route.params;
  const theme = useAppTheme();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const { t } = useTranslation();
  const dataClaimable = useAppSelector(getDataClaimable);
  const dataGetOwned = useAppSelector(getDataGetOwned);
  const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
  const [loading] = useState(false);
  const [totalClaim, setTotalClaim] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const dataPriceFeed = useAppSelector(getDataPriceFeed) as OwnedNFTType[];
  const [filteredData, setFilteredData] = useState<OwnedNFTType[]>();
  const handleSearchChange = (text: string) => {
    setSearchValue(text);
  };

  const cleanSearch = () => {
    setSearchValue("");
  };
  const backAction = () => {
    navigation.goBack();
    navigation.navigate(t(LanguageKey.transaction_history_project_details));
  };

  const commonBackAction = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const filteringData = data.filter((item: NFTItem) => {
      return item.nftId.toLowerCase().includes(searchValue.toLowerCase());
    });

    setFilteredData(filteringData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return {
    theme,
    backAction,
    lightMode,
    dataClaimable,
    dataGetOwned,
    statusLoadingYouGot,
    commonBackAction,
    loading,
    totalClaim,
    setTotalClaim,
    t,
    searchValue,
    handleSearchChange,
    cleanSearch,
    dataPriceFeed,
    filteredData,
    data,
  };
};
