import { request } from "./client";

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  createdAt: string;
}

export const fetchShoppingList = () => request<ShoppingItem[]>("/shopping-list");

export const addShoppingItem = (data: { name: string; category?: string; quantity?: string }) =>
  request<ShoppingItem>("/shopping-list", { method: "POST", body: JSON.stringify(data) });

export const updateShoppingItem = (id: string, data: Partial<Pick<ShoppingItem, "name" | "category" | "quantity" | "checked">>) =>
  request<ShoppingItem>(`/shopping-list/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteShoppingItem = (id: string) =>
  request<{ message: string }>(`/shopping-list/${id}`, { method: "DELETE" });

export const clearShoppingList = () =>
  request<{ message: string }>("/shopping-list", { method: "DELETE" });
