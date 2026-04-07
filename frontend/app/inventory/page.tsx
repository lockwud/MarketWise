"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, Plus, Edit2, Trash2, List, LayoutGrid,
  ArrowUp, ArrowDown, Bookmark, BookmarkCheck, BarChart3, AlertCircle,
  Star, Building2, Settings, Users, Heart, X, CheckCircle, Filter,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateModal, FormField, inputCls, selectCls } from "@/components/ui/create-modal";
import { PageBar, ModalPager } from "@/components/ui/page-bar";
import type { Product, AggregatedProduct } from "@/lib/api/inventory";
import type { Market } from "@/lib/api/markets";

/* ─── static constants ─────────────────────────────────────────── */
const CATEGORIES = ["Grains","Vegetables","Proteins","Cooking Essentials","Fruits","Dairy","Beverages","Smartphones","Laptops","Desktops"];
const UNITS = ["kg","bag","bunch","litre","piece","crate","dozen","unit"];

/* ─── nav configs ─────────────────────────────────────────────── */
const SELLER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Package, label: "My Products", active: true },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/shopping-list", icon: BarChart3, label: "Price Tracking" },
  { href: "/recipes", icon: MapPin, label: "Markets" },
  { href: "/profile", icon: User, label: "Profile" },
];
const BUYER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Package, label: "Browse Products", active: true },
  { href: "/shopping-list", icon: ShoppingCart, label: "Shopping List" },
  { href: "/orders", icon: Heart, label: "Saved Items" },
  { href: "/profile", icon: User, label: "Profile" },
];

/* ─── product form ─────────────────────────────────────────────── */
interface ProductForm {
  name: string; category: string; description: string;
  unit: string; stock: string; minStock: string;
  price: string; comparePrice: string; marketId: string; location: string;
}
const emptyForm = (): ProductForm => ({ name:"", category:"", description:"", unit:"kg", stock:"", minStock:"", price:"", comparePrice:"", marketId:"", location:"" });

/* ─── component ────────────────────────────────────────────────── */
export default function Inventory() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(getUserRole() || "buyer"); }, []);

  if (!role) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
    </div>
  );
  if (role === "buyer") return <BuyerProducts />;
  return <SellerProducts />;
}

/* ════════════════════════════════════════ SELLER ════════════════ */
function SellerProducts() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list"|"card">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sellerPage, setSellerPage] = useState(1);
  const [sellerPageSize, setSellerPageSize] = useState(15);

  useEffect(() => {
    async function load() {
      try {
        const [{ fetchProducts }, { fetchMarkets }] = await Promise.all([
          import("@/lib/api/inventory"),
          import("@/lib/api/markets"),
        ]);
        const [pRes, mRes] = await Promise.all([fetchProducts(), fetchMarkets()]);
        setProducts((pRes as any).products ?? (pRes as any));
        setMarkets((mRes as any).markets ?? (mRes as any));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || (p.market?.name || "").toLowerCase().includes(search.toLowerCase()))
  );
  const sellerPaged = filtered.slice((sellerPage - 1) * sellerPageSize, sellerPage * sellerPageSize);

  async function handleCreate() {
    setSubmitting(true);
    try {
      const { createProduct } = await import("@/lib/api/inventory");
      const created = await createProduct({
        name: form.name,
        category: form.category,
        description: form.description,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 10,
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        marketId: form.marketId,
      });
      setProducts(prev => [created as Product, ...prev]);
      setForm(emptyForm()); setCreateOpen(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try {
      const { deleteProduct } = await import("@/lib/api/inventory");
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
    setDeleteTarget(null);
  }

  const f = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className="text-emerald-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-4 w-4" /></button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Seller Panel</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {SELLER_NAV.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${"active" in { active } && active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Heading + controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Products</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your listings, stock and prices</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-emerald-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} aria-label="List view"><List className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-md transition-colors ${viewMode === "card" ? "bg-white dark:bg-gray-700 shadow text-emerald-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} aria-label="Card view"><LayoutGrid className="h-4 w-4" /></button>
              </div>
              <button onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:-translate-y-0.5">
                <Plus className="h-4 w-4" /> New Product
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setCategoryFilter(cat); setSellerPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">All Products</h2>
                <span className="text-xs text-gray-400">{filtered.length} of {products.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Product","Category","Price","Stock","Market","Status","Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sellerPaged.map(p => {
                      const isLow = p.stock < (p.minStock || 10);
                      const statusLabel = p.status === "LOW_STOCK" || isLow ? "Low Stock" : p.status === "INACTIVE" ? "Inactive" : "Active";
                      const statusCls = p.status === "LOW_STOCK" || isLow
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : p.status === "INACTIVE"
                          ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                      return (
                        <tr key={p.id} onClick={() => setViewProduct(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                          <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.category}</td>
                          <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{p.price.toFixed(2)}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`font-medium ${isLow ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>{p.stock} {p.unit}</span>
                            {isLow && <span className="ml-2 text-xs text-red-500">Low</span>}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{p.market?.name || "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button aria-label="Delete" onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sellerPaged.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No products found. Click <strong>New Product</strong> to add one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PageBar page={sellerPage} total={filtered.length} pageSize={sellerPageSize} setPage={setSellerPage} setPageSize={(s) => { setSellerPageSize(s); setSellerPage(1); }} label="products" />
            </div>
          )}

          {/* CARD VIEW */}
          {viewMode === "card" && (
            <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sellerPaged.map(p => {
                const isLow = p.stock < (p.minStock || 10);
                const statusLabel = p.status === "LOW_STOCK" || isLow ? "Low Stock" : p.status === "INACTIVE" ? "Inactive" : "Active";
                const statusCls = p.status === "LOW_STOCK" || isLow
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                  : p.status === "INACTIVE"
                    ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
                return (
                  <div key={p.id} onClick={() => setViewProduct(p)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                    {/* Image / placeholder */}
                    <div className="h-36 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 flex items-center justify-center relative">
                      <Package className="h-14 w-14 text-emerald-300 dark:text-emerald-700" />
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span>
                      </div>
                    </div>
                    {/* Header branding strip */}
                    <div className="px-4 py-1.5 bg-gray-900 dark:bg-gray-800 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-white tracking-wide">Market<span className="text-emerald-400">Wise</span></span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{p.category}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2">{p.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{p.description || "No description."}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">GH₵{p.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">/ {p.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className={isLow ? "text-red-500 font-medium" : ""}>{p.stock} {p.unit} left{isLow ? " ⚠️" : ""}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{(p.market?.name || "").split(" ")[0]}</span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDeleteTarget(p.id)} className="flex-1 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors border border-gray-200 dark:border-gray-700"><Trash2 className="h-3.5 w-3.5 inline mr-1" />Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sellerPaged.length === 0 && (
                <div className="col-span-full flex flex-col items-center py-16 text-gray-400">
                  <Package className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No products found. Click <strong className="text-emerald-600">New Product</strong> to add one.</p>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mt-1">
              <PageBar page={sellerPage} total={filtered.length} pageSize={sellerPageSize} setPage={setSellerPage} setPageSize={(s) => { setSellerPageSize(s); setSellerPage(1); }} label="products" />
            </div>
            </>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <CreateModal open={createOpen} title="List a New Product"
        onClose={() => { setCreateOpen(false); setForm(emptyForm()); }}
        onSubmit={handleCreate} submitLabel="Create Listing" submitting={submitting}
        tabs={[
          { key: "product", label: "Product Info", content: (
            <div>
              <FormField label="Product Name" required><input className={inputCls} placeholder="e.g. Rice (5kg bag)" value={form.name} onChange={f("name")} /></FormField>
              <FormField label="Category" required><select aria-label="Category" className={selectCls} value={form.category} onChange={f("category")}><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
              <FormField label="Description" hint="Optional"><textarea className={inputCls + " resize-none"} rows={3} placeholder="Describe quality, variety…" value={form.description} onChange={f("description") as any} /></FormField>
              <FormField label="Unit of Sale" required><select aria-label="Unit" className={selectCls} value={form.unit} onChange={f("unit")}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></FormField>
            </div>
          )},
          { key: "stock", label: "Stock Info", content: (
            <div>
              <FormField label="Current Stock Quantity" required><input className={inputCls} type="number" min="0" placeholder="e.g. 50" value={form.stock} onChange={f("stock")} /></FormField>
              <FormField label="Low Stock Alert Threshold" hint="Get notified when stock falls below this"><input className={inputCls} type="number" min="0" placeholder="e.g. 10" value={form.minStock} onChange={f("minStock")} /></FormField>
              <FormField label="Market" required><select aria-label="Market" className={selectCls} value={form.marketId} onChange={f("marketId")}><option value="">Select market</option>{markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField>
              <FormField label="Stall / Shop Number" hint="Optional"><input className={inputCls} placeholder="e.g. Block C, Shop 12" value={form.location} onChange={f("location")} /></FormField>
            </div>
          )},
          { key: "price", label: "Price Info", content: (
            <div>
              <FormField label="Selling Price (GH₵)" required><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">GH₵</span><input className={inputCls + " pl-10"} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={f("price")} /></div></FormField>
              <FormField label="Market Average Price (GH₵)" hint="Optional"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">GH₵</span><input className={inputCls + " pl-10"} type="number" min="0" step="0.01" placeholder="0.00" value={form.comparePrice} onChange={f("comparePrice")} /></div></FormField>
            </div>
          )},
        ]}
      />

      {/* Delete confirm */}
      <ConfirmDialog open={deleteTarget !== null} title="Remove Product Listing"
        description="This will permanently remove this product from your listings."
        confirmLabel="Remove Listing" requireTyping="delete" variant="danger"
        onConfirm={() => deleteTarget !== null && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)} />

      {/* View product modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewProduct(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 flex items-center justify-center relative">
              <Package className="h-16 w-16 text-emerald-300 dark:text-emerald-700" />
              <button onClick={() => setViewProduct(null)} aria-label="Close" className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/70 dark:bg-gray-800/70 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-4 py-1.5 bg-gray-900 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
              <span className="ml-auto text-[10px] text-gray-400">Product Detail</span>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{viewProduct.category}</p>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{viewProduct.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{viewProduct.description || "No description."}</p>
              {[
                ["Price", `GH₵${viewProduct.price.toFixed(2)} / ${viewProduct.unit}`],
                ["Stock", `${viewProduct.stock} ${viewProduct.unit}${viewProduct.stock < (viewProduct.minStock || 10) ? " ⚠️ Low" : ""}`],
                ["Market", viewProduct.market?.name || "—"],
                ["Status", viewProduct.status === "LOW_STOCK" ? "Low Stock" : viewProduct.status === "INACTIVE" ? "Inactive" : "Active"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════ BUYER ═════════════════ */
function BuyerProducts() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<AggregatedProduct[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list"|"card">("list");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewProduct, setViewProduct] = useState<AggregatedProduct | null>(null);
  const [buyerPage, setBuyerPage] = useState(1);
  const [buyerPageSize, setBuyerPageSize] = useState(15);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerPage, setSellerPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const [{ fetchAggregatedProducts }, { fetchSavedProducts }] = await Promise.all([
          import("@/lib/api/inventory"),
          import("@/lib/api/saved"),
        ]);
        const [pRes, sRes] = await Promise.all([fetchAggregatedProducts(), fetchSavedProducts()]);
        setProducts((pRes as any).products ?? (pRes as any));
        const saved: any[] = (sRes as any).saved ?? (sRes as any);
        setSavedIds(saved.map((s: any) => s.productId));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );
  const buyerPaged = filtered.slice((buyerPage - 1) * buyerPageSize, buyerPage * buyerPageSize);

  async function toggleSave(productId: string) {
    try {
      if (savedIds.includes(productId)) {
        const { removeSavedProduct } = await import("@/lib/api/saved");
        await removeSavedProduct(productId);
        setSavedIds(prev => prev.filter(id => id !== productId));
      } else {
        const { saveProduct } = await import("@/lib/api/saved");
        await saveProduct(productId);
        setSavedIds(prev => [...prev, productId]);
      }
    } catch (err) { console.error(err); }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600"><TrendingUp className="h-4 w-4 text-white" /></div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className="text-emerald-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-4 w-4" /></button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Buyer Panel</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {BUYER_NAV.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${"active" in { active } && active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, markets…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Browse Products</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Compare prices across Ghana markets</p>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-emerald-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} aria-label="List view"><List className="h-4 w-4" /></button>
              <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-md transition-colors ${viewMode === "card" ? "bg-white dark:bg-gray-700 shadow text-emerald-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} aria-label="Card view"><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setCategoryFilter(cat); setBuyerPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Market Prices</h2>
                <span className="text-xs text-gray-400">{filtered.length} products</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Product","Category","Best Price","Avg Price","Sellers","Change","Market","Save"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {buyerPaged.map(p => {
                      const pid = p.sellerList?.[0]?.productId || p.name;
                      return (
                        <tr key={pid} onClick={() => setViewProduct(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.category}</td>
                          <td className="px-5 py-3.5"><span className="font-bold text-emerald-600 dark:text-emerald-400">GH₵{p.lowestPrice.toFixed(2)}</span></td>
                          <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">GH₵{p.avgPrice.toFixed(2)}</td>
                          <td className="px-5 py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{p.sellers} sellers</span></td>
                          <td className="px-5 py-3.5"><span className={`flex items-center gap-1 text-xs font-medium ${p.up ? "text-emerald-600" : "text-red-500"}`}>{p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}</span></td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{p.market}</td>
                          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => toggleSave(pid)} className={`p-1.5 rounded-lg transition-colors ${savedIds.includes(pid) ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500"}`} title={savedIds.includes(pid) ? "Unsave" : "Save"}>
                              {savedIds.includes(pid) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PageBar page={buyerPage} total={filtered.length} pageSize={buyerPageSize} setPage={setBuyerPage} setPageSize={(s) => { setBuyerPageSize(s); setBuyerPage(1); }} label="products" />
            </div>
          )}

          {/* CARD VIEW */}
          {viewMode === "card" && (
            <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {buyerPaged.map(p => {
                const pid = p.sellerList?.[0]?.productId || p.name;
                return (
                  <div key={pid} onClick={() => setViewProduct(p)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                    <div className="h-36 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center relative">
                      <Package className="h-14 w-14 text-blue-200 dark:text-blue-800" />
                      <div className="absolute top-2 right-2">
                        <button onClick={e => { e.stopPropagation(); toggleSave(pid); }} className={`p-1.5 rounded-full transition-colors ${savedIds.includes(pid) ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400" : "bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-blue-600"}`}>
                          {savedIds.includes(pid) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${p.up ? "text-emerald-600" : "text-red-500"} bg-white/80 dark:bg-gray-900/80 px-1.5 py-0.5 rounded-full`}>
                          {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-gray-900 dark:bg-gray-800 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{p.category}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{p.description}</p>
                      <div className="flex items-end justify-between mb-1">
                        <div>
                          <p className="text-xs text-gray-400">Best Price</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">GH₵{p.lowestPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Avg</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">GH₵{p.avgPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{p.sellers} sellers</span>
                        <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 flex-shrink-0" />{p.market.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mt-1">
              <PageBar page={buyerPage} total={filtered.length} pageSize={buyerPageSize} setPage={setBuyerPage} setPageSize={(s) => { setBuyerPageSize(s); setBuyerPage(1); }} label="products" />
            </div>
            </>
          )}
        </main>
      </div>

      {/* View product modal */}
      {viewProduct && (() => {
        const allSellers = (viewProduct.sellerList || []).slice().sort((a, b) => a.price - b.price);
        const filteredSellers = sellerSearch
          ? allSellers.filter(s =>
              s.seller.toLowerCase().includes(sellerSearch.toLowerCase()) ||
              s.market.toLowerCase().includes(sellerSearch.toLowerCase())
            )
          : allSellers;
        const MODAL_PAGE_SIZE = 5;
        const pagedSellers = filteredSellers.slice((sellerPage - 1) * MODAL_PAGE_SIZE, sellerPage * MODAL_PAGE_SIZE);
        const bestPrice = allSellers.length > 0 ? allSellers[0].price : viewProduct.lowestPrice;
        const pid = allSellers[0]?.productId || viewProduct.name;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setViewProduct(null); setSellerSearch(""); setSellerPage(1); }} />
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              {/* Header image */}
              <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center relative flex-shrink-0">
                <Package className="h-20 w-20 text-blue-200 dark:text-blue-800" />
                <button onClick={() => { setViewProduct(null); setSellerSearch(""); setSellerPage(1); }} aria-label="Close" className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/70 dark:bg-gray-800/70 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              {/* Branding bar */}
              <div className="px-5 py-1.5 bg-gray-900 flex items-center gap-2 flex-shrink-0">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
                <span className="ml-auto text-[10px] text-gray-400">Price Comparison</span>
              </div>
              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{viewProduct.category}</p>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{viewProduct.name}</h3>
                  </div>
                  <button onClick={() => toggleSave(pid)} className={`p-2 rounded-xl transition-colors ${savedIds.includes(pid) ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600"}`}>
                    {savedIds.includes(pid) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{viewProduct.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Best Price</p>
                    <p className="text-lg font-bold text-emerald-600">GH₵{viewProduct.lowestPrice}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200">GH₵{viewProduct.avgPrice}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Highest</p>
                    <p className="text-lg font-bold text-red-500">GH₵{viewProduct.highestPrice}</p>
                  </div>
                </div>
                {[
                  ["Sellers", `${viewProduct.sellers} sellers`],
                  ["Market", viewProduct.market],
                  ["Price Change", viewProduct.change],
                  ["Rating", `${viewProduct.rating} / 5.0`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
                  </div>
                ))}

                {/* Seller breakdown */}
                {allSellers.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        Compare {allSellers.length} Sellers
                      </h4>
                      <span className="text-xs text-gray-400">Sorted by lowest price</span>
                    </div>
                    <ModalPager
                      search={sellerSearch}
                      setSearch={setSellerSearch}
                      page={sellerPage}
                      total={filteredSellers.length}
                      setPage={setSellerPage}
                      placeholder="Search sellers or markets…"
                    />
                    <div className="space-y-3">
                      {pagedSellers.map((s) => {
                        const isLowest = s.price === bestPrice;
                        return (
                          <div
                            key={s.id}
                            className={`relative rounded-xl border p-3.5 flex items-center gap-4 transition-all ${
                              isLowest
                                ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm shadow-emerald-100 dark:shadow-none"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            {isLowest && (
                              <span className="absolute -top-2.5 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                                BEST PRICE
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.seller}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 flex-shrink-0" />{s.market}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(s.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
                                ))}
                                <span className="text-[10px] text-gray-400 ml-0.5">{s.rating}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <p className={`text-xl font-bold ${
                                isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                              }`}>
                                GH₵{s.price.toLocaleString()}
                              </p>
                              {s.inStock ? (
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                                  In stock
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                  Out of stock
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
