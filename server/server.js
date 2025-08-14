const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const cryptoRoutes = require("./routes/cryptoRoutes");
const historyRoutes = require("./routes/historyRoutes");
const { saveCryptoHistory } = require("./controllers/cryptoHistoryController");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/coins", cryptoRoutes);
app.use("/api/history", historyRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Cron job: runs every hour at 0 minutes
cron.schedule("0 * * * *", async () => {
  console.log("Cron Job: Fetching top 10 cryptocurrencies for history...");
  await saveCryptoHistory(); // append to history
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));