"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/auth";
import { TrendingUp, LogOut } from "lucide-react";

const REDIRECT_MS = 2500;
const STEPS = [
  "Clearing your session…",
  "Securing your account…",
  "See you next time!",
];

export default function SignoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Call backend logout to clear server-side cookie, then clear client cookies
    import("@/lib/api/auth").then(({ logout }) => logout().catch(() => {})).finally(() => {
      clearAuthCookies();
    });

    // Advance through status messages
    const s1 = setTimeout(() => setStep(1), 600);
    const s2 = setTimeout(() => setStep(2), 1400);

    // Animate progress bar over REDIRECT_MS
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / REDIRECT_MS) * 100);
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (elapsed < REDIRECT_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const redirect = setTimeout(() => router.replace("/"), REDIRECT_MS);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(redirect);
      cancelAnimationFrame(raf);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center gap-6">
        {/* Icon with pulsing ring */}
        <div className="relative flex items-center justify-center">
          <span className="absolute h-20 w-20 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="relative h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <LogOut className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-gray-900 dark:text-white">
            Market<span className="text-emerald-600">Wise</span>
          </span>
        </div>

        {/* Status text — fades between steps */}
        <div className="h-6 flex items-center justify-center">
          <p
            key={step}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-fade-in"
          >
            {STEPS[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div ref={barRef} className="h-full bg-emerald-500 rounded-full signout-bar" />
        </div>
      </div>

      <style>{`
        .signout-bar { width: 0%; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.35s ease both; }
      `}</style>
    </div>
  );
}
