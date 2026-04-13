import { useState, useEffect } from 'react';
import { useAppSelector } from 'src/core/redux/hooks';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import { sendGet } from 'src/core/network/requests';

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

  const fetchActiveBenefit = async () => {
    if (!userId) return;
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

  useEffect(() => {
    fetchActiveBenefit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    activeBenefit,
    refreshBenefit: fetchActiveBenefit,
  };
};
