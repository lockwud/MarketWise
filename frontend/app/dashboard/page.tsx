import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./_shell";

/**
 * Decode the JWT payload on the server.
 * Uses Buffer (Node.js runtime) — same base64url logic as the middleware.
 */
function decodeJwtUser(token: string): { role: string; name: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    const role = (payload.role as string)?.toLowerCase();
    if (!role) return null;
    return { role, name: payload.name ?? "" };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  // cookies() in Next.js 15 is async; reads the same cookie jar as the middleware.
  const token = (await cookies()).get("token")?.value;

  if (!token) redirect("/login");

  const user = decodeJwtUser(token);
  if (!user) redirect("/login");

  if (user.role === "admin") redirect("/admin");
  if (user.role !== "buyer" && user.role !== "seller") redirect("/login");

  return <DashboardShell role={user.role} userName={user.name} />;
}
