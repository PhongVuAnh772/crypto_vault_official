import { useEffect, useState } from "react";

export interface ChartPoint {
  x: string; // formatted date
  y: number; // price
}

export default function useCoinChart(coinId: string = "ethereum") {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCoinData = async (retryCount: number = 0): Promise<void> => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
      );

      if (res.status === 200) {
        const json = await res.json();
        const prices: [number, number][] = json.prices || [];

        const formatted: ChartPoint[] = prices.map((p) => ({
          x: new Date(p[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          y: p[1],
        }));

        setData(formatted);
        setLoading(false);
      } else if (res.status === 429) {
        console.warn("429 Too Many Requests - retry sau 1 phút...");
        setTimeout(() => fetchCoinData(retryCount + 1), 60000);
      } else {
        throw new Error("API Error: " + res.status);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, [coinId]);

  return { data, loading };
}
