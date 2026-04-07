"use client";

import { useEffect, useState } from "react";
import { getUserRole, setAuthCookies } from "@/lib/auth";
import SellerDashboard from "./seller";
import BuyerDashboard from "./buyer";
import { getMe } from "@/lib/api/auth";

function getUserLocation(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userLocation") || localStorage.getItem("user_location") || "";
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [location, setLocation] = useState("");

  useEffect(() => {
    const storedRole = getUserRole();
    if (storedRole) {
      setRole(storedRole);
    } else {
      getMe()
        .then((user) => {
          setAuthCookies(undefined as any, user.role.toLowerCase());
          setRole(user.role.toLowerCase());
        })
        .catch(() => {
          setRole("buyer");
        });
    }
    setLocation(getUserLocation());
  }, []);

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (role === "buyer") return <BuyerDashboard userLocation={location} />;
  return <SellerDashboard userLocation={location} />;
}
