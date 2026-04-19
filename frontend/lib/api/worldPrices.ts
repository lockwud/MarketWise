import { request } from "./client";

export interface WorldMarketPrice {
  id: string;
  commodity: "DIESEL" | "PETROL" | "CEMENT";
  worldPriceUSD: number;
  previousPriceUSD: number;
  percentageChange: number;
  exchangeRate: number;
  cediEquivalent: number;
  unit: string;
  source: string | null;
  updatedAt: string;
  history?: WorldMarketPriceHistory[];
}

export interface WorldMarketPriceHistory {
  id: string;
  commodity: string;
  worldPriceUSD: number;
  percentageChange: number;
  exchangeRate: number;
  cediEquivalent: number;
  recordedAt: string;
}

export interface AIComparison {
  matched: boolean;
  commodity: string | null;
  message?: string;
  worldPriceUSD?: number;
  previousPriceUSD?: number;
  worldPriceChangePercent?: number;
  exchangeRate?: number;
  cediEquivalent?: number;
  unit?: string;
  localPriceGHS?: number;
  localVsWorldPercent?: number;
  verdict?: "FAIR" | "ABOVE_MARKET" | "BELOW_MARKET";
  trend?: "up" | "down";
  summary?: string;
  updatedAt?: string;
}

/** Get all world market prices (DIESEL, PETROL, CEMENT) */
export const fetchWorldPrices = () =>
  request<WorldMarketPrice[]>("/world-prices");

/** Get a single commodity's world price */
export const fetchCommodityPrice = (commodity: string) =>
  request<WorldMarketPrice>(`/world-prices/${commodity.toUpperCase()}`);

/** Admin: update a commodity's world price */
export const updateCommodityPrice = (
  commodity: string,
  data: { worldPriceUSD: number; exchangeRate?: number }
) =>
  request<WorldMarketPrice>(`/world-prices/${commodity.toUpperCase()}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/** AI price comparison for a product against world market */
export const compareProductPrice = (productName: string, localPriceGHS: number) =>
  request<AIComparison>("/world-prices/compare", {
    method: "POST",
    body: JSON.stringify({ productName, localPriceGHS }),
  });
