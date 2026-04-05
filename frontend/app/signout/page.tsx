"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/auth";

export default function SignoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear authentication cookies
    clearAuthCookies();

    // Redirect to home page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push("/");
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
        <p className="text-gray-600">
          You will be redirected to the home page shortly.
        </p>
      </div>
    </div>
  );
}
