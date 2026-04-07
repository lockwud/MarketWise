"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package,
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

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/inventory", icon: Package, label: "Browse Products", active: false },
  { href: "/shopping-list", icon: ShoppingCart, label: "Shopping List", active: false },
  { href: "/orders", icon: Heart, label: "Saved Items", active: false },
  { href: "/profile", icon: User, label: "Profile", active: false },
];

/* ── component ───────────────────────────────────────────────────── */
export default function BuyerDashboard({ userLocation }: { userLocation: string }) {
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
                B
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">Buyer</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {userLocation || "Location not set"}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Saved Products", value: savedProducts.length, change: "Products tracked", up: true, Icon: Bookmark, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Price Alerts", value: priceAlerts.length, change: "Monitoring active", up: true, Icon: Bell, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
              { label: "Nearby Markets", value: markets.length, change: "With live hours", up: true, Icon: MapPin, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Shopping List", value: shoppingList.length, change: `${checkedCount} checked off`, up: checkedCount > 0, Icon: ShoppingCart, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
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
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Markets Near You</h2>
                <p className="text-xs text-gray-400 mt-0.5">Live opening hours · {userLocation || "Accra"} area</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {markets.slice(0, 8).map((m) => (
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
                      {m.region && <p className="text-xs text-gray-400 mt-0.5">{m.region}</p>}
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

import {
  TrendingUp, Bell, Search, Package,
  MapPin, ShoppingCart, LogOut, ArrowUp, ArrowDown,
  LayoutDashboard, User, Menu, Heart, AlertCircle,
  BarChart3, Bookmark, BookmarkCheck, Plus, Trash2,
  Star, X, LineChart,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";

/* ── demo data ───────────────────────────────────────────────────── */
const allProducts = [
  // Market goods
  { id: 1, name: "Rice (50kg bag)", category: "Grains", sellers: 8, avgPrice: 290, lowestPrice: 265, highestPrice: 320, market: "Accra Central Market", change: "+2.1%", up: true, rating: 4.5 },
  { id: 2, name: "Cooking Oil (2L)", category: "Cooking Essentials", sellers: 12, avgPrice: 38.5, lowestPrice: 34, highestPrice: 45, market: "Kumasi Central Market", change: "-3.8%", up: false, rating: 4.2 },
  { id: 3, name: "Tomatoes (1kg)", category: "Vegetables", sellers: 20, avgPrice: 12, lowestPrice: 9, highestPrice: 15, market: "Takoradi Market", change: "+4.3%", up: true, rating: 3.9 },
  { id: 4, name: "Onions (1kg)", category: "Vegetables", sellers: 15, avgPrice: 8, lowestPrice: 7, highestPrice: 11, market: "Madina Market", change: "0%", up: true, rating: 4.0 },
  { id: 5, name: "Chicken (1kg)", category: "Proteins", sellers: 6, avgPrice: 32, lowestPrice: 28, highestPrice: 38, market: "Accra Central Market", change: "-8.6%", up: false, rating: 4.7 },
  { id: 6, name: "Yam (medium)", category: "Vegetables", sellers: 9, avgPrice: 18, lowestPrice: 15, highestPrice: 22, market: "Kumasi Central Market", change: "+1.5%", up: true, rating: 4.1 },
  { id: 7, name: "Eggs (crate×30)", category: "Proteins", sellers: 11, avgPrice: 55, lowestPrice: 50, highestPrice: 62, market: "Kaneshie Market", change: "+5.4%", up: true, rating: 4.3 },
  // Electronics — Smartphones
  { id: 8, name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", sellers: 5, avgPrice: 9800, lowestPrice: 8500, highestPrice: 11500, market: "Accra Central Market", change: "+3.2%", up: true, rating: 4.8 },
  { id: 9, name: "Samsung Galaxy S24 Ultra", category: "Smartphones", sellers: 7, avgPrice: 8400, lowestPrice: 7200, highestPrice: 10000, market: "Kumasi Central Market", change: "-2.1%", up: false, rating: 4.6 },
  { id: 10, name: "Samsung Galaxy A55 5G", category: "Smartphones", sellers: 9, avgPrice: 4100, lowestPrice: 3200, highestPrice: 5200, market: "Madina Market", change: "+1.8%", up: true, rating: 4.3 },
  // Electronics — Laptops
  { id: 11, name: "MacBook Air M3 (13\")", category: "Laptops", sellers: 4, avgPrice: 15800, lowestPrice: 13500, highestPrice: 18500, market: "Accra Central Market", change: "+5.1%", up: true, rating: 4.9 },
  { id: 12, name: "HP Pavilion 15 (Core i7)", category: "Laptops", sellers: 6, avgPrice: 8200, lowestPrice: 6800, highestPrice: 10500, market: "Kaneshie Market", change: "-4.3%", up: false, rating: 4.4 },
  { id: 13, name: "Lenovo IdeaPad 3 (Core i5)", category: "Laptops", sellers: 8, avgPrice: 6500, lowestPrice: 5400, highestPrice: 7800, market: "Kumasi Central Market", change: "+2.4%", up: true, rating: 4.2 },
  // Electronics — Desktops
  { id: 14, name: "Dell OptiPlex 7010 (i5)", category: "Desktops", sellers: 5, avgPrice: 5500, lowestPrice: 4200, highestPrice: 7000, market: "Accra Central Market", change: "+2.7%", up: true, rating: 4.2 },
  { id: 15, name: "HP ProDesk 400 (Ryzen 5)", category: "Desktops", sellers: 4, avgPrice: 4800, lowestPrice: 3900, highestPrice: 6200, market: "Kaneshie Market", change: "-1.5%", up: false, rating: 4.0 },
];

const sellersByProduct: Record<number, { id: number; seller: string; market: string; price: number; distance: string; rating: number; inStock: boolean }[]> = {
  1: [
    { id: 1, seller: "Mensah Grains", market: "Accra Central Market", price: 265, distance: "1.2km", rating: 4.7, inStock: true },
    { id: 2, seller: "Aba Agro Stores", market: "Kaneshie Market", price: 275, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 3, seller: "Golden Harvest", market: "Madina Market", price: 280, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 4, seller: "Nkrumah Supplies", market: "Accra Central Market", price: 290, distance: "1.5km", rating: 3.9, inStock: true },
    { id: 5, seller: "TwinStar Traders", market: "Kaneshie Market", price: 295, distance: "4.0km", rating: 4.5, inStock: false },
    { id: 6, seller: "Akosua Wholesalers", market: "Tema Market", price: 310, distance: "18km", rating: 4.2, inStock: true },
    { id: 7, seller: "BulkFoods GH", market: "Madina Market", price: 315, distance: "6.5km", rating: 4.0, inStock: true },
    { id: 8, seller: "Bright Commodities", market: "Agbogbloshie", price: 320, distance: "2.3km", rating: 3.7, inStock: true },
  ],
  2: [
    { id: 1, seller: "Healthy Oils Co.", market: "Kumasi Central Market", price: 34, distance: "5.3km", rating: 4.6, inStock: true },
    { id: 2, seller: "Palmy Essentials", market: "Takoradi Market", price: 36, distance: "12km", rating: 4.0, inStock: true },
    { id: 3, seller: "Oil & More", market: "Accra Central Market", price: 37, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 4, seller: "Frytex Supplies", market: "Kaneshie Market", price: 39, distance: "3.8km", rating: 3.8, inStock: true },
  ],
  3: [
    { id: 1, seller: "Fresh Farms GH", market: "Takoradi Market", price: 9, distance: "12km", rating: 4.2, inStock: true },
    { id: 2, seller: "Veggies Direct", market: "Kumasi Central Market", price: 10, distance: "5.3km", rating: 4.5, inStock: true },
    { id: 3, seller: "Garden Fresh", market: "Madina Market", price: 11, distance: "6.1km", rating: 3.9, inStock: true },
    { id: 4, seller: "Tomato Queen", market: "Accra Central Market", price: 12, distance: "1.2km", rating: 4.1, inStock: true },
  ],
  4: [
    { id: 1, seller: "Onion King", market: "Madina Market", price: 7, distance: "6.1km", rating: 4.3, inStock: true },
    { id: 2, seller: "Spice World", market: "Accra Central Market", price: 8, distance: "1.2km", rating: 4.0, inStock: true },
    { id: 3, seller: "Fresh Roots GH", market: "Kumasi Central Market", price: 9, distance: "5.3km", rating: 3.7, inStock: true },
  ],
  5: [
    { id: 1, seller: "Poultry Plus", market: "Accra Central Market", price: 28, distance: "1.2km", rating: 4.8, inStock: true },
    { id: 2, seller: "Chicken Depot", market: "Kaneshie Market", price: 30, distance: "3.8km", rating: 4.5, inStock: true },
    { id: 3, seller: "Farm Fresh Meats", market: "Madina Market", price: 33, distance: "6.1km", rating: 4.2, inStock: true },
  ],
  6: [
    { id: 1, seller: "Yam Farmers Coop", market: "Kumasi Central Market", price: 15, distance: "5.3km", rating: 4.4, inStock: true },
    { id: 2, seller: "Root Harvest", market: "Accra Central Market", price: 17, distance: "1.2km", rating: 4.0, inStock: true },
    { id: 3, seller: "Tuber Traders", market: "Madina Market", price: 19, distance: "6.1km", rating: 3.8, inStock: true },
  ],
  7: [
    { id: 1, seller: "EggMart GH", market: "Kaneshie Market", price: 50, distance: "3.8km", rating: 4.6, inStock: true },
    { id: 2, seller: "Poultry World", market: "Accra Central Market", price: 52, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "Fresh Eggs Co.", market: "Kumasi Central Market", price: 55, distance: "5.3km", rating: 4.1, inStock: true },
    { id: 4, seller: "Daily Farms", market: "Takoradi Market", price: 58, distance: "12km", rating: 3.9, inStock: false },
  ],
  // Smartphones
  8: [
    { id: 1, seller: "iGhana Store", market: "Accra Central Market", price: 8500, distance: "1.2km", rating: 4.8, inStock: true },
    { id: 2, seller: "Apple Resellers GH", market: "Kaneshie Market", price: 8900, distance: "3.8km", rating: 4.6, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 9200, distance: "6.1km", rating: 4.4, inStock: true },
    { id: 4, seller: "PhoneZone GH", market: "Kumasi Central Market", price: 9500, distance: "5.3km", rating: 4.2, inStock: false },
    { id: 5, seller: "Elite Gadgets", market: "Accra Central Market", price: 11500, distance: "1.8km", rating: 4.0, inStock: true },
  ],
  9: [
    { id: 1, seller: "Samsung Deals GH", market: "Kumasi Central Market", price: 7200, distance: "5.3km", rating: 4.7, inStock: true },
    { id: 2, seller: "MobileMart", market: "Accra Central Market", price: 7600, distance: "1.2km", rating: 4.5, inStock: true },
    { id: 3, seller: "GadgetPro", market: "Kaneshie Market", price: 8000, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 4, seller: "TechHub Accra", market: "Madina Market", price: 8400, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 5, seller: "PhoneZone GH", market: "Takoradi Market", price: 9000, distance: "12km", rating: 3.9, inStock: true },
    { id: 6, seller: "Digital World", market: "Accra Central Market", price: 9500, distance: "2.0km", rating: 3.8, inStock: false },
    { id: 7, seller: "Elite Gadgets", market: "Kaneshie Market", price: 10000, distance: "4.2km", rating: 4.0, inStock: true },
  ],
  10: [
    { id: 1, seller: "Samsung Deals GH", market: "Madina Market", price: 3200, distance: "6.1km", rating: 4.5, inStock: true },
    { id: 2, seller: "AfriTech Stores", market: "Accra Central Market", price: 3500, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "MobileMart", market: "Kumasi Central Market", price: 3800, distance: "5.3km", rating: 4.1, inStock: true },
    { id: 4, seller: "GadgetPro", market: "Kaneshie Market", price: 4100, distance: "3.8km", rating: 3.9, inStock: true },
    { id: 5, seller: "TechHub Accra", market: "Takoradi Market", price: 4600, distance: "12km", rating: 4.2, inStock: true },
  ],
  // Laptops
  11: [
    { id: 1, seller: "iGhana Store", market: "Accra Central Market", price: 13500, distance: "1.2km", rating: 4.9, inStock: true },
    { id: 2, seller: "Apple Resellers GH", market: "Kaneshie Market", price: 14200, distance: "3.8km", rating: 4.7, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 15500, distance: "6.1km", rating: 4.5, inStock: false },
    { id: 4, seller: "Digital World", market: "Kumasi Central Market", price: 18500, distance: "5.3km", rating: 4.2, inStock: true },
  ],
  12: [
    { id: 1, seller: "HP Authorized GH", market: "Kaneshie Market", price: 6800, distance: "3.8km", rating: 4.5, inStock: true },
    { id: 2, seller: "LaptopCity GH", market: "Accra Central Market", price: 7200, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 8000, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 4, seller: "CompuMart", market: "Kumasi Central Market", price: 9000, distance: "5.3km", rating: 3.9, inStock: true },
    { id: 5, seller: "Digital World", market: "Takoradi Market", price: 10500, distance: "12km", rating: 4.0, inStock: false },
  ],
  13: [
    { id: 1, seller: "Lenovo Point GH", market: "Kumasi Central Market", price: 5400, distance: "5.3km", rating: 4.4, inStock: true },
    { id: 2, seller: "LaptopCity GH", market: "Accra Central Market", price: 5800, distance: "1.2km", rating: 4.2, inStock: true },
    { id: 3, seller: "CompuMart", market: "Kaneshie Market", price: 6200, distance: "3.8km", rating: 4.0, inStock: true },
    { id: 4, seller: "TechHub Accra", market: "Madina Market", price: 6800, distance: "6.1km", rating: 3.8, inStock: true },
    { id: 5, seller: "GadgetPro", market: "Takoradi Market", price: 7200, distance: "12km", rating: 3.7, inStock: true },
  ],
  // Desktops
  14: [
    { id: 1, seller: "Dell Resellers GH", market: "Accra Central Market", price: 4200, distance: "1.2km", rating: 4.4, inStock: true },
    { id: 2, seller: "CompuMart", market: "Kaneshie Market", price: 4800, distance: "3.8km", rating: 4.2, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 5200, distance: "6.1km", rating: 4.0, inStock: true },
    { id: 4, seller: "Digital World", market: "Kumasi Central Market", price: 6000, distance: "5.3km", rating: 3.9, inStock: false },
    { id: 5, seller: "LaptopCity GH", market: "Kaneshie Market", price: 7000, distance: "4.0km", rating: 3.7, inStock: true },
  ],
  15: [
    { id: 1, seller: "HP Authorized GH", market: "Kaneshie Market", price: 3900, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 2, seller: "CompuMart", market: "Accra Central Market", price: 4300, distance: "1.2km", rating: 4.1, inStock: true },
    { id: 3, seller: "Digital World", market: "Madina Market", price: 4900, distance: "6.1km", rating: 3.9, inStock: true },
    { id: 4, seller: "AfriTech Stores", market: "Kumasi Central Market", price: 5500, distance: "5.3km", rating: 3.7, inStock: true },
  ],
};

// Markets available to buyers (read-only, live opening hours)
const nearbyMarkets = [
  { name: "Accra Central Market", distance: "1.2km", products: 340, status: "Open", city: "Accra" },
  { name: "Kaneshie Market", distance: "3.8km", products: 210, status: "Open", city: "Accra" },
  { name: "Madina Market", distance: "6.1km", products: 185, status: "Open", city: "Accra" },
  { name: "Kumasi Central Market", distance: "5.3km", products: 420, status: "Open", city: "Kumasi" },
  { name: "Takoradi Market", distance: "12km", products: 175, status: "Open", city: "Takoradi" },
  { name: "Tema Market", distance: "18km", products: 200, status: "Closed", city: "Tema" },
  { name: "Agbogbloshie", distance: "2.3km", products: 280, status: "Open", city: "Accra" },
  { name: "Tamale Central Market", distance: "320km", products: 160, status: "Open", city: "Tamale" },
];

// 6-week price history per product
const priceHistoryByProduct: Record<number, { week: string; price: number }[]> = {
  1: [{ week: "W1", price: 280 }, { week: "W2", price: 285 }, { week: "W3", price: 278 }, { week: "W4", price: 290 }, { week: "W5", price: 288 }, { week: "W6", price: 265 }],
  2: [{ week: "W1", price: 40 }, { week: "W2", price: 41 }, { week: "W3", price: 39 }, { week: "W4", price: 40 }, { week: "W5", price: 38.5 }, { week: "W6", price: 34 }],
  3: [{ week: "W1", price: 10 }, { week: "W2", price: 10.5 }, { week: "W3", price: 11 }, { week: "W4", price: 11.5 }, { week: "W5", price: 12 }, { week: "W6", price: 9 }],
  4: [{ week: "W1", price: 8 }, { week: "W2", price: 8 }, { week: "W3", price: 9 }, { week: "W4", price: 8.5 }, { week: "W5", price: 8 }, { week: "W6", price: 7 }],
  5: [{ week: "W1", price: 38 }, { week: "W2", price: 36 }, { week: "W3", price: 35 }, { week: "W4", price: 34 }, { week: "W5", price: 32 }, { week: "W6", price: 28 }],
  6: [{ week: "W1", price: 17 }, { week: "W2", price: 17.5 }, { week: "W3", price: 18 }, { week: "W4", price: 17 }, { week: "W5", price: 18 }, { week: "W6", price: 15 }],
  7: [{ week: "W1", price: 52 }, { week: "W2", price: 53 }, { week: "W3", price: 52 }, { week: "W4", price: 54 }, { week: "W5", price: 55 }, { week: "W6", price: 50 }],
  // Smartphones
  8: [{ week: "W1", price: 8200 }, { week: "W2", price: 8600 }, { week: "W3", price: 9100 }, { week: "W4", price: 9500 }, { week: "W5", price: 9800 }, { week: "W6", price: 8500 }],
  9: [{ week: "W1", price: 7800 }, { week: "W2", price: 7600 }, { week: "W3", price: 7900 }, { week: "W4", price: 8200 }, { week: "W5", price: 8400 }, { week: "W6", price: 7200 }],
  10: [{ week: "W1", price: 3800 }, { week: "W2", price: 3900 }, { week: "W3", price: 4000 }, { week: "W4", price: 4100 }, { week: "W5", price: 4050 }, { week: "W6", price: 3200 }],
  // Laptops
  11: [{ week: "W1", price: 13000 }, { week: "W2", price: 13800 }, { week: "W3", price: 14500 }, { week: "W4", price: 15000 }, { week: "W5", price: 15800 }, { week: "W6", price: 13500 }],
  12: [{ week: "W1", price: 7800 }, { week: "W2", price: 7500 }, { week: "W3", price: 7200 }, { week: "W4", price: 8000 }, { week: "W5", price: 8200 }, { week: "W6", price: 6800 }],
  13: [{ week: "W1", price: 6200 }, { week: "W2", price: 6400 }, { week: "W3", price: 6100 }, { week: "W4", price: 6500 }, { week: "W5", price: 6700 }, { week: "W6", price: 5400 }],
  // Desktops
  14: [{ week: "W1", price: 5000 }, { week: "W2", price: 5200 }, { week: "W3", price: 5400 }, { week: "W4", price: 5500 }, { week: "W5", price: 5600 }, { week: "W6", price: 4200 }],
  15: [{ week: "W1", price: 4600 }, { week: "W2", price: 4700 }, { week: "W3", price: 4800 }, { week: "W4", price: 4750 }, { week: "W5", price: 4800 }, { week: "W6", price: 3900 }],
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/inventory", icon: Package, label: "Browse Products", active: false },
  { href: "/shopping-list", icon: ShoppingCart, label: "Shopping List", active: false },
  { href: "/orders", icon: Heart, label: "Saved Items", active: false },
  { href: "/profile", icon: User, label: "Profile", active: false },
];

/* ── component ───────────────────────────────────────────────────── */
export default function BuyerDashboard({ userLocation }: { userLocation: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Saved / favourite products
  const [saved, setSaved] = useState<number[]>([1, 3]);

  // Price alerts (mutable state so they can be removed)
  const [priceAlerts, setPriceAlerts] = useState([
    { id: 1, product: "Rice (50kg bag)", condition: "below GH₵270", current: 290, target: 270 },
    { id: 2, product: "Cooking Oil (2L)", condition: "any change", current: 38.5, target: 38.5 },
  ]);
  const [removeAlertId, setRemoveAlertId] = useState<number | null>(null);

  const [shoppingList, setShoppingList] = useState<{ id: number; name: string; quantity: string; checked: boolean }[]>([
    { id: 1, name: "Rice (50kg bag)", quantity: "1 bag", checked: false },
    { id: 2, name: "Tomatoes (1kg)", quantity: "2 kg", checked: true },
  ]);
  const [newItem, setNewItem] = useState("");
  const [clearListConfirm, setClearListConfirm] = useState(false);
  const [compareProduct, setCompareProduct] = useState<number | null>(null);
  const [historyProduct, setHistoryProduct] = useState<number | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(15);

  const categories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];
  const filtered = allProducts.filter(
    (p) =>
      (categoryFilter === "All" || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );
  const tablePaged = filtered.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  function toggleSave(id: number) {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addToList() {
    if (!newItem.trim()) return;
    setShoppingList((prev) => [...prev, { id: Date.now(), name: newItem.trim(), quantity: "1", checked: false }]);
    setNewItem("");
  }

  function toggleCheck(id: number) {
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }

  function removeFromList(id: number) {
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
  }

  function confirmRemoveAlert() {
    if (removeAlertId !== null) {
      setPriceAlerts((prev) => prev.filter((a) => a.id !== removeAlertId));
      setRemoveAlertId(null);
    }
  }

  function clearChecked() {
    setShoppingList((prev) => prev.filter((i) => !i.checked));
    setClearListConfirm(false);
  }

  const savedProducts = allProducts.filter((p) => saved.includes(p.id));
  const checkedCount = shoppingList.filter((i) => i.checked).length;

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
                B
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">Buyer</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {userLocation || "Location not set"}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Saved Products", value: saved.length, change: "Products tracked", up: true, Icon: Bookmark, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Price Alerts", value: priceAlerts.length, change: "Monitoring active", up: true, Icon: Bell, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
              { label: "Nearby Markets", value: nearbyMarkets.length, change: "With live hours", up: true, Icon: MapPin, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Shopping List", value: shoppingList.length, change: `${checkedCount} checked off`, up: checkedCount > 0, Icon: ShoppingCart, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
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
            {/* Markets Near You — read-only */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Markets Near You</h2>
                <p className="text-xs text-gray-400 mt-0.5">Live opening hours · {userLocation || "Accra"} area</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {nearbyMarkets.map((m) => (
                  <div key={m.name} className="flex items-center gap-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.products} products · {m.city}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.status === "Open"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {m.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{m.distance} away</p>
                    </div>
                  </div>
                ))}
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
                      onChange={() => toggleCheck(item.id)}
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
                  {tablePaged.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
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
                            onClick={() => toggleSave(p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              saved.includes(p.id)
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500"
                            }`}
                            title={saved.includes(p.id) ? "Remove from saved" : "Save product"}
                          >
                            {saved.includes(p.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setCompareProduct(compareProduct === p.id ? null : p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              compareProduct === p.id
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-500"
                            }`}
                            title="Compare sellers for this product"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setHistoryProduct(historyProduct === p.id ? null : p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              historyProduct === p.id
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
                  ))}
                </tbody>
              </table>
            </div>
            <PageBar page={tablePage} total={filtered.length} pageSize={tablePageSize} setPage={setTablePage} setPageSize={(s) => { setTablePageSize(s); setTablePage(1); }} label="products" />
          </div>

          {/* Seller Price Comparison */}
          {compareProduct !== null && (() => {
            const sellers = sellersByProduct[compareProduct] ?? [];
            const bestPrice = Math.min(...sellers.map((s) => s.price));
            const product = allProducts.find((p) => p.id === compareProduct);
            return (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Seller Comparison: {product?.name}
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
                        key={seller.id}
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
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{seller.distance}
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
          {historyProduct !== null && (() => {
            const history = priceHistoryByProduct[historyProduct] ?? [];
            const product = allProducts.find((p) => p.id === historyProduct);
            const maxPrice = Math.max(...history.map((h) => h.price));
            const minPrice = Math.min(...history.map((h) => h.price));
            const latestPrice = history[history.length - 1]?.price ?? 0;
            const earliestPrice = history[0]?.price ?? 0;
            const overallChange = earliestPrice > 0 ? (((latestPrice - earliestPrice) / earliestPrice) * 100).toFixed(1) : "0";
            const trendUp = latestPrice >= earliestPrice;
            return (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-violet-500" />
                      Price History: {product?.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      6-week trend · Low: <span className="text-emerald-600 font-medium">GH₵{minPrice}</span> · High: <span className="text-red-500 font-medium">GH₵{maxPrice}</span>
                      &nbsp;·&nbsp;<span className={trendUp ? "text-red-500" : "text-emerald-600"}>{trendUp ? "▲" : "▼"} {Math.abs(parseFloat(overallChange))}% over 6 weeks</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setHistoryProduct(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close price history"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end gap-3 h-36">
                  {history.map((point, i) => {
                    const isMin = point.price === minPrice;
                    const isLatest = i === history.length - 1;
                    return (
                      <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-medium ${isLatest ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}>
                          GH₵{point.price}
                        </span>
                        <div
                          className={`w-full rounded-md transition-colors relative group cursor-default ${
                            isMin ? "bg-emerald-500 hover:bg-emerald-400" : isLatest ? "bg-violet-500 hover:bg-violet-400" : "bg-blue-400 hover:bg-blue-300"
                          }`}
                          ref={(el) => { if (el) el.style.height = `${((point.price - minPrice * 0.9) / (maxPrice - minPrice * 0.9)) * 100}%`; }}
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
                  {savedProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">Best: GH₵{p.lowestPrice} · {p.sellers} sellers</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-600">GH₵{p.lowestPrice}</p>
                        <span className={`text-xs ${p.up ? "text-emerald-500" : "text-red-500"}`}>{p.change}</span>
                        <Link href={`/shopping-list?add=${encodeURIComponent(p.name)}`} className="flex items-center gap-1 text-[10px] font-medium text-violet-600 hover:underline">
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
                <button className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Alert
                </button>
              </div>
              <div className="space-y-3">
                {priceAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.product}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when {a.condition}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Current: GH₵{a.current}</p>
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
