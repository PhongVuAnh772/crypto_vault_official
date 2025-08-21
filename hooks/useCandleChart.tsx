// hooks/useBinanceCandles.ts
import { useEffect, useRef, useState } from "react";

type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function useBinanceCandles(interval: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const streamUrl = `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`;
    wsRef.current = new WebSocket(streamUrl);

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const k = message.k;
      const newCandle: Candle = {
        timestamp: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      };

      setCandles((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.timestamp === newCandle.timestamp) {
          return [...prev.slice(0, -1), newCandle];
        } else {
          return [...prev, newCandle].slice(-50);
        }
      });
    };

    return () => {
      wsRef.current?.close();
    };
  }, [interval]);

  return candles;
}
