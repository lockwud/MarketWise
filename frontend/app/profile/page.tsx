"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import { getMe, updateMe } from "@/lib/api/auth";
import {
  TrendingUp, Bell, Search, Package, MapPin, ShoppingCart, LogOut,
  LayoutDashboard, User, Menu, BarChart3, Heart, Users, Tag,
  Camera, Mail, Phone, Home, ShieldCheck, Lock, Save,
  CheckCircle, AlertCircle,
} from "lucide-react";

type IconComp = React.FC<{ className?: string }>;

const SELLER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory", icon: Package as IconComp, label: "My Products" },
  { href: "/orders", icon: ShoppingCart as IconComp, label: "Orders" },
  { href: "/shopping-list", icon: BarChart3 as IconComp, label: "Price Tracking" },
  { href: "/markets", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Profile", active: true },
];
const BUYER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard as IconComp, label: "Dashboard" },
  { href: "/inventory", icon: Package as IconComp, label: "Browse Products" },
  { href: "/shopping-list", icon: ShoppingCart as IconComp, label: "Shopping List" },
  { href: "/orders", icon: Heart as IconComp, label: "Saved Items" },
  { href: "/profile", icon: User as IconComp, label: "Profile", active: true },
];
const ADMIN_NAV = [
  { href: "/admin", icon: LayoutDashboard as IconComp, label: "Overview" },
  { href: "/admin/user", icon: Users as IconComp, label: "Users" },
  { href: "/admin/delivery", icon: Tag as IconComp, label: "Price Submissions" },
  { href: "/inventory", icon: Package as IconComp, label: "Products" },
  { href: "/markets", icon: MapPin as IconComp, label: "Markets" },
  { href: "/profile", icon: User as IconComp, label: "Settings", active: true },
];

const ACTIVITY_SELLER = [
  { text: "Updated price for Rice (50kg bag)", time: "2 hours ago", type: "edit" },
  { text: "New order #ORD-1042 received", time: "5 hours ago", type: "order" },
  { text: "Added 3 new products to My Products", time: "Yesterday", type: "add" },
  { text: "Price alert triggered for Tomatoes", time: "2 days ago", type: "alert" },
];
const ACTIVITY_BUYER = [
  { text: "Added Cooking Oil to Shopping List", time: "1 hour ago", type: "add" },
  { text: "Saved 2 new products from Browse", time: "3 hours ago", type: "save" },
  { text: "Viewed Accra Central Market", time: "Yesterday", type: "view" },
  { text: "Checked off items in Shopping List", time: "2 days ago", type: "check" },
];
const ACTIVITY_ADMIN = [
  { text: "Approved price submission from Kwame Mensah", time: "1 hour ago", type: "approve" },
  { text: "Suspended user account: John Doe", time: "3 hours ago", type: "suspend" },
  { text: "Added new market: Takoradi Market", time: "Yesterday", type: "add" },
  { text: "Rejected 2 price submissions (flagged)", time: "2 days ago", type: "reject" },
];

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(getUserRole() || "buyer"); }, []);
  if (!role) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" /></div>;
  return <ProfileView role={role} />;
}

function ProfileView({ role }: { role: string }) {
  const nav = role === "admin" ? ADMIN_NAV : role === "buyer" ? BUYER_NAV : SELLER_NAV;
  const activity = role === "admin" ? ACTIVITY_ADMIN : role === "buyer" ? ACTIVITY_BUYER : ACTIVITY_SELLER;
  const accent = role === "admin" ? "violet" : "emerald";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    notifications: { orders: true, priceAlerts: role !== "buyer", comments: false, marketUpdates: true },
  });

  useEffect(() => {
    getMe().then(user => {
      setForm(f => ({ ...f, name: user.name || "", email: user.email || "", phone: (user as any).phone || "", location: user.location || "" }));
    }).catch(() => {});
  }, []);

  const accentActiveStyle = accent === "violet" ? "bg-violet-600 text-white" : "bg-emerald-600 text-white";
  const accentIconBg = accent === "violet" ? "bg-violet-600" : "bg-emerald-600";
  const accentText = accent === "violet" ? "text-violet-400" : "text-emerald-400";
  const accentBtn = accent === "violet"
    ? "bg-violet-600 hover:bg-violet-700 text-white"
    : "bg-emerald-600 hover:bg-emerald-700 text-white";
  const accentRing = accent === "violet" ? "focus:ring-violet-500" : "focus:ring-emerald-500";

  async function save() {
    setSaveError("");
    try {
      await updateMe({ name: form.name, phone: form.phone, location: form.location });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 z-20`}>
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className={`h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg ${accentIconBg}`}><TrendingUp className="h-4 w-4 text-white" /></div>
          {sidebarOpen && <span className="text-base font-bold tracking-tight">Market<span className={accentText}>Wise</span></span>}
          <button aria-label="Toggle sidebar" className="ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-4 w-4" /></button>
        </div>
        {sidebarOpen && <div className="px-3 pt-4 pb-1"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{role === "admin" ? "Admin Panel" : role === "buyer" ? "Buyer Panel" : "Seller Panel"}</span></div>}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {nav.map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? accentActiveStyle : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
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
            <input placeholder="Search…" readOnly className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none dark:text-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {saved && <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><CheckCircle className="h-4 w-4" />Saved</span>}
            <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Bell className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{role === "admin" ? "Account Settings" : "My Profile"}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and preferences</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Avatar card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{form.name.charAt(0)}</span>
                  </div>
                  <button aria-label="Change profile photo" className="absolute bottom-0 right-0 h-6 w-6 bg-gray-900 border-2 border-white rounded-full flex items-center justify-center">
                    <Camera className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{form.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{role}</p>
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Mail className="h-4 w-4 flex-shrink-0" /><span className="truncate">{form.email}</span></div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Phone className="h-4 w-4 flex-shrink-0" /><span>{form.phone}</span></div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Home className="h-4 w-4 flex-shrink-0" /><span>{form.location}</span></div>
                </div>
                <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /><span>Account verified</span>
                  </div>
                </div>
              </div>

              {/* Info form */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", key: "name", icon: User as IconComp },
                      { label: "Email Address", key: "email", icon: Mail as IconComp },
                      { label: "Phone Number", key: "phone", icon: Phone as IconComp },
                      { label: "Location", key: "location", icon: Home as IconComp },
                    ].map(({ label, key, icon: Icon }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            aria-label={label}
                            value={(form as Record<string, unknown>)[key] as string}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 ${accentRing} dark:text-white`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={save} className={`mt-5 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${accentBtn}`}>
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
                  <div className="space-y-3">
                    {(role !== "buyer" ? [
                      { key: "orders", label: "Order notifications", desc: "Get notified when you receive new orders" },
                      { key: "priceAlerts", label: "Price alerts", desc: "Alerts when market prices change significantly" },
                      { key: "marketUpdates", label: "Market updates", desc: "Weekly market insights and trends" },
                    ] : [
                      { key: "orders", label: "Shopping reminders", desc: "Reminders to complete your shopping list" },
                      { key: "marketUpdates", label: "Market updates", desc: "New products and price drops in your area" },
                      { key: "comments", label: "Activity digest", desc: "Weekly summary of your activity" },
                    ]).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                        <button
                          aria-label={label}
                          onClick={() => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: !(f.notifications as Record<string, boolean>)[key] } }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${(form.notifications as Record<string, boolean>)[key] ? (accent === "violet" ? "bg-violet-600" : "bg-emerald-600") : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${(form.notifications as Record<string, boolean>)[key] ? "translate-x-4" : "translate-x-1"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Lock className="h-4 w-4" /> Security</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Change Password</p>
                      <p className="text-xs text-gray-400 mt-0.5">Update your password regularly to keep your account secure</p>
                    </div>
                    <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Update</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === "order" ? "bg-blue-100 dark:bg-blue-900/30" : a.type === "alert" || a.type === "reject" || a.type === "suspend" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
                      {a.type === "alert" || a.type === "suspend" ? <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
