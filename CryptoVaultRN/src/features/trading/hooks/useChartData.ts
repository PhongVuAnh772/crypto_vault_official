import { useState, useEffect, useMemo, useCallback } from 'react';
import { PricePoint, Candle, TIMEFRAME_MAP, Timeframe } from '../types/trading';

interface UseChartDataProps {
  price: string | null;
  activeTimeframe: string;
}

export const useChartData = ({ price, activeTimeframe }: UseChartDataProps) => {
  const [viewableCount, setViewableCount] = useState(40);
  
  const [lineHistory, setLineHistory] = useState<PricePoint[]>([]);
  const [candleHistory, setCandleHistory] = useState<Candle[]>([]);

  // Khởi tạo nến khi đổi khung giờ
  const reinitializeCandles = useCallback((tf: string, currentPrice: string | null) => {
    if (!currentPrice) {
      setCandleHistory([]);
      return;
    }
    const interval = TIMEFRAME_MAP[tf] || 60000;
    const base = parseFloat(currentPrice);
    const bucket = Math.floor(Date.now() / interval) * interval;
    setCandleHistory([{ timestamp: bucket, open: base, high: base, low: base, close: base }]);
  }, []);

  // Logic cập nhật thời gian thực (Aggregation)
  useEffect(() => {
    if (!price) return;
    const newPrice = parseFloat(price);
    const now = Date.now();
    const interval = TIMEFRAME_MAP[activeTimeframe] || 60000;

    setLineHistory(prev => [...prev.slice(-119), { timestamp: now, value: newPrice }]);

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
          if (newData.length >= 120) newData.shift();
          newData.push({ timestamp: bucket, open: lastCandle?.close || newPrice, high: newPrice, low: newPrice, close: newPrice });
        }
        return newData;
    });
  }, [price, activeTimeframe]);

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
