const express = require("express");
const router = express.Router();
const { getInventory } = require("../controllers/sysController");

router.get("/inventory", getInventory);

module.exports = router;
