import { request } from "./client";

export interface AdminStats {
  users: number;
  products: number;
  orders: number;
  markets: number;
  pendingSubmissions: number;
  sellers: number;
  buyers: number;
  pendingSellers: number;
}

export interface AdminMarket {
  id: string;
  name: string;
  city: string;
  region?: string;
  status: string;
  open?: boolean;
  products: number;
  sellers: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  location?: string;
  phone?: string;
  createdAt: string;
  joined?: string;
  products?: number;
  orders?: number;
}

export interface AdminSubmission {
  id: string;
  status: string;
  price: number;
  prevPrice?: number;
  change?: string;
  up?: boolean;
  productName: string;
  category?: string;
  market?: string;
  seller: string;
  sellerEmail?: string;
  submitted?: string;
}

export const fetchAdminStats = () => request<AdminStats>("/admin/stats");

export const fetchAdminActivity = () =>
  request<{ weeklyOrders: number[] }>("/admin/activity");

export const fetchAdminUsers = (params?: { role?: string; status?: string; search?: string; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  return request<{ users: AdminUser[]; total: number; page: number; pages: number }>(
    `/admin/users${qs.toString() ? "?" + qs : ""}`
  );
};

export const suspendUser = (id: string, suspend: boolean) =>
  request<AdminUser>(`/admin/users/${id}/suspend`, { method: "PUT", body: JSON.stringify({ suspend }) });

export const deleteUser = (id: string) =>
  request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" });

export const verifyUser = (id: string) =>
  request<AdminUser>(`/admin/users/${id}/verify`, { method: "PUT" });

export const createSellerAccount = (data: { name: string; email: string; password: string; phone?: string; location?: string }) =>
  request<AdminUser>("/admin/sellers", { method: "POST", body: JSON.stringify(data) });

export const fetchAdminSubmissions = (params?: { status?: string; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  return request<{ submissions: AdminSubmission[]; total: number; page: number; pages: number }>(
    `/admin/submissions${qs.toString() ? "?" + qs : ""}`
  );
};

export const approveSubmission = (id: string) =>
  request<AdminSubmission>(`/admin/submissions/${id}/approve`, { method: "PUT" });

export const rejectSubmission = (id: string) =>
  request<AdminSubmission>(`/admin/submissions/${id}/reject`, { method: "PUT" });

export const flagSubmission = (id: string) =>
  request<AdminSubmission>(`/admin/submissions/${id}/flag`, { method: "PUT" });

export const fetchAdminMarkets = () =>
  request<AdminMarket[]>("/admin/markets");

export const createMarket = (data: { name: string; city: string; district?: string; description?: string; region?: string }) =>
  request<AdminMarket>("/markets", { method: "POST", body: JSON.stringify(data) });
