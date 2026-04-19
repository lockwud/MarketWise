const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  getLatestPrices,
  getCommodityPrice,
  updateWorldPrice,
  getAIComparison,
} = require("../services/worldMarketPriceService");

// GET /api/world-prices — public: get current world market prices for all commodities
router.get("/", async (_req, res, next) => {
  try {
    const prices = await getLatestPrices();
    res.json(prices);
  } catch (err) {
    next(err);
  }
});

// GET /api/world-prices/:commodity — public: single commodity (DIESEL, PETROL, CEMENT)
router.get("/:commodity", async (req, res, next) => {
  try {
    const commodity = req.params.commodity.toUpperCase();
    if (!["DIESEL", "PETROL", "CEMENT"].includes(commodity)) {
      return res.status(400).json({ message: "Invalid commodity. Use DIESEL, PETROL, or CEMENT." });
    }

    const price = await getCommodityPrice(commodity);
    if (!price) return res.status(404).json({ message: "Commodity data not found" });
    res.json(price);
  } catch (err) {
    next(err);
  }
});

// PUT /api/world-prices/:commodity — admin only: update world price
router.put("/:commodity", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const commodity = req.params.commodity.toUpperCase();
    if (!["DIESEL", "PETROL", "CEMENT"].includes(commodity)) {
      return res.status(400).json({ message: "Invalid commodity. Use DIESEL, PETROL, or CEMENT." });
    }

    const { worldPriceUSD, exchangeRate } = req.body;
    if (worldPriceUSD == null || worldPriceUSD <= 0) {
      return res.status(422).json({ message: "worldPriceUSD is required and must be positive" });
    }
    if (exchangeRate != null && exchangeRate <= 0) {
      return res.status(422).json({ message: "exchangeRate must be positive" });
    }

    const updated = await updateWorldPrice(
      commodity,
      Number(worldPriceUSD),
      exchangeRate ? Number(exchangeRate) : undefined
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/world-prices/compare — public: AI price comparison for a product
router.post("/compare", async (req, res, next) => {
  try {
    const { productName, localPriceGHS } = req.body;
    if (!productName || localPriceGHS == null) {
      return res
        .status(422)
        .json({ message: "productName and localPriceGHS are required" });
    }

    const comparison = await getAIComparison(productName, Number(localPriceGHS));
    res.json(comparison);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
