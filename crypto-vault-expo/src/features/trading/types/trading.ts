export type Timeframe = 'Thời gian' | '15p' | '1h' | '4h' | '1n' | 'Nhiều hơn';

export interface PricePoint {
  timestamp: number;
  value: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TradeTick {
  symbol: string;
  price: string;
  time: number;
  market: 'spot' | 'futures';
}

export const TIMEFRAME_MAP: Record<string, number> = {
  'Thời gian': 60000,
  '15p': 15 * 60000,
  '1h': 60 * 60000,
  '4h': 4 * 60 * 60000,
  '1n': 24 * 60 * 60000,
};
