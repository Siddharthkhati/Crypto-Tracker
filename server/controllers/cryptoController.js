const axios = require("axios");
const Crypto = require("../models/cryptoModel");

// In-memory cache variables
let lastFetchTime = 0;
let cachedCryptoData = null;
// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

const getTopCryptos = async (req, res) => {
  try {
    const currentTime = Date.now();

    // Check if cached data exists and is still fresh
    if (cachedCryptoData && (currentTime - lastFetchTime < CACHE_DURATION)) {
      console.log("Serving cached data.");
      return res.status(200).json(cachedCryptoData);
    }

    // If cache is expired or empty, fetch new data from CoinGecko
    console.log("Fetching new data from CoinGecko...");
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
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
      timestamp: new Date(),
    }));

    // Update the in-memory cache and timestamp
    cachedCryptoData = formattedData;
    lastFetchTime = currentTime;

    // Delete existing data and insert the new data into the database
    await Crypto.deleteMany({});
    await Crypto.insertMany(formattedData);

    // Send the fresh data to the client
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