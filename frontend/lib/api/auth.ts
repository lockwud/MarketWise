import { request } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SellerApplyRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  businessName?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    location?: string;
  };
}

export const login = (data: LoginRequest) =>
  request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const signup = (data: SignupRequest) =>
  request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const sellerApply = (data: SellerApplyRequest) =>
  request<{ message: string }>("/auth/seller-apply", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const logout = async (): Promise<void> => {
  await request<{ message: string }>("/auth/logout", { method: "POST" });
};

export const getMe = () => request<AuthResponse["user"]>("/auth/me");

export const updateMe = (data: { name?: string; phone?: string; location?: string }) =>
  request<AuthResponse["user"]>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  request<{ message: string }>("/auth/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
