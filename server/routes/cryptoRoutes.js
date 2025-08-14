const express = require("express");
const { getTopCryptos } = require("../controllers/cryptoController");
const router = express.Router();

router.get("/", getTopCryptos);

module.exports = router;
