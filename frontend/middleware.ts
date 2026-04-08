import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/inventory", "/orders", "/profile", "/shopping-list", "/markets"];
const AUTH_ONLY = ["/login", "/signup", "/join"];
const ADMIN_ONLY = ["/admin"];

/** Decode JWT and return payload, or null if missing / expired / malformed. */
function decodeJwt(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64 + "=".repeat((4 - b64.length % 4) % 4));
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get("token")?.value;

  // Treat as unauthenticated if token is absent, expired, or malformed
  const payload   = rawToken ? decodeJwt(rawToken) : null;
  const isValid   = payload !== null;
  const role      = isValid ? (payload?.role as string | undefined)?.toLowerCase() : undefined;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAdminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  // If token exists but is expired/invalid, clear cookies and let the request proceed
  const response = NextResponse.next();
  if (rawToken && !isValid) {
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("role",  "", { maxAge: 0, path: "/" });
    // If hitting a protected route with a bad token, redirect to login without the cookie
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirect = NextResponse.redirect(url);
      redirect.cookies.set("token", "", { maxAge: 0, path: "/" });
      redirect.cookies.set("role",  "", { maxAge: 0, path: "/" });
      return redirect;
    }
    return response;
  }

  // Unauthenticated user hitting a protected route → send to login
  if (isProtected && !isValid) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Non-admin hitting an admin route → send to their dashboard
  if (isAdminOnly && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Already-authenticated user hitting login/signup/join → send to dashboard
  if (isAuthOnly && isValid) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/inventory/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/shopping-list/:path*",
    "/recipes/:path*",
    "/login",
    "/signup",
    "/join",
    "/markets/:path*",
  ],
};
