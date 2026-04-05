import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  MapPin,
  BarChart2,
  Bell,
  Users,
  ShoppingCart,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
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
            { href: "/dashboard", label: "Explore Markets" },
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
          </div>
        </nav>
        <div className="ml-auto md:hidden">
          <MobileNav />
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden bg-white dark:bg-gray-950">
          <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-100 dark:bg-emerald-900/20 blur-3xl opacity-50" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-40" />
          <div className="container relative mx-auto px-4 md:px-8 text-center">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 px-3 py-1">
              Our Mission
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-white max-w-3xl mx-auto">
              About{" "}
              <span className="text-emerald-600 dark:text-emerald-400">MarketWise</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              We're on a mission to make market price information transparent,
              accessible, and actionable for every shopper, trader, and business
              owner — so you never overpay for goods and services again.
            </p>
          </div>
        </section>

        {/* ── OUR STORY ─────────────────────────────────────────── */}
        <section className="w-full py-20 bg-emerald-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-5">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Our Story
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  MarketWise was born from a simple frustration: prices for the
                  same item varied wildly from one market to the next, yet there
                  was no easy way to compare them. Shoppers and small businesses
                  were losing money simply because they lacked information.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Our team of data scientists, economists, and local market
                  experts built an AI engine that continuously tracks prices
                  across hundreds of markets, forecasts upcoming changes, and
                  pinpoints where the best deals are at any moment.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Whether you're a household stocking up for the week or a
                  retailer managing procurement, MarketWise gives you the
                  intelligence to buy smarter every day.
                </p>
              </div>

              {/* Stats panel */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "500+", label: "Markets Tracked", icon: <MapPin className="h-5 w-5" /> },
                  { value: "50+", label: "Cities Covered", icon: <TrendingUp className="h-5 w-5" /> },
                  { value: "10k+", label: "Daily Price Records", icon: <BarChart2 className="h-5 w-5" /> },
                  { value: "95%", label: "Prediction Accuracy", icon: <Zap className="h-5 w-5" /> },
                ].map(({ value, label, icon }) => (
                  <div
                    key={label}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {icon}
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEMS WE SOLVE ─────────────────────────────────── */}
        <section className="w-full py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                The Problem We're Solving
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
                Opaque pricing costs consumers and businesses billions every year.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Price Opacity",
                  desc: "Prices for the same goods vary by up to 40% between markets with no easy way to compare.",
                },
                {
                  title: "Overpaying",
                  desc: "The average household overspends hundreds of dollars a year simply due to lack of price information.",
                },
                {
                  title: "Market Volatility",
                  desc: "Seasonal and supply-chain swings make it hard to time purchases without historical data.",
                },
                {
                  title: "Wasted Trips",
                  desc: "Shoppers travel to markets only to find prices higher than expected, wasting time and fuel.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="flex flex-col gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section className="w-full py-20 bg-emerald-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                What MarketWise Offers
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
                A full suite of tools designed to put price intelligence in your hands.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "AI Price Prediction",
                  desc: "Forecast where prices are heading so you can buy at the right time.",
                },
                {
                  icon: <MapPin className="h-5 w-5" />,
                  title: "Market Locator",
                  desc: "Discover the nearest market with the lowest current price for any item.",
                },
                {
                  icon: <Bell className="h-5 w-5" />,
                  title: "Smart Price Alerts",
                  desc: "Get notified the moment a price drops to your chosen target level.",
                },
                {
                  icon: <BarChart2 className="h-5 w-5" />,
                  title: "Price History Charts",
                  desc: "Visualise historical pricing trends for any product or market.",
                },
                {
                  icon: <ShoppingCart className="h-5 w-5" />,
                  title: "Shopping List Savings",
                  desc: "Build a list and see exactly how much you save by combining the best markets.",
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Multi-User Access",
                  desc: "Share price tracking with your team, family, or procurement department.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="w-full py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-2xl mx-auto">
              Ready to shop{" "}
              <span className="text-emerald-600 dark:text-emerald-400">smarter?</span>
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Join thousands of smart shoppers and traders who use MarketWise to
              make confident buying decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 text-base shadow-lg shadow-emerald-500/30"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 text-base border-gray-300 dark:border-gray-700"
                >
                  Explore Markets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
