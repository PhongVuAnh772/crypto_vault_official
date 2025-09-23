import { useTranslation } from "react-i18next";
import { EdgeInsets } from "react-native-safe-area-context";
import LanguageType from "src/core/enum/LanguageType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  changeLanguageType,
  getLanguageType,
} from "src/core/redux/slice/app.slice";
import { AppThemeType } from "src/core/type/ThemeType";
import { TypeLanguage } from "./changeLanguage.type";

const useChangeLanguage = () => {
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const languageType = useAppSelector(getLanguageType) ?? "";
  const listLanguage: TypeLanguage[] = [
    { language: "English", key: LanguageType.en },
    {
      language: "日本語",
      key: LanguageType.jp,
    },
  ];
  const onChangeLanguage = (key: LanguageType) => {
    dispatch(changeLanguageType(key));
    i18n.changeLanguage(key);
  };
  const theme: AppThemeType = useAppTheme();

  return {
    theme,
    insets,
    listLanguage,
    languageType,
    onChangeLanguage,
  };
};
export default useChangeLanguage;
