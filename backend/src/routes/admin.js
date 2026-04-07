const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const prisma = new PrismaClient();

// GET /api/admin/stats
router.get("/stats", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const [users, products, orders, markets, submissions] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.market.count(),
      prisma.priceSubmission.count({ where: { status: "PENDING" } }),
    ]);

    const sellers = await prisma.user.count({ where: { role: "SELLER" } });
    const buyers = await prisma.user.count({ where: { role: "BUYER" } });

    res.json({ users, products, orders, markets, pendingSubmissions: submissions, sellers, buyers });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - alias to users route
router.get("/users", authenticate, requireRole("ADMIN"), async (req, res, next) => {
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
      users: users.map((u) => ({
        ...u,
        role: u.role.toLowerCase(),
        markets: u._count.products,
        joined: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/suspend
router.put("/users/:id/suspend", authenticate, requireRole("ADMIN"), async (req, res, next) => {
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

// DELETE /api/admin/users/:id
router.delete("/users/:id", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/submissions
router.get("/submissions", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
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

// PUT /api/admin/submissions/:id/approve
router.put("/submissions/:id/approve", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const sub = await prisma.priceSubmission.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    await prisma.product.update({ where: { id: sub.productId }, data: { price: sub.price } });
    await prisma.priceHistory.create({ data: { productId: sub.productId, sellerId: sub.sellerId, price: sub.price } });

    const updated = await prisma.priceSubmission.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
    });
    res.json({ ...updated, status: "Approved" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/submissions/:id/reject
router.put("/submissions/:id/reject", authenticate, requireRole("ADMIN"), async (req, res, next) => {
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

// GET /api/admin/markets
router.get("/markets", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const markets = await prisma.market.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    res.json(markets.map((m) => ({ ...m, products: m._count.products })));
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
