import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import AppToastType from "src/core/enum/AppToastType";
import { Feature } from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import ThemeKey from "src/core/enum/ThemeKey";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useProtocolSelected } from "src/core/redux/slice/account.selector";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import createContextError from "src/core/services/ContextError";
import Utils from "src/core/utils/commonUtils";
import AppErrorUtils from "src/core/utils/errorUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getDataClaimable,
  getDataGetOwned,
  getDataPageUsingPriceFeed,
  getDataPerPage,
  getDataPriceFeed,
  getStatusLoadingYouGot,
  handleGetPriceFeed,
  handleGetPriceFeedFirst,
  setPageUsingPriceFeed,
} from "../../bottomTab/explore/explore.slice";
import { OwnedNFTType } from "../../bottomTab/explore/explore.type";

export const useConfirmClaimToken = ({
  navigation,
  route,
}: RootNavigationType) => {
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const { data } = route.params;
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const pageUsingPriceFeed = useAppSelector(getDataPageUsingPriceFeed);
  const perPagePriceFeed = useAppSelector(getDataPerPage);
  const { t } = useTranslation();
  const dataClaimable = useAppSelector(getDataClaimable);
  const dataGetOwned = useAppSelector(getDataGetOwned);
  const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
  const [loading, setLoading] = useState(true);
  const [hasCalledLoadMore, setHasCalledLoadMore] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dataPriceFeed = useAppSelector(getDataPriceFeed) as OwnedNFTType[];
  const [enableScrollLoadMore, setEnableScrollLoadMore] = useState(false);
  const [filteredData] = useState<OwnedNFTType[]>();
  const currentProtocol = useProtocolSelected();

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

  const handleOnEndReached = async () => {
    if (!enableScrollLoadMore) {
      setEnableScrollLoadMore(false);
      return;
    }
    setEnableScrollLoadMore(true);

    try {
      const resPaging = await dispatch(
        handleGetPriceFeed({
          page: pageUsingPriceFeed,
          perPage: perPagePriceFeed,
          contractAddress: data?.contractAddress,
          claimableTokenProject: data?.claimableTokenProject,
        })
      );
      if (handleGetPriceFeed.fulfilled.match(resPaging)) {
        dispatch(setPageUsingPriceFeed(pageUsingPriceFeed + 1));
        setHasCalledLoadMore(true);
        setEnableScrollLoadMore(false);
      } else {
        setHasCalledLoadMore(false);
      }
    } catch (error) {
      console.log("error", error);
      setHasCalledLoadMore(false);
      setEnableScrollLoadMore(false);
    }
  };

  const contextSupportClaimTokenError = (
    functionError: string,
    reason: string,
    id?: number
  ) => {
    const error = createContextError({
      feature: Feature.ClaimToken,
      fileError: `PriceFeedList.hook.ts (tabs)`,
      functionError: functionError,
      reason: reason,
      protocol: currentProtocol?.symbol ?? ProtocolType.All,
      id: id,
    });
    // Auto log => push error to server
    AppErrorUtils.sendContactWhenError(dispatch, error);
    return error;
  };

  const handleScrollLoadMore = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const distanceToEnd =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceToEnd < -30 && !hasCalledLoadMore) {
      handleOnEndReached();
    } else if (distanceToEnd >= -30 && hasCalledLoadMore) {
      setHasCalledLoadMore(false);
    }
  };

  useEffect(() => {
    const handleGetDataSearching = async () => {
      try {
        if (searchValue === "") {
          await dispatch(
            handleGetPriceFeedFirst({
              contractAddress: data?.contractAddress,
              claimableTokenProject: dataClaimable?.project?._id,
              page: 1,
              perPage: 10,
            })
          );
        } else {
          await dispatch(
            handleGetPriceFeedFirst({
              contractAddress: data?.contractAddress,
              claimableTokenProject: data?.claimableTokenProject,
              nftId: searchValue,
            })
          );
        }
      } catch (error: any) {
        console.log("error getData", error);
        contextSupportClaimTokenError(`handleGetDataSearching`, error, 163);
        Utils.showToast({
          msg: t(LanguageKey.common_server_busy),
          type: AppToastType.error,
        });
      }
    };
    handleGetDataSearching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    const getData = async () => {
      try {
        await dispatch(
          handleGetPriceFeedFirst({
            page: 1,
            perPage: 10,
            contractAddress: data?.contractAddress,
            claimableTokenProject: data?.claimableTokenProject,
          })
        );
      } catch (error: any) {
        console.log("error getData", error);
        navigation.goBack();
        contextSupportClaimTokenError(`getData`, error, 176);
        Utils.showToast({
          msg: t(LanguageKey.common_server_busy),
          type: AppToastType.error,
        });
      }

      setLoading(false);
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    theme,
    backAction,
    lightMode,
    dataClaimable,
    dataGetOwned,
    statusLoadingYouGot,
    commonBackAction,
    loading,
    t,
    searchValue,
    handleSearchChange,
    cleanSearch,
    dataPriceFeed,
    filteredData,
    handleOnEndReached,
    handleScrollLoadMore,
    enableScrollLoadMore,
    setEnableScrollLoadMore,
    insets,
  };
};
