"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Bell, Search, Package,
  MapPin, ShoppingCart, LogOut, ArrowUp, ArrowDown,
  LayoutDashboard, User, Menu, Heart, AlertCircle,
  BarChart3, Bookmark, BookmarkCheck, Plus, Trash2,
  Star, X, LineChart,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";
import { fetchAggregatedProducts, type AggregatedProduct, getProductPriceHistory } from "@/lib/api/inventory";
import { fetchMarkets, type Market } from "@/lib/api/markets";
import { fetchShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, type ShoppingItem } from "@/lib/api/shoppingList";
import { fetchSavedProducts, saveProduct, removeSavedProduct, type SavedProduct } from "@/lib/api/saved";
import { fetchPriceAlerts, deletePriceAlert, type PriceAlert } from "@/lib/api/priceAlerts";
import type { LocationStatus } from "@/hooks/use-location";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/inventory", icon: Package, label: "Browse Products", active: false },
  { href: "/shopping-list", icon: ShoppingCart, label: "Shopping List", active: false },
  { href: "/orders", icon: Heart, label: "Saved Items", active: false },
  { href: "/profile", icon: User, label: "Profile", active: false },
];

/* ── component ───────────────────────────────────────────────────── */
interface BuyerDashboardProps {
  userLocation: string;
  userName?: string;
  userCoords?: { lat: number; lng: number };
  locationStatus?: LocationStatus;
  onRequestLocation?: () => void;
}

export default function BuyerDashboard({
  userLocation,
  userName,
  userCoords,
  locationStatus,
  onRequestLocation,
}: BuyerDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // API data
  const [products, setProducts] = useState<AggregatedProduct[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [removeAlertId, setRemoveAlertId] = useState<string | null>(null);
  const [clearListConfirm, setClearListConfirm] = useState(false);
  const [compareProduct, setCompareProduct] = useState<string | null>(null);
  const [historyProduct, setHistoryProduct] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{ week: string; price: number }[]>([]);
  const [newItem, setNewItem] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(15);

  const marketsWithDist = useMemo(() => {
    if (!userCoords) return markets.map((m) => ({ ...m, distKm: null as number | null }));
    return [...markets]
      .map((m) => ({
        ...m,
        distKm:
          m.latitude != null && m.longitude != null
            ? haversineKm(userCoords.lat, userCoords.lng, m.latitude, m.longitude)
            : null,
      }))
      .sort((a, b) => {
        if (a.distKm == null && b.distKm == null) return 0;
        if (a.distKm == null) return 1;
        if (b.distKm == null) return -1;
        return a.distKm - b.distKm;
      });
  }, [markets, userCoords]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, mkts, list, saved, alerts] = await Promise.all([
        fetchAggregatedProducts(),
        fetchMarkets(),
        fetchShoppingList(),
        fetchSavedProducts(),
        fetchPriceAlerts(),
      ]);
      setProducts(prods);
      setMarkets(mkts);
      setShoppingList(list);
      setSavedProducts(saved);
      setPriceAlerts(alerts);
    } catch {
      // silently fail — user stays with empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter(
    (p) =>
      (categoryFilter === "All" || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );
  const tablePaged = filtered.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  const savedProductIds = new Set(savedProducts.map((s) => s.productId));

  // Total savings: for each saved product, how much cheaper the best price is vs avg market price
  const totalSavings = savedProducts.reduce((sum, s) => {
    const agg = products.find((p) => p.name === s.product.name);
    if (!agg) return sum;
    return sum + Math.max(0, agg.avgPrice - agg.lowestPrice);
  }, 0);

  async function toggleSave(product: AggregatedProduct) {
    const firstProductId = product.sellerList?.[0]?.productId;
    if (!firstProductId) return;
    const existing = savedProducts.find((s) => s.product.name === product.name);
    if (existing) {
      await removeSavedProduct(existing.productId);
      setSavedProducts((prev) => prev.filter((s) => s.productId !== existing.productId));
    } else {
      try {
        const saved = await saveProduct(firstProductId);
        setSavedProducts((prev) => [...prev, saved]);
      } catch { /* already saved or unavailable */ }
    }
  }

  async function addToList() {
    if (!newItem.trim()) return;
    try {
      const item = await addShoppingItem({ name: newItem.trim() });
      setShoppingList((prev) => [...prev, item]);
      setNewItem("");
    } catch { /* ignore */ }
  }

  async function toggleCheck(id: string, checked: boolean) {
    try {
      const updated = await updateShoppingItem(id, { checked: !checked });
      setShoppingList((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch { /* ignore */ }
  }

  async function removeFromList(id: string) {
    await deleteShoppingItem(id);
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
  }

  async function confirmRemoveAlert() {
    if (!removeAlertId) return;
    await deletePriceAlert(removeAlertId);
    setPriceAlerts((prev) => prev.filter((a) => a.id !== removeAlertId));
    setRemoveAlertId(null);
  }

  async function clearChecked() {
    const checked = shoppingList.filter((i) => i.checked);
    await Promise.all(checked.map((i) => deleteShoppingItem(i.id)));
    setShoppingList((prev) => prev.filter((i) => !i.checked));
    setClearListConfirm(false);
  }

  async function openHistory(product: AggregatedProduct) {
    const productId = product.sellerList?.[0]?.productId;
    if (!productId) return;
    setHistoryProduct(historyProduct === product.name ? null : product.name);
    if (historyProduct !== product.name) {
      try {
        const raw = await getProductPriceHistory(productId);
        const data = raw.slice(-6).map((r, i) => ({
          week: `W${i + 1}`,
          price: r.price,
        }));
        setHistoryData(data);
      } catch { setHistoryData([]); }
    }
  }

  const compareProductObj = compareProduct ? products.find((p) => p.name === compareProduct) : null;
  const historyProductObj = historyProduct ? products.find((p) => p.name === historyProduct) : null;
  const checkedCount = shoppingList.filter((i) => i.checked).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* ── SIDEBAR ─── */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className="text-emerald-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-3 pt-4 pb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Buyer Panel</span>
          </div>
        )}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-800">
          <Link href="/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* ── MAIN ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, markets…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="h-5 w-5" />
              {priceAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-bold">
                {userName ? userName[0].toUpperCase() : "B"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">{userName || "Buyer"}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationStatus === "requesting" ? (
                    <span className="animate-pulse">Detecting…</span>
                  ) : locationStatus === "denied" ? (
                    <button
                      onClick={onRequestLocation}
                      className="text-amber-500 hover:underline"
                    >
                      Enable location
                    </button>
                  ) : (
                    userLocation || (
                      <button
                        onClick={onRequestLocation}
                        className="text-emerald-500 hover:underline"
                      >
                        Detect location
                      </button>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Heading */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyer Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {userLocation || "Set your location in profile"} · Compare prices across markets, track alerts, manage your shopping list
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Saved Products", value: savedProducts.length, change: "Products tracked", up: true, Icon: Bookmark, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Price Alerts", value: priceAlerts.length, change: "Monitoring active", up: true, Icon: Bell, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
              { label: "Nearby Markets", value: markets.length, change: "With live hours", up: true, Icon: MapPin, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Shopping List", value: shoppingList.length, change: `${checkedCount} checked off`, up: checkedCount > 0, Icon: ShoppingCart, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
              { label: "Total Savings", value: `GH₵${totalSavings.toFixed(2)}`, change: "vs avg market price", up: true, Icon: TrendingDown, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
            ].map(({ label, value, change, up, Icon, bg, ic }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className={`p-2 rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${ic}`} /></span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-emerald-600" : "text-amber-500"}`}>
                    {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Markets Near You + Shopping List */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Markets Near You */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Markets Near You</h2>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationStatus === "requesting" ? (
                      <span className="animate-pulse">Detecting your location…</span>
                    ) : userLocation ? (
                      <>{userLocation} · sorted by distance</>
                    ) : (
                      "Enable location to sort by distance"
                    )}
                  </p>
                </div>
                {(locationStatus === "denied" || (!userLocation && locationStatus !== "requesting")) && (
                  <button
                    onClick={onRequestLocation}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                    {locationStatus === "denied" ? "Allow location" : "Detect"}
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {marketsWithDist.slice(0, 8).map((m) => (
                  <div key={m.id} className="flex items-center gap-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.city}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.open
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {m.open ? "Open" : "Closed"}
                      </span>
                      {m.distKm != null ? (
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
                          {m.distKm < 1
                            ? `${(m.distKm * 1000).toFixed(0)} m away`
                            : `${m.distKm.toFixed(1)} km away`}
                        </p>
                      ) : m.region ? (
                        <p className="text-xs text-gray-400 mt-0.5">{m.region}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
                {markets.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No markets found</p>
                )}
              </div>
            </div>

            {/* Shopping List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Shopping List</h2>
                {checkedCount > 0 && (
                  <button
                    onClick={() => setClearListConfirm(true)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear done ({checkedCount})
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToList()}
                  placeholder="Add item…"
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
                <button
                  aria-label="Add item to shopping list"
                  onClick={addToList}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto max-h-48">
                {shoppingList.map((item) => (
                  <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg ${item.checked ? "opacity-50" : ""}`}>
                    <input
                      type="checkbox"
                      aria-label={`Mark ${item.name} as ${item.checked ? "incomplete" : "complete"}`}
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id, item.checked)}
                      className="h-4 w-4 accent-emerald-600 rounded flex-shrink-0"
                    />
                    <span className={`flex-1 text-sm text-gray-700 dark:text-gray-300 ${item.checked ? "line-through" : ""}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400">{item.quantity}</span>
                    <button
                      aria-label="Remove from shopping list"
                      onClick={() => removeFromList(item.id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {shoppingList.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Your shopping list is empty</p>
                )}
              </div>
            </div>
          </div>

          {/* Price Comparison Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Market Price Comparison</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Live prices across Ghana markets · Click <BarChart3 className="inline h-3 w-3 mx-0.5" /> to compare sellers · <LineChart className="inline h-3 w-3 mx-0.5" /> for price history
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setTablePage(1); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {["Product", "Category", "Best Price", "Avg Price", "Highest", "Sellers", "Trend", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tablePaged.map((p) => {
                    const isSaved = savedProducts.some((s) => s.product.name === p.name);
                    return (
                      <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</p>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 ${i < Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.category}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">GH₵{p.lowestPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400">GH₵{p.avgPrice.toFixed(2)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">GH₵{p.highestPrice.toFixed(2)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {p.sellers} sellers
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`flex items-center gap-1 text-xs font-medium ${p.up ? "text-emerald-600" : "text-red-500"}`}>
                            {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {p.change}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleSave(p)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSaved
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500"
                              }`}
                              title={isSaved ? "Remove from saved" : "Save product"}
                            >
                              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setCompareProduct(compareProduct === p.name ? null : p.name)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                compareProduct === p.name
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-500"
                              }`}
                              title="Compare sellers for this product"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openHistory(p)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                historyProduct === p.name
                                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-500"
                              }`}
                              title="View price history trend"
                            >
                              <LineChart className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {tablePaged.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PageBar page={tablePage} total={filtered.length} pageSize={tablePageSize} setPage={setTablePage} setPageSize={(s) => { setTablePageSize(s); setTablePage(1); }} label="products" />
          </div>

          {/* Seller Price Comparison */}
          {compareProductObj && (() => {
            const sellers = compareProductObj.sellerList ?? [];
            const bestPrice = sellers.length ? Math.min(...sellers.map((s) => s.price)) : 0;
            return (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Seller Comparison: {compareProductObj.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sellers.length} sellers · Best price: <span className="text-emerald-600 dark:text-emerald-400 font-medium">GH₵{bestPrice.toFixed(2)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setCompareProduct(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close comparison"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sellers.map((seller) => {
                    const isLowest = seller.price === bestPrice;
                    return (
                      <div
                        key={seller.productId}
                        className={`relative rounded-xl border p-4 flex flex-col gap-2 transition-all ${
                          isLowest
                            ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm shadow-emerald-200 dark:shadow-none"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {isLowest && (
                          <span className="absolute -top-2.5 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                            BEST PRICE
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{seller.seller}</p>
                          {!seller.inStock && (
                            <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded flex-shrink-0">
                              Out of stock
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />{seller.market}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                        }`}>
                          GH₵{seller.price.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-400">
                            {seller.market}
                          </span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(seller.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200 dark:text-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Price History Trends */}
          {historyProductObj && historyData.length > 0 && (() => {
            const maxPrice = Math.max(...historyData.map((h) => h.price));
            const minPrice = Math.min(...historyData.map((h) => h.price));
            const latestPrice = historyData[historyData.length - 1]?.price ?? 0;
            const earliestPrice = historyData[0]?.price ?? 0;
            const overallChange = earliestPrice > 0 ? (((latestPrice - earliestPrice) / earliestPrice) * 100).toFixed(1) : "0";
            const trendUp = latestPrice >= earliestPrice;
            return (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-violet-500" />
                      Price History: {historyProductObj.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {historyData.length}-week trend · Low: <span className="text-emerald-600 font-medium">GH₵{minPrice}</span> · High: <span className="text-red-500 font-medium">GH₵{maxPrice}</span>
                      &nbsp;·&nbsp;<span className={trendUp ? "text-red-500" : "text-emerald-600"}>{trendUp ? "▲" : "▼"} {Math.abs(parseFloat(overallChange))}% change</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { setHistoryProduct(null); setHistoryData([]); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close price history"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end gap-3 h-36">
                  {historyData.map((point, i) => {
                    const isMin = point.price === minPrice;
                    const isLatest = i === historyData.length - 1;
                    return (
                      <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-medium ${isLatest ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}>
                          GH₵{point.price}
                        </span>
                        <div
                          className={`w-full rounded-md transition-colors relative group cursor-default ${
                            isMin ? "bg-emerald-500 hover:bg-emerald-400" : isLatest ? "bg-violet-500 hover:bg-violet-400" : "bg-blue-400 hover:bg-blue-300"
                          }`}
                          ref={(el) => { if (el) el.style.height = `${((point.price - minPrice * 0.9) / (maxPrice - minPrice * 0.9 || 1)) * 100}%`; }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                            {isMin ? "Lowest" : isLatest ? "Current" : point.week}: GH₵{point.price}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{point.week}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" /> Lowest price</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500 inline-block" /> Current (latest)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400 inline-block" /> Historical</span>
                </div>
              </div>
            );
          })()}

          {/* Saved Products + Price Alerts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Saved Products */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Saved Products</h2>
              {savedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No saved products yet. Tap the bookmark icon on any product.</p>
              ) : (
                <div className="space-y-3">
                  {savedProducts.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.product.name}</p>
                        <p className="text-xs text-gray-400">
                          {s.product.market?.name} · {s.product.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-600">GH₵{s.product.price.toFixed(2)}</p>
                        <Link href={`/shopping-list?add=${encodeURIComponent(s.product.name)}`} className="flex items-center gap-1 text-[10px] font-medium text-violet-600 hover:underline">
                          <ShoppingCart className="h-2.5 w-2.5" />Add to List
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Alerts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Price Alerts</h2>
                <Link href="/profile" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Alert
                </Link>
              </div>
              <div className="space-y-3">
                {priceAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.productName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when {a.condition.toLowerCase()} GH₵{a.targetPrice}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Current: GH₵{a.currentPrice}</p>
                    </div>
                    <button
                      aria-label="Remove price alert"
                      onClick={() => setRemoveAlertId(a.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {priceAlerts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No active price alerts</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── CONFIRM: Remove price alert ── */}
      <ConfirmDialog
        open={removeAlertId !== null}
        title="Remove Price Alert"
        description="This alert will be deleted and you will no longer receive notifications for this product."
        confirmLabel="Remove Alert"
        variant="warning"
        onConfirm={confirmRemoveAlert}
        onCancel={() => setRemoveAlertId(null)}
      />

      {/* ── CONFIRM: Clear shopping list ── */}
      <ConfirmDialog
        open={clearListConfirm}
        title="Clear Completed Items"
        description={`This will remove ${checkedCount} checked item${checkedCount !== 1 ? "s" : ""} from your shopping list.`}
        confirmLabel="Clear Items"
        variant="warning"
        onConfirm={clearChecked}
        onCancel={() => setClearListConfirm(false)}
      />
    </div>
  );
}
