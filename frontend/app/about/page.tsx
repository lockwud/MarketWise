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
  Package,
  ClipboardList,
  Store,
  Shield,
  Heart,
  Search,
  Star,
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
            { href: "/signup", label: "Explore Markets" },
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
            <Link href="/join">
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
              Ghana's AI-powered marketplace intelligence platform — making market
              price information transparent, accessible, and actionable for every
              shopper, trader, and business owner across Accra, Kumasi, and beyond.
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
                  across hundreds of Ghanaian markets — from Makola to Kejetia —
                  forecasting upcoming changes and pinpointing the best deals in
                  real time.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Whether you're a household stocking up for the week or a
                  trader managing multiple product lines, MarketWise gives both
                  buyers and sellers the intelligence to operate smarter every day.
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

        {/* ── WHO IT'S FOR ──────────────────────────────────────── */}
        <section className="w-full py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Built for Everyone in the Market
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
                MarketWise serves two sides of the marketplace — each with a
                dedicated, purpose-built experience.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Buyers */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-5">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">For Buyers</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Compare prices across sellers, find the best deals, and shop with total confidence.
                </p>
                <ul className="space-y-3">
                  {[
                    "Browse & compare products across all markets",
                    "See lowest, highest & average prices side-by-side",
                    "Save favourite products for quick access",
                    "Build a smart shopping list with savings estimate",
                    "Set price-drop alerts on any item",
                    "View price history trends before you buy",
                    "Find markets near you with live opening hours",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/signup">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
                      Sign up as Buyer <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sellers */}
              <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white mb-5">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">For Sellers</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  List your products, manage your inventory, track orders and stay ahead of market prices.
                </p>
                <ul className="space-y-3">
                  {[
                    "List & manage products with stock levels",
                    "Submit and update live market prices",
                    "Manage incoming orders end-to-end",
                    "Track competitor price changes in real time",
                    "Monitor stock alerts for low-inventory items",
                    "View weekly sales performance charts",
                    "Reach buyers across multiple markets",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-4 w-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/seller-apply">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6">
                      Sign up as Seller <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section className="w-full py-20 bg-emerald-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                How It Works
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
                From sign-up to smarter decisions in three simple steps.
              </p>
            </div>

            {/* Buyer flow */}
            <div className="mb-14">
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-8">
                Buyer Journey
              </p>
              <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { step: "01", icon: <Search className="h-6 w-6" />, title: "Search Any Product", desc: "Type the item you need. Browse results from sellers across multiple markets instantly." },
                  { step: "02", icon: <BarChart2 className="h-6 w-6" />, title: "Compare Prices & Sellers", desc: "See every seller's price, location, rating, and stock — ranked from lowest to highest." },
                  { step: "03", icon: <ShoppingCart className="h-6 w-6" />, title: "Shop Smarter", desc: "Save items, set price alerts, build your shopping list and head to the best market." },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <span className="absolute -top-2.5 left-4 text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">{step}</span>
                    <div className="mb-3 mt-2 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller flow */}
            <div>
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-8">
                Seller Journey
              </p>
              <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { step: "01", icon: <Package className="h-6 w-6" />, title: "List Your Products", desc: "Add products with prices, stock levels, and market location. Go live in minutes." },
                  { step: "02", icon: <ClipboardList className="h-6 w-6" />, title: "Manage Orders", desc: "Receive and process buyer orders. Confirm, update, or mark deliveries — all in one place." },
                  { step: "03", icon: <TrendingUp className="h-6 w-6" />, title: "Track & Compete", desc: "Monitor real-time price changes across competitors and adjust your listings to stay ahead." },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <span className="absolute -top-2.5 left-4 text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">{step}</span>
                    <div className="mb-3 mt-2 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
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
                  desc: "The average household overspends hundreds of GH₵ a year simply due to lack of price information.",
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
                Everything You Need, In One Platform
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
                  title: "Markets Directory",
                  desc: "Browse a live directory of physical markets — with hours, distance, seller counts, and product categories.",
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
                  desc: "Build a list, check items off, and see exactly how much you save by shopping at the right markets.",
                },
                {
                  icon: <Package className="h-5 w-5" />,
                  title: "Inventory Management",
                  desc: "Sellers manage product listings, stock levels, and get low-stock alerts automatically.",
                },
                {
                  icon: <ClipboardList className="h-5 w-5" />,
                  title: "Order Management",
                  desc: "Track orders from pending to delivery. Buyers save items; sellers confirm and fulfill with ease.",
                },
                {
                  icon: <Heart className="h-5 w-5" />,
                  title: "Saved Items",
                  desc: "Bookmark products you want to watch and revisit your favourites list any time.",
                },
                {
                  icon: <Star className="h-5 w-5" />,
                  title: "Seller Ratings",
                  desc: "Community-driven ratings help buyers choose trusted sellers and motivate quality service.",
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "Verified Price Data",
                  desc: "Admin-reviewed price submissions keep the data accurate and free from manipulation.",
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "Competitive Price Tracking",
                  desc: "Sellers monitor market-wide price movements to stay competitive without manual research.",
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Multi-Role Access",
                  desc: "Buyers, sellers, and admins each get a dedicated dashboard tailored to their workflow.",
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

        {/* ── TRUST & TRANSPARENCY ─────────────────────────────── */}
        <section className="w-full py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <Badge className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800 px-3 py-1">
                  Platform Integrity
                </Badge>
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Price Data You Can Trust
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Every price submitted by a seller goes through a review
                  pipeline before it becomes visible to buyers. Our admin team
                  flags suspicious changes, verifies outliers, and approves
                  updates — so the price you see reflects what you'll actually pay.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                  Sellers are rated by buyers after transactions, creating an
                  accountability layer that rewards accuracy and penalises
                  misleading listings.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: <Shield className="h-5 w-5" />, title: "Admin-Reviewed Submissions", desc: "Price changes are approved, flagged, or rejected before going live." },
                  { icon: <Star className="h-5 w-5" />, title: "Community Ratings", desc: "Buyer ratings keep sellers accountable and surface the best traders." },
                  { icon: <Users className="h-5 w-5" />, title: "User Management", desc: "Admins can suspend, verify, or review any account to maintain platform quality." },
                  { icon: <Bell className="h-5 w-5" />, title: "Anomaly Flagging", desc: "Sudden price swings are automatically flagged for human review." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="w-full py-24 bg-emerald-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-2xl mx-auto">
              Ready to shop{" "}
              <span className="text-emerald-600 dark:text-emerald-400">smarter?</span>
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Join thousands of smart shoppers and traders across Ghana who use
              MarketWise to make confident buying and selling decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/join">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 text-base shadow-lg shadow-emerald-500/30"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/join">
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
