const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const prisma = new PrismaClient();

// GET /api/orders
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (req.user.role === "BUYER") {
      where.buyerId = req.user.id;
    } else if (req.user.role === "SELLER") {
      where.sellerId = req.user.id;
    }
    // ADMIN sees all

    if (status && status !== "All") where.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true } },
          market: { select: { id: true, name: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders: orders.map(formatOrder),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders - buyer only
router.post("/", authenticate, requireRole("BUYER"), async (req, res, next) => {
  try {
    const { items, marketId, notes } = req.body;
    // items: [{ productId, quantity }]
    if (!items || !items.length) return res.status(422).json({ message: "Order items required" });
    if (!marketId) return res.status(422).json({ message: "marketId required" });

    // Fetch all products to validate
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      return res.status(422).json({ message: "One or more products not found" });
    }

    // All items must belong to the same seller
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    if (sellerIds.length > 1) {
      return res.status(422).json({ message: "All items in an order must be from the same seller" });
    }
    const sellerId = sellerIds[0];

    const orderItems = items.map((i) => {
      const product = products.find((p) => p.id === i.productId);
      return {
        productId: product.id,
        productName: product.name,
        quantity: Number(i.quantity),
        unit: product.unit,
        price: product.price,
        total: product.price * Number(i.quantity),
      };
    });

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        sellerId,
        marketId,
        notes,
        items: { create: orderItems },
      },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        market: { select: { id: true, name: true } },
        items: true,
      },
    });

    res.status(201).json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true } },
        market: { select: { id: true, name: true } },
        items: true,
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.buyerId === req.user.id || order.sellerId === req.user.id;
    if (!isOwner && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status - seller or admin
router.put("/:id/status", authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(422).json({ message: "Invalid status" });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isSeller = order.sellerId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isSeller && !isAdmin) {
      return res.status(403).json({ message: "Only the seller or admin can update order status" });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: status.toUpperCase() },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        market: { select: { id: true, name: true } },
        items: true,
      },
    });
    res.json(formatOrder(updated));
  } catch (err) {
    next(err);
  }
});

function formatOrder(order) {
  const total = order.items.reduce((s, i) => s + i.total, 0);
  return {
    id: order.id,
    buyer: order.buyer?.name,
    buyerId: order.buyerId,
    seller: order.seller?.name,
    sellerId: order.sellerId,
    market: order.market?.name,
    marketId: order.marketId,
    product: order.items?.[0]?.productName,
    qty: order.items?.[0]?.quantity,
    unit: order.items?.[0]?.unit,
    total,
    status: order.status.charAt(0) + order.status.slice(1).toLowerCase(),
    date: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    items: order.items,
    notes: order.notes,
    createdAt: order.createdAt,
  };
}

module.exports = router;
