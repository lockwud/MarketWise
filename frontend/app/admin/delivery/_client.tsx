"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package, MapPin, LogOut,
  LayoutDashboard, User, Menu, Tag, Users, Shield,
  CheckCircle, XCircle, Flag, Clock, ArrowUp, ArrowDown,
  AlertTriangle, X, Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";
import {
  fetchAdminSubmissions, approveSubmission, rejectSubmission, flagSubmission,
  type AdminSubmission,
} from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";

type IconComp = React.FC<{ className?: string }>;
type Status = "Pending" | "Approved" | "Rejected" | "Flagged";

const ADMIN_NAV = [
  { href: "/admin", icon: LayoutDashboard as IconComp, label: "Overview" },
  { href: "/admin/user", icon: Users as IconComp, label: "Users" },
  { href: "/admin/delivery", icon: Tag as IconComp, label: "Price Submissions", active: true },
  { href: "/inventory", icon: Package as IconComp, label: "Products" },
  { href: "/markets", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Settings" },
];

const STATUS_CFG: Record<Status, { bg: string; text: string; Icon: IconComp }> = {
  Pending:  { bg: "bg-amber-100 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-400",    Icon: Clock as IconComp },
  Approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", Icon: CheckCircle as IconComp },
  Rejected: { bg: "bg-gray-100 dark:bg-gray-800",          text: "text-gray-600 dark:text-gray-400",       Icon: XCircle as IconComp },
  Flagged:  { bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-700 dark:text-red-400",         Icon: Flag as IconComp },
};

export default function AdminDeliveryClient() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionIds, setActionIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [viewSub, setViewSub] = useState<AdminSubmission | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(15);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: { status?: string; page?: number } = { page: subPage };
      if (statusFilter !== "All") params.status = statusFilter;
      const data = await fetchAdminSubmissions(params);
      setSubmissions(data.submissions);
      setTotal(data.total);
    } catch {
      toast({ title: "Failed to load submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [subPage, statusFilter, toast]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const filtered = submissions.filter(s =>
    s.productName.toLowerCase().includes(search.toLowerCase()) ||
    (s.seller ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.market ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const subPaged = filtered.slice((subPage - 1) * subPageSize, subPage * subPageSize);

  const counts = {
    All: total,
    Pending:  submissions.filter(s => s.status === "Pending").length,
    Flagged:  submissions.filter(s => s.status === "Flagged").length,
    Approved: submissions.filter(s => s.status === "Approved").length,
    Rejected: submissions.filter(s => s.status === "Rejected").length,
  };

  function setBusy(id: string, busy: boolean) {
    setActionIds(prev => { const s = new Set(prev); busy ? s.add(id) : s.delete(id); return s; });
  }

  async function doApprove(id: string) {
    setApproveId(null);
    setBusy(id, true);
    try {
      const updated = await approveSubmission(id);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s));
      setViewSub(v => v?.id === id ? { ...v, status: updated.status } : v);
      toast({ title: "Submission approved and price published" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Approve failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  async function doReject(id: string) {
    setRejectId(null);
    setBusy(id, true);
    try {
      const updated = await rejectSubmission(id);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s));
      setViewSub(v => v?.id === id ? { ...v, status: updated.status } : v);
      toast({ title: "Submission rejected" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Reject failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  async function doFlag(id: string) {
    setBusy(id, true);
    try {
      const updated = await flagSubmission(id);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s));
      setViewSub(v => v?.id === id ? { ...v, status: updated.status } : v);
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Flag action failed", variant: "destructive" });
    } finally {
      setBusy(id, false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-base font-bold">Market<span className="text-emerald-400">Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Admin Panel</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {ADMIN_NAV.map(({ href, icon: Icon, label, active }) => (
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, seller, market…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="h-5 w-5" />
              {(counts.Pending + counts.Flagged) > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Price Submissions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review, approve and flag price updates submitted by sellers</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { label: "Total",    value: counts.All,      bg: "bg-violet-50 dark:bg-violet-900/20",   ic: "text-violet-600 dark:text-violet-400",   Icon: Tag },
              { label: "Pending",  value: counts.Pending,  bg: "bg-amber-50 dark:bg-amber-900/20",     ic: "text-amber-600 dark:text-amber-400",     Icon: Clock },
              { label: "Flagged",  value: counts.Flagged,  bg: "bg-red-50 dark:bg-red-900/20",         ic: "text-red-600 dark:text-red-400",         Icon: Flag },
              { label: "Approved", value: counts.Approved, bg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600 dark:text-emerald-400", Icon: CheckCircle },
            ] as const).map(({ label, value, bg, ic, Icon }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className={`p-2 rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${ic}`} /></span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              {(["All", "Pending", "Flagged", "Approved", "Rejected"] as const).map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setSubPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>
                  {s}{s !== "All" && counts[s] > 0 && <span className="ml-1 opacity-70">{counts[s]}</span>}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading submissions…</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Product", "Seller", "Market", "Price", "Change", "Status", "Submitted", "Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {subPaged.map(s => {
                      const status = s.status as Status;
                      const cfg = STATUS_CFG[status] ?? STATUS_CFG.Pending;
                      const busy = actionIds.has(s.id);
                      const up = s.up ?? true;
                      return (
                        <tr key={s.id} onClick={() => setViewSub(s)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="font-medium text-gray-900 dark:text-white">{s.productName}</p>
                            <p className="text-xs text-gray-400">{s.category ?? "—"}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{s.seller}</p>
                            <p className="text-xs text-gray-400">{s.sellerEmail ?? ""}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{s.market ?? "—"}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="font-semibold text-gray-900 dark:text-white">GH₵{s.price}</p>
                            {s.prevPrice != null && <p className="text-xs text-gray-400">was GH₵{s.prevPrice}</p>}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {s.change ? (
                              <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
                                {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{s.change}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                              <cfg.Icon className="h-3 w-3" />{status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{s.submitted ?? "—"}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                              <div className="flex items-center gap-1">
                                {(status === "Pending" || status === "Flagged") && (
                                  <>
                                    <button onClick={() => setApproveId(s.id)} title="Approve"
                                      className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors">
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setRejectId(s.id)} title="Reject"
                                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {status === "Pending" && (
                                  <button onClick={() => doFlag(s.id)} title="Flag for review"
                                    className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 transition-colors">
                                    <Flag className="h-4 w-4" />
                                  </button>
                                )}
                                {status === "Flagged" && (
                                  <button onClick={() => doFlag(s.id)} title="Remove flag"
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-500 hover:text-gray-500 transition-colors">
                                    <Flag className="h-4 w-4 fill-amber-400" />
                                  </button>
                                )}
                                {(status === "Approved" || status === "Rejected") && (
                                  <span className="text-xs text-gray-400 px-1">{status}</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {subPaged.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No submissions match the selected filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <PageBar page={subPage} total={filtered.length} pageSize={subPageSize} setPage={setSubPage} setPageSize={(s) => { setSubPageSize(s); setSubPage(1); }} label="submissions" />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={approveId !== null}
        title="Approve Price Submission"
        description="This price will be published on MarketWise and visible to all buyers. Confirm it is accurate."
        confirmLabel="Approve & Publish"
        variant="default"
        onConfirm={() => approveId !== null && doApprove(approveId)}
        onCancel={() => setApproveId(null)}
      />

      <ConfirmDialog
        open={rejectId !== null}
        title="Reject Price Submission"
        description="This submission will be rejected and will not appear on MarketWise."
        confirmLabel="Reject Submission"
        variant="warning"
        onConfirm={() => rejectId !== null && doReject(rejectId)}
        onCancel={() => setRejectId(null)}
      />

      {viewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewSub(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Market<span className="text-emerald-400">Wise</span></span>
              <span className="ml-auto text-xs text-gray-400">Submission Detail</span>
              <button aria-label="Close" onClick={() => setViewSub(null)} className="p-1 rounded text-gray-400 hover:text-white ml-2"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const status = viewSub.status as Status;
                const cfg = STATUS_CFG[status] ?? STATUS_CFG.Pending;
                const up = viewSub.up ?? true;
                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{viewSub.category ?? "Product"}</p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{viewSub.productName}</h3>
                        {viewSub.market && <p className="text-xs text-gray-500 mt-0.5">{viewSub.market}</p>}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <cfg.Icon className="h-3 w-3" />{status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Previous</p>
                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300">GH₵{viewSub.prevPrice ?? "—"}</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">New Price</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">GH₵{viewSub.price}</p>
                      </div>
                      <div className={`rounded-lg p-3 text-center ${up ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
                        <p className="text-xs text-gray-400 mb-1">Change</p>
                        <p className={`text-base font-bold flex items-center justify-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                          {up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}{viewSub.change ?? "—"}
                        </p>
                      </div>
                    </div>
                    {[["Seller", viewSub.seller], ["Email", viewSub.sellerEmail ?? "—"], ["Submitted", viewSub.submitted ?? "—"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                    {(status === "Pending" || status === "Flagged") && (
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setApproveId(viewSub.id)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button onClick={() => setRejectId(viewSub.id)}
                          className="flex-1 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    )}
                    {status === "Flagged" && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">This submission has been flagged for review.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
