"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, BarChart3, Heart, ArrowUp, ArrowDown,
  Plus, Trash2, AlertCircle, Bell as BellIcon, X, CheckCircle, TrendingDown,
  Archive, RotateCcw,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, clearShoppingList } from "@/lib/api/shoppingList";
import type { ShoppingItem } from "@/lib/api/shoppingList";
import { fetchPriceAlerts, createPriceAlert, deletePriceAlert } from "@/lib/api/priceAlerts";
import { fetchSubmissions } from "@/lib/api/submissions";


const PRODUCT_PRICES: Record<string, { lowestPrice: number; avgPrice: number; change: string; up: boolean }> = {
  "Rice (50kg bag)": { lowestPrice: 265, avgPrice: 290, change: "+2.1%", up: true },
  "Cooking Oil (2L)": { lowestPrice: 34, avgPrice: 38.5, change: "-3.8%", up: false },
  "Tomatoes (1kg)": { lowestPrice: 9, avgPrice: 12, change: "+4.3%", up: true },
  "Chicken (1kg)": { lowestPrice: 28, avgPrice: 32, change: "-8.6%", up: false },
  "Eggs (crate×30)": { lowestPrice: 50, avgPrice: 55, change: "+5.4%", up: true },
  "Yam (medium)": { lowestPrice: 15, avgPrice: 18, change: "+1.5%", up: true },
  // Electronics
  "iPhone 16 Pro Max (256GB)": { lowestPrice: 8500, avgPrice: 9800, change: "+3.2%", up: true },
  "Samsung Galaxy S24 Ultra": { lowestPrice: 7200, avgPrice: 8400, change: "-2.1%", up: false },
  "Samsung Galaxy A55 5G": { lowestPrice: 3200, avgPrice: 4100, change: "+1.8%", up: true },
  "MacBook Air M3 (13\")": { lowestPrice: 13500, avgPrice: 15800, change: "+5.1%", up: true },
  "HP Pavilion 15 (Core i7)": { lowestPrice: 6800, avgPrice: 8200, change: "-4.3%", up: false },
  "Lenovo IdeaPad 3 (Core i5)": { lowestPrice: 5400, avgPrice: 6500, change: "+2.4%", up: true },
  "Dell OptiPlex 7010 (i5)": { lowestPrice: 4200, avgPrice: 5500, change: "+2.7%", up: true },
  "HP ProDesk 400 (Ryzen 5)": { lowestPrice: 3900, avgPrice: 4800, change: "-1.5%", up: false },
};

interface PastTrip {
  id: number;
  name: string;
  date: string;
  items: { name: string; category: string; quantity: string }[];
  totalSaved: number;
  market: string;
}


type IconComp = React.FC<{ className?: string }>;

const SELLER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory", icon: Package as IconComp, label: "My Products" },
  { href: "/orders", icon: ShoppingCart as IconComp, label: "Orders" },
  { href: "/shopping-list", icon: BarChart3 as IconComp, label: "Price Tracking", active: true },
  { href: "/markets", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Profile" },
];
const BUYER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory", icon: Package as IconComp, label: "Browse Products" },
  { href: "/shopping-list", icon: ShoppingCart as IconComp, label: "Shopping List", active: true },
  { href: "/orders", icon: Heart as IconComp, label: "Saved Items" },
  { href: "/profile", icon: User as IconComp, label: "Profile" },
];

/* ─── root ─────────────────────────────────────────────────────── */
export default function ShoppingListPage() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(getUserRole() || "buyer"); }, []);
  if (!role) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" /></div>;
  if (role === "buyer") return <Suspense><BuyerShoppingList /></Suspense>;
  return <SellerPriceTracking />;
}

/* ═══════════════════════ SELLER PRICE TRACKING ═════════════════ */
function SellerPriceTracking() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  type PriceRow = { id: string; product: string; market: string; category: string; oldPrice: number; newPrice: number; change: string; up: boolean; date: string };
  const [priceHistory, setPriceHistory] = useState<PriceRow[]>([]);

  type Alert = { id: string; product: string; condition: string; current: number; target: number };
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlertProduct, setNewAlertProduct] = useState("");
  const [newAlertTarget, setNewAlertTarget] = useState("");
  const [removeAlertId, setRemoveAlertId] = useState<string | null>(null);
  const [addAlertOpen, setAddAlertOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions({ status: "APPROVED" })
      .then(({ submissions }) => setPriceHistory(submissions.map(s => ({
        id: s.id,
        product: s.productName,
        market: s.market ?? "",
        category: "",
        oldPrice: s.prevPrice ?? 0,
        newPrice: s.price,
        change: s.change ?? "",
        up: s.prevPrice == null ? true : s.price >= s.prevPrice,
        date: (s as any).submitted ?? "",
      }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPriceAlerts()
      .then(data => setAlerts(data.map(a => ({
        id: a.id,
        product: a.productName,
        condition: `${a.condition === "BELOW" ? "below" : "above"} GH\u20b5${a.targetPrice}`,
        current: a.currentPrice,
        target: a.targetPrice,
      }))))
      .catch(() => {});
  }, []);

  const categories = ["All", ...Array.from(new Set(priceHistory.map(p => p.category).filter(Boolean)))];
  const filtered = priceHistory.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.product.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );

  async function addAlert() {
    if (!newAlertProduct.trim()) return;
    const target = parseFloat(newAlertTarget) || 0;
    try {
      const created = await createPriceAlert({ productName: newAlertProduct, condition: "BELOW", targetPrice: target });
      setAlerts(prev => [...prev, {
        id: created.id,
        product: created.productName,
        condition: `below GH\u20b5${created.targetPrice}`,
        current: created.currentPrice,
        target: created.targetPrice,
      }]);
      setNewAlertProduct(""); setNewAlertTarget(""); setAddAlertOpen(false);
    } catch { /* silent */ }
  }

  async function confirmRemoveAlert() {
    if (!removeAlertId) return;
    const id = removeAlertId;
    setRemoveAlertId(null);
    try {
      await deletePriceAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch { /* silent */ }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <SidebarComp open={sidebarOpen} setOpen={setSidebarOpen} nav={SELLER_NAV} panelLabel="Seller Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBarComp search={search} setSearch={setSearch} placeholder="Search products, markets…" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Price Tracking</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor price movements and set alerts for your market</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Price Records", value: priceHistory.length, change: "Approved submissions", up: true, Icon: BarChart3 as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Price Increases", value: priceHistory.filter(p => p.up).length, change: "Products went up", up: false, Icon: TrendingUp as IconComp, bg: "bg-red-50 dark:bg-red-900/20", ic: "text-red-600 dark:text-red-400" },
              { label: "Price Drops", value: priceHistory.filter(p => !p.up).length, change: "Products went down", up: true, Icon: TrendingDown as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Active Alerts", value: alerts.length, change: "Monitoring", up: true, Icon: BellIcon as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Price History Table */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Price Changes</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Product","Category","Old Price","New Price","Change","Market","Date"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.product}</td>
                        <td className="px-5 py-3.5 text-gray-500">{p.category}</td>
                        <td className="px-5 py-3.5 text-gray-500 line-through">GH₵{p.oldPrice}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-100">GH₵{p.newPrice}</td>
                        <td className="px-5 py-3.5"><span className={`flex items-center gap-1 text-xs font-semibold ${p.up ? "text-emerald-600" : "text-red-500"}`}>{p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}</span></td>
                        <td className="px-5 py-3.5 text-gray-500 truncate max-w-[120px]">{p.market}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Alerts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Price Alerts</h2>
                <button onClick={() => setAddAlertOpen(!addAlertOpen)} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Alert
                </button>
              </div>

              {addAlertOpen && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <input value={newAlertProduct} onChange={e => setNewAlertProduct(e.target.value)} placeholder="Product name" className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                  <input value={newAlertTarget} onChange={e => setNewAlertTarget(e.target.value)} type="number" placeholder="Target price (GH₵)" className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                  <div className="flex gap-2">
                    <button onClick={addAlert} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors">Add</button>
                    <button onClick={() => setAddAlertOpen(false)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.product}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when {a.condition}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Current: GH₵{a.current}</p>
                    </div>
                    <button aria-label="Remove alert" onClick={() => setRemoveAlertId(a.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No active alerts</p>}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog open={removeAlertId !== null} title="Remove Alert" description="Remove this price alert? You will no longer receive notifications." confirmLabel="Remove" variant="warning" onConfirm={confirmRemoveAlert} onCancel={() => setRemoveAlertId(null)} />
    </div>
  );
}

/* ═══════════════════════ BUYER SHOPPING LIST ════════════════════ */
function BuyerShoppingList() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [pastTrips, setPastTrips] = useState<PastTrip[]>([]);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [tripName, setTripName] = useState("");
  const [deleteTripId, setDeleteTripId] = useState<number | null>(null);
  const [reuseTrip, setReuseTrip] = useState<PastTrip | null>(null);

  // Load shopping list from API
  useEffect(() => {
    fetchShoppingList()
      .then(data => setItems(data))
      .catch(() => toast({ title: "Failed to load shopping list", variant: "destructive" }))
      .finally(() => setListLoading(false));
  }, [toast]);

  // Load past trips from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mw_past_trips");
      if (stored) setPastTrips(JSON.parse(stored));
    } catch {}
  }, []);

  const pending = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const savingsItems = items
    .map(item => { const p = PRODUCT_PRICES[item.name]; return p ? { name: item.name, saved: p.avgPrice - p.lowestPrice } : null; })
    .filter((x): x is { name: string; saved: number } => x !== null);
  const totalSavings = savingsItems.reduce((s, x) => s + x.saved, 0);

  async function addItem() {
    if (!newName.trim()) return;
    try {
      const created = await addShoppingItem({ name: newName.trim(), quantity: newQty.trim() || "1" });
      setItems(prev => [...prev, created]);
      setNewName(""); setNewQty("");
    } catch {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
  }
  async function toggle(id: string) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      const updated = await updateShoppingItem(id, { checked: !item.checked });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch {}
  }
  async function remove(id: string) {
    try {
      await deleteShoppingItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
  }
  async function clearChecked() {
    setClearConfirm(false);
    const toDelete = items.filter(i => i.checked);
    try {
      await Promise.all(toDelete.map(i => deleteShoppingItem(i.id)));
      setItems(prev => prev.filter(i => !i.checked));
    } catch {
      toast({ title: "Failed to clear items", variant: "destructive" });
    }
  }

  function archiveTrip() {
    const name = tripName.trim() || `Market Trip – ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    const newTrip: PastTrip = {
      id: Date.now(), name,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      items: items.map(({ name, category, quantity }) => ({ name, category, quantity })),
      totalSaved: parseFloat(totalSavings.toFixed(2)),
      market: "Accra Central Market",
    };
    const updated = [newTrip, ...pastTrips];
    setPastTrips(updated);
    try { localStorage.setItem("mw_past_trips", JSON.stringify(updated)); } catch {}
    clearShoppingList().catch(() => {});
    setItems([]); setArchiveConfirm(false); setTripName(""); setActiveTab("past");
  }

  async function reuseList(trip: PastTrip) {
    setReuseTrip(null);
    try {
      await clearShoppingList();
      const created = await Promise.all(
        trip.items.map(item => addShoppingItem({ name: item.name, quantity: item.quantity }))
      );
      setItems(created); setActiveTab("current");
    } catch {
      toast({ title: "Failed to reuse list", variant: "destructive" });
    }
  }

  // Auto-add item from ?add= URL param (e.g. navigating from Saved Items)
  useEffect(() => {
    const name = searchParams.get("add");
    if (!name) return;
    addShoppingItem({ name, quantity: "1" })
      .then(item => setItems(prev => prev.some(i => i.name === item.name) ? prev : [...prev, item]))
      .catch(() => {});
  }, [searchParams]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <SidebarComp open={sidebarOpen} setOpen={setSidebarOpen} nav={BUYER_NAV} panelLabel="Buyer Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBarComp search={search} setSearch={setSearch} placeholder="Search shopping list…" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shopping List</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {activeTab === "current"
                  ? `Plan your market trip · ${pending.length} item${pending.length !== 1 ? "s" : ""} remaining`
                  : `${pastTrips.length} saved trip${pastTrips.length !== 1 ? "s" : ""} · reuse any list below`}
              </p>
            </div>
            {activeTab === "current" && checked.length > 0 && (
              <button onClick={() => setClearConfirm(true)} className="text-xs text-red-500 hover:underline">Clear done ({checked.length})</button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
            {(["current", "past"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}>
                {tab === "current" ? "Current List" : `Past Trips (${pastTrips.length})`}
              </button>
            ))}
          </div>

          {activeTab === "current" ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Items", value: items.length, Icon: ShoppingCart as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
                  { label: "Remaining", value: pending.length, Icon: Package as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
                  { label: "Checked Off", value: checked.length, Icon: CheckCircle as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Est. Savings", value: `GH₵${totalSavings.toFixed(2)}`, Icon: TrendingDown as IconComp, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
                ].map(({ label, value, Icon, bg, ic }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                    <span className={`p-3 rounded-xl ${bg}`}><Icon className={`h-5 w-5 ${ic}`} /></span>
                    <div><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-gray-400">
                      <ShoppingCart className="h-10 w-10 mb-2 opacity-30" />
                      <p className="text-sm">Your list is empty. Add items using the form →</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filtered.map(item => {
                        const price = PRODUCT_PRICES[item.name];
                        return (
                          <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                            item.checked
                              ? "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60"
                              : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                          }`}>
                            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                              className="h-4 w-4 accent-emerald-600 rounded flex-shrink-0"
                              aria-label={`Mark ${item.name} as ${item.checked ? "incomplete" : "complete"}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${item.checked ? "line-through text-gray-400" : ""}`}>{item.name}</p>
                              <p className="text-xs text-gray-400">{item.category}</p>
                            </div>
                            {price && !item.checked && (
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">GH₵{price.lowestPrice}</span>
                                <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                  price.up ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                }`}>
                                  {price.up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}{price.change}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400 mx-1">{item.quantity}</span>
                            <button aria-label="Remove item" onClick={() => remove(item.id)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Add item */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add Item</h2>
                    <div className="space-y-2">
                      <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder="Item name (e.g. Tomatoes)" className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                      <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Quantity (e.g. 2 kg)" className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                      <button onClick={addItem} className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <Plus className="h-4 w-4" /> Add to List
                      </button>
                    </div>
                  </div>

                  {/* Summary + archive */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Summary</h2>
                    <div className="space-y-0">
                      {[["Total items", items.length], ["Remaining", pending.length], ["Completed", checked.length]].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-500">{k}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{v}</span>
                        </div>
                      ))}
                      {totalSavings > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-500">Est. savings</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">GH₵{totalSavings.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {pending.length === 0 && items.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">All items checked off!</p>
                        </div>
                        <input value={tripName} onChange={e => setTripName(e.target.value)}
                          placeholder="Name this trip (optional)"
                          className="w-full px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        <button onClick={() => setArchiveConfirm(true)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                          <Archive className="h-3.5 w-3.5" /> Save to Past Trips
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Savings breakdown */}
                  {savingsItems.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-emerald-500" /> Savings Breakdown
                      </h2>
                      <div className="space-y-2">
                        {savingsItems.map(s => (
                          <div key={s.name} className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">{s.name}</span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">save GH₵{s.saved.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">GH₵{totalSavings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Past Trips Tab */
            <div className="space-y-4">
              {pastTrips.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                  <Archive className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No past trips yet. Complete and save your current list to record it here.</p>
                  <button onClick={() => setActiveTab("current")} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Go to current list</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastTrips.map(trip => (
                    <div key={trip.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{trip.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{trip.date} · {trip.market}</p>
                        </div>
                        <button aria-label="Delete trip" onClick={() => setDeleteTripId(trip.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {trip.items.slice(0, 4).map(item => (
                          <div key={item.name} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{item.name}</span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{item.quantity}</span>
                          </div>
                        ))}
                        {trip.items.length > 4 && <p className="text-xs text-gray-400 pl-5">+{trip.items.length - 4} more items</p>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500">{trip.items.length} items</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Saved GH₵{trip.totalSaved}</span>
                      </div>
                      <button onClick={() => setReuseTrip(trip)}
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors">
                        <RotateCcw className="h-3 w-3" /> Reuse This List
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog open={clearConfirm} title="Clear Completed Items" description={`Remove ${checked.length} checked item${checked.length !== 1 ? "s" : ""} from your list?`} confirmLabel="Clear Items" variant="warning" onConfirm={clearChecked} onCancel={() => setClearConfirm(false)} />
      <ConfirmDialog open={archiveConfirm} title="Save Trip to History" description={`Save "${tripName.trim() || "this trip"}" to your past trips and clear the current list?`} confirmLabel="Save Trip" variant="default" onConfirm={archiveTrip} onCancel={() => setArchiveConfirm(false)} />
      <ConfirmDialog open={reuseTrip !== null} title="Reuse This List" description={`Load all items from "${reuseTrip?.name}" into your current list? Your existing items will be replaced.`} confirmLabel="Reuse List" variant="default" onConfirm={() => reuseList(reuseTrip!)} onCancel={() => setReuseTrip(null)} />
      <ConfirmDialog open={deleteTripId !== null} title="Delete Trip" description="Remove this trip from your history? This cannot be undone." confirmLabel="Delete" variant="warning" onConfirm={() => { setPastTrips(prev => prev.filter(t => t.id !== deleteTripId)); setDeleteTripId(null); }} onCancel={() => setDeleteTripId(null)} />
    </div>
  );
}

/* ─── shared ────────────────────────────────────────────────────── */
function SidebarComp({ open, setOpen, nav, panelLabel }: {
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

function TopBarComp({ search, setSearch, placeholder }: { search: string; setSearch: (v: string) => void; placeholder: string }) {
  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
      </div>
      <div className="ml-auto"><button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button></div>
    </header>
  );
}
