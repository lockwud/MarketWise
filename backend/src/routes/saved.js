const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const { prisma } = require("../config/database");

// GET /api/saved
router.get("/", authenticate, async (req, res, next) => {
  try {
    const saved = await prisma.savedProduct.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            market: { select: { id: true, name: true, city: true } },
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(saved.map((s) => s.product));
  } catch (err) {
    next(err);
  }
});

// POST /api/saved
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(422).json({ message: "productId required" });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const saved = await prisma.savedProduct.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      create: { userId: req.user.id, productId },
      update: {},
    });
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/saved/:productId
router.delete("/:productId", authenticate, async (req, res, next) => {
  try {
    await prisma.savedProduct.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.json({ message: "Removed from saved" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
