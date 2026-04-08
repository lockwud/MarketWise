"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  BarChart2,
  Search,
  Check,
  Zap,
  Target,
  Bell,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/footer";
import { decodeToken } from "@/lib/auth";

function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);

  return (
    <div ref={ref}>
      <p className="text-4xl font-extrabold tabular-nums">
        {count}{suffix}
      </p>
      <p className="mt-1 text-emerald-200 text-sm">{label}</p>
    </div>
  );
}

export default function Home() {
  const [authRole, setAuthRole] = useState<string | null>(null);

  useEffect(() => {
    const payload = decodeToken();
    if (payload) setAuthRole(payload.role);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Market<span className="text-emerald-600">Wise</span>
          </span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/join", label: "Explore Markets" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-2">
            {authRole ? (
              <Link href={authRole === "admin" ? "/admin" : "/dashboard"}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="ml-auto md:hidden">
          <MobileNav />
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-white dark:bg-gray-950 pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Subtle gradient blobs */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-emerald-100 dark:bg-emerald-900/20 blur-3xl opacity-50" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-40" />

          <div className="container relative mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left – copy */}
              <div className="flex flex-col gap-6">
                <Badge className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 text-sm px-3 py-1">
                  AI-Powered Price Intelligence
                </Badge>

                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tighter leading-none text-gray-900 dark:text-white">
                  A smarter way to{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    find the&nbsp;best&nbsp;prices.
                  </span>
                </h1>

                <p className="max-w-lg text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  MarketWise predicts market prices for goods &amp; services,
                  compares prices across locations, and tells you exactly where
                  to buy at the lowest cost.
                </p>

                {/* Feature pills */}
                <ul className="grid grid-cols-2 gap-3">
                  {[
                    "AI Price Prediction",
                    "Best Market Locator",
                    "Real-time Price Alerts",
                    "Historical Trends",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/join">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900">
                      Explore Markets
                    </Button>
                  </Link>
                </div>

                {/* Social proof */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-6 text-sm text-gray-400">
                  <span><strong className="text-gray-700 dark:text-gray-200">500+</strong> Markets tracked</span>
                  <span><strong className="text-gray-700 dark:text-gray-200">50+</strong> Cities covered</span>
                  <span><strong className="text-gray-700 dark:text-gray-200">95 %</strong> Prediction accuracy</span>
                </div>
              </div>

              {/* Right – visual cards grid */}
              <div className="relative flex items-center justify-center h-[480px]">
                {/* Central card */}
                <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 w-56">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Pick Today</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">🍅</div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Tomatoes</p>
                      <p className="text-xs text-gray-400">Kumasi Market</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">₵12<span className="text-sm font-medium text-gray-400">/kg</span></p>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      <TrendingDown className="h-3 w-3" /> 18% cheaper
                    </span>
                  </div>
                </div>

                {/* Floating card – top left */}
                <div className="absolute top-8 left-0 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 w-44 animate-float-slow">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Makola Market</p>
                      <p className="text-xs text-gray-400">Accra, Ghana</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-emerald-600 font-medium">Best prices for rice &amp; oil</p>
                </div>

                {/* Floating card – top right */}
                <div className="absolute top-4 right-0 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 w-48 animate-float">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <BarChart2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price Forecast</p>
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    <div className="flex-1 bg-emerald-200 dark:bg-emerald-700 rounded-sm h-[30%]" />
                    <div className="flex-1 bg-emerald-200 dark:bg-emerald-700 rounded-sm h-[55%]" />
                    <div className="flex-1 bg-emerald-200 dark:bg-emerald-700 rounded-sm h-[40%]" />
                    <div className="flex-1 bg-emerald-300 dark:bg-emerald-600 rounded-sm h-[65%]" />
                    <div className="flex-1 bg-emerald-200 dark:bg-emerald-700 rounded-sm h-[45%]" />
                    <div className="flex-1 bg-emerald-300 dark:bg-emerald-600 rounded-sm h-[70%]" />
                    <div className="flex-1 bg-emerald-400 dark:bg-emerald-500 rounded-sm h-[85%]" />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">Next 7 days — Rice 5kg</p>
                </div>

                {/* Floating card – bottom left */}
                <div className="absolute bottom-10 left-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 w-44 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price Alert</p>
                      <p className="text-xs text-gray-400">Palm oil dropped</p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-bold text-amber-600">₵45 → ₵38 / litre</p>
                </div>

                {/* Floating card – bottom right */}
                <div className="absolute bottom-6 right-2 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 w-40 animate-float-slow">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Savings this week</p>
                  <p className="text-2xl font-extrabold text-emerald-600">₵240</p>
                  <p className="text-[10px] text-gray-400">across 8 purchases</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="w-full py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                How It Works
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
                Three simple steps to always get the best deal on any good or
                service in your area.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  icon: <Search className="h-6 w-6" />,
                  color: "emerald",
                  title: "Search Any Good",
                  desc: "Type the name of any product or service – from rice and tomatoes to fuel and cement.",
                },
                {
                  step: "02",
                  icon: <MapPin className="h-6 w-6" />,
                  color: "emerald",
                  title: "Compare Markets",
                  desc: "We instantly compare prices across hundreds of markets and vendors in your city and beyond.",
                },
                {
                  step: "03",
                  icon: <TrendingUp className="h-6 w-6" />,
                  color: "emerald",
                  title: "Get AI Predictions",
                  desc: "Our AI forecasts price changes so you know the best time and place to buy.",
                },
              ].map(({ step, icon, color, title, desc }) => (
                <div key={step} className="flex flex-col gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                    {icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-300 dark:text-gray-600 tracking-widest">STEP {step}</span>
                    <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section className="w-full py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Everything you need to buy smarter.
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg">
                  Whether you're a household shopper, small business owner, or
                  market trader, MarketWise gives you the edge to cut costs and
                  maximise profit.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8">
                    Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Zap className="h-5 w-5" />,
                    color: "emerald",
                    title: "AI Price Prediction",
                    desc: "Forecast where prices are headed so you never overpay again.",
                  },
                  {
                    icon: <MapPin className="h-5 w-5" />,
                    color: "emerald",
                    title: "Market Locator",
                    desc: "Find the nearest market with the lowest price for what you need.",
                  },
                  {
                    icon: <Bell className="h-5 w-5" />,
                    color: "amber",
                    title: "Smart Price Alerts",
                    desc: "Get notified the moment a price drops to your target level.",
                  },
                  {
                    icon: <BarChart2 className="h-5 w-5" />,
                    color: "emerald",
                    title: "Price History Charts",
                    desc: "Visualise price trends over time for any product in any market.",
                  },
                  {
                    icon: <Target className="h-5 w-5" />,
                    color: "rose",
                    title: "Best Deal Finder",
                    desc: "Instantly surface the single best vendor for your shopping list.",
                  },
                  {
                    icon: <ShoppingCart className="h-5 w-5" />,
                    color: "cyan",
                    title: "Shopping List Savings",
                    desc: "Build a list and see how much you save by mixing markets.",
                  },
                ].map(({ icon, color, title, desc }) => (
                  <div key={title} className={`rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                      {icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BANNER ─────────────────────────────────────── */}
        <section className="w-full py-16 bg-emerald-600 dark:bg-emerald-700">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <StatItem target={500} suffix="+" label="Markets Tracked" />
              <StatItem target={50} suffix="+" label="Cities Covered" />
              <StatItem target={10} suffix="k+" label="Daily Price Records" />
              <StatItem target={95} suffix="%" label="Prediction Accuracy" />
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="w-full py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-3xl mx-auto">
              Start finding better prices{" "}
              <span className="text-emerald-600 dark:text-emerald-400">today.</span>
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Join thousands of smart shoppers and traders who use MarketWise
              to make confident buying decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 text-base shadow-lg shadow-emerald-500/30">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-full px-10 text-base border-gray-300 dark:border-gray-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
