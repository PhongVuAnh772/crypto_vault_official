import { useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppSelector } from "src/core/redux/hooks";
import { getStakingHistory } from "src/core/redux/slice/staking/staking.slice";
import { StakingHistoryItem } from "src/core/redux/slice/staking/staking.type";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { StakingPool } from "../types";
import { StakingPoolDetailProp } from "./stakingPoolDetail.type";

const useStakingPoolDetail = ({ navigation }: RootNavigationType) => {
  const insets = useAppSafeAreaInsets();
  const stakingPoolData: StakingPool = useRoute<StakingPoolDetailProp>().params;
  const listStakingHistory = useAppSelector(getStakingHistory);

  const handleNavigateToLock = () => {
    navigation.navigate(HomeStackScreenKey.LockScreen, stakingPoolData);
  };
  const handleNavigateToStakingDetail = (item: StakingHistoryItem) => {
    navigation.navigate(HomeStackScreenKey.StakingDetail, item);
  };
  const convertList = useCallback(() => {
    if (!listStakingHistory) {
      return [];
    }
    return listStakingHistory.filter(
      (item) => item.adminAddress === stakingPoolData.adminAddress
    );
  }, [listStakingHistory, stakingPoolData.adminAddress]);

  const calculateTotalLockAmount = (data: StakingHistoryItem[]) => {
    return data.reduce((total, item) => {
      const [amountLocked] = item.lockAmount.split(" ");
      const convertedNumber = amountLocked.replaceAll(",", "");
      const amount = Number(convertedNumber);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };
  const getTotal = useCallback(() => {
    return calculateTotalLockAmount(convertList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStakingHistory]);

  const totalMyStaking = getTotal();
  const showMyStaking = convertList().length;
  const listMyStaking = convertList();
  const lockPeriodLength = stakingPoolData.lockPeriod.length;
  const lockAPYShow = `${stakingPoolData.lockPeriod[0].apr}% - ${stakingPoolData.lockPeriod[lockPeriodLength - 1].apr}%`;

  return {
    handleNavigateToLock,
    handleNavigateToStakingDetail,
    stakingPoolData,
    totalMyStaking,
    showMyStaking,
    listMyStaking,
    insets,
    lockAPYShow,
  };
};
export default useStakingPoolDetail;
