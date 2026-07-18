import { request } from "./client";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export const fetchNotifications = () =>
  request<{ notifications: AppNotification[] }>("/notifications");

export const markNotificationRead = (id: string) =>
  request<AppNotification>(`/notifications/${id}/read`, { method: "PUT" });

export const markAllNotificationsRead = () =>
  request<{ notifications: AppNotification[] }>("/notifications/read-all", { method: "PUT" });
