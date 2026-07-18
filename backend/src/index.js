require("dotenv").config();
const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
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
const notificationRoutes = require("./routes/notifications");
const { setNotificationSocket } = require("./services/notificationService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});
setNotificationSocket(io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.user;
  socket.join(`user:${user.id}`);
  socket.join(`role:${user.role}`);
});

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
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
app.use("/api/notifications", notificationRoutes);

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
server.listen(PORT, () => {
  console.log(`🚀 MarketWise API running on http://localhost:${PORT}`);
});

module.exports = app;
