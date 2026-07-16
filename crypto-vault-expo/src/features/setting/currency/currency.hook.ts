import { useEffect, useState } from "react";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useSelectedCurrencySetting } from "src/core/redux/slice/account.selector";
import {
  selectorSettingCurrency,
  setSelectedCurrencySetting,
} from "src/core/redux/slice/app.slice";
import { SettingCurrencyType } from "src/core/redux/slice/type";
import GlobalUtils from "src/core/utils/globalUtils";
import useStyles from "./currency.styles";

const useCurrency = () => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();
  const settingCurrency = useAppSelector(selectorSettingCurrency);
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const [searchValue, setSearchValue] = useState<string>();
  const [searchData, setSearchData] = useState<
    SettingCurrencyType[] | undefined
  >(settingCurrency);

  const isEmptyData = searchData?.length === 0;

  const onChangeSearchValue = (value: string) => {
    if (value) {
      const lowerCaseValue = value.toLocaleLowerCase();
      const newData = searchData?.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(lowerCaseValue) ||
          e.symbol.toLocaleLowerCase().includes(lowerCaseValue)
      );
      setSearchData(newData);
    } else {
      setSearchData(settingCurrency);
    }
    setSearchValue(value);
  };

  useEffect(() => {
    const selectedData = searchData?.find(
      (e) => e.name === selectedCurrencySetting.name
    );
    const otherData = searchData?.filter(
      (e) => e.name !== selectedCurrencySetting.name
    );
    if (selectedData && otherData) {
      otherData.unshift(selectedData);
      setSearchData([...otherData]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectItem = (item: SettingCurrencyType) => {
    dispatch(setSelectedCurrencySetting(item));
  };

  return {
    theme,
    styles,
    searchData,
    onSelectItem,
    selectedCurrencySetting,
    searchValue,
    onChangeSearchValue,
    isEmptyData,
  };
};

export default useCurrency;
