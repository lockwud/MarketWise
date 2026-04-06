"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, BarChart3, Bell, Search, Package,
  MapPin, ShoppingCart, Plus, LogOut, ChevronRight, ArrowUp,
  ArrowDown, LayoutDashboard, User, Menu, AlertCircle, Edit2,
  Trash2, Star,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateModal, FormField, inputCls, selectCls } from "@/components/ui/create-modal";

/* ── static demo data ───────────────────────────────────────────── */
const CATEGORIES = ["Grains", "Vegetables", "Proteins", "Cooking Essentials", "Fruits", "Dairy", "Beverages", "Smartphones", "Laptops", "Desktops"];
const UNITS = ["kg", "bag", "bunch", "litre", "piece", "crate", "dozen", "unit"];
const MARKETS = ["Accra Central Market", "Kumasi Central Market", "Madina Market", "Takoradi Market", "Kaneshie Market"];

const initialProducts = [
  { id: 1, name: "Rice (5kg)", category: "Grains", price: 45, unit: "bag", stock: 80, market: "Accra Central Market", status: "Active", change: "+7.1%", up: true },
  { id: 2, name: "Cooking Oil (2L)", category: "Cooking Essentials", price: 38.5, unit: "litre", stock: 35, market: "Kumasi Central Market", status: "Active", change: "-3.8%", up: false },
  { id: 3, name: "Tomatoes (1kg)", category: "Vegetables", price: 12, unit: "kg", stock: 12, market: "Takoradi Market", status: "Alert", change: "+4.3%", up: true },
  { id: 4, name: "Onions (1kg)", category: "Vegetables", price: 8, unit: "kg", stock: 50, market: "Accra Central Market", status: "Active", change: "0%", up: true },
  { id: 5, name: "Chicken (1kg)", category: "Proteins", price: 32, unit: "kg", stock: 20, market: "Kumasi Central Market", status: "Active", change: "-8.6%", up: false },
  { id: 6, name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", price: 8500, unit: "unit", stock: 8, market: "Accra Central Market", status: "Active", change: "+3.2%", up: true },
  { id: 7, name: "Samsung Galaxy S24 Ultra", category: "Smartphones", price: 7200, unit: "unit", stock: 12, market: "Kumasi Central Market", status: "Active", change: "-2.1%", up: false },
  { id: 8, name: "Samsung Galaxy A55 5G", category: "Smartphones", price: 3200, unit: "unit", stock: 25, market: "Madina Market", status: "Active", change: "+1.8%", up: true },
  { id: 9, name: "MacBook Air M3 (13\")", category: "Laptops", price: 13500, unit: "unit", stock: 5, market: "Accra Central Market", status: "Alert", change: "+5.1%", up: true },
  { id: 10, name: "HP Pavilion 15 (Core i7)", category: "Laptops", price: 6800, unit: "unit", stock: 10, market: "Kaneshie Market", status: "Active", change: "-4.3%", up: false },
  { id: 11, name: "Dell OptiPlex 7010 (i5)", category: "Desktops", price: 4200, unit: "unit", stock: 7, market: "Accra Central Market", status: "Active", change: "+2.7%", up: true },
];

const weeklyBars = [38, 52, 32, 67, 88, 57, 43];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxBar = Math.max(...weeklyBars);

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/inventory", icon: Package, label: "My Products", active: false },
  { href: "/orders", icon: ShoppingCart, label: "Orders", active: false },
  { href: "/shopping-list", icon: BarChart3, label: "Price Tracking", active: false },
  { href: "/recipes", icon: MapPin, label: "Markets", active: false },
  { href: "/profile", icon: User, label: "Profile", active: false },
];

/* ── product form state type ─────────────────────────────────────── */
interface ProductForm {
  name: string; category: string; description: string;
  unit: string; stock: string; minStock: string;
  price: string; comparePrice: string; market: string; location: string;
}
const emptyForm = (): ProductForm => ({
  name: "", category: "", description: "",
  unit: "kg", stock: "", minStock: "",
  price: "", comparePrice: "", market: "", location: "",
});

/* ── component ───────────────────────────────────────────────────── */
export default function SellerDashboard({ userLocation }: { userLocation: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<(typeof initialProducts)[0] | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.market.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    setSubmitting(true);
    setTimeout(() => {
      const newProduct = {
        id: Date.now(),
        name: form.name || "New Product",
        category: form.category || "Grains",
        price: parseFloat(form.price) || 0,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        market: form.market || MARKETS[0],
        status: "Active",
        change: "0%",
        up: true,
      };
      setProducts((prev) => [newProduct, ...prev]);
      setForm(emptyForm());
      setCreateOpen(false);
      setSubmitting(false);
    }, 800);
  }

  function handleDelete(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  const f = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const alerts = products.filter((p) => p.stock < 15).length;

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
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="h-5 w-5" />
              {alerts > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">S</div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">Seller</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{userLocation || "Location not set"}
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
                {userLocation || "Set your location in profile"} · Manage your products & price records
              </p>
            </div>

          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Products Listed", value: products.length, change: "+3 this week", up: true, Icon: Package, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Inventory Value", value: `GH₵${totalValue.toLocaleString()}`, change: "+5% from last week", up: true, Icon: BarChart3, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Active Markets", value: new Set(products.map((p) => p.market)).size, change: "Across " + new Set(products.map((p) => p.market)).size + " markets", up: true, Icon: MapPin, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
              { label: "Low Stock Items", value: alerts, change: alerts > 0 ? "Needs restocking" : "All good", up: alerts === 0, Icon: AlertCircle, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
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
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Sales Performance</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Orders fulfilled this week</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyBars.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs text-emerald-500 flex items-center justify-end gap-1"><ArrowUp className="h-3 w-3" />12.4% vs last week</p>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-2 h-32">
                {weeklyBars.map((val, i) => (
                  <div key={weekDays[i]} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{val}</span>
                    <div className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer relative group"
                      ref={(el) => { if (el) el.style.height = `${(val / maxBar) * 100}%`; }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap">{val} orders</div>
                    </div>
                    <span className="text-[10px] text-gray-400">{weekDays[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Markets</h2>
              <div className="space-y-3">
                {[...new Set(products.map((p) => p.market))].map((m) => {
                  const count = products.filter((p) => p.market === m).length;
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
                    {["Product", "Category", "Price", "Stock", "Market", "Change", "Status", "Actions"].map((h) => (
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
                        <span className={`font-medium ${p.stock < 15 ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>{p.stock} {p.unit}</span>
                        {p.stock < 15 && <span className="ml-2 text-xs text-red-500">Low</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[140px]">{p.market}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`flex items-center gap-1 font-medium text-xs ${p.up ? "text-emerald-600" : "text-red-500"}`}>
                          {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "Alert"
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
                        No products found. Go to <strong>My Products</strong> to add your first listing.
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
        onClose={() => { setCreateOpen(false); setForm(emptyForm()); }}
        onSubmit={handleCreate}
        submitLabel="Create Listing"
        submitting={submitting}
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
                <FormField label="Market / Location" required>
                  <select aria-label="Market" className={selectCls} value={form.market} onChange={f("market")}>
                    <option value="">Select market</option>
                    {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FormField>
                <FormField label="Stall / Shop Number" hint="Optional — helps buyers find you">
                  <input className={inputCls} placeholder="e.g. Block C, Shop 12" value={form.location} onChange={f("location")} />
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
                    🎉 Your price is <strong>{(((parseFloat(form.comparePrice) - parseFloat(form.price)) / parseFloat(form.comparePrice)) * 100).toFixed(1)}% below</strong> the market average — great deal for buyers!
                  </div>
                )}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Price Visibility</p>
                  Your price will be publicly listed on MarketWise and compared with other sellers in the same market. Prices are updated in real-time.
                </div>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewProduct(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setViewProduct(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><span className="sr-only">Close</span>✕</button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{viewProduct.name}</h3>
                <p className="text-xs text-gray-400">{viewProduct.category}</p>
              </div>
            </div>
            {[
              ["Price", `GH₵${viewProduct.price.toFixed(2)} / ${viewProduct.unit}`],
              ["Stock", `${viewProduct.stock} ${viewProduct.unit}`],
              ["Market", viewProduct.market],
              ["Price Change", viewProduct.change],
              ["Status", viewProduct.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
