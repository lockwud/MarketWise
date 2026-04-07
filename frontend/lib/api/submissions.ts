import { request } from "./client";

export interface PriceSubmission {
  id: string;
  productId?: string;
  productName: string;
  market?: string;
  price: number;
  prevPrice?: number;
  change?: string;
  status: "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";
  submittedAt: string;
  seller?: { id: string; name: string };
}

export const fetchSubmissions = (params?: { status?: string; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  return request<{ submissions: PriceSubmission[]; total: number; page: number; pages: number }>(
    `/submissions${qs.toString() ? "?" + qs : ""}`
  );
};

export const createSubmission = (data: { productId?: string; productName: string; price: number; market?: string }) =>
  request<PriceSubmission>("/submissions", { method: "POST", body: JSON.stringify(data) });

export const approveSubmission = (id: string) =>
  request<PriceSubmission>(`/submissions/${id}/approve`, { method: "PUT" });

export const rejectSubmission = (id: string) =>
  request<PriceSubmission>(`/submissions/${id}/reject`, { method: "PUT" });

export const flagSubmission = (id: string) =>
  request<PriceSubmission>(`/submissions/${id}/flag`, { method: "PUT" });
