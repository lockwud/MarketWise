"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package, MapPin, LogOut,
  LayoutDashboard, User, Menu, Tag, Users,
  ChevronDown, Shield, ShieldOff, Trash2, UserPlus, Loader2, CheckCircle, Clock,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";
import { fetchAdminUsers, suspendUser, deleteUser, verifyUser, createSellerAccount, type AdminUser } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";

type IconComp = React.FC<{ className?: string }>;

const ADMIN_NAV = [
  { href: "/admin", icon: LayoutDashboard as IconComp, label: "Overview" },
  { href: "/admin/user", icon: Users as IconComp, label: "Users", active: true },
  { href: "/admin/delivery", icon: Tag as IconComp, label: "Price Submissions" },
  { href: "/inventory", icon: Package as IconComp, label: "Products" },
  { href: "/markets", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Settings" },
];

export default function AdminUserClient() {
  return <UserManagement />;
}

function UserManagement() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "seller" | "buyer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "pending">("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionIds, setActionIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "reinstate" | "delete" | "verify"; user: AdminUser } | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(15);
  const [createSellerOpen, setCreateSellerOpen] = useState(false);
  const [sellerForm, setSellerForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [creatingSellerBusy, setCreatingSellerBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: userPage, limit: userPageSize };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await fetchAdminUsers(params as Parameters<typeof fetchAdminUsers>[0]);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userPage, userPageSize, search, roleFilter, statusFilter, toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function executeAction() {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    setConfirmAction(null);
    setActionIds(prev => new Set(prev).add(user.id));

    try {
      if (type === "delete") {
        await deleteUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setTotal(prev => prev - 1);
        toast({ title: `${user.name} deleted` });
      } else if (type === "verify") {
        const updated = await verifyUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: updated.status } : u));
        toast({ title: `${user.name} verified and activated` });
      } else {
        await suspendUser(user.id, type === "suspend");
        setUsers(prev => prev.map(u =>
          u.id === user.id ? { ...u, status: type === "suspend" ? "SUSPENDED" : "ACTIVE" } : u
        ));
        toast({ title: `${user.name} ${type === "suspend" ? "suspended" : "reinstated"}` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setActionIds(prev => { const s = new Set(prev); s.delete(user.id); return s; });
    }
  }

  async function handleCreateSeller(e: React.FormEvent) {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.email || !sellerForm.password) return;
    setCreatingSellerBusy(true);
    try {
      const newUser = await createSellerAccount(sellerForm);
      setUsers(prev => [newUser, ...prev]);
      setTotal(prev => prev + 1);
      setCreateSellerOpen(false);
      setSellerForm({ name: "", email: "", password: "", phone: "", location: "" });
      toast({ title: `Seller account created for ${newUser.name}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create seller";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setCreatingSellerBusy(false);
    }
  }

  const stats = {
    total,
    sellers: users.filter(u => u.role === "seller").length,
    buyers: users.filter(u => u.role === "buyer").length,
    pending: users.filter(u => (u.status ?? "").toLowerCase() === "pending").length,
    suspended: users.filter(u => (u.status ?? "").toLowerCase() === "suspended").length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-violet-600"><TrendingUp className="h-4 w-4 text-white" /></div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className="text-violet-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-4 w-4" /></button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Admin Panel</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {ADMIN_NAV.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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
            <input value={search} onChange={e => { setSearch(e.target.value); setUserPage(1); }} placeholder="Search users by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
          </div>
          <div className="ml-auto"><button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all registered users · {total} total</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Users", value: stats.total, Icon: Users as IconComp, bg: "bg-violet-50 dark:bg-violet-900/20", ic: "text-violet-600" },
              { label: "Sellers", value: stats.sellers, Icon: Shield as IconComp, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600" },
              { label: "Buyers", value: stats.buyers, Icon: User as IconComp, bg: "bg-blue-50 dark:bg-blue-900/20", ic: "text-blue-600" },
              { label: "Pending Sellers", value: stats.pending, Icon: Clock as IconComp, bg: "bg-amber-50 dark:bg-amber-900/20", ic: "text-amber-600" },
              { label: "Suspended", value: stats.suspended, Icon: ShieldOff as IconComp, bg: "bg-red-50 dark:bg-red-900/20", ic: "text-red-600" },
            ].map(({ label, value, Icon, bg, ic }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                <span className={`p-3 rounded-xl ${bg} flex-shrink-0`}><Icon className={`h-5 w-5 ${ic}`} /></span>
                <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Users</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <select aria-label="Filter by role" value={roleFilter} onChange={e => { setRoleFilter(e.target.value as typeof roleFilter); setUserPage(1); }} className="pl-3 pr-7 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none appearance-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-violet-500">
                    <option value="all">All Roles</option>
                    <option value="seller">Sellers</option>
                    <option value="buyer">Buyers</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select aria-label="Filter by status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setUserPage(1); }} className="pl-3 pr-7 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none appearance-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-violet-500">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
                <button onClick={() => setCreateSellerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                  <UserPlus className="h-3.5 w-3.5" /> Create Seller
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading users…</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Name", "Email", "Role", "Status", "Joined", "Activity", "Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map(user => {
                      const status = (user.status || "").toLowerCase();
                      const role = (user.role || "").toLowerCase();
                      const busy = actionIds.has(user.id);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{user.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${role === "seller" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                              {role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{user.joined ?? "—"}</td>
                          <td className="px-5 py-3.5 text-gray-500">
                            {role === "seller" ? `${user.products ?? 0} products` : `${user.orders ?? 0} orders`}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              ) : status === "pending" ? (
                                <>
                                  <button onClick={() => setConfirmAction({ type: "verify", user })} className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 rounded transition-colors">
                                    <CheckCircle className="h-3.5 w-3.5" /> Verify
                                  </button>
                                  <button aria-label="Reject application" onClick={() => setConfirmAction({ type: "delete", user })} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" /> Reject
                                  </button>
                                </>
                              ) : status === "active" ? (
                                <button onClick={() => setConfirmAction({ type: "suspend", user })} className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 rounded transition-colors">
                                  <ShieldOff className="h-3.5 w-3.5" /> Suspend
                                </button>
                              ) : (
                                <button onClick={() => setConfirmAction({ type: "reinstate", user })} className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 rounded transition-colors">
                                  <Shield className="h-3.5 w-3.5" /> Reinstate
                                </button>
                              )}
                              <button aria-label="Delete user" disabled={busy} onClick={() => setConfirmAction({ type: "delete", user })} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-40">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No users match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <PageBar page={userPage} total={total} pageSize={userPageSize} setPage={setUserPage} setPageSize={(s) => { setUserPageSize(s); setUserPage(1); }} label="users" />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.type === "delete" ? "Delete User" :
          confirmAction?.type === "suspend" ? "Suspend User" :
          confirmAction?.type === "verify" ? "Verify Seller" :
          "Reinstate User"
        }
        description={
          confirmAction?.type === "delete"
            ? `Permanently delete ${confirmAction.user.name}? This action cannot be undone.`
            : confirmAction?.type === "suspend"
            ? `Suspend ${confirmAction?.user.name}? They will not be able to access their account.`
            : confirmAction?.type === "verify"
            ? `Verify and activate ${confirmAction?.user.name}'s seller account?`
            : `Reinstate ${confirmAction?.user.name}? They will regain full access.`
        }
        confirmLabel={
          confirmAction?.type === "delete" ? "Delete" :
          confirmAction?.type === "suspend" ? "Suspend" :
          confirmAction?.type === "verify" ? "Verify" :
          "Reinstate"
        }
        variant={confirmAction?.type === "delete" ? "danger" : confirmAction?.type === "verify" ? "default" : "warning"}
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
      />

      {createSellerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Seller Account</h2>
            <form onSubmit={handleCreateSeller} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name *</label>
                <input required value={sellerForm.name} onChange={e => setSellerForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Seller name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                <input required type="email" value={sellerForm.email} onChange={e => setSellerForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" placeholder="seller@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password *</label>
                <input required type="password" value={sellerForm.password} onChange={e => setSellerForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Temporary password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                <input value={sellerForm.phone} onChange={e => setSellerForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" placeholder="+1 555 0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                <input value={sellerForm.location} onChange={e => setSellerForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" placeholder="City, Country" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateSellerOpen(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creatingSellerBusy}
                  className="flex-1 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {creatingSellerBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {creatingSellerBusy ? "Creating..." : "Create Seller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
