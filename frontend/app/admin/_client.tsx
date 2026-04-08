"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package, MapPin, Users, ShoppingCart,
  LogOut, ArrowUp, ArrowDown, LayoutDashboard, Menu, BarChart3,
  CheckCircle, XCircle, AlertTriangle, Clock, Trash2, UserX,
  UserCheck, Flag, Shield, Settings, Building2,
  ChevronRight, Activity, Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateModal, FormField, inputCls, selectCls } from "@/components/ui/create-modal";
import { PageBar } from "@/components/ui/page-bar";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAdminStats, fetchAdminActivity, fetchAdminUsers, fetchAdminSubmissions, fetchAdminMarkets,
  suspendUser as apiSuspendUser, deleteUser as apiDeleteUser,
  approveSubmission, rejectSubmission, createMarket,
} from "@/lib/api/admin";
import type { AdminUser, AdminSubmission, AdminMarket, AdminStats } from "@/lib/api/admin";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CITIES = ["Accra", "Kumasi", "Takoradi", "Tamale", "Tema", "Madina", "Cape Coast", "Sunyani"];

const navItems = [
  { href: "/admin",          icon: LayoutDashboard, label: "Overview",    active: true },
  { href: "/admin/user",     icon: Users,           label: "Users",       active: false },
  { href: "/admin/delivery", icon: ShoppingCart,    label: "Submissions", active: false },
  { href: "/inventory",      icon: Package,         label: "Products",    active: false },
  { href: "/markets",        icon: Building2,       label: "Markets",     active: false },
  { href: "/profile",        icon: Settings,        label: "Settings",    active: false },
];

interface MarketForm { name: string; city: string; district: string; description: string; }
const emptyMarket = (): MarketForm => ({ name: "", city: "", district: "", description: "" });

export default function AdminClient() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [markets, setMarkets] = useState<AdminMarket[]>([]);
  const [weeklyBars, setWeeklyBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [actionIds, setActionIds] = useState<Set<string>>(new Set());

  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);
  const [suspendUserTarget, setSuspendUserTarget] = useState<AdminUser | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
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

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, activityData, usersData, subsData, marketsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminActivity(),
        fetchAdminUsers({ page: 1 }),
        fetchAdminSubmissions({ page: 1 }),
        fetchAdminMarkets(),
      ]);
      setStats(statsData);
      setWeeklyBars(activityData.weeklyOrders);
      setUsers(usersData.users);
      setSubmissions(subsData.submissions);
      setMarkets(marketsData);
    } catch {
      toast({ title: "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function setBusy(id: string, busy: boolean) {
    setActionIds(prev => { const s = new Set(prev); busy ? s.add(id) : s.delete(id); return s; });
  }

  async function handleDeleteUser() {
    if (!deleteUserTarget) return;
    const { id, name } = deleteUserTarget;
    setDeleteUserTarget(null);
    setBusy(id, true);
    try {
      await apiDeleteUser(id);
      setUsers(p => p.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, users: stats.users - 1 });
      toast({ title: `${name} deleted` });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Delete failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  async function handleSuspendUser() {
    if (!suspendUserTarget) return;
    const user = suspendUserTarget;
    setSuspendUserTarget(null);
    setBusy(user.id, true);
    const isSuspended = (user.status ?? "").toUpperCase() === "SUSPENDED";
    try {
      await apiSuspendUser(user.id, !isSuspended);
      setUsers(p => p.map(u => u.id === user.id ? { ...u, status: isSuspended ? "ACTIVE" : "SUSPENDED" } : u));
      toast({ title: `${user.name} ${isSuspended ? "reinstated" : "suspended"}` });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
    } finally {
      setBusy(user.id, false);
    }
  }

  async function handleApprove() {
    if (!approveId) return;
    const id = approveId;
    setApproveId(null);
    setBusy(id, true);
    try {
      const updated = await approveSubmission(id);
      setSubmissions(p => p.map(s => s.id === id ? { ...s, status: updated.status } : s));
      toast({ title: "Submission approved" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Approve failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  async function handleReject() {
    if (!rejectId) return;
    const id = rejectId;
    setRejectId(null);
    setBusy(id, true);
    try {
      const updated = await rejectSubmission(id);
      setSubmissions(p => p.map(s => s.id === id ? { ...s, status: updated.status } : s));
      toast({ title: "Submission rejected" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Reject failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  async function handleCreateMarket() {
    setSubmittingMarket(true);
    try {
      const newMarket = await createMarket({ name: marketForm.name, city: marketForm.city, district: marketForm.district, description: marketForm.description });
      setMarkets(p => [...p, newMarket]);
      if (stats) setStats({ ...stats, markets: stats.markets + 1 });
      setMarketForm(emptyMarket());
      setCreateMarketOpen(false);
      toast({ title: `${newMarket.name} created` });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Create failed", variant: "destructive" });
    } finally {
      setSubmittingMarket(false);
    }
  }

  const mf = (k: keyof MarketForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setMarketForm((p) => ({ ...p, [k]: e.target.value }));

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredSubs = submissions.filter(s => s.productName.toLowerCase().includes(search.toLowerCase()) || (s.seller ?? "").toLowerCase().includes(search.toLowerCase()));
  const pagedUsers = filteredUsers.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize);
  const pagedSubs = filteredSubs.slice((subsPage - 1) * subsPageSize, subsPage * subsPageSize);
  const pagedMarkets = markets.slice((marketsPage - 1) * marketsPageSize, marketsPage * marketsPageSize);
  const pendingCount = submissions.filter(s => s.status === "Pending").length;
  const flaggedCount = submissions.filter(s => s.status === "Flagged").length;

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

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" /><span>Loading dashboard…</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users",      value: stats?.users ?? 0,      sub: `${stats?.sellers ?? 0} sellers · ${stats?.buyers ?? 0} buyers`, up: true,  Icon: Users,     bg: "bg-blue-50 dark:bg-blue-900/20",    ic: "text-blue-600 dark:text-blue-400" },
                  { label: "Markets",          value: stats?.markets ?? 0,    sub: "Across Ghana",                up: true,  Icon: Building2, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Pending Reviews",  value: stats?.pendingSubmissions ?? 0, sub: `${flaggedCount} flagged`,  up: false, Icon: Clock,     bg: "bg-amber-50 dark:bg-amber-900/20",   ic: "text-amber-600 dark:text-amber-400" },
                  { label: "Total Products",   value: stats?.products ?? 0,   sub: "Listed items",                up: true,  Icon: Package,   bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600 dark:text-violet-400" },
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
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Orders</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Orders placed this week</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyBars.reduce((a, b) => a + b, 0)}</p>
                      <p className="text-xs text-gray-400">this week</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-end gap-2 h-32">
                    {weeklyBars.map((val, i) => {
                      const maxBar = Math.max(...weeklyBars, 1);
                      const pct = Math.round((val / maxBar) * 100);
                      return (
                        <div key={weekDays[i]} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-gray-400">{val}</span>
                          {/* eslint-disable-next-line react/forbid-dom-props */}
                          <div className="w-full rounded-md bg-violet-500 hover:bg-violet-400 transition-colors" style={{ height: `${pct}%` }} />
                          <span className="text-[10px] text-gray-400">{weekDays[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Markets</h2>
                  <div className="space-y-3">
                    {markets.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.sellers} sellers · {m.city}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{m.products} products</span>
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
                        <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Name","Role","Location","Status","Products","Joined","Actions"].map(h => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {pagedUsers.map(u => {
                            const status = (u.status ?? "").toLowerCase();
                            const role = (u.role ?? "").toLowerCase();
                            const busy = actionIds.has(u.id);
                            return (
                              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                <td className="px-5 py-3.5"><p className="font-medium text-gray-900 dark:text-white">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                                <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${role === "seller" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{role}</span></td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.location ?? "—"}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                    {status === "active" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.products ?? 0}</td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.joined ?? "—"}</td>
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  {busy ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : (
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => setSuspendUserTarget(u)} className={`p-1.5 rounded-lg transition-colors ${status === "suspended" ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600" : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600"}`} title={status === "suspended" ? "Reinstate" : "Suspend"}>
                                        {status === "suspended" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                      </button>
                                      <button onClick={() => setDeleteUserTarget(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {pagedUsers.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No users found.</td></tr>}
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
                        <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Product","Seller","Market","Price","Change","Status","Submitted","Actions"].map(h => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {pagedSubs.map(s => {
                            const status = s.status;
                            const up = s.up ?? true;
                            const busy = actionIds.has(s.id);
                            return (
                              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{s.productName}</td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{s.seller}</td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{s.market ?? "—"}</td>
                                <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{s.price}</td>
                                <td className="px-5 py-3.5">
                                  {s.change ? (
                                    <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
                                      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{s.change}
                                    </span>
                                  ) : <span className="text-gray-400">—</span>}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : status === "Flagged" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : status === "Rejected" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                    {status === "Approved" ? <CheckCircle className="h-3 w-3" /> : status === "Flagged" ? <Flag className="h-3 w-3" /> : status === "Rejected" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{s.submitted ?? "—"}</td>
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  {busy ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : (
                                    (status === "Pending" || status === "Flagged") ? (
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => setApproveId(s.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                                        <button onClick={() => setRejectId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors" title="Reject"><XCircle className="h-4 w-4" /></button>
                                      </div>
                                    ) : <span className="text-xs text-gray-400">{status}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {pagedSubs.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No submissions found.</td></tr>}
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
                        <thead><tr className="bg-gray-50 dark:bg-gray-800/50">{["Market Name","City","Sellers","Products","Status",""].map(h => <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {pagedMarkets.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{m.name}</td>
                              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.city}</td>
                              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.sellers}</td>
                              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{m.products}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${m.open !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                  <CheckCircle className="h-3 w-3" />{m.open !== false ? "Active" : "Closed"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <Link href="/markets" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">View<ChevronRight className="h-3 w-3" /></Link>
                              </td>
                            </tr>
                          ))}
                          {pagedMarkets.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No markets found.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                      <PageBar page={marketsPage} total={markets.length} pageSize={marketsPageSize} setPage={setMarketsPage} setPageSize={(s) => { setMarketsPageSize(s); setMarketsPage(1); }} label="markets" />
                      <button onClick={() => setCreateMarketOpen(true)} className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                        + Add Market
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
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
              <FormField label="City" required><select aria-label="City" className={selectCls} value={marketForm.city} onChange={mf("city")}><option value="">Select city</option>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
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
              <FormField label="Region"><select aria-label="Region" className={selectCls}><option value="">Select region</option>{["Greater Accra","Ashanti","Western","Northern","Volta","Central","Eastern"].map(r => <option key={r} value={r}>{r}</option>)}</select></FormField>
            </div>
          )},
        ]}
      />

      <ConfirmDialog open={suspendUserTarget !== null} title={(suspendUserTarget?.status ?? "").toUpperCase() === "SUSPENDED" ? "Reinstate Account" : "Suspend Account"} description={(suspendUserTarget?.status ?? "").toUpperCase() === "SUSPENDED" ? `Reinstate ${suspendUserTarget?.name}'s access to MarketWise.` : `Suspend ${suspendUserTarget?.name}'s account. They will lose platform access until reinstated.`} confirmLabel={(suspendUserTarget?.status ?? "").toUpperCase() === "SUSPENDED" ? "Reinstate" : "Suspend"} variant="warning" onConfirm={handleSuspendUser} onCancel={() => setSuspendUserTarget(null)} />
      <ConfirmDialog open={deleteUserTarget !== null} title="Delete Account" description={`Permanently deleting ${deleteUserTarget?.name}'s account cannot be undone.`} confirmLabel="Delete Account" requireTyping="delete" variant="danger" onConfirm={handleDeleteUser} onCancel={() => setDeleteUserTarget(null)} />
      <ConfirmDialog open={approveId !== null} title="Approve Price Submission" description="This price record will be published and visible to all buyers." confirmLabel="Approve" variant="default" onConfirm={handleApprove} onCancel={() => setApproveId(null)} />
      <ConfirmDialog open={rejectId !== null} title="Reject Price Submission" description="This submission will be rejected and the seller will be notified." confirmLabel="Reject" variant="warning" onConfirm={handleReject} onCancel={() => setRejectId(null)} />
    </div>
  );
}
