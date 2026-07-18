const notifications = [];
let io = null;

function setNotificationSocket(socketServer) {
  io = socketServer;
}

function now() {
  return new Date().toISOString();
}

function makeNotification({ userId, role, title, message, type = "info", actionUrl }) {
  return {
    id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: userId || null,
    role: role || null,
    title,
    message,
    type,
    actionUrl: actionUrl || null,
    read: false,
    createdAt: now(),
  };
}

function matchesUser(notification, user) {
  return notification.userId === user.id || notification.role === user.role || notification.role === user.role?.toLowerCase();
}

function listNotifications(user) {
  return notifications
    .filter((notification) => matchesUser(notification, user))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
}

function createNotification(input) {
  const notification = makeNotification(input);
  notifications.unshift(notification);
  if (notifications.length > 300) notifications.length = 300;

  if (io) {
    if (notification.userId) io.to(`user:${notification.userId}`).emit("notification:new", notification);
    if (notification.role) io.to(`role:${String(notification.role).toUpperCase()}`).emit("notification:new", notification);
  }

  return notification;
}

function markNotificationRead(user, id) {
  const notification = notifications.find((item) => item.id === id && matchesUser(item, user));
  if (!notification) return null;
  notification.read = true;
  return notification;
}

function markAllRead(user) {
  for (const notification of notifications) {
    if (matchesUser(notification, user)) notification.read = true;
  }
  return listNotifications(user);
}

module.exports = {
  setNotificationSocket,
  createNotification,
  listNotifications,
  markNotificationRead,
  markAllRead,
};
