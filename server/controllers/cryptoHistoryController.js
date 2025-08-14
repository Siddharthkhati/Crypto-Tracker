const axios = require("axios");
const CryptoHistory = require("../models/cryptoHistoryModel");

const saveCryptoHistory = async () => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1
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
      timestamp: new Date(coin.last_updated)
    }));

    // Append to history collection
    await CryptoHistory.insertMany(formattedData);

    console.log("Top 10 crypto data appended to history collection.");
  } catch (error) {
    console.error("Error fetching or saving crypto history:", error.message);
  }
};

// Fetch history for a specific coin
const getCryptoHistory = async (req, res) => {
  const { coinId } = req.params;

  try {
    // Find all records for this coin, sorted by timestamp ascending
    const history = await CryptoHistory.find({ coinId }).sort({ timestamp: 1 });

    if (!history || history.length === 0) {
      return res.status(404).json({ message: "No history found for this coin" });
    }

    const formatted = history.map((item) => ({
      priceUSD: item.priceUSD,
      timestamp: item.timestamp
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching crypto history:", error.message);
    res.status(500).json({ error: "Failed to fetch crypto history" });
  }
};

module.exports = { saveCryptoHistory, getCryptoHistory };
