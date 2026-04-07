import { request } from "./client";

export interface Market {
  id: string;
  name: string;
  city: string;
  region: string;
  description?: string;
  status: string;
  open: boolean;
  hours?: string;
  latitude?: number;
  longitude?: number;
  productCount?: number;
  sellerCount?: number;
  createdAt?: string;
}

export const fetchMarkets = (params?: { search?: string; city?: string }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.city) qs.set("city", params.city);
  return request<Market[]>(`/markets${qs.toString() ? "?" + qs : ""}`);
};

export const getMarket = (id: string) => request<Market>(`/markets/${id}`);

export const createMarket = (data: Omit<Market, "id" | "createdAt" | "productCount" | "sellerCount">) =>
  request<Market>("/markets", { method: "POST", body: JSON.stringify(data) });

export const updateMarket = (id: string, data: Partial<Market>) =>
  request<Market>(`/markets/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteMarket = (id: string) =>
  request<{ message: string }>(`/markets/${id}`, { method: "DELETE" });
