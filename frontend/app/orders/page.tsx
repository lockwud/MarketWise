"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, BarChart3, Heart, ArrowUp, ArrowDown,
  Bookmark, BookmarkCheck, Star, X, CheckCircle, Clock, Truck, Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";
import { useToast } from "@/hooks/use-toast";
import { fetchOrders, updateOrderStatus, type Order } from "@/lib/api/orders";
import { fetchSavedProducts, removeSavedProduct, type SavedProduct } from "@/lib/api/saved";

const SELLER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as React.FC<{ className?: string }>, label: "Dashboard" },
  { href: "/inventory", icon: Package as React.FC<{ className?: string }>, label: "My Products" },
  { href: "/orders", icon: ShoppingCart as React.FC<{ className?: string }>, label: "Orders", active: true },
  { href: "/shopping-list", icon: BarChart3 as React.FC<{ className?: string }>, label: "Price Tracking" },
  { href: "/markets", icon: MapPin as React.FC<{ className?: string }>, label: "Markets" },
  { href: "/profile", icon: User as React.FC<{ className?: string }>, label: "Profile" },
];
const BUYER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as React.FC<{ className?: string }>, label: "Dashboard" },
  { href: "/inventory", icon: Package as React.FC<{ className?: string }>, label: "Browse Products" },
  { href: "/shopping-list", icon: ShoppingCart as React.FC<{ className?: string }>, label: "Shopping List" },
  { href: "/orders", icon: Heart as React.FC<{ className?: string }>, label: "Saved Items", active: true },
  { href: "/profile", icon: User as React.FC<{ className?: string }>, label: "Profile" },
];

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
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [actionIds, setActionIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ order: Order; action: "confirm" | "cancel" } | null>(null);
  const [ordPage, setOrdPage] = useState(1);
  const [ordPageSize, setOrdPageSize] = useState(15);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
    } catch {
      toast({ title: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  function setBusy(id: string, busy: boolean) {
    setActionIds(prev => { const s = new Set(prev); busy ? s.add(id) : s.delete(id); return s; });
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    const { order, action } = confirmAction;
    setConfirmAction(null);
    setBusy(order.id, true);
    const newStatus = action === "confirm" ? "CONFIRMED" : "CANCELLED";
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrders(p => p.map(o => o.id === order.id ? { ...o, status: updated.status } : o));
      toast({ title: `Order ${action === "confirm" ? "confirmed" : "cancelled"}` });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
    } finally {
      setBusy(order.id, false);
    }
  }

  async function markDelivered(order: Order) {
    setBusy(order.id, true);
    try {
      const updated = await updateOrderStatus(order.id, "DELIVERED");
      setOrders(p => p.map(o => o.id === order.id ? { ...o, status: updated.status } : o));
      toast({ title: "Order marked as delivered" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
    } finally {
      setBusy(order.id, false);
    }
  }

  const displayStatus = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  const statuses = ["All", "PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
  const filtered = orders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    ((o.buyer?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
     (o.items[0]?.productName ?? "").toLowerCase().includes(search.toLowerCase()) ||
     o.id.toLowerCase().includes(search.toLowerCase()))
  );
  const ordPaged = filtered.slice((ordPage - 1) * ordPageSize, ordPage * ordPageSize);

  const statusColor = (s: string) => ({
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" /><span>Loading orders…</span>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: orders.length, Icon: ShoppingCart as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
                  { label: "Pending", value: orders.filter(o => o.status === "PENDING").length, Icon: Clock as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
                  { label: "Confirmed", value: orders.filter(o => o.status === "CONFIRMED").length, Icon: CheckCircle as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, Icon: Truck as IconComp, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
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
                    {s === "All" ? "All" : displayStatus(s)}
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
                        {["Order ID","Buyer","Product","Qty","Total","Date","Status","Actions"].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {ordPaged.map(o => {
                        const busy = actionIds.has(o.id);
                        const firstItem = o.items[0];
                        return (
                          <tr key={o.id} onClick={() => setViewOrder(o)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                            <td className="px-5 py-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[100px]">{o.id.slice(0, 8)}…</td>
                            <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{o.buyer?.name ?? "—"}</td>
                            <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{firstItem?.productName ?? "—"}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</td>
                            <td className="px-5 py-3.5 text-gray-500">{firstItem ? `${firstItem.quantity} ${firstItem.unit}` : "—"}</td>
                            <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{o.total}</td>
                            <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap text-xs">{new Date(o.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</td>
                            <td className="px-5 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(o.status)}`}>{displayStatus(o.status)}</span></td>
                            <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              {busy ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : (
                                <>
                                  {o.status === "PENDING" && (
                                    <div className="flex gap-1">
                                      <button onClick={() => setConfirmAction({ order: o, action: "confirm" })} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Confirm</button>
                                      <button onClick={() => setConfirmAction({ order: o, action: "cancel" })} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Cancel</button>
                                    </div>
                                  )}
                                  {o.status === "CONFIRMED" && (
                                    <button onClick={() => markDelivered(o)} className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">Mark Delivered</button>
                                  )}
                                  {(o.status === "DELIVERED" || o.status === "CANCELLED") && <span className="text-xs text-gray-400">{displayStatus(o.status)}</span>}
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {ordPaged.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No orders found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <PageBar page={ordPage} total={filtered.length} pageSize={ordPageSize} setPage={setOrdPage} setPageSize={(s) => { setOrdPageSize(s); setOrdPage(1); }} label="orders" />
              </div>
            </>
          )}
        </main>
      </div>

      {/* View modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
              <span className="ml-auto text-xs text-gray-400">Order Detail</span>
              <button aria-label="Close" onClick={() => setViewOrder(null)} className="ml-2 p-1 rounded text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-emerald-600 break-all">{viewOrder.id}</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(viewOrder.status)}`}>{displayStatus(viewOrder.status)}</span>
              </div>
              {[
                ["Buyer", viewOrder.buyer?.name ?? "—"],
                ["Products", viewOrder.items.map(i => `${i.productName} ×${i.quantity}`).join(", ")],
                ["Total", `GH₵${viewOrder.total}`],
                ["Date", new Date(viewOrder.createdAt).toLocaleDateString("en-GH", { dateStyle: "medium" })],
                ...(viewOrder.notes ? [["Notes", viewOrder.notes]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{k}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction?.action === "confirm" ? "Confirm Order" : "Cancel Order"}
        description={confirmAction?.action === "confirm" ? `Confirm this order from ${confirmAction?.order.buyer?.name}?` : `Cancel this order from ${confirmAction?.order.buyer?.name}? This cannot be undone.`}
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
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saved, setSaved] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unsaveId, setUnsaveId] = useState<string | null>(null);
  const [savedPage, setSavedPage] = useState(1);
  const [savedPageSize, setSavedPageSize] = useState(15);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSavedProducts();
      setSaved(data);
    } catch {
      toast({ title: "Failed to load saved items", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  async function unsave(productId: string) {
    setUnsaveId(null);
    try {
      await removeSavedProduct(productId);
      setSaved(prev => prev.filter(p => p.productId !== productId));
      toast({ title: "Removed from saved items" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to remove", variant: "destructive" });
    }
  }

  const filtered = saved.filter(p =>
    p.product.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.product.market?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const savedPaged = filtered.slice((savedPage - 1) * savedPageSize, savedPage * savedPageSize);

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

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" /><span>Loading saved items…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Bookmark className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No saved items yet. Browse products and tap the bookmark icon.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedPaged.map(sp => {
                  const p = sp.product;
                  return (
                    <div key={sp.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
                      <div className="h-28 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center relative">
                        <Package className="h-12 w-12 text-blue-200 dark:text-blue-800" />
                        <button onClick={() => setUnsaveId(sp.productId)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-blue-600 hover:text-red-500 transition-colors" title="Remove from saved"><BookmarkCheck className="h-4 w-4" /></button>
                      </div>
                      <div className="px-4 py-1.5 bg-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-semibold text-white">Market<span className="text-emerald-400">Wise</span></span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">{p.category}</p>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{p.name}</h3>
                        <div className="flex mb-3">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-3 w-3 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />)}</div>
                        <div className="flex items-end justify-between mb-2">
                          <p className="text-lg font-bold text-emerald-600">GH₵{p.price}</p>
                          <p className="text-xs text-gray-400">per {p.unit}</p>
                        </div>
                        {p.market && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.market.name}</p>}
                        <div className="mt-3 flex gap-2">
                          <Link href="/inventory" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">View Product</Link>
                          <Link href={`/shopping-list?add=${encodeURIComponent(p.name)}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"><ShoppingCart className="h-3 w-3" />Add to List</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

