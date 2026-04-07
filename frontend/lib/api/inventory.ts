import { request } from "./client";

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  price: number;
  comparePrice?: number;
  stock: number;
  minStock: number;
  status: string;
  image?: string;
  change?: string;
  up?: boolean;
  sellerId: string;
  marketId: string;
  seller?: { id: string; name: string; location?: string };
  market?: { id: string; name: string; city: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AggregatedProduct {
  name: string;
  category: string;
  description?: string;
  sellers: number;
  sellerList: { id: string; productId: string; seller: string; market: string; price: number; rating: number; inStock: boolean }[];
  avgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  market: string;
  change: string;
  up: boolean;
  rating: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateProductData {
  name: string;
  category: string;
  description?: string;
  unit: string;
  price: number;
  comparePrice?: number;
  stock: number;
  minStock?: number;
  marketId: string;
  image?: string;
}

// Buyer view: aggregated products across all sellers
export const fetchAggregatedProducts = (params?: { search?: string; category?: string }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  return request<AggregatedProduct[]>(`/products/aggregated${qs.toString() ? "?" + qs : ""}`);
};

// Seller/Admin view: individual product listings
export const fetchProducts = (params?: { search?: string; category?: string; sellerId?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  if (params?.sellerId) qs.set("sellerId", params.sellerId);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<ProductsResponse>(`/products${qs.toString() ? "?" + qs : ""}`);
};

export const getProduct = (id: string) => request<Product>(`/products/${id}`);

export const createProduct = (data: CreateProductData) =>
  request<Product>("/products", { method: "POST", body: JSON.stringify(data) });

export const updateProduct = (id: string, data: Partial<CreateProductData & { status?: string }>) =>
  request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProduct = (id: string) =>
  request<{ message: string }>(`/products/${id}`, { method: "DELETE" });

export const getProductPriceHistory = (id: string) =>
  request<{ id: string; price: number; recordedAt: string }[]>(`/products/${id}/price-history`);