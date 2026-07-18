"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { API_BASE } from "@/lib/api/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notifications";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.split(";").find((c) => c.trim().startsWith("token="));
  return cookie ? cookie.split("=")[1] : null;
}

function socketBaseUrl() {
  return API_BASE.replace(/\/api\/?$/, "");
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function iconClass(type: string) {
  if (["success", "price"].includes(type)) return "text-emerald-500";
  if (["warning", "alert"].includes(type)) return "text-amber-500";
  return "text-blue-500";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let socket: Socket | null = null;
    const token = getToken();
    if (!token) return;

    fetchNotifications()
      .then((data) => setNotifications(data.notifications))
      .catch(() => {});

    socket = io(socketBaseUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("notification:new", (notification: AppNotification) => {
      setNotifications((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 50));
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id)
      .then((updated) => setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n))))
      .catch(() => {});
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead()
      .then((data) => setNotifications(data.notifications))
      .catch(() => {});
  }

  return (
    <>
      <button
        aria-label="Notifications"
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/25 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h2>
                  <p className="text-xs text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={markAllRead} className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300">Mark all read</button>
                  <button onClick={() => setOpen(false)} aria-label="Close notifications" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800">Today</div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-gray-400">
                  <Bell className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : notifications.map((notification) => {
                const content = (
                  <div className={`relative flex gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 ${notification.read ? "bg-white dark:bg-gray-950" : "bg-blue-50/40 dark:bg-blue-950/10"}`}>
                    <div className={`absolute left-0 top-0 h-full w-1 ${notification.read ? "bg-gray-200 dark:bg-gray-800" : "bg-emerald-500"}`} />
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${iconClass(notification.type)}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                        {!notification.read && (
                          <button onClick={(e) => { e.preventDefault(); markRead(notification.id); }} className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300">Mark as read</button>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-400">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                );

                return notification.actionUrl ? (
                  <Link key={notification.id} href={notification.actionUrl} onClick={() => markRead(notification.id)}>{content}</Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
