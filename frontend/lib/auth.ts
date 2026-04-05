import { cookies } from "next/headers";

// Set authentication cookies
export const setAuthCookies = (token: string, role: string) => {
  // Set cookies with appropriate options
  document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;
};

// Clear authentication cookies
export const clearAuthCookies = () => {
  document.cookie =
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  document.cookie =
    "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
};

// Check if user is authenticated
export const isAuthenticated = (ignorePaths = false) => {
  if (typeof document === "undefined") return false;

  // If ignorePaths is false, check if we're on login or signup page
  if (!ignorePaths) {
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/signup') {
      return false;
    }
  }

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );

  return !!tokenCookie;
};

// Check if user is admin
export const isAdmin = () => {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie.split(";");
  const roleCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("role=")
  );

  return roleCookie?.split("=")[1] === "admin";
};

// Get user role
export const getUserRole = () => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const roleCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("role=")
  );

  return roleCookie?.split("=")[1] || null;
};

// Get auth token
export const getAuthToken = () => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );

  return tokenCookie?.split("=")[1] || null;
};
