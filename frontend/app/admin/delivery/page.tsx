"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Bell, Search, Package, MapPin, LogOut,
  LayoutDashboard, User, Menu, Tag, Users, Shield,
  CheckCircle, XCircle, Flag, Clock, ArrowUp, ArrowDown,
  AlertTriangle, X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageBar } from "@/components/ui/page-bar";

type IconComp = React.FC<{ className?: string }>;

const ADMIN_NAV = [
  { href: "/admin", icon: LayoutDashboard as IconComp, label: "Overview" },
  { href: "/admin/user", icon: Users as IconComp, label: "Users" },
  { href: "/admin/delivery", icon: Tag as IconComp, label: "Price Submissions", active: true },
  { href: "/inventory", icon: Package as IconComp, label: "Products" },
  { href: "/recipes", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Settings" },
];

type Status = "Pending" | "Approved" | "Rejected" | "Flagged";

interface Submission {
  id: number;
  product: string;
  category: string;
  seller: string;
  sellerEmail: string;
  market: string;
  city: string;
  price: number;
  prevPrice: number;
  change: string;
  up: boolean;
  status: Status;
  submitted: string;
  note?: string;
}

const INITIAL_SUBMISSIONS: Submission[] = [
  { id: 1, product: "Rice (50kg bag)", category: "Grains", seller: "Kofi Mensah", sellerEmail: "kofi@example.com", market: "Accra Central Market", city: "Accra", price: 290, prevPrice: 270, change: "+7.4%", up: true, status: "Pending", submitted: "2 hours ago" },
  { id: 2, product: "Cooking Oil (2L)", category: "Cooking Essentials", seller: "Yaw Darko", sellerEmail: "yaw@example.com", market: "Takoradi Market", city: "Takoradi", price: 34, prevPrice: 38, change: "-10.5%", up: false, status: "Flagged", submitted: "4 hours ago", note: "Unusually large price drop — verify." },
  { id: 3, product: "Tomatoes (1kg)", category: "Vegetables", seller: "Kweku Boateng", sellerEmail: "kweku@example.com", market: "Kumasi Central Market", city: "Kumasi", price: 9, prevPrice: 12, change: "-25.0%", up: false, status: "Pending", submitted: "6 hours ago" },
  { id: 4, product: "Chicken (1kg)", category: "Proteins", seller: "Kofi Mensah", sellerEmail: "kofi@example.com", market: "Accra Central Market", city: "Accra", price: 32, prevPrice: 30, change: "+6.7%", up: true, status: "Approved", submitted: "1 day ago" },
  { id: 5, product: "Eggs (crate×30)", category: "Proteins", seller: "Yaw Darko", sellerEmail: "yaw@example.com", market: "Takoradi Market", city: "Takoradi", price: 58, prevPrice: 55, change: "+5.4%", up: true, status: "Approved", submitted: "1 day ago" },
  { id: 6, product: "Onions (1kg)", category: "Vegetables", seller: "Abena Asante", sellerEmail: "abena@example.com", market: "Madina Market", city: "Accra", price: 11, prevPrice: 8, change: "+37.5%", up: true, status: "Flagged", submitted: "2 days ago", note: "Price spike over 30% — requires review." },
  { id: 7, product: "Yam (medium)", category: "Vegetables", seller: "Kofi Mensah", sellerEmail: "kofi@example.com", market: "Kumasi Central Market", city: "Kumasi", price: 18, prevPrice: 19, change: "-5.3%", up: false, status: "Rejected", submitted: "2 days ago" },
  { id: 8, product: "Plantain (bunch)", category: "Fruits", seller: "Efua Nyarko", sellerEmail: "efua@example.com", market: "Kaneshie Market", city: "Accra", price: 22, prevPrice: 20, change: "+10.0%", up: true, status: "Pending", submitted: "3 days ago" },
  // Electronics
  { id: 9, product: "iPhone 16 Pro Max (256GB)", category: "Smartphones", seller: "Kofi Mensah", sellerEmail: "kofi@example.com", market: "Accra Central Market", city: "Accra", price: 8500, prevPrice: 8200, change: "+3.7%", up: true, status: "Pending", submitted: "1 hour ago" },
  { id: 10, product: "Samsung Galaxy S24 Ultra", category: "Smartphones", seller: "Nana Amoah", sellerEmail: "nana@example.com", market: "Kumasi Central Market", city: "Kumasi", price: 7200, prevPrice: 7500, change: "-4.0%", up: false, status: "Approved", submitted: "3 hours ago" },
  { id: 11, product: "MacBook Air M3 (13\")", category: "Laptops", seller: "Yaw Darko", sellerEmail: "yaw@example.com", market: "Accra Central Market", city: "Accra", price: 13500, prevPrice: 12800, change: "+5.5%", up: true, status: "Flagged", submitted: "5 hours ago", note: "Large price increase on high-value item — verify stock." },
  { id: 12, product: "HP Pavilion 15 (Core i7)", category: "Laptops", seller: "Kweku Boateng", sellerEmail: "kweku@example.com", market: "Kaneshie Market", city: "Accra", price: 6800, prevPrice: 7200, change: "-5.6%", up: false, status: "Pending", submitted: "8 hours ago" },
  { id: 13, product: "Lenovo IdeaPad 3 (Core i5)", category: "Laptops", seller: "Efua Nyarko", sellerEmail: "efua@example.com", market: "Kumasi Central Market", city: "Kumasi", price: 5400, prevPrice: 5200, change: "+3.8%", up: true, status: "Approved", submitted: "1 day ago" },
  { id: 14, product: "Dell OptiPlex 7010 (i5)", category: "Desktops", seller: "Kofi Mensah", sellerEmail: "kofi@example.com", market: "Accra Central Market", city: "Accra", price: 4200, prevPrice: 4000, change: "+5.0%", up: true, status: "Approved", submitted: "1 day ago" },
  { id: 15, product: "HP ProDesk 400 (Ryzen 5)", category: "Desktops", seller: "Abena Asante", sellerEmail: "abena@example.com", market: "Kaneshie Market", city: "Accra", price: 3900, prevPrice: 4000, change: "-2.5%", up: false, status: "Pending", submitted: "2 days ago" },
  { id: 16, product: "Samsung Galaxy A55 5G", category: "Smartphones", seller: "Nana Amoah", sellerEmail: "nana@example.com", market: "Madina Market", city: "Accra", price: 3200, prevPrice: 3100, change: "+3.2%", up: true, status: "Pending", submitted: "2 days ago" },
];

const STATUS_CFG: Record<Status, { bg: string; text: string; Icon: IconComp }> = {
  Pending:  { bg: "bg-amber-100 dark:bg-amber-900/30",    text: "text-amber-700 dark:text-amber-400",    Icon: Clock as IconComp },
  Approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", Icon: CheckCircle as IconComp },
  Rejected: { bg: "bg-gray-100 dark:bg-gray-800",          text: "text-gray-600 dark:text-gray-400",       Icon: XCircle as IconComp },
  Flagged:  { bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-700 dark:text-red-400",         Icon: Flag as IconComp },
};

export default function PriceSubmissionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [viewSub, setViewSub] = useState<Submission | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(15);

  const filtered = submissions.filter(s =>
    (statusFilter === "All" || s.status === statusFilter) &&
    (s.product.toLowerCase().includes(search.toLowerCase()) ||
     s.seller.toLowerCase().includes(search.toLowerCase()) ||
     s.market.toLowerCase().includes(search.toLowerCase()))
  );
  const subPaged = filtered.slice((subPage - 1) * subPageSize, subPage * subPageSize);

  const counts = {
    All:      submissions.length,
    Pending:  submissions.filter(s => s.status === "Pending").length,
    Flagged:  submissions.filter(s => s.status === "Flagged").length,
    Approved: submissions.filter(s => s.status === "Approved").length,
    Rejected: submissions.filter(s => s.status === "Rejected").length,
  };

  function approve(id: number) {
    setSubmissions(p => p.map(s => s.id === id ? { ...s, status: "Approved" } : s));
    setApproveId(null);
    setViewSub(p => (p?.id === id ? { ...p, status: "Approved" } : p));
  }
  function reject(id: number) {
    setSubmissions(p => p.map(s => s.id === id ? { ...s, status: "Rejected" } : s));
    setRejectId(null);
    setViewSub(p => (p?.id === id ? { ...p, status: "Rejected" } : p));
  }
  function flagToggle(id: number) {
    setSubmissions(p => p.map(s =>
      s.id === id ? { ...s, status: s.status === "Flagged" ? "Pending" : "Flagged" } : s
    ));
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
              { label: "Total", value: counts.All,      bg: "bg-violet-50 dark:bg-violet-900/20",  ic: "text-violet-600 dark:text-violet-400",  Icon: Tag },
              { label: "Pending", value: counts.Pending,  bg: "bg-amber-50 dark:bg-amber-900/20",    ic: "text-amber-600 dark:text-amber-400",    Icon: Clock },
              { label: "Flagged", value: counts.Flagged,  bg: "bg-red-50 dark:bg-red-900/20",        ic: "text-red-600 dark:text-red-400",        Icon: Flag },
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
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              {(["All", "Pending", "Flagged", "Approved", "Rejected"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {["Product","Seller","Market","Price","Change","Status","Submitted","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {subPaged.map(s => {
                    const cfg = STATUS_CFG[s.status];
                    return (
                      <tr key={s.id} onClick={() => setViewSub(s)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-medium text-gray-900 dark:text-white">{s.product}</p>
                          <p className="text-xs text-gray-400">{s.category}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-gray-700 dark:text-gray-300 font-medium">{s.seller}</p>
                          <p className="text-xs text-gray-400">{s.sellerEmail}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{s.market}</p>
                          <p className="text-xs text-gray-400">{s.city}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-gray-900 dark:text-white">GH₵{s.price}</p>
                          <p className="text-xs text-gray-400">was GH₵{s.prevPrice}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                            {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{s.change}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <cfg.Icon className="h-3 w-3" />{s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{s.submitted}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {(s.status === "Pending" || s.status === "Flagged") && (
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
                            {s.status === "Pending" && (
                              <button onClick={() => flagToggle(s.id)} title="Flag for review"
                                className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 transition-colors">
                                <Flag className="h-4 w-4" />
                              </button>
                            )}
                            {s.status === "Flagged" && (
                              <button onClick={() => flagToggle(s.id)} title="Remove flag"
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-500 hover:text-gray-500 transition-colors">
                                <Flag className="h-4 w-4 fill-amber-400" />
                              </button>
                            )}
                            {(s.status === "Approved" || s.status === "Rejected") && (
                              <span className="text-xs text-gray-400 px-1">{s.status}</span>
                            )}
                          </div>
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
            <PageBar page={subPage} total={filtered.length} pageSize={subPageSize} setPage={setSubPage} setPageSize={(s) => { setSubPageSize(s); setSubPage(1); }} label="submissions" />
          </div>
        </main>
      </div>

      {/* Approve confirm */}
      <ConfirmDialog
        open={approveId !== null}
        title="Approve Price Submission"
        description="This price will be published on MarketWise and visible to all buyers. Confirm it is accurate."
        confirmLabel="Approve & Publish"
        variant="default"
        onConfirm={() => approveId !== null && approve(approveId)}
        onCancel={() => setApproveId(null)}
      />

      {/* Reject confirm */}
      <ConfirmDialog
        open={rejectId !== null}
        title="Reject Price Submission"
        description="This submission will be rejected and will not appear on MarketWise."
        confirmLabel="Reject Submission"
        variant="warning"
        onConfirm={() => rejectId !== null && reject(rejectId)}
        onCancel={() => setRejectId(null)}
      />

      {/* Detail modal */}
      {viewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewSub(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 bg-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Market<span className="text-emerald-400">Wise</span></span>
              <span className="ml-auto text-xs text-gray-400">Submission Detail</span>
              <button aria-label="Close" onClick={() => setViewSub(null)} className="p-1 rounded text-gray-400 hover:text-white ml-2"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{viewSub.category}</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{viewSub.product}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{viewSub.market} · {viewSub.city}</p>
                </div>
                {(() => { const cfg = STATUS_CFG[viewSub.status]; return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    <cfg.Icon className="h-3 w-3" />{viewSub.status}
                  </span>
                ); })()}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Previous</p>
                  <p className="text-lg font-bold text-gray-600 dark:text-gray-300">GH₵{viewSub.prevPrice}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">New Price</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">GH₵{viewSub.price}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${viewSub.up ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
                  <p className="text-xs text-gray-400 mb-1">Change</p>
                  <p className={`text-base font-bold flex items-center justify-center gap-0.5 ${viewSub.up ? "text-emerald-600" : "text-red-500"}`}>
                    {viewSub.up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}{viewSub.change}
                  </p>
                </div>
              </div>
              {[["Seller", viewSub.seller], ["Email", viewSub.sellerEmail], ["Submitted", viewSub.submitted]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{v}</span>
                </div>
              ))}
              {viewSub.note && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">{viewSub.note}</p>
                </div>
              )}
              {(viewSub.status === "Pending" || viewSub.status === "Flagged") && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setApproveId(viewSub.id)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => setRejectId(viewSub.id)}
                    className="flex-1 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

