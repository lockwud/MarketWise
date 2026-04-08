const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const { prisma } = require("../config/database");

// GET /api/admin/stats
router.get("/stats", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const [totalUsers, products, orders, totalMarkets, pendingSubmissions, sellers, buyers, pendingSellers] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.market.count(),
      prisma.priceSubmission.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "SELLER", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "SELLER", status: "PENDING" } }),
    ]);

    res.json({ users: totalUsers, products, orders, markets: totalMarkets, pendingSubmissions, sellers, buyers, pendingSellers });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/activity - order counts per day for the current week (Mon–Sun)
router.get("/activity", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const now = new Date();
    // dayOfWeek: 0=Sun … 6=Sat  →  daysFromMonday: 0=Mon … 6=Sun
    const daysFromMonday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true },
    });

    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon=0 … Sun=6
    for (const o of orders) {
      const idx = (new Date(o.createdAt).getDay() + 6) % 7;
      counts[idx]++;
    }

    res.json({ weeklyOrders: counts });
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
          _count: { select: { products: true, orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map((u) => ({
        ...u,
        role: u.role.toLowerCase(),
        products: u._count.products,
        orders: u._count.orders,
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

// PUT /api/admin/users/:id/verify  — activate a PENDING seller account
router.put("/users/:id/verify", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status !== "PENDING") return res.status(400).json({ message: "User is not pending verification" });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json({ ...updated, role: updated.role.toLowerCase() });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sellers  — admin creates a seller account directly
router.post("/sellers", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const bcrypt = require("bcryptjs");
    const { name, email, password, phone, location } = req.body;
    if (!name || !email || !password) return res.status(422).json({ message: "name, email and password are required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "SELLER", status: "ACTIVE", phone, location },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });
    res.status(201).json({ ...user, role: user.role.toLowerCase() });
  } catch (err) {
    next(err);
  }
});
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
          seller: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, category: true } },
        },
      }),
      prisma.priceSubmission.count({ where }),
    ]);

    res.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        productName: s.productName,
        category: s.product?.category ?? "General",
        seller: s.seller.name,
        sellerEmail: s.seller.email,
        market: s.market,
        price: s.price,
        prevPrice: s.prevPrice,
        change: s.change,
        up: s.up,
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

// PUT /api/admin/submissions/:id/flag
router.put("/submissions/:id/flag", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const sub = await prisma.priceSubmission.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ message: "Submission not found" });
    const newStatus = sub.status === "FLAGGED" ? "PENDING" : "FLAGGED";
    const updated = await prisma.priceSubmission.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });
    const statusLabel = updated.status.charAt(0) + updated.status.slice(1).toLowerCase();
    res.json({ ...updated, status: statusLabel });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/markets
router.get("/markets", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const markets = await prisma.market.findMany({
      include: {
        _count: { select: { products: true } },
        products: { select: { sellerId: true }, distinct: ["sellerId"] },
      },
      orderBy: { name: "asc" },
    });
    res.json(markets.map((m) => ({
      id: m.id,
      name: m.name,
      city: m.city,
      region: m.region,
      status: m.status,
      open: m.open,
      products: m._count.products,
      sellers: m.products.length,
    })));
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
