const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const { prisma } = require("../config/database");
const { createNotification } = require("../services/notificationService");

function normalizeAlert(alert) {
  const condition = String(alert.condition || "BELOW").toUpperCase().includes("ABOVE") ? "ABOVE" : "BELOW";
  const triggered = condition === "ABOVE" ? alert.current >= alert.target : alert.current <= alert.target;
  return {
    ...alert,
    productName: alert.product,
    condition,
    currentPrice: alert.current,
    targetPrice: alert.target,
    triggered,
  };
}

async function getCurrentProductPrice(productName) {
  if (!productName) return 0;
  const product = await prisma.product.findFirst({
    where: { name: { contains: productName } },
    orderBy: { price: "asc" },
    select: { price: true },
  });
  return product?.price ?? 0;
}

// GET /api/price-alerts
router.get("/", authenticate, async (req, res, next) => {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    const refreshed = await Promise.all(alerts.map(async (alert) => {
      const current = await getCurrentProductPrice(alert.product);
      const data = current > 0 && current !== alert.current
        ? await prisma.priceAlert.update({ where: { id: alert.id }, data: { current } })
        : alert;
      return normalizeAlert(data);
    }));
    res.json(refreshed);
  } catch (err) {
    next(err);
  }
});

// POST /api/price-alerts
router.post("/", authenticate, async (req, res, next) => {
  try {
    const product = req.body.product ?? req.body.productName;
    const condition = req.body.condition ?? "BELOW";
    const target = req.body.target ?? req.body.targetPrice;
    const current = req.body.current ?? req.body.currentPrice ?? await getCurrentProductPrice(product);
    if (!product) return res.status(422).json({ message: "product name required" });
    if (target == null || Number.isNaN(Number(target))) return res.status(422).json({ message: "target price required" });
    const alert = await prisma.priceAlert.create({
      data: {
        product,
        condition: String(condition || "BELOW").toUpperCase(),
        current: Number(current) || 0,
        target: Number(target) || 0,
        userId: req.user.id,
      },
    });
    createNotification({
      userId: req.user.id,
      title: "Price alert created",
      message: `Monitoring ${product} ${String(condition).toLowerCase()} GH₵${Number(target).toFixed(2)}.`,
      type: "alert",
      actionUrl: "/shopping-list",
    });
    res.status(201).json(normalizeAlert(alert));
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
    const product = req.body.product ?? req.body.productName;
    const condition = req.body.condition;
    const target = req.body.target ?? req.body.targetPrice;
    const current = req.body.current ?? req.body.currentPrice;
    const updated = await prisma.priceAlert.update({
      where: { id: req.params.id },
      data: {
        product,
        condition: condition ? String(condition).toUpperCase() : undefined,
        current: current != null ? Number(current) : undefined,
        target: target != null ? Number(target) : undefined,
      },
    });
    res.json(normalizeAlert(updated));
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
