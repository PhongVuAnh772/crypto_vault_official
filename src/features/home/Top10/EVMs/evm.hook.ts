import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingImage } from "src/components/common/AppImage/type";
import AppToastType from "src/core/enum/AppToastType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useSelectedCurrencySetting } from "src/core/redux/slice/account.selector";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getTop10EVMs,
  handleGetTop10EVMs,
  setDataTopEVMs,
} from "../../bottomTab/explore/explore.slice";

const useTop10EVMs = ({ navigation }: RootNavigationType) => {
  const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const top10EVMsData = useAppSelector(getTop10EVMs);
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleFiatConverted = (price: number) => {
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ""} ${Utils.fiatFormat(price * selectedCurrencySetting?.rate)}`;
    return balanceConverted;
  };

  const backAction = () => {
    navigation.goBack();
    setDataTopEVMs(null);
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
  const handleInitData = async () => {
    try {
      await dispatch(
        handleGetTop10EVMs({
          page: 1,
          perPage: 10,
        })
      );
    } catch (error) {
      showError();
      console.log("handleGetTop10EVMs error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshing = async () => {
    try {
      setRefreshing(true);
      await dispatch(
        handleGetTop10EVMs({
          page: 1,
          perPage: 10,
        })
      );
    } catch (error) {
      console.log("🚀 ~ handleRefreshing ~ error:", error);
      showError();
    } finally {
      setRefreshing(false);
    }
  };
  const showError = () => {
    Utils.showToast({
      msg: t(LanguageKey.common_text_error_title),
      type: AppToastType.error,
    });
  };
  useEffect(() => {
    handleInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    top10EVMsData,
    theme,
    setLoadingImages,
    isLoadingImages,
    handleFiatConverted,
    backAction,
    loading,
    handleRefreshing,
    refreshing,
  };
};
export default useTop10EVMs;
