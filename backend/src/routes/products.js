const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const { prisma } = require("../config/database");

// GET /api/products - public, with filters
router.get("/", async (req, res, next) => {
  try {
    const { search, category, marketId, sellerId, page = 1, limit = 20 } = req.query;
    const where = { status: { not: "INACTIVE" } };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { category: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (marketId) where.marketId = marketId;
    if (sellerId) where.sellerId = sellerId;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { updatedAt: "desc" },
        include: {
          seller: { select: { id: true, name: true, location: true } },
          market: { select: { id: true, name: true, city: true } },
          _count: { select: { savedBy: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map((p) => ({
        ...p,
        change: computeChange(p),
        status: p.status === "ALERT" ? "Alert" : "Active",
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/aggregated - buyer view: products grouped by name with seller count & avg price
router.get("/aggregated", async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const where = { status: { not: "INACTIVE" } };
    if (search) {
      where.OR = [{ name: { contains: search } }, { category: { contains: search } }];
    }
    if (category) where.category = category;

    const products = await prisma.product.findMany({
      where,
      include: {
        market: { select: { id: true, name: true, city: true } },
        seller: { select: { id: true, name: true } },
        priceHistories: { orderBy: { recordedAt: "asc" }, take: 6 },
      },
    });

    // Group by product name
    const grouped = {};
    for (const p of products) {
      const key = p.name;
      if (!grouped[key]) {
        grouped[key] = {
          name: p.name,
          category: p.category,
          description: p.description,
          sellers: [],
          prices: [],
          markets: new Set(),
          priceHistory: p.priceHistories.map((h) => h.price),
        };
      }
      grouped[key].sellers.push({
        id: p.seller.id,
        productId: p.id,
        seller: p.seller.name,
        market: p.market.name,
        price: p.price,
        rating: 4.2,
        inStock: p.stock > 0,
      });
      grouped[key].prices.push(p.price);
      grouped[key].markets.add(p.market.name);
    }

    const result = Object.values(grouped).map((g) => {
      const sorted = [...g.prices].sort((a, b) => a - b);
      const avg = g.prices.reduce((s, v) => s + v, 0) / g.prices.length;
      return {
        name: g.name,
        category: g.category,
        description: g.description,
        sellers: g.sellers.length,
        sellerList: g.sellers,
        avgPrice: Math.round(avg * 10) / 10,
        lowestPrice: sorted[0],
        highestPrice: sorted[sorted.length - 1],
        market: [...g.markets][0],
        change: "0%",
        up: true,
        rating: 4.2,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, location: true, phone: true } },
        market: true,
        priceHistories: { orderBy: { recordedAt: "asc" }, take: 8 },
      },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - seller only
router.post("/", authenticate, requireRole("SELLER"), async (req, res, next) => {
  try {
    const { name, category, description, unit, price, comparePrice, stock, minStock, marketId, image } = req.body;
    if (!name || !category || price == null || !marketId) {
      return res.status(422).json({ message: "name, category, price, marketId are required" });
    }
    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market) return res.status(404).json({ message: "Market not found" });

    const product = await prisma.product.create({
      data: {
        name, category, description, unit: unit || "kg",
        price: Number(price), comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock) || 0, minStock: Number(minStock) || 10,
        status: Number(stock) < (Number(minStock) || 10) ? "ALERT" : "ACTIVE",
        image, sellerId: req.user.id, marketId,
      },
      include: {
        seller: { select: { id: true, name: true } },
        market: { select: { id: true, name: true, city: true } },
      },
    });

    // Record initial price history
    await prisma.priceHistory.create({
      data: { productId: product.id, sellerId: req.user.id, price: Number(price) },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - seller (own) or admin
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isOwner = product.sellerId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorised to update this product" });
    }

    const { name, category, description, unit, price, comparePrice, stock, minStock, marketId, image, status } = req.body;

    const updatedStock = stock != null ? Number(stock) : product.stock;
    const updatedMinStock = minStock != null ? Number(minStock) : product.minStock;
    const computedStatus = status || (updatedStock < updatedMinStock ? "ALERT" : "ACTIVE");

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name, category, description, unit,
        price: price != null ? Number(price) : product.price,
        comparePrice: comparePrice != null ? Number(comparePrice) : product.comparePrice,
        stock: updatedStock, minStock: updatedMinStock,
        status: computedStatus, image,
        marketId: marketId || product.marketId,
      },
      include: {
        seller: { select: { id: true, name: true } },
        market: { select: { id: true, name: true, city: true } },
      },
    });

    // Record price history if price changed
    if (price != null && Number(price) !== product.price) {
      await prisma.priceHistory.create({
        data: { productId: product.id, sellerId: req.user.id, price: Number(price) },
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - seller (own) or admin
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const isOwner = product.sellerId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorised to delete this product" });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id/price-history
router.get("/:id/price-history", async (req, res, next) => {
  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId: req.params.id },
      orderBy: { recordedAt: "asc" },
      take: 20,
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

function computeChange(product) {
  return "0%";
}

module.exports = router;
