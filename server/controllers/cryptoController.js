const axios = require("axios");
const Crypto = require("../models/cryptoModel");

const getTopCryptos = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
        }
      }
    );

    const data = response.data;

    const formattedData = data.map((coin) => ({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      priceUSD: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      timestamp: new Date(coin.last_updated),
    }));

    // Overwrite existing collection
    await Crypto.deleteMany({});
    await Crypto.insertMany(formattedData);

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching or saving crypto data:", error.message);
    res.status(500).json({ error: "Failed to fetch or save crypto data" });
  }
};

module.exports = { getTopCryptos };