import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return (payload.role as string)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");
  const role = decodeJwtRole(token);
  if (role !== "admin") redirect(role === "buyer" || role === "seller" ? "/dashboard" : "/login");
}

import AdminDeliveryClient from "./_client";

export default async function AdminDeliveryPage() {
  await requireAdmin();
  return <AdminDeliveryClient />;
}
