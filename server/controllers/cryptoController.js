const axios = require("axios");
const Crypto = require("../models/cryptoModel");

const getTopCryptos = async (req, res) => {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;

    if (!apiKey) {
      console.error("CoinGecko API key is not set!");
      return res.status(500).json({ error: "API key is missing" });
    }

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
        },
        headers: {
          "x-cg-demo-api-key": apiKey,
          "User-Agent": "CryptoTracker/1.0 (https://crypto-tracker-rosy-psi.vercel.app)",
        },
      }
    );

    const formattedData = response.data.map((coin) => ({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      priceUSD: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      timestamp: new Date(coin.last_updated),
    }));

    await Crypto.deleteMany({});
    await Crypto.insertMany(formattedData);

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching or saving crypto data:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }

    res.status(500).json({ error: "Failed to fetch or save crypto data" });
  }
};

module.exports = { getTopCryptos };