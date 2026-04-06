"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, BarChart3, Heart, ArrowUp, ArrowDown,
  Bookmark, BookmarkCheck, Star, X, CheckCircle, Clock, Truck,
  AlertCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";

/* ─── data ─────────────────────────────────────────────────────── */
const SELLER_ORDERS = [
  { id: "ORD-101", buyer: "Ama Owusu", product: "Rice (5kg)", qty: 3, unit: "bag", total: 135, status: "Pending", market: "Accra Central Market", date: "Apr 6, 2026" },
  { id: "ORD-102", buyer: "Efua Nyarko", product: "Tomatoes (1kg)", qty: 10, unit: "kg", total: 120, status: "Confirmed", market: "Kaneshie Market", date: "Apr 5, 2026" },
  { id: "ORD-103", buyer: "Abena Asante", product: "Onions (1kg)", qty: 5, unit: "kg", total: 40, status: "Delivered", market: "Accra Central Market", date: "Apr 4, 2026" },
  { id: "ORD-104", buyer: "Kofi Mensah", product: "Cooking Oil (2L)", qty: 2, unit: "litre", total: 77, status: "Cancelled", market: "Kumasi Central Market", date: "Apr 3, 2026" },
  { id: "ORD-105", buyer: "Yaw Darko", product: "Chicken (1kg)", qty: 4, unit: "kg", total: 128, status: "Pending", market: "Takoradi Market", date: "Apr 2, 2026" },
  { id: "ORD-106", buyer: "Kwame Boateng", product: "iPhone 16 Pro Max (256GB)", qty: 1, unit: "unit", total: 8500, status: "Pending", market: "Accra Central Market", date: "Apr 6, 2026" },
  { id: "ORD-107", buyer: "Nana Amoah", product: "Samsung Galaxy S24 Ultra", qty: 2, unit: "unit", total: 14400, status: "Confirmed", market: "Kumasi Central Market", date: "Apr 5, 2026" },
  { id: "ORD-108", buyer: "Akosua Darko", product: "MacBook Air M3 (13\")", qty: 1, unit: "unit", total: 13500, status: "Delivered", market: "Accra Central Market", date: "Apr 4, 2026" },
  { id: "ORD-109", buyer: "Kweku Asante", product: "HP Pavilion 15 (Core i7)", qty: 1, unit: "unit", total: 6800, status: "Pending", market: "Kaneshie Market", date: "Apr 3, 2026" },
  { id: "ORD-110", buyer: "Esi Mensah", product: "Dell OptiPlex 7010 (i5)", qty: 1, unit: "unit", total: 4200, status: "Confirmed", market: "Accra Central Market", date: "Apr 2, 2026" },
];

const SAVED_PRODUCTS = [
  { id: 1, name: "Rice (50kg bag)", category: "Grains", sellers: 8, avgPrice: 290, lowestPrice: 265, market: "Accra Central Market", change: "+2.1%", up: true, rating: 4.5 },
  { id: 3, name: "Tomatoes (1kg)", category: "Vegetables", sellers: 20, avgPrice: 12, lowestPrice: 9, market: "Takoradi Market", change: "+4.3%", up: true, rating: 3.9 },
  { id: 5, name: "Chicken (1kg)", category: "Proteins", sellers: 6, avgPrice: 32, lowestPrice: 28, market: "Accra Central Market", change: "-8.6%", up: false, rating: 4.7 },
  { id: 8, name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", sellers: 5, avgPrice: 9800, lowestPrice: 8500, market: "Accra Central Market", change: "+3.2%", up: true, rating: 4.8 },
  { id: 9, name: "Samsung Galaxy S24 Ultra", category: "Smartphones", sellers: 7, avgPrice: 8400, lowestPrice: 7200, market: "Kumasi Central Market", change: "-2.1%", up: false, rating: 4.6 },
  { id: 11, name: "MacBook Air M3 (13\")", category: "Laptops", sellers: 4, avgPrice: 15800, lowestPrice: 13500, market: "Accra Central Market", change: "+5.1%", up: true, rating: 4.9 },
];

const SELLER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as React.FC<{ className?: string }>, label: "Dashboard" },
  { href: "/inventory", icon: Package as React.FC<{ className?: string }>, label: "My Products" },
  { href: "/orders", icon: ShoppingCart as React.FC<{ className?: string }>, label: "Orders", active: true },
  { href: "/shopping-list", icon: BarChart3 as React.FC<{ className?: string }>, label: "Price Tracking" },
  { href: "/recipes", icon: MapPin as React.FC<{ className?: string }>, label: "Markets" },
  { href: "/profile", icon: User as React.FC<{ className?: string }>, label: "Profile" },
];
const BUYER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as React.FC<{ className?: string }>, label: "Dashboard" },
  { href: "/inventory", icon: Package as React.FC<{ className?: string }>, label: "Browse Products" },
  { href: "/shopping-list", icon: ShoppingCart as React.FC<{ className?: string }>, label: "Shopping List" },
  { href: "/orders", icon: Heart as React.FC<{ className?: string }>, label: "Saved Items", active: true },
  { href: "/profile", icon: User as React.FC<{ className?: string }>, label: "Profile" },
];

type SellerOrder = typeof SELLER_ORDERS[0];
type IconComp = React.FC<{ className?: string }>;

/* ─── root ─────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(getUserRole() || "buyer"); }, []);
  if (!role) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" /></div>;
  if (role === "buyer") return <BuyerSaved />;
  return <SellerOrders />;
}

/* ════════════════════════ SELLER ORDERS ════════════════════════ */
function SellerOrders() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState(SELLER_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOrder, setViewOrder] = useState<SellerOrder | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ order: SellerOrder; action: "confirm" | "cancel" } | null>(null);
  const [ordPage, setOrdPage] = useState(1);
  const [ordPageSize, setOrdPageSize] = useState(15);

  const statuses = ["All", "Pending", "Confirmed", "Delivered", "Cancelled"];
  const filtered = orders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.buyer.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  );
  const ordPaged = filtered.slice((ordPage - 1) * ordPageSize, ordPage * ordPageSize);

  function handleConfirmAction() {
    if (!confirmAction) return;
    setOrders(prev => prev.map(o => o.id === confirmAction.order.id
      ? { ...o, status: confirmAction.action === "confirm" ? "Confirmed" : "Cancelled" } : o
    ));
    setConfirmAction(null);
  }

  const statusColor = (s: string) => ({
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }[s] || "bg-gray-100 text-gray-600");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} nav={SELLER_NAV} panelLabel="Seller Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar search={search} setSearch={setSearch} placeholder="Search orders, buyers…" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage buyer orders for your products</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Orders", value: orders.length, Icon: ShoppingCart as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Pending", value: orders.filter(o => o.status === "Pending").length, Icon: Clock as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
              { label: "Confirmed", value: orders.filter(o => o.status === "Confirmed").length, Icon: CheckCircle as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, Icon: Truck as IconComp, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
            ].map(({ label, value, Icon, bg, ic }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                <span className={`p-3 rounded-xl ${bg}`}><Icon className={`h-5 w-5 ${ic}`} /></span>
                <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p></div>
              </div>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setOrdPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400"}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">All Orders</h2>
              <span className="text-xs text-gray-400">{filtered.length} orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {["Order ID","Buyer","Product","Qty","Total","Market","Date","Status","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ordPaged.map(o => (
                    <tr key={o.id} onClick={() => setViewOrder(o)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{o.id}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{o.buyer}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{o.product}</td>
                      <td className="px-5 py-3.5 text-gray-500">{o.qty} {o.unit}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{o.total}</td>
                      <td className="px-5 py-3.5 text-gray-500 truncate max-w-[120px]">{o.market}</td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap text-xs">{o.date}</td>
                      <td className="px-5 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span></td>
                      <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {o.status === "Pending" && (
                          <div className="flex gap-1">
                            <button onClick={() => setConfirmAction({ order: o, action: "confirm" })} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Confirm</button>
                            <button onClick={() => setConfirmAction({ order: o, action: "cancel" })} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Cancel</button>
                          </div>
                        )}
                        {o.status === "Confirmed" && (
                          <button onClick={() => setOrders(p => p.map(x => x.id === o.id ? { ...x, status: "Delivered" } : x))} className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">Mark Delivered</button>
                        )}
                        {(o.status === "Delivered" || o.status === "Cancelled") && <span className="text-xs text-gray-400">{o.status}</span>}
                      </td>
                    </tr>
                  ))}
                  {ordPaged.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
            <PageBar page={ordPage} total={filtered.length} pageSize={ordPageSize} setPage={setOrdPage} setPageSize={(s) => { setOrdPageSize(s); setOrdPage(1); }} label="orders" />
          </div>
        </main>
      </div>

      {/* View modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
              <span className="ml-auto text-xs text-gray-400">Order Detail</span>
              <button aria-label="Close" onClick={() => setViewOrder(null)} className="ml-2 p-1 rounded text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-sm font-bold text-emerald-600">{viewOrder.id}</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(viewOrder.status)}`}>{viewOrder.status}</span>
              </div>
              {[["Buyer", viewOrder.buyer],["Product", viewOrder.product],["Quantity", `${viewOrder.qty} ${viewOrder.unit}`],["Total", `GH₵${viewOrder.total}`],["Market", viewOrder.market],["Date", viewOrder.date]].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm action */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction?.action === "confirm" ? "Confirm Order" : "Cancel Order"}
        description={confirmAction?.action === "confirm" ? `Confirm order ${confirmAction?.order.id} from ${confirmAction?.order.buyer}?` : `Cancel order ${confirmAction?.order.id} from ${confirmAction?.order.buyer}? This cannot be undone.`}
        confirmLabel={confirmAction?.action === "confirm" ? "Confirm" : "Cancel Order"}
        variant={confirmAction?.action === "confirm" ? "default" : "warning"}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

/* ════════════════════════ BUYER SAVED ITEMS ════════════════════ */
function BuyerSaved() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saved, setSaved] = useState(SAVED_PRODUCTS);
  const [search, setSearch] = useState("");
  const [unsaveId, setUnsaveId] = useState<number | null>(null);
  const [savedPage, setSavedPage] = useState(1);
  const [savedPageSize, setSavedPageSize] = useState(15);

  const filtered = saved.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase())
  );
  const savedPaged = filtered.slice((savedPage - 1) * savedPageSize, savedPage * savedPageSize);

  function unsave(id: number) { setSaved(prev => prev.filter(p => p.id !== id)); setUnsaveId(null); }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} nav={BUYER_NAV} panelLabel="Buyer Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar search={search} setSearch={setSearch} placeholder="Search saved products…" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Saved Items</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Products you&apos;ve bookmarked for quick access</p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Bookmark className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No saved items yet. Browse products and tap the bookmark icon.</p>
            </div>
          ) : (
            <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedPaged.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
                  <div className="h-28 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center relative">
                    <Package className="h-12 w-12 text-blue-200 dark:text-blue-800" />
                    <button onClick={() => setUnsaveId(p.id)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-blue-600 hover:text-red-500 transition-colors" title="Remove from saved"><BookmarkCheck className="h-4 w-4" /></button>
                    <div className="absolute top-2 left-2">
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${p.up ? "text-emerald-600" : "text-red-500"} bg-white/80 dark:bg-gray-900/80 px-1.5 py-0.5 rounded-full`}>
                        {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">{p.category}</p>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{p.name}</h3>
                    <div className="flex mb-3">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-3 w-3 ${i < Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />)}</div>
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-lg font-bold text-emerald-600">GH₵{p.lowestPrice}</p>
                      <p className="text-xs text-gray-400">Avg GH₵{p.avgPrice}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.market}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.sellers} sellers available</p>
                    <div className="mt-3 flex gap-2">
                      <Link href="/inventory" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">View Product</Link>
                      <Link href={`/shopping-list?add=${encodeURIComponent(p.name)}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"><ShoppingCart className="h-3 w-3" />Add to List</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mt-1">
              <PageBar page={savedPage} total={filtered.length} pageSize={savedPageSize} setPage={setSavedPage} setPageSize={(s) => { setSavedPageSize(s); setSavedPage(1); }} label="saved items" />
            </div>
            </>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={unsaveId !== null}
        title="Remove Saved Item"
        description="Remove this product from your saved items?"
        confirmLabel="Remove"
        variant="warning"
        onConfirm={() => unsave(unsaveId!)}
        onCancel={() => setUnsaveId(null)}
      />
    </div>
  );
}

/* ─── shared sub-components ────────────────────────────────────── */
function Sidebar({ open, setOpen, nav, panelLabel }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  nav: { href: string; icon: IconComp; label: string; active?: boolean }[];
  panelLabel: string;
}) {
  return (
    <aside className={`${open ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
      <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
        <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600"><TrendingUp className="h-4 w-4 text-white" /></div>
        {open && <span className="text-base font-bold tracking-tight">Market<span className="text-emerald-400">Wise</span></span>}
        <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setOpen(!open)}><Menu className="h-4 w-4" /></button>
      </div>
      {open && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{panelLabel}</span></div>}
      <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, active }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <Icon className="h-4 w-4 flex-shrink-0" />{open && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-800">
        <Link href="/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />{open && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}

function TopBar({ search, setSearch, placeholder }: { search: string; setSearch: (v: string) => void; placeholder: string }) {
  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button>
      </div>
    </header>
  );
}

