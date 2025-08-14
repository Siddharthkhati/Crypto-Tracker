const express = require("express");
const { getCryptoHistory } = require("../controllers/cryptoHistoryController");
const router = express.Router();

router.get("/:coinId", getCryptoHistory);

module.exports = router;
