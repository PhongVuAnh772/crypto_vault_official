import { Auction } from '../services/auctionService';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toTimestamp = (value?: string | null): number => {
  if (!value) return NaN;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : NaN;
};

const isValidIsoDate = (value: string) => Number.isFinite(toTimestamp(value));

const getAuctionMetrics = (auction: Auction) => {
  const startPrice = toNumber(auction.start_price);
  const currentPrice = toNumber(auction.current_price);
  const minBidStep = toNumber(auction.min_bid_step);
  const endAt = toTimestamp(auction.end_time);
  const now = Date.now();
  const isExpired = Number.isFinite(endAt) ? endAt <= now : false;
  const minBidAmount = currentPrice > 0 ? currentPrice + minBidStep : startPrice;

  return {
    startPrice,
    currentPrice,
    minBidStep,
    endAt,
    isExpired,
    minBidAmount,
  };
};

const validateBidAmount = (auction: Auction, rawAmount: string) => {
  const amount = toNumber(rawAmount, NaN);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, message: 'Bid amount không hợp lệ' };
  }

  const { isExpired, minBidAmount } = getAuctionMetrics(auction);
  if (isExpired) {
    return { ok: false as const, message: 'Auction đã hết hạn' };
  }
  if (amount < minBidAmount) {
    return { ok: false as const, message: `Bid phải >= ${minBidAmount} TON` };
  }

  return { ok: true as const, amount };
};

const validateCreateAuctionInput = (params: {
  startPrice: string;
  minStep: string;
  endTime: string;
}) => {
  const startPrice = toNumber(params.startPrice, NaN);
  if (!Number.isFinite(startPrice) || startPrice <= 0) {
    return { ok: false as const, message: 'Start price không hợp lệ' };
  }

  const minBidStep = toNumber(params.minStep, NaN);
  if (!Number.isFinite(minBidStep) || minBidStep <= 0) {
    return { ok: false as const, message: 'Minimum bid step không hợp lệ' };
  }

  if (!params.endTime || !isValidIsoDate(params.endTime)) {
    return { ok: false as const, message: 'End time phải là ISO hợp lệ' };
  }

  const endAt = toTimestamp(params.endTime);
  if (endAt <= Date.now()) {
    return { ok: false as const, message: 'End time phải ở tương lai' };
  }

  return {
    ok: true as const,
    startPrice,
    minBidStep,
    endTime: new Date(endAt).toISOString(),
  };
};

const formatDateTime = (value?: string | null) => {
  const time = toTimestamp(value);
  if (!Number.isFinite(time)) return '--';

  return new Date(time).toLocaleString();
};

export const auctionUtils = {
  formatDateTime,
  getAuctionMetrics,
  validateBidAmount,
  validateCreateAuctionInput,
};

