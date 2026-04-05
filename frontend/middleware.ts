import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Protect dashboard and admin routes
  if (protectedRoutes.includes(pathname)) {
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If trying to access admin route but not an admin
    if (pathname === "/admin" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/dashboard", "/admin", "/login", "/signup"],
};
