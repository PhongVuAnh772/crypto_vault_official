import axios from "axios";

export const fetchBitcoinChart = async () => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart",
    {
      params: {
        vs_currency: "usd",
        days: 7,
      },
    }
  );
  return response.data.prices;
};
