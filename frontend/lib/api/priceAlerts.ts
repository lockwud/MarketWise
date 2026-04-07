import { request } from "./client";

export interface PriceAlert {
  id: string;
  productName: string;
  condition: "BELOW" | "ABOVE";
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: string;
}

export const fetchPriceAlerts = () => request<PriceAlert[]>("/price-alerts");

export const createPriceAlert = (data: { productName: string; condition: "BELOW" | "ABOVE"; targetPrice: number; currentPrice?: number }) =>
  request<PriceAlert>("/price-alerts", { method: "POST", body: JSON.stringify(data) });

export const updatePriceAlert = (id: string, data: Partial<PriceAlert>) =>
  request<PriceAlert>(`/price-alerts/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePriceAlert = (id: string) =>
  request<{ message: string }>(`/price-alerts/${id}`, { method: "DELETE" });
