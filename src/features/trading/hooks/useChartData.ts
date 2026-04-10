import { useState, useEffect, useMemo, useCallback } from 'react';
import { PricePoint, Candle, TIMEFRAME_MAP, Timeframe } from '../types/trading';

interface UseChartDataProps {
  price: string | null;
  activeTimeframe: string;
}

export const useChartData = ({ price, activeTimeframe }: UseChartDataProps) => {
  const [viewableCount, setViewableCount] = useState(40);
  
  // Lịch sử đồ thị dạng đường (Line)
  const [lineHistory, setLineHistory] = useState<PricePoint[]>(() =>
    Array.from({ length: 120 }, (_, i) => ({
      timestamp: Date.now() - (120 - i) * 5000,
      value: 68150 + Math.random() * 100,
    }))
  );

  // Lịch sử đồ thị nến (Candlestick)
  const [candleHistory, setCandleHistory] = useState<Candle[]>(() =>
    Array.from({ length: 100 }, (_, i) => {
      const base = 68150 + Math.random() * 100;
      return {
        timestamp: Math.floor(Date.now() / 60000) * 60000 - (100 - i) * 60000,
        open: base, high: base + 20, low: base - 20, close: base + (Math.random() > 0.5 ? 10 : -10)
      };
    })
  );

  // Khởi tạo nến khi đổi khung giờ
  const reinitializeCandles = useCallback((tf: string, currentPrice: string | null) => {
    const interval = TIMEFRAME_MAP[tf] || 60000;
    const base = parseFloat(currentPrice || '68150');
    setCandleHistory(Array.from({ length: 100 }, (_, i) => {
      const startOfTime = Math.floor(Date.now() / interval) * interval;
      return {
        timestamp: startOfTime - (100 - i) * interval,
        open: base, high: base, low: base, close: base
      };
    }));
  }, []);

  const [isInitialized, setIsInitialized] = useState(false);

  // Logic cập nhật thời gian thực (Aggregation)
  useEffect(() => {
    if (!price) return;
    const newPrice = parseFloat(price);
    const now = Date.now();
    const interval = TIMEFRAME_MAP[activeTimeframe] || 60000;

    // Normalization logic: Once we get real price, re-seed the history with a realistic Random Walk!
    if (!isInitialized && Math.abs(newPrice - lineHistory[lineHistory.length-1].value) > 20) {
      let runPrice = newPrice;
      const walkedItems = Array.from({ length: 120 }).map((_, i) => {
        const volatility = newPrice * 0.001; // 0.1% biến động
        runPrice = runPrice + (Math.random() * volatility - volatility/2);
        return runPrice;
      }).reverse(); // Tạo lùi về quá khứ nhưng mảng lưu theo thứ tự tăng dần thời gian

      setLineHistory(Array.from({ length: 120 }, (_, i) => ({
        timestamp: now - (120 - i) * 5000,
        value: walkedItems[i],
      })));

      let candleRun = newPrice;
      const candleWalks = Array.from({ length: 100 }).map(() => {
         const volatility = newPrice * 0.002;
         candleRun = candleRun + (Math.random() * volatility - volatility/2);
         return candleRun;
      }).reverse();

      setCandleHistory(Array.from({ length: 100 }, (_, i) => {
        const startOfTime = Math.floor(now / interval) * interval;
        const base = candleWalks[i];
        const v = newPrice * 0.0015;
        const sign = Math.random() > 0.5 ? 1 : -1;
        const open = base;
        const close = base + (Math.random() * v * sign);
        return {
          timestamp: startOfTime - (100 - i) * interval,
          open: open, 
          close: close,
          high: Math.max(open, close) + Math.random() * (v * 0.5), 
          low: Math.min(open, close) - Math.random() * (v * 0.5)
        };
      }));
      setIsInitialized(true);
      return;
    }

    // 1. Cập nhật Line Chart (Dịch chuyển lịch sử)
    setLineHistory(prev => [...prev.slice(1), { timestamp: now, value: newPrice }]);

    // 2. Cập nhật Candle Chart (Gộp hoặc thêm mới)
    setCandleHistory(prev => {
        const bucket = Math.floor(now / interval) * interval;
        const newData = [...prev];
        const lastCandle = newData[newData.length - 1];

        if (lastCandle && lastCandle.timestamp === bucket) {
          newData[newData.length - 1] = {
            ...lastCandle,
            close: newPrice,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
          };
        } else {
          newData.shift();
          newData.push({ timestamp: bucket, open: lastCandle?.close || newPrice, high: newPrice, low: newPrice, close: newPrice });
        }
        return newData;
    });
  }, [price, activeTimeframe, isInitialized]);

  // Cắt bớt mảng tùy theo mức Zoon (viewableCount)
  const visibleLineData = useMemo(() => lineHistory.slice(-viewableCount), [lineHistory, viewableCount]);
  const visibleCandleData = useMemo(() => candleHistory.slice(-viewableCount), [candleHistory, viewableCount]);

  // Hàm zoon-in / zoom-out
  const handleZoom = useCallback((scale: number) => {
    if (scale > 1.05) setViewableCount(prev => Math.min(prev + 1, 120));
    else if (scale < 0.95) setViewableCount(prev => Math.max(prev - 1, 10));
  }, []);

  return {
    visibleLineData,
    visibleCandleData,
    viewableCount,
    handleZoom,
    reinitializeCandles
  };
};
