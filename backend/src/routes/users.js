const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const prisma = new PrismaClient();

// GET /api/users - admin only
router.get("/", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (role) where.role = role.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true, status: true,
          location: true, phone: true, createdAt: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map((u) => ({ ...u, role: u.role.toLowerCase(), markets: u._count.products })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, status: true, location: true, phone: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user, role: user.role.toLowerCase() });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/suspend - admin only
router.put("/:id/suspend", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const newStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: newStatus },
      select: { id: true, name: true, status: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id - admin only
router.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
