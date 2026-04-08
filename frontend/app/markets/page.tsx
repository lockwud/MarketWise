"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeToken } from "@/lib/auth";
import { fetchMarkets, type Market } from "@/lib/api/markets";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, BarChart3, Heart, Store, Clock,
  Users, Tag, ChevronRight,
} from "lucide-react";

type IconComp = React.FC<{ className?: string }>;

const SELLER_NAV = [
  { href: "/dashboard",    icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory",    icon: Package        as IconComp, label: "My Products" },
  { href: "/orders",       icon: ShoppingCart   as IconComp, label: "Orders" },
  { href: "/shopping-list",icon: BarChart3      as IconComp, label: "Price Tracking" },
  { href: "/markets",      icon: MapPin         as IconComp, label: "Markets", active: true },
  { href: "/profile",      icon: User           as IconComp, label: "Profile" },
];
const BUYER_NAV = [
  { href: "/dashboard",    icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory",    icon: Package         as IconComp, label: "Browse Products" },
  { href: "/shopping-list",icon: ShoppingCart    as IconComp, label: "Shopping List" },
  { href: "/orders",       icon: Heart           as IconComp, label: "Saved Items" },
  { href: "/markets",      icon: MapPin          as IconComp, label: "Markets", active: true },
  { href: "/profile",      icon: User            as IconComp, label: "Profile" },
];
const ADMIN_NAV = [
  { href: "/admin",        icon: LayoutDashboard as IconComp, label: "Overview" },
  { href: "/admin/user",   icon: Users           as IconComp, label: "Users" },
  { href: "/admin/delivery",icon: Tag            as IconComp, label: "Price Submissions" },
  { href: "/inventory",    icon: Package         as IconComp, label: "Products" },
  { href: "/markets",      icon: MapPin          as IconComp, label: "Markets", active: true },
  { href: "/profile",      icon: User            as IconComp, label: "Settings" },
];

export default function MarketsPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const payload = decodeToken();
    setRole(payload?.role ?? "buyer");
  }, []);

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const nav    = role === "admin" ? ADMIN_NAV : role === "buyer" ? BUYER_NAV : SELLER_NAV;
  const accent = role === "admin" ? "violet" : "emerald";
  return <MarketsView role={role} nav={nav} accent={accent} />;
}

function MarketsView({ role, nav, accent }: { role: string; nav: typeof SELLER_NAV; accent: string }) {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [search, setSearch]             = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [openOnly, setOpenOnly]         = useState(false);
  const [markets, setMarkets]           = useState<Market[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selected, setSelected]         = useState<Market | null>(null);

  useEffect(() => {
    fetchMarkets()
      .then(setMarkets)
      .catch(() => setError("Failed to load markets."))
      .finally(() => setLoading(false));
  }, []);

  const regions = ["All", ...Array.from(new Set(markets.map(m => m.region).filter(Boolean)))];

  const filtered = markets.filter(m =>
    (regionFilter === "All" || m.region === regionFilter) &&
    (!openOnly || m.open) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
     m.city.toLowerCase().includes(search.toLowerCase()))
  );

  const activeStyle = accent === "violet" ? "bg-violet-600 text-white" : "bg-emerald-600 text-white";
  const iconBg      = accent === "violet" ? "bg-violet-600" : "bg-emerald-600";
  const accentText  = accent === "violet" ? "text-violet-400" : "text-emerald-400";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className={`h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg ${iconBg}`}>
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className={accentText}>Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-3 pt-4 pb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              {role === "admin" ? "Admin Panel" : role === "buyer" ? "Buyer Panel" : "Seller Panel"}
            </span>
          </div>
        )}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {nav.map(({ href, icon: Icon, label, active }: any) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? activeStyle : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <Icon className="h-4 w-4 flex-shrink-0" />{sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-800">
          <Link href="/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4 flex-shrink-0" />{sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search markets, cities…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} className="accent-emerald-600 h-4 w-4 rounded" />
              Open now
            </label>
            <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Markets</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Explore markets across Ghana · {loading ? "loading…" : `${filtered.length} market${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Markets",   value: markets.length,                                                                     Icon: Store   as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600" },
              { label: "Open Now",        value: markets.filter(m => m.open).length,                                                 Icon: Clock   as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20",     ic: "text-blue-600" },
              { label: "Total Sellers",   value: markets.reduce((a, m) => a + (m.sellerCount  ?? 0), 0).toLocaleString(),            Icon: Users   as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20",   ic: "text-amber-600" },
              { label: "Products Listed", value: markets.reduce((a, m) => a + (m.productCount ?? 0), 0).toLocaleString(),            Icon: Package as IconComp, bg: "bg-purple-50 dark:bg-purple-900/20", ic: "text-purple-600" },
            ].map(({ label, value, Icon, bg, ic }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                <span className={`p-3 rounded-xl ${bg} flex-shrink-0`}><Icon className={`h-5 w-5 ${ic}`} /></span>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? "—" : value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Region filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {regions.map(r => (
              <button key={r} onClick={() => setRegionFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${regionFilter === r ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"}`}>
                {r}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          )}

          {/* Market cards */}
          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(market => (
                <button key={market.id} onClick={() => setSelected(market)}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${market.open ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                      {market.open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{market.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{market.city}{market.region ? `, ${market.region}` : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    {market.sellerCount  != null && <span className="flex items-center gap-1"><Users   className="h-3 w-3" />{market.sellerCount} sellers</span>}
                    {market.productCount != null && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{market.productCount.toLocaleString()} products</span>}
                  </div>
                  {market.hours && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{market.hours}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Store className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No markets match your filter.</p>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 dark:bg-gray-950 px-5 py-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Market<span className="text-emerald-400">Wise</span></span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{selected.city}{selected.region ? `, ${selected.region}` : ""}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selected.open ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {selected.open ? "Open" : "Closed"}
                </span>
              </div>
              {selected.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Sellers",  selected.sellerCount  ?? "—"],
                  ["Products", selected.productCount != null ? selected.productCount.toLocaleString() : "—"],
                  ["Hours",    selected.hours   ?? "—"],
                  ["Status",   selected.status  ?? "—"],
                ].map(([k, v]) => (
                  <div key={String(k)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{v}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected(null)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
