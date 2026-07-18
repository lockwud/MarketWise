const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const { prisma } = require("../config/database");

const DEFAULT_MARKETS = [
  { name: "Accra Central Market", city: "Accra", region: "Greater Accra", open: true, hours: "6am - 8pm", distance: "2.3 km", latitude: 5.556, longitude: -0.205 },
  { name: "Kumasi Central Market", city: "Kumasi", region: "Ashanti", open: true, hours: "5am - 9pm", distance: "210 km", latitude: 6.692, longitude: -1.616 },
  { name: "Kaneshie Market", city: "Accra", region: "Greater Accra", open: true, hours: "7am - 7pm", distance: "5.1 km", latitude: 5.565, longitude: -0.236 },
  { name: "Makola Market", city: "Accra", region: "Greater Accra", open: true, hours: "5:30am - 8pm", distance: "3.1 km", latitude: 5.550, longitude: -0.210 },
  { name: "Madina Market", city: "Accra", region: "Greater Accra", open: true, hours: "7am - 7pm", distance: "6.1 km", latitude: 5.682, longitude: -0.164 },
  { name: "Kejetia Market", city: "Kumasi", region: "Ashanti", open: true, hours: "5am - 9pm", distance: "212 km", latitude: 6.695, longitude: -1.622 },
  { name: "Tema Market", city: "Tema", region: "Greater Accra", open: true, hours: "6am - 6pm", distance: "18 km", latitude: 5.666, longitude: -0.017 },
  { name: "Takoradi Market", city: "Takoradi", region: "Western", open: true, hours: "6am - 6pm", distance: "248 km", latitude: 4.899, longitude: -1.760 },
];

async function ensureDefaultMarkets() {
  const count = await prisma.market.count();
  if (count > 0) return;
  await prisma.market.createMany({ data: DEFAULT_MARKETS, skipDuplicates: true });
}

// GET /api/markets
router.get("/", async (req, res, next) => {
  try {
    await ensureDefaultMarkets();
    const { search, city, region } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { region: { contains: search } },
      ];
    }
    if (city) where.city = city;
    if (region) where.region = region;

    const markets = await prisma.market.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json(markets.map((m) => ({
      ...m,
      products: m._count.products,
      sellers: 0,
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/markets/:id
router.get("/:id", async (req, res, next) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          include: { seller: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 20,
        },
        _count: { select: { products: true } },
      },
    });
    if (!market) return res.status(404).json({ message: "Market not found" });
    res.json(market);
  } catch (err) {
    next(err);
  }
});

// POST /api/markets - admin only
router.post("/", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, city, region, district, description, hours, latitude, longitude } = req.body;
    if (!name || !city) return res.status(422).json({ message: "name and city are required" });

    const market = await prisma.market.create({
      data: { name, city, region: region || "Greater Accra", district, description, hours, latitude, longitude },
    });
    res.status(201).json(market);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Market name already exists" });
    next(err);
  }
});

// PUT /api/markets/:id - admin only
router.put("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, city, region, district, description, open, hours, status, latitude, longitude } = req.body;
    const market = await prisma.market.update({
      where: { id: req.params.id },
      data: { name, city, region, district, description, open, hours, status, latitude, longitude },
    });
    res.json(market);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/markets/:id - admin only
router.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.market.delete({ where: { id: req.params.id } });
    res.json({ message: "Market deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
