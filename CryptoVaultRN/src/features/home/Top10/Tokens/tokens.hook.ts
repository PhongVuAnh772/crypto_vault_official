import { useEffect, useState } from "react";
import { LoadingImage } from "src/components/common/AppImage/type";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useSelectedCurrencySetting } from "src/core/redux/slice/account.selector";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getTop10Tokens,
  handleGetTop10Tokens,
  setDataTopTokens,
} from "../../bottomTab/explore/explore.slice";

const useTop10Tokens = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const theme: AppThemeType = useAppTheme();
  const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
  const top10TokensData = useAppSelector(getTop10Tokens);
  const selectedCurrencySetting = useSelectedCurrencySetting();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const handleFiatConverted = (price: number) => {
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ""} ${Utils.fiatFormat(price * selectedCurrencySetting?.rate)}`;
    return balanceConverted;
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
  const backAction = () => {
    navigation.goBack();
    setDataTopTokens(null);
  };
  useEffect(() => {
    const fetchTopTokens = async () => {
      try {
        await dispatch(
          handleGetTop10Tokens({
            page: 1,
            perPage: 10,
          })
        );
      } catch (error) {
        console.log("fetch useTop10Tokens failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTokens();

    return () => {
      setDataTopTokens(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefreshing = () => {
    try {
      setRefreshing(true);
      dispatch(
        handleGetTop10Tokens({
          page: 1,
          perPage: 10,
        })
      ).unwrap();
      setRefreshing(false);
    } catch (error) {
      console.log("handleRefreshing failed", error);
      setRefreshing(false);
    }
  };
  return {
    theme,
    top10TokensData,
    setLoadingImages,
    isLoadingImages,
    handleFiatConverted,
    loading,
    refreshing,
    handleRefreshing,
    backAction,
  };
};
export default useTop10Tokens;
