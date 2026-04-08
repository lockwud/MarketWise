// Set authentication cookies
export const setAuthCookies = (token: string, role: string) => {
  if (token) {
    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
  document.cookie = `role=${role}; path=/; max-age=604800; SameSite=Lax`;
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

  return tokenCookie?.split("=").slice(1).join("=") || null;
};

// Decode JWT payload (client-side only — reads claims without verifying signature).
// The signature is verified server-side on every API call.
export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;  // lowercase: "buyer" | "seller" | "admin"
  exp: number;
}

export const decodeToken = (): TokenPayload | null => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    const payload = JSON.parse(atob(padded));
    // Reject if expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: (payload.role as string).toLowerCase(),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};
