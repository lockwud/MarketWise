import { request } from "./client";

export interface SavedProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    status: string;
    seller?: { name: string };
    market?: { name: string; city: string };
  };
  createdAt: string;
}

export const fetchSavedProducts = () => request<SavedProduct[]>("/saved");

export const saveProduct = (productId: string) =>
  request<SavedProduct>("/saved", { method: "POST", body: JSON.stringify({ productId }) });

export const removeSavedProduct = (productId: string) =>
  request<{ message: string }>(`/saved/${productId}`, { method: "DELETE" });
