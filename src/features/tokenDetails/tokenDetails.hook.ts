import { useEffect, useState } from 'react';

type ChartPoint = {
  x: number;
  y: number;
};

const useCoinChart = (_coinId: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const now = Date.now();
    const seed = Array.from({ length: 24 }).map((_, index) => ({
      x: now - (23 - index) * 60 * 60 * 1000,
      y: 1000 + Math.sin(index / 3) * 40 + index * 1.5,
    }));
    setData(seed);
    setLoading(false);
  }, []);

  return { loading, data };
};

export default useCoinChart;
