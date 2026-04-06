import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/inventory", "/orders", "/profile", "/shopping-list", "/recipes"];
const AUTH_ONLY = ["/login", "/signup"];
const ADMIN_ONLY = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role  = request.cookies.get("role")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p));
  const isAdminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  // Unauthenticated user hitting a protected route → send to login
  // AUTH TEMPORARILY DISABLED FOR PREVIEW
  // if (isProtected && !token) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  // Non-admin hitting an admin route → send to their dashboard
  if (isAdminOnly && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Already-authenticated user hitting login/signup → send to dashboard
  if (isAuthOnly && token) {
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
  ],
};
