const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const prisma = new PrismaClient();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password minimum 8 characters"),
    body("role").optional().isIn(["BUYER", "SELLER", "buyer", "seller"]).withMessage("Invalid role"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const { name, email, password, role, phone, location } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 12);
      const assignedRole = (role || "BUYER").toUpperCase();

      const user = await prisma.user.create({
        data: { name, email, password: hashed, role: assignedRole, phone, location },
      });

      const token = signToken(user);
      const roleOut = user.role.toLowerCase();

      res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie("role", roleOut, { sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.status(201).json({
        token,
        role: roleOut,
        user: { id: user.id, name: user.name, email: user.email, role: roleOut },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.status === "SUSPENDED") {
        return res.status(403).json({ message: "Account suspended. Contact support." });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user);
      const roleOut = user.role.toLowerCase();

      res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie("role", roleOut, { sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.json({
        token,
        role: roleOut,
        user: { id: user.id, name: user.name, email: user.email, role: roleOut, location: user.location },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("role");
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, status: true, phone: true, location: true, profileImage: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user, role: user.role.toLowerCase() });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me
router.put("/me", authenticate, async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, location },
      select: { id: true, name: true, email: true, role: true, phone: true, location: true },
    });
    res.json({ ...updated, role: updated.role.toLowerCase() });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/password
router.put(
  "/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password minimum 8 characters"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg });
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
