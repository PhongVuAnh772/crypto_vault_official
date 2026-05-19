import { useState, useEffect } from 'react';
import { useAppSelector } from 'src/core/redux/hooks';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import { sendGet, sendPost } from 'src/core/network/requests';

type Benefit = {
  id: string;
  type: string;
  value: number;
  status: string;
  expires_at: string;
};

export const useAds = () => {
  const userId = useAppSelector(getAccountId);
  const [activeBenefit, setActiveBenefit] = useState<Benefit | null>(null);
  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  const fetchActiveBenefit = async () => {
    if (!userId || !isUuid(userId)) {
      setActiveBenefit(null);
      return;
    }
    try {
      const res = await sendGet<{ hasBenefit: boolean; benefit: Benefit }>({
        endPoint: `ads/benefits/active?userId=${userId}`,
      });
      if (res.isSuccess && res.data?.hasBenefit) {
        setActiveBenefit(res.data.benefit);
      } else {
        setActiveBenefit(null);
      }
    } catch (err) {
      console.log('Error fetching active benefit:', err);
    }
  };

  const claimRewardedBenefit = async () => {
    if (!userId || !isUuid(userId)) return false;
    try {
      const externalId = `rewarded-${userId}-${Date.now()}`;
      const res = await sendPost<{ success: boolean }>({
        endPoint: 'ads/reward/callback',
        body: {
          userId,
          type: 'REWARDED_AD',
          rewardValue: 0.3,
          externalId,
        },
      });
      if (res.isSuccess) {
        await fetchActiveBenefit();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchActiveBenefit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    activeBenefit,
    refreshBenefit: fetchActiveBenefit,
    claimRewardedBenefit,
  };
};
