export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  message?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  token: string;
  role: string;
  message?: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      "https://smartpantry-bc4q.onrender.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const responseData = await response.json();
    return {
      token: responseData.token || responseData.access_token,
      role: responseData.role || "user",
      message: responseData.message,
    };
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during login");
  }
};

import Swal from "sweetalert2";

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await fetch(
      "https://smartpantry-bc4q.onrender.com/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const responseData = await response.json();
    return {
      token: responseData.token || responseData.access_token,
      role: responseData.role || "user",
      message: responseData.message,
    };
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during registration");
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
