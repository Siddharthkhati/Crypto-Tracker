const mongoose = require("mongoose");

const cryptoHistorySchema = new mongoose.Schema({
  coinId: String,
  name: String,
  symbol: String,
  priceUSD: Number,
  marketCap: Number,
  change24h: Number,
  timestamp: Date
});

module.exports = mongoose.model("CryptoHistory", cryptoHistorySchema);
