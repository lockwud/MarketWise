const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/shopping-list
router.get("/", authenticate, async (req, res, next) => {
  try {
    const items = await prisma.shoppingItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/shopping-list
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { name, category, quantity } = req.body;
    if (!name) return res.status(422).json({ message: "Item name required" });
    const item = await prisma.shoppingItem.create({
      data: { name, category: category || "General", quantity: quantity || "1", userId: req.user.id },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/shopping-list/:id
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const item = await prisma.shoppingItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const { name, category, quantity, checked } = req.body;
    const updated = await prisma.shoppingItem.update({
      where: { id: req.params.id },
      data: { name, category, quantity, checked },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shopping-list/:id
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const item = await prisma.shoppingItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    await prisma.shoppingItem.delete({ where: { id: req.params.id } });
    res.json({ message: "Item removed" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shopping-list - clear all
router.delete("/", authenticate, async (req, res, next) => {
  try {
    await prisma.shoppingItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: "Shopping list cleared" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
