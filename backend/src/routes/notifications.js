const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { listNotifications, markNotificationRead, markAllRead } = require("../services/notificationService");

router.get("/", authenticate, (req, res) => {
  res.json({ notifications: listNotifications(req.user) });
});

router.put("/:id/read", authenticate, (req, res) => {
  const notification = markNotificationRead(req.user, req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json(notification);
});

router.put("/read-all", authenticate, (req, res) => {
  res.json({ notifications: markAllRead(req.user) });
});

module.exports = router;
