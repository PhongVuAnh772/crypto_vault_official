import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CONFIG } from '../constants/config';

const SOCKET_URL = CONFIG.WS_BASE_URL;

export const usePriceSocket = (defaultSymbol: string = 'BTCUSDT', market: 'spot' | 'futures' = 'futures', token?: string) => {
  const [price, setPrice] = useState<string | null>(null);
  const [prevPrice, setPrevPrice] = useState<string | null>(null);
  const [orderBook, setOrderBook] = useState<{ bids: string[][], asks: string[][] }>({ bids: [], asks: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
    
    const finalUrl = `${SOCKET_URL}?symbol=${defaultSymbol}&market=${market}`;
    console.log(`[Socket] Connecting to ${finalUrl}...`);
    ws.current = new WebSocket(finalUrl);

    ws.current.onopen = () => {
      console.log(`[Socket] Connected. Sending subscribe protocol for ${defaultSymbol}...`);
      setIsConnected(true);
      
      // Gửi protocol đăng ký
      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        symbol: defaultSymbol,
        market: market,
        token,
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        // Log mọi thứ cho tới khi chúng ta biết lỗi ở đâu
        console.log(`[Socket Raw] Received: ${message.event || message.type || 'unknown'} for ${message.symbol || 'none'}`);
        
        // Initial price cache from backend
        if (message.type === 'initial_prices') {
            const cached = message.data.find((p: any) => p.symbol.toUpperCase() === defaultSymbol.toUpperCase());
            if (cached) setPrice(cached.price);
        }

        // Real-time updates
        if (message.event === 'priceChange') {
          // Bỏ qua lọc market/symbol ở Log để test kết nối thô
          if (message.symbol.toUpperCase() === defaultSymbol.toUpperCase()) {
            console.log(`[Socket Update] Found price for ${defaultSymbol}: ${message.price}`);
            setPrice((currentPrice) => {
              if (currentPrice !== message.price) {
                setPrevPrice(currentPrice);
              }
              return message.price;
            });
          }
        }

        if (message.event === 'depthUpdate') {
          if (message.symbol.toUpperCase() === defaultSymbol.toUpperCase()) {
            setOrderBook({
              bids: message.bids,
              asks: message.asks
            });
          }
        }
      } catch (e) {
        console.error('[Socket Error]', e);
      }
    };

    ws.current.onerror = (e) => {
      console.error('[Socket] Error', e);
    };

    ws.current.onclose = (e) => {
      setIsConnected(false);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(connect, 3000);
    };
  }, [defaultSymbol, market, token]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  const priceColor = useMemo(() => {
    if (!price || !prevPrice) return '#1E2329';
    return parseFloat(price) >= parseFloat(prevPrice) ? '#2EBD63' : '#F64646';
  }, [price, prevPrice]);

  return { price, priceColor, isConnected, orderBook, lastMessage };
};
