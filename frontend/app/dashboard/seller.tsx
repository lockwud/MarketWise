"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package,
  MapPin, Plus, LogOut, ArrowUp,
  ArrowDown, LayoutDashboard, User, Menu, AlertCircle, Edit2,
  Trash2, BarChart3, ImagePlus,
} from "lucide-react";
import type { LocationStatus } from "@/hooks/use-location";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateModal, FormField, inputCls, selectCls } from "@/components/ui/create-modal";
import { AppShellSkeleton } from "@/components/ui/app-skeleton";
import { fetchProducts, createProduct, deleteProduct, type Product } from "@/lib/api/inventory";
import { fetchMarkets, type Market } from "@/lib/api/markets";
import { createSubmission } from "@/lib/api/submissions";
import { NotificationBell } from "@/components/notifications/notification-drawer";

const CATEGORIES = ["Grains", "Vegetables", "Proteins", "Cooking Essentials", "Fruits", "Dairy", "Beverages", "Smartphones", "Laptops", "Desktops"];
const UNITS = ["unit", "item", "piece", "kg", "g", "bag", "box", "pack", "bottle", "sachet", "litre", "ml", "crate", "dozen", "bunch", "pair", "meter", "yard"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/inventory", icon: Package, label: "My Products", active: false },
  { href: "/shopping-list", icon: BarChart3, label: "Price Tracking", active: false },
  { href: "/markets", icon: MapPin, label: "Markets", active: false },
  { href: "/profile", icon: User, label: "Profile", active: false },
];

interface ProductForm {
  name: string; category: string; description: string;
  unit: string; stock: string; minStock: string;
  price: string; comparePrice: string; marketId: string; image: string;
  marketOverrides: Record<string, { price: string; stock: string; minStock: string }>;
}
const emptyForm = (): ProductForm => ({
  name: "", category: "", description: "",
  unit: "unit", stock: "", minStock: "",
  price: "", comparePrice: "", marketId: "", image: "", marketOverrides: {},
});

/* ── component ───────────────────────────────────────────────────── */
interface SellerDashboardProps {
  userLocation: string;
  userName?: string;
  userCoords?: { lat: number; lng: number };
  locationStatus?: LocationStatus;
  onRequestLocation?: () => void;
}

export default function SellerDashboard({
  userLocation,
  userName,
  locationStatus,
  onRequestLocation,
}: SellerDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [submitPrice, setSubmitPrice] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, mkts] = await Promise.all([
        fetchProducts(),
        fetchMarkets(),
      ]);
      setProducts(prods.products);
      setMarkets(mkts);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const weeklyUpdates = weekDays.map((_, dayIdx) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const diff = dayIdx - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Mon=0
    const date = new Date(now);
    date.setDate(now.getDate() + diff);
    const dateStr = date.toISOString().slice(0, 10);
    return products.filter((p) => p.updatedAt && p.updatedAt.slice(0, 10) === dateStr).length;
  });
  const maxBar = Math.max(...weeklyUpdates, 1);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.market?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    const missing = [];
    const selectedMarketIds = form.marketId.split(",").filter(Boolean);
    if (!form.name.trim()) missing.push("product name");
    if (!form.category) missing.push("category");
    if (selectedMarketIds.length === 0) missing.push("market");
    if (!form.price.trim()) missing.push("selling price");
    if (missing.length > 0) {
      setCreateError(`Please enter: ${missing.join(", ")}.`);
      return;
    }

    setSubmitting(true);
    setCreateError("");
    try {
      const newProduct = await createProduct({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        unit: form.unit,
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock) || 0,
        minStock: form.minStock ? parseInt(form.minStock) : undefined,
        marketId: selectedMarketIds[0],
        marketName: markets.find((m) => m.id === selectedMarketIds[0])?.name,
        markets: selectedMarketIds.map(id => ({
          marketId: id,
          marketName: markets.find((m) => m.id === id)?.name,
          price: form.marketOverrides[id]?.price ? parseFloat(form.marketOverrides[id].price) : undefined,
          stock: form.marketOverrides[id]?.stock ? parseInt(form.marketOverrides[id].stock) : undefined,
          minStock: form.marketOverrides[id]?.minStock ? parseInt(form.marketOverrides[id].minStock) : undefined,
        })),
        image: form.image || undefined,
      });
      const createdProducts: Product[] = Array.isArray((newProduct as any).products) ? (newProduct as any).products : [newProduct as Product];
      setProducts((prev) => [...createdProducts, ...prev]);
      setForm(emptyForm());
      setCreateOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  async function handlePriceSubmission() {
    if (!viewProduct || !submitPrice.trim()) return;
    const price = Number(submitPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setSubmitMessage("Enter a valid price above 0.");
      return;
    }

    try {
      await createSubmission({
        productId: viewProduct.id,
        productName: viewProduct.name,
        price,
        market: viewProduct.market?.name,
      });
      setSubmitPrice("");
      setSubmitMessage("Price submitted for admin review.");
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Unable to submit price.");
    }
  }

  const f = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCreateError("");
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  function toggleMarket(id: string) {
    setCreateError("");
    setForm(prev => {
      const selected = prev.marketId.split(",").filter(Boolean);
      const next = selected.includes(id) ? selected.filter(marketId => marketId !== id) : [...selected, id];
      return { ...prev, marketId: next.join(",") };
    });
  }

  function setMarketOverride(id: string, key: "price" | "stock" | "minStock", value: string) {
    setCreateError("");
    setForm(prev => ({
      ...prev,
      marketOverrides: {
        ...prev.marketOverrides,
        [id]: { ...(prev.marketOverrides[id] || { price: "", stock: "", minStock: "" }), [key]: value },
      },
    }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCreateError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setCreateError("Product image must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCreateError("");
      setForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStockAlerts = products.filter((p) => p.stock < (p.minStock || 10)).length;
  const uniqueMarkets = [...new Set(products.map((p) => p.market?.name).filter(Boolean))];
  const averagePrice = products.length > 0 ? products.reduce((s, p) => s + p.price, 0) / products.length : 0;

  if (loading) return <AppShellSkeleton panelLabel="Seller Panel" />;

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
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Seller Panel</span>
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
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, markets…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">{userName ? userName[0].toUpperCase() : "S"}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">{userName || "Seller"}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationStatus === "requesting" ? (
                    <span className="animate-pulse">Detecting…</span>
                  ) : locationStatus === "denied" ? (
                    <button onClick={onRequestLocation} className="text-amber-500 hover:underline">Enable location</button>
                  ) : (
                    userLocation || (
                      <button onClick={onRequestLocation} className="text-emerald-500 hover:underline">Detect location</button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {locationStatus === "requesting" ? (
                  <span className="animate-pulse">Detecting location…</span>
                ) : (
                  userLocation || "Set your location"
                )} · Manage your products &amp; price records
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Products Listed", value: products.length, change: `${products.length} active listings`, up: true, Icon: Package, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Inventory Value", value: `GH₵${totalValue.toLocaleString()}`, change: "Total stock value", up: true, Icon: BarChart3, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Average Price", value: `GH₵${averagePrice.toFixed(2)}`, change: "Across listed products", up: products.length > 0, Icon: TrendingUp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Active Markets", value: uniqueMarkets.length, change: `Across ${uniqueMarkets.length} market${uniqueMarkets.length !== 1 ? "s" : ""}`, up: true, Icon: MapPin, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
              { label: "Low Stock Items", value: lowStockAlerts, change: lowStockAlerts > 0 ? "Needs restocking" : "All good", up: lowStockAlerts === 0, Icon: AlertCircle, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
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

          {/* Chart + Markets */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Price Records</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Product price updates this week</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyUpdates.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs text-emerald-500 flex items-center justify-end gap-1"><ArrowUp className="h-3 w-3" />This week</p>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-2 h-32">
                {weeklyUpdates.map((val, i) => (
                  <div key={weekDays[i]} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{val}</span>
                    <div className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer relative group"
                      ref={(el) => { if (el) el.style.height = `${((val || 0.5) / maxBar) * 100}%`; }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap">{val} update{val !== 1 ? "s" : ""}</div>
                    </div>
                    <span className="text-[10px] text-gray-400">{weekDays[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Markets</h2>
              <div className="space-y-3">
                {uniqueMarkets.map((m) => {
                  const count = products.filter((p) => p.market?.name === m).length;
                  return (
                    <div key={m} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m}</p>
                        <p className="text-xs text-gray-400">{count} product{count !== 1 ? "s" : ""}</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    </div>
                  );
                })}
                {uniqueMarkets.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No markets yet. Add your first product to get started.</p>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">My Products</h2>
              <span className="text-xs text-gray-400">{filtered.length} of {products.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {["Product", "Category", "Price", "Stock", "Market", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((p) => (
                    <tr key={p.id} onClick={() => setViewProduct(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.category}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">GH₵{p.price.toFixed(2)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`font-medium ${p.stock < (p.minStock || 10) ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
                          {p.stock} {p.unit}
                        </span>
                        {p.stock < (p.minStock || 10) && <span className="ml-2 text-xs text-red-500">Low</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[140px]">
                        {p.market?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "ALERT"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button aria-label="Edit product" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button aria-label="Delete product" onClick={() => setDeleteTarget(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                        No products found. Click <strong>Add Product</strong> to list your first product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── CREATE MODAL ── */}
      <CreateModal
        open={createOpen}
        title="List a New Product"
        onClose={() => { setCreateOpen(false); setCreateError(""); setForm(emptyForm()); }}
        onSubmit={handleCreate}
        submitLabel="Create Listing"
        submitting={submitting}
        error={createError}
        tabs={[
          {
            key: "product",
            label: "Product Info",
            content: (
              <div>
                <FormField label="Product Name" required>
                  <input className={inputCls} placeholder="e.g. Rice (5kg bag)" value={form.name} onChange={f("name")} />
                </FormField>
                <FormField label="Category" required>
                  <select aria-label="Category" className={selectCls} value={form.category} onChange={f("category")}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Description" hint="Optional — describe quality, variety, etc.">
                  <textarea className={inputCls + " resize-none"} rows={3} placeholder="Fresh, locally sourced..." value={form.description} onChange={f("description")} />
                </FormField>
                <FormField label="Product Image" hint="Optional — choose a clear photo of the product">
                  {form.image ? (
                    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <img src={form.image} alt="Product preview" className="h-40 w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove product image"
                        onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm hover:text-red-600 dark:bg-gray-900/90 dark:text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20">
                      <ImagePlus className="mb-2 h-6 w-6 text-gray-400" />
                      Click to add product image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </FormField>
                <FormField label="Unit of Sale" required>
                  <select aria-label="Unit of sale" className={selectCls} value={form.unit} onChange={f("unit")}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </FormField>
              </div>
            ),
          },
          {
            key: "stock",
            label: "Stock Info",
            content: (
              <div>
                <FormField label="Current Stock Quantity" required>
                  <input className={inputCls} type="number" min="0" placeholder="e.g. 50" value={form.stock} onChange={f("stock")} />
                </FormField>
                <FormField label="Low Stock Alert Threshold" hint="Get notified when stock falls below this">
                  <input className={inputCls} type="number" min="0" placeholder="e.g. 10" value={form.minStock} onChange={f("minStock")} />
                </FormField>
                <FormField label="Markets" required>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
                    {markets.map((m) => {
                      const selected = form.marketId.split(",").filter(Boolean).includes(m.id);
                      return (
                        <label key={m.id} className={`block rounded-lg border p-2 text-sm transition-colors ${selected ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20" : "border-gray-100 dark:border-gray-800"}`}>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={selected} onChange={() => toggleMarket(m.id)} className="accent-emerald-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">{m.name}</span>
                            <span className="text-xs text-gray-400">{m.city}</span>
                          </div>
                          {selected && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <input className={inputCls} type="number" min="0" step="0.01" placeholder={`Price ${form.price || "shared"}`} value={form.marketOverrides[m.id]?.price || ""} onChange={e => setMarketOverride(m.id, "price", e.target.value)} />
                              <input className={inputCls} type="number" min="0" placeholder={`Stock ${form.stock || "shared"}`} value={form.marketOverrides[m.id]?.stock || ""} onChange={e => setMarketOverride(m.id, "stock", e.target.value)} />
                              <input className={inputCls} type="number" min="0" placeholder={`Min ${form.minStock || "10"}`} value={form.marketOverrides[m.id]?.minStock || ""} onChange={e => setMarketOverride(m.id, "minStock", e.target.value)} />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </FormField>
              </div>
            ),
          },
          {
            key: "price",
            label: "Price Info",
            content: (
              <div>
                <FormField label="Selling Price (GH₵)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">GH₵</span>
                    <input className={inputCls + " pl-10"} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={f("price")} />
                  </div>
                </FormField>
                <FormField label="Market Average / Compare Price (GH₵)" hint="Optional — shows buyers if your price is competitive">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">GH₵</span>
                    <input className={inputCls + " pl-10"} type="number" min="0" step="0.01" placeholder="0.00" value={form.comparePrice} onChange={f("comparePrice")} />
                  </div>
                </FormField>
                {form.price && form.comparePrice && parseFloat(form.price) < parseFloat(form.comparePrice) && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300">
                    🎉 Your price is <strong>{(((parseFloat(form.comparePrice) - parseFloat(form.price)) / parseFloat(form.comparePrice)) * 100).toFixed(1)}% below</strong> the market average!
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* ── DELETE CONFIRM ── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Product Listing"
        description="This will permanently remove this product from your listings and it will no longer appear in market searches."
        confirmLabel="Remove Listing"
        requireTyping="delete"
        variant="danger"
        onConfirm={() => deleteTarget !== null && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── VIEW PRODUCT MODAL ── */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setViewProduct(null); setSubmitPrice(""); setSubmitMessage(""); }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => { setViewProduct(null); setSubmitPrice(""); setSubmitMessage(""); }} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><span className="sr-only">Close</span>✕</button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                {viewProduct.image ? (
                  <img src={viewProduct.image} alt={viewProduct.name} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{viewProduct.name}</h3>
                <p className="text-xs text-gray-400">{viewProduct.category}</p>
              </div>
            </div>
            {[
              ["Price", `GH₵${viewProduct.price.toFixed(2)} / ${viewProduct.unit}`],
              ["Stock", `${viewProduct.stock} ${viewProduct.unit}`],
              ["Market", viewProduct.market?.name ?? "—"],
              ["Status", viewProduct.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
              </div>
            ))}
            <div className="mt-5 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Submit New Price</p>
              <p className="mt-0.5 text-xs text-gray-400">Admin approval updates comparison and history.</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={submitPrice}
                  onChange={(e) => { setSubmitPrice(e.target.value); setSubmitMessage(""); }}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="New price"
                  className="min-w-0 flex-1 rounded-lg border-0 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white"
                />
                <button onClick={handlePriceSubmission} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Submit
                </button>
              </div>
              {submitMessage && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{submitMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
