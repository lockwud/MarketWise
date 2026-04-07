import { request } from "./client";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  total: number;
  notes?: string;
  buyer?: { id: string; name: string; email: string };
  seller?: { id: string; name: string; email: string };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  sellerId: string;
  items: { productId: string; quantity: number }[];
  notes?: string;
}

export const fetchOrders = (params?: { status?: string; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  return request<{ orders: Order[]; total: number; page: number; pages: number }>(
    `/orders${qs.toString() ? "?" + qs : ""}`
  );
};

export const getOrder = (id: string) => request<Order>(`/orders/${id}`);

export const createOrder = (data: CreateOrderData) =>
  request<Order>("/orders", { method: "POST", body: JSON.stringify(data) });

export const updateOrderStatus = (id: string, status: string) =>
  request<Order>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
