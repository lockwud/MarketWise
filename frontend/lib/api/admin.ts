import { request } from "./client";

export interface AdminStats {
  users: { total: number; buyers: number; sellers: number; admins: number; pending: number };
  products: { total: number; active: number; alert: number };
  orders: { total: number; pending: number; confirmed: number; delivered: number; cancelled: number };
  markets: { total: number };
  submissions: { total: number; pending: number };
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
}

export interface AdminSubmission {
  id: string;
  status: string;
  price: number;
  prevPrice?: number;
  productName: string;
  market?: string;
  submittedAt: string;
  seller: { id: string; name: string; email: string };
  product?: { id: string; name: string };
}

export const fetchAdminStats = () => request<AdminStats>("/admin/stats");

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
