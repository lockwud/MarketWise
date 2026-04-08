const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const { prisma } = require("../config/database");

// GET /api/submissions - seller sees own, admin sees all
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (req.user.role === "SELLER") {
      where.sellerId = req.user.id;
    }
    if (status && status !== "All") where.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [submissions, total] = await Promise.all([
      prisma.priceSubmission.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          seller: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.priceSubmission.count({ where }),
    ]);

    res.json({
      submissions: submissions.map((s) => ({
        ...s,
        seller: s.seller.name,
        status: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
        submitted: timeAgo(s.createdAt),
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/submissions - seller only
router.post("/", authenticate, requireRole("SELLER"), async (req, res, next) => {
  try {
    const { productId, price, market } = req.body;
    if (!productId || price == null) return res.status(422).json({ message: "productId and price required" });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: "Not your product" });

    const prevPrice = product.price;
    const newPrice = Number(price);
    const diff = ((newPrice - prevPrice) / prevPrice) * 100;
    const change = (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";

    const submission = await prisma.priceSubmission.create({
      data: {
        productId,
        sellerId: req.user.id,
        productName: product.name,
        price: newPrice,
        prevPrice,
        change,
        up: diff >= 0,
        market: market || product.market?.name || "",
      },
      include: { seller: { select: { id: true, name: true } } },
    });

    res.status(201).json({
      ...submission,
      seller: submission.seller.name,
      submitted: "just now",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/approve - admin only
router.put("/:id/approve", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const sub = await prisma.priceSubmission.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    // Apply price to product
    await prisma.product.update({
      where: { id: sub.productId },
      data: { price: sub.price },
    });

    // Record price history
    await prisma.priceHistory.create({
      data: { productId: sub.productId, sellerId: sub.sellerId, price: sub.price },
    });

    const updated = await prisma.priceSubmission.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
    });

    res.json({ ...updated, status: "Approved" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/reject - admin only
router.put("/:id/reject", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const updated = await prisma.priceSubmission.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    });
    res.json({ ...updated, status: "Rejected" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/flag - admin only
router.put("/:id/flag", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const updated = await prisma.priceSubmission.update({
      where: { id: req.params.id },
      data: { status: "FLAGGED" },
    });
    res.json({ ...updated, status: "Flagged" });
  } catch (err) {
    next(err);
  }
});

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

module.exports = router;
