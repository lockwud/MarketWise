"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package, MapPin, Users, ShoppingCart,
  LogOut, ArrowUp, ArrowDown, LayoutDashboard, Menu, BarChart3,
  CheckCircle, XCircle, AlertTriangle, Clock, Trash2, UserX,
  UserCheck, Flag, Shield, Settings, Building2,
  ChevronRight, Activity,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateModal, FormField, inputCls, selectCls } from "@/components/ui/create-modal";
import { PageBar } from "@/components/ui/page-bar";

const INITIAL_USERS = [
  { id: 1, name: "Kofi Mensah", email: "kofi@example.com", role: "seller", status: "Active", markets: 3, joined: "Jan 15, 2025", location: "Accra" },
  { id: 2, name: "Ama Owusu", email: "ama@example.com", role: "buyer", status: "Active", markets: 0, joined: "Feb 3, 2025", location: "Kumasi" },
  { id: 3, name: "Yaw Darko", email: "yaw@example.com", role: "seller", status: "Pending", markets: 1, joined: "Mar 1, 2025", location: "Takoradi" },
  { id: 4, name: "Abena Asante", email: "abena@example.com", role: "buyer", status: "Active", markets: 0, joined: "Mar 8, 2025", location: "Accra" },
  { id: 5, name: "Kweku Boateng", email: "kweku@example.com", role: "seller", status: "Suspended", markets: 2, joined: "Nov 20, 2024", location: "Kumasi" },
  { id: 6, name: "Efua Nyarko", email: "efua@example.com", role: "buyer", status: "Active", markets: 0, joined: "Apr 2, 2025", location: "Tamale" },
];

const INITIAL_SUBMISSIONS = [
  { id: 1, product: "Rice (50kg bag)", seller: "Kofi Mensah", market: "Accra Central Market", price: 290, prevPrice: 270, change: "+7.4%", up: true, status: "Pending", submitted: "2h ago" },
  { id: 2, product: "Cooking Oil (2L)", seller: "Yaw Darko", market: "Takoradi Market", price: 34, prevPrice: 38, change: "-10.5%", up: false, status: "Flagged", submitted: "4h ago" },
  { id: 3, product: "Tomatoes (1kg)", seller: "Kweku Boateng", market: "Kumasi Central Market", price: 9, prevPrice: 12, change: "-25%", up: false, status: "Pending", submitted: "6h ago" },
  { id: 4, product: "Chicken (1kg)", seller: "Kofi Mensah", market: "Accra Central Market", price: 32, prevPrice: 30, change: "+6.7%", up: true, status: "Approved", submitted: "1d ago" },
  { id: 5, product: "Eggs (crate)", seller: "Yaw Darko", market: "Takoradi Market", price: 58, prevPrice: 55, change: "+5.4%", up: true, status: "Approved", submitted: "1d ago" },
  { id: 6, product: "iPhone 16 Pro Max (256GB)", seller: "Kofi Mensah", market: "Accra Central Market", price: 8500, prevPrice: 8200, change: "+3.7%", up: true, status: "Pending", submitted: "3h ago" },
  { id: 7, product: "Samsung Galaxy S24 Ultra", seller: "Nana Amoah", market: "Kumasi Central Market", price: 7200, prevPrice: 7500, change: "-4.0%", up: false, status: "Approved", submitted: "5h ago" },
  { id: 8, product: "MacBook Air M3 (13\")", seller: "Yaw Darko", market: "Accra Central Market", price: 13500, prevPrice: 12800, change: "+5.5%", up: true, status: "Flagged", submitted: "1d ago" },
  { id: 9, product: "HP Pavilion 15 (Core i7)", seller: "Kweku Boateng", market: "Kaneshie Market", price: 6800, prevPrice: 7200, change: "-5.6%", up: false, status: "Pending", submitted: "2d ago" },
  { id: 10, product: "Dell OptiPlex 7010 (i5)", seller: "Kofi Mensah", market: "Accra Central Market", price: 4200, prevPrice: 4000, change: "+5.0%", up: true, status: "Approved", submitted: "2d ago" },
];

const MARKETS_DATA = [
  { name: "Accra Central Market", sellers: 124, products: 340, city: "Accra", status: "Active", revenue: "GH₵142k" },
  { name: "Kumasi Central Market", sellers: 98, products: 280, city: "Kumasi", status: "Active", revenue: "GH₵118k" },
  { name: "Madina Market", sellers: 67, products: 185, city: "Accra", status: "Active", revenue: "GH₵74k" },
  { name: "Takoradi Market", sellers: 54, products: 155, city: "Takoradi", status: "Active", revenue: "GH₵61k" },
  { name: "Kaneshie Market", sellers: 43, products: 120, city: "Accra", status: "Active", revenue: "GH₵49k" },
];

const weeklyBars = [120, 185, 145, 230, 285, 198, 165];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxBar = Math.max(...weeklyBars);
const CITIES = ["Accra", "Kumasi", "Takoradi", "Tamale", "Tema", "Madina", "Cape Coast", "Sunyani"];

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", active: true },
  { href: "/admin/user", icon: Users, label: "Users", active: false },
  { href: "/admin/delivery", icon: ShoppingCart, label: "Submissions", active: false },
  { href: "/inventory", icon: Package, label: "Products", active: false },
  { href: "/recipes", icon: Building2, label: "Markets", active: false },
  { href: "/profile", icon: Settings, label: "Settings", active: false },
];

interface MarketForm { name: string; city: string; district: string; description: string; }
const emptyMarket = (): MarketForm => ({ name: "", city: "", district: "", description: "" });

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [markets, setMarkets] = useState(MARKETS_DATA);
  const [deleteUser, setDeleteUser] = useState<typeof INITIAL_USERS[0] | null>(null);
  const [suspendUser, setSuspendUser] = useState<typeof INITIAL_USERS[0] | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [createMarketOpen, setCreateMarketOpen] = useState(false);
  const [submittingMarket, setSubmittingMarket] = useState(false);
  const [marketForm, setMarketForm] = useState<MarketForm>(emptyMarket());
  const [activeTab, setActiveTab] = useState<"users" | "submissions" | "markets">("users");
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(15);
  const [subsPage, setSubsPage] = useState(1);
  const [subsPageSize, setSubsPageSize] = useState(15);
  const [marketsPage, setMarketsPage] = useState(1);
  const [marketsPageSize, setMarketsPageSize] = useState(15);

  const handleDeleteUser = () => {
    if (!deleteUser) return;
    setUsers((p) => p.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
  };
  const handleSuspendUser = () => {
    if (!suspendUser) return;
    setUsers((p) => p.map((u) => u.id === suspendUser.id ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u));
    setSuspendUser(null);
  };
  const handleApprove = () => {
    if (approveId == null) return;
    setSubmissions((p) => p.map((s) => s.id === approveId ? { ...s, status: "Approved" } : s));
    setApproveId(null);
  };
  const handleReject = () => {
    if (rejectId == null) return;
    setSubmissions((p) => p.map((s) => s.id === rejectId ? { ...s, status: "Rejected" } : s));
    setRejectId(null);
  };
  const handleCreateMarket = () => {
    setSubmittingMarket(true);
    setTimeout(() => {
      setMarkets((p) => [...p, { name: marketForm.name || "New Market", sellers: 0, products: 0, city: marketForm.city || "Accra", status: "Active", revenue: "GH₵0" }]);
      setMarketForm(emptyMarket());
      setCreateMarketOpen(false);
      setSubmittingMarket(false);
    }, 700);
  };
  const mf = (k: keyof MarketForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setMarketForm((p) => ({ ...p, [k]: e.target.value }));

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.location.toLowerCase().includes(search.toLowerCase()));
  const filteredSubs = submissions.filter((s) => s.product.toLowerCase().includes(search.toLowerCase()) || s.seller.toLowerCase().includes(search.toLowerCase()));
  const pagedUsers = filteredUsers.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize);
  const pagedSubs = filteredSubs.slice((subsPage - 1) * subsPageSize, subsPage * subsPageSize);
  const pagedMarkets = markets.slice((marketsPage - 1) * marketsPageSize, marketsPage * marketsPageSize);
  const pendingCount = submissions.filter((s) => s.status === "Pending").length;
  const flaggedCount = submissions.filter((s) => s.status === "Flagged").length;
  const activeUsers = users.filter((u) => u.status === "Active").length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-base font-bold">Market<span className="text-emerald-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-4 w-4" /></button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Admin Panel</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, markets…" className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="h-5 w-5" />
              {(pendingCount + flaggedCount) > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 text-sm font-bold">A</div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">Admin</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Shield className="h-3 w-3" />Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform overview — MarketWise Ghana</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: users.length, sub: `${activeUsers} active`, up: true, Icon: Users, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600 dark:text-blue-400" },
              { label: "Markets", value: markets.length, sub: "Across Ghana", up: true, Icon: Building2, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
              { label: "Pending Reviews", value: pendingCount, sub: `${flaggedCount} flagged`, up: false, Icon: Clock, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600 dark:text-amber-400" },
              { label: "Total Submissions", value: submissions.length, sub: "Price records", up: true, Icon: Activity, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
            ].map(({ label, value, sub, up, Icon, bg, ic }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className={`p-2 rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${ic}`} /></span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-emerald-600" : "text-amber-500"}`}>
                    {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Submissions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Price records submitted this week</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyBars.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs text-emerald-500 flex items-center justify-end gap-1"><ArrowUp className="h-3 w-3" />18.2%</p>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-2 h-32">
                {weeklyBars.map((val, i) => (
                  <div key={weekDays[i]} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{val}</span>
                    <div className="w-full rounded-md bg-violet-500 hover:bg-violet-400 transition-colors cursor-pointer"
                      ref={(el) => { if (el) el.style.height = `${(val / maxBar) * 100}%`; }} />
                    <span className="text-[10px] text-gray-400">{weekDays[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Markets</h2>
              <div className="space-y-3">
                {markets.slice(0, 5).map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.sellers} sellers · {m.city}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{m.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-2">
              {(["users", "submissions", "markets"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-emerald-600 text-emerald-600 dark:text-emerald-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  {tab}
                  {tab === "submissions" && pendingCount > 0 && <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold">{pendingCount}</span>}
                </button>
              ))}
            </div>

            {activeTab === "users" && (
              <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Name","Role","Location","Status","Markets","Joined","Actions"].map((h) => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {pagedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5"><p className="font-medium text-gray-900 dark:text-white">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                        <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === "seller" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{u.role}</span></td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.location}</td>
                        <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : u.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{u.status === "Active" ? <CheckCircle className="h-3 w-3" /> : u.status === "Pending" ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{u.status}</span></td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.markets}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.joined}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSuspendUser(u)} className={`p-1.5 rounded-lg transition-colors ${u.status === "Suspended" ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600" : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600"}`} title={u.status === "Suspended" ? "Reinstate" : "Suspend"}>
                              {u.status === "Suspended" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setDeleteUser(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PageBar page={usersPage} total={filteredUsers.length} pageSize={usersPageSize} setPage={setUsersPage} setPageSize={(s) => { setUsersPageSize(s); setUsersPage(1); }} label="users" />
              </>
            )}

            {activeTab === "submissions" && (
              <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Product","Seller","Market","Price","Change","Status","Submitted","Actions"].map((h) => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {pagedSubs.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{s.product}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{s.seller}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{s.market}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{s.price}</td>
                        <td className="px-5 py-3.5"><span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>{s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{s.change}</span></td>
                        <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : s.status === "Flagged" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : s.status === "Rejected" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{s.status === "Approved" ? <CheckCircle className="h-3 w-3" /> : s.status === "Flagged" ? <Flag className="h-3 w-3" /> : s.status === "Rejected" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{s.status}</span></td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{s.submitted}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {(s.status === "Pending" || s.status === "Flagged") && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setApproveId(s.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                              <button onClick={() => setRejectId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors" title="Reject"><XCircle className="h-4 w-4" /></button>
                            </div>
                          )}
                          {(s.status === "Approved" || s.status === "Rejected") && <span className="text-xs text-gray-400">{s.status}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PageBar page={subsPage} total={filteredSubs.length} pageSize={subsPageSize} setPage={setSubsPage} setPageSize={(s) => { setSubsPageSize(s); setSubsPage(1); }} label="submissions" />
              </>
            )}

            {activeTab === "markets" && (
              <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Market Name","City","Sellers","Products","Revenue","Status"].map((h) => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {pagedMarkets.map((m) => (
                      <tr key={m.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{m.name}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.city}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.sellers}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.products}</td>
                        <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{m.revenue}</td>
                        <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="h-3 w-3" />{m.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PageBar page={marketsPage} total={markets.length} pageSize={marketsPageSize} setPage={setMarketsPage} setPageSize={(s) => { setMarketsPageSize(s); setMarketsPage(1); }} label="markets" />
              </>
            )}
          </div>
        </main>
      </div>

      <CreateModal
        open={createMarketOpen}
        title="Add New Market"
        onClose={() => { setCreateMarketOpen(false); setMarketForm(emptyMarket()); }}
        onSubmit={handleCreateMarket}
        submitLabel="Create Market"
        submitting={submittingMarket}
        tabs={[
          { key: "info", label: "Market Info", content: (
            <div>
              <FormField label="Market Name" required><input className={inputCls} placeholder="e.g. Accra Central Market" value={marketForm.name} onChange={mf("name")} /></FormField>
              <FormField label="City" required><select aria-label="City" className={selectCls} value={marketForm.city} onChange={mf("city")}><option value="">Select city</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></FormField>
              <FormField label="District / Area"><input className={inputCls} placeholder="e.g. Osu" value={marketForm.district} onChange={mf("district")} /></FormField>
              <FormField label="Description"><textarea className={inputCls + " resize-none"} rows={3} placeholder="About this market…" value={marketForm.description} onChange={mf("description")} /></FormField>
            </div>
          )},
          { key: "location", label: "Location", content: (
            <div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                <p className="font-medium mb-1">Location Mapping</p>
                <p className="text-xs">Geo-coordinates will be enabled once mapping API is integrated.</p>
              </div>
              <FormField label="Google Maps Link" hint="Paste a link to help buyers find this market"><input className={inputCls} placeholder="https://maps.google.com/…" /></FormField>
              <FormField label="Region"><select aria-label="Region" className={selectCls}><option value="">Select region</option>{["Greater Accra","Ashanti","Western","Northern","Volta","Central","Eastern"].map((r) => <option key={r} value={r}>{r}</option>)}</select></FormField>
            </div>
          )},
        ]}
      />

      <ConfirmDialog open={suspendUser !== null} title={suspendUser?.status === "Suspended" ? "Reinstate Account" : "Suspend Account"} description={suspendUser?.status === "Suspended" ? `Reinstate ${suspendUser?.name}'s access to MarketWise.` : `Suspend ${suspendUser?.name}'s account. They will lose platform access until reinstated.`} confirmLabel={suspendUser?.status === "Suspended" ? "Reinstate" : "Suspend"} variant="warning" onConfirm={handleSuspendUser} onCancel={() => setSuspendUser(null)} />
      <ConfirmDialog open={deleteUser !== null} title="Delete Account" description={`Permanently deleting ${deleteUser?.name}'s account cannot be undone. All their data will be removed.`} confirmLabel="Delete Account" requireTyping="delete" variant="danger" onConfirm={handleDeleteUser} onCancel={() => setDeleteUser(null)} />
      <ConfirmDialog open={approveId !== null} title="Approve Price Submission" description="This price record will be published and visible to all buyers." confirmLabel="Approve" variant="default" onConfirm={handleApprove} onCancel={() => setApproveId(null)} />
      <ConfirmDialog open={rejectId !== null} title="Reject Price Submission" description="This submission will be rejected and the seller will be notified." confirmLabel="Reject" variant="warning" onConfirm={handleReject} onCancel={() => setRejectId(null)} />
    </div>
  );
}
