require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const marketRoutes = require("./routes/markets");
const orderRoutes = require("./routes/orders");
const shoppingListRoutes = require("./routes/shoppingList");
const savedRoutes = require("./routes/saved");
const priceAlertRoutes = require("./routes/priceAlerts");
const submissionRoutes = require("./routes/submissions");
const adminRoutes = require("./routes/admin");
const worldPriceRoutes = require("./routes/worldPrices");

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/price-alerts", priceAlertRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/world-prices", worldPriceRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MarketWise API running on http://localhost:${PORT}`);
});

module.exports = app;
