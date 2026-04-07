const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/price-alerts
router.get("/", authenticate, async (req, res, next) => {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// POST /api/price-alerts
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { product, condition, current, target } = req.body;
    if (!product) return res.status(422).json({ message: "product name required" });
    const alert = await prisma.priceAlert.create({
      data: {
        product,
        condition: condition || "any change",
        current: Number(current) || 0,
        target: Number(target) || 0,
        userId: req.user.id,
      },
    });
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
});

// PUT /api/price-alerts/:id
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const alert = await prisma.priceAlert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    if (alert.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    const { product, condition, current, target } = req.body;
    const updated = await prisma.priceAlert.update({
      where: { id: req.params.id },
      data: { product, condition, current: Number(current), target: Number(target) },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/price-alerts/:id
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const alert = await prisma.priceAlert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    if (alert.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    await prisma.priceAlert.delete({ where: { id: req.params.id } });
    res.json({ message: "Alert removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
