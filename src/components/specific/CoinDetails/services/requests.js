import axios from "axios";

// Tạo axios instance chung
const coinGeckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  headers: {
    Accept: "application/json",
    "User-Agent": "my-app",
  },
  timeout: 10000,
});

const validOHLCDays = [1, 7, 14, 30, 90, 180, 365, "max"];

export const getDetailedCoinData = async (coinId) => {
  if (!coinId) throw new Error("coinId is required");
  try {
    const res = await coinGeckoAPI.get(
      `/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    return res.data;
  } catch (e) {
    console.error(
      "getDetailedCoinData error:",
      e.response?.status,
      e.response?.data
    );
  }
};

export const getCoinMarketChart = async (coinId, selectedRange) => {
  if (!coinId) throw new Error("coinId is required");
  try {
    const res = await coinGeckoAPI.get(
      `/coins/${coinId}/market_chart?vs_currency=usd&days=${selectedRange}`
    );
    return res.data;
  } catch (e) {
    console.error(
      "getCoinMarketChart error:",
      e.response?.status,
      e.response?.data
    );
  }
};

export const getCandleChartData = async (coinId, days = 1) => {
  if (!coinId) throw new Error("coinId is required");
  if (!validOHLCDays.includes(days)) days = 1;
  try {
    const res = await coinGeckoAPI.get(
      `/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );
    return res.data;
  } catch (e) {
    console.error(
      "getCandleChartData error:",
      e.response?.status,
      e.response?.data
    );
  }
};

export const getMarketData = async (pageNumber = 1) => {
  try {
    const res = await coinGeckoAPI.get(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${pageNumber}&sparkline=false&price_change_percentage=24h`
    );
    return res.data;
  } catch (e) {
    console.error("getMarketData error:", e.response?.status, e.response?.data);
  }
};

export const getWatchlistedCoins = async (pageNumber = 1, coinIds) => {
  if (!coinIds) throw new Error("coinIds is required");
  try {
    const res = await coinGeckoAPI.get(
      `/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=${pageNumber}&sparkline=false&price_change_percentage=24h`
    );
    return res.data;
  } catch (e) {
    console.error(
      "getWatchlistedCoins error:",
      e.response?.status,
      e.response?.data
    );
  }
};

export const getAllCoins = async () => {
  try {
    const res = await coinGeckoAPI.get(`/coins/list?include_platform=false`);
    return res.data;
  } catch (e) {
    console.error("getAllCoins error:", e.response?.status, e.response?.data);
  }
};

export const getGlobalData = async () => {
  try {
    const res = await coinGeckoAPI.get(`/global`);
    return res.data.data;
  } catch (e) {
    console.error("getGlobalData error:", e.response?.status, e.response?.data);
  }
};
