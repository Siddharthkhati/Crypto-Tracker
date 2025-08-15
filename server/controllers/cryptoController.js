const axios = require("axios");
const Crypto = require("../models/cryptoModel");

const getTopCryptos = async (req, res) => {
  try {
    console.log("Fetching top cryptos from CoinGecko...");
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
        },
        timeout: 10000, // optional: timeout in ms to avoid hanging requests
      }
    );

    console.log("Data fetched successfully. Formatting data...");
    const formattedData = response.data.map((coin) => ({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      priceUSD: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      timestamp: new Date(coin.last_updated),
    }));

    console.log("Clearing old crypto data from DB...");
    await Crypto.deleteMany({});

    console.log("Inserting new crypto data into DB...");
    await Crypto.insertMany(formattedData);

    console.log("Crypto data saved successfully!");
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching or saving crypto data:");

    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
    }

    // Optional: log the full error object for debugging
    console.error(error);

    res.status(500).json({ error: "Failed to fetch or save crypto data" });
  }
};

module.exports = { getTopCryptos };
