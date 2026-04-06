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

/* ─── static data ─────────────────────────────────────────────── */
const CATEGORIES = ["Grains","Vegetables","Proteins","Cooking Essentials","Fruits","Dairy","Beverages","Smartphones","Laptops","Desktops"];
const UNITS = ["kg","bag","bunch","litre","piece","crate","dozen","unit"];
const MARKETS = ["Accra Central Market","Kumasi Central Market","Madina Market","Takoradi Market","Kaneshie Market"];

const SELLER_PRODUCTS = [
  { id: 1, name: "Rice (5kg)", category: "Grains", price: 45, unit: "bag", stock: 80, market: "Accra Central Market", status: "Active", change: "+7.1%", up: true, description: "Premium long-grain rice, freshly milled.", image: "" },
  { id: 2, name: "Cooking Oil (2L)", category: "Cooking Essentials", price: 38.5, unit: "litre", stock: 35, market: "Kumasi Central Market", status: "Active", change: "-3.8%", up: false, description: "Refined sunflower cooking oil.", image: "" },
  { id: 3, name: "Tomatoes (1kg)", category: "Vegetables", price: 12, unit: "kg", stock: 12, market: "Takoradi Market", status: "Alert", change: "+4.3%", up: true, description: "Fresh locally-grown tomatoes.", image: "" },
  { id: 4, name: "Onions (1kg)", category: "Vegetables", price: 8, unit: "kg", stock: 50, market: "Accra Central Market", status: "Active", change: "0%", up: true, description: "Fresh red onions, bulk available.", image: "" },
  { id: 5, name: "Chicken (1kg)", category: "Proteins", price: 32, unit: "kg", stock: 20, market: "Kumasi Central Market", status: "Active", change: "-8.6%", up: false, description: "Fresh dressed chicken, chilled.", image: "" },
  { id: 6, name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", price: 8500, unit: "unit", stock: 8, market: "Accra Central Market", status: "Active", change: "+3.2%", up: true, description: "Apple iPhone 16 Pro Max, 256GB, Titanium — unlocked.", image: "" },
  { id: 7, name: "Samsung Galaxy S24 Ultra", category: "Smartphones", price: 7200, unit: "unit", stock: 12, market: "Kumasi Central Market", status: "Active", change: "-2.1%", up: false, description: "Samsung Galaxy S24 Ultra, 256GB, Titanium Black.", image: "" },
  { id: 8, name: "Samsung Galaxy A55 5G", category: "Smartphones", price: 3200, unit: "unit", stock: 25, market: "Madina Market", status: "Active", change: "+1.8%", up: true, description: "Samsung Galaxy A55 5G, 128GB, Awesome Navy.", image: "" },
  { id: 9, name: "MacBook Air M3 (13\")", category: "Laptops", price: 13500, unit: "unit", stock: 5, market: "Accra Central Market", status: "Alert", change: "+5.1%", up: true, description: "Apple MacBook Air 13\" M3 chip, 8GB RAM, 256GB SSD.", image: "" },
  { id: 10, name: "HP Pavilion 15 (Core i7)", category: "Laptops", price: 6800, unit: "unit", stock: 10, market: "Kaneshie Market", status: "Active", change: "-4.3%", up: false, description: "HP Pavilion 15.6\", Intel Core i7-13th Gen, 16GB RAM, 512GB SSD.", image: "" },
  { id: 11, name: "Lenovo IdeaPad 3 (Core i5)", category: "Laptops", price: 5400, unit: "unit", stock: 14, market: "Kumasi Central Market", status: "Active", change: "+2.4%", up: true, description: "Lenovo IdeaPad 3, Core i5-12th Gen, 8GB RAM, 256GB SSD.", image: "" },
  { id: 12, name: "Dell OptiPlex 7010 (i5)", category: "Desktops", price: 4200, unit: "unit", stock: 7, market: "Accra Central Market", status: "Active", change: "+2.7%", up: true, description: "Dell OptiPlex 7010 SFF, Core i5-13th Gen, 16GB RAM, 256GB SSD.", image: "" },
  { id: 13, name: "HP ProDesk 400 (Ryzen 5)", category: "Desktops", price: 3900, unit: "unit", stock: 9, market: "Kaneshie Market", status: "Active", change: "-1.5%", up: false, description: "HP ProDesk 400 G9 Mini, AMD Ryzen 5, 8GB RAM, 256GB SSD.", image: "" },
];

const BUYER_PRODUCTS = [
  { id: 1, name: "Rice (50kg bag)", category: "Grains", sellers: 8, avgPrice: 290, lowestPrice: 265, highestPrice: 320, market: "Accra Central Market", change: "+2.1%", up: true, rating: 4.5, description: "Premium basmati/long-grain rice, 50kg bulk bag." },
  { id: 2, name: "Cooking Oil (2L)", category: "Cooking Essentials", sellers: 12, avgPrice: 38.5, lowestPrice: 34, highestPrice: 45, market: "Kumasi Central Market", change: "-3.8%", up: false, rating: 4.2, description: "Refined vegetable cooking oil, 2L bottle." },
  { id: 3, name: "Tomatoes (1kg)", category: "Vegetables", sellers: 20, avgPrice: 12, lowestPrice: 9, highestPrice: 15, market: "Takoradi Market", change: "+4.3%", up: true, rating: 3.9, description: "Fresh ripe tomatoes from local farms." },
  { id: 4, name: "Onions (1kg)", category: "Vegetables", sellers: 15, avgPrice: 8, lowestPrice: 7, highestPrice: 11, market: "Madina Market", change: "0%", up: true, rating: 4.0, description: "Medium-sized red onions, firm and fresh." },
  { id: 5, name: "Chicken (1kg)", category: "Proteins", sellers: 6, avgPrice: 32, lowestPrice: 28, highestPrice: 38, market: "Accra Central Market", change: "-8.6%", up: false, rating: 4.7, description: "Broiler chicken, freshly dressed per kg." },
  { id: 6, name: "Yam (medium)", category: "Vegetables", sellers: 9, avgPrice: 18, lowestPrice: 15, highestPrice: 22, market: "Kumasi Central Market", change: "+1.5%", up: true, rating: 4.1, description: "Medium-sized water yam, perfect for pounding or frying." },
  { id: 7, name: "Eggs (crate×30)", category: "Proteins", sellers: 11, avgPrice: 55, lowestPrice: 50, highestPrice: 62, market: "Kaneshie Market", change: "+5.4%", up: true, rating: 4.3, description: "Fresh farm eggs, crate of 30." },
  // Electronics — Smartphones
  { id: 8, name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", sellers: 5, avgPrice: 9800, lowestPrice: 8500, highestPrice: 11500, market: "Accra Central Market", change: "+3.2%", up: true, rating: 4.8, description: "Apple iPhone 16 Pro Max 256GB — unlocked for all networks." },
  { id: 9, name: "Samsung Galaxy S24 Ultra", category: "Smartphones", sellers: 7, avgPrice: 8400, lowestPrice: 7200, highestPrice: 10000, market: "Kumasi Central Market", change: "-2.1%", up: false, rating: 4.6, description: "Samsung Galaxy S24 Ultra 256GB — AI-powered flagship." },
  { id: 10, name: "Samsung Galaxy A55 5G", category: "Smartphones", sellers: 9, avgPrice: 4100, lowestPrice: 3200, highestPrice: 5200, market: "Madina Market", change: "+1.8%", up: true, rating: 4.3, description: "Samsung Galaxy A55 5G 128GB — premium mid-range." },
  // Electronics — Laptops
  { id: 11, name: "MacBook Air M3 (13\")", category: "Laptops", sellers: 4, avgPrice: 15800, lowestPrice: 13500, highestPrice: 18500, market: "Accra Central Market", change: "+5.1%", up: true, rating: 4.9, description: "Apple MacBook Air 13\" M3 chip, 8GB RAM, 256GB SSD." },
  { id: 12, name: "HP Pavilion 15 (Core i7)", category: "Laptops", sellers: 6, avgPrice: 8200, lowestPrice: 6800, highestPrice: 10500, market: "Kaneshie Market", change: "-4.3%", up: false, rating: 4.4, description: "HP Pavilion 15.6\" Core i7-13th Gen, 16GB RAM, 512GB SSD." },
  { id: 13, name: "Lenovo IdeaPad 3 (Core i5)", category: "Laptops", sellers: 8, avgPrice: 6500, lowestPrice: 5400, highestPrice: 7800, market: "Kumasi Central Market", change: "+2.4%", up: true, rating: 4.2, description: "Lenovo IdeaPad 3 Core i5-12th Gen, 8GB RAM, 256GB SSD." },
  // Electronics — Desktops
  { id: 14, name: "Dell OptiPlex 7010 (i5)", category: "Desktops", sellers: 5, avgPrice: 5500, lowestPrice: 4200, highestPrice: 7000, market: "Accra Central Market", change: "+2.7%", up: true, rating: 4.2, description: "Dell OptiPlex 7010 SFF, Core i5-13th Gen, 16GB RAM." },
  { id: 15, name: "HP ProDesk 400 (Ryzen 5)", category: "Desktops", sellers: 4, avgPrice: 4800, lowestPrice: 3900, highestPrice: 6200, market: "Kaneshie Market", change: "-1.5%", up: false, rating: 4.0, description: "HP ProDesk 400 G9 Mini, AMD Ryzen 5, 8GB RAM, 256GB SSD." },
];

/* ─── seller breakdown data (buyer view) ──────────────────────── */
const BUYER_SELLERS: Record<number, { id: number; seller: string; market: string; price: number; distance: string; rating: number; inStock: boolean }[]> = {
  1: [
    { id: 1, seller: "Mensah Grains", market: "Accra Central Market", price: 265, distance: "1.2km", rating: 4.7, inStock: true },
    { id: 2, seller: "Aba Agro Stores", market: "Kaneshie Market", price: 275, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 3, seller: "Golden Harvest", market: "Madina Market", price: 280, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 4, seller: "Nkrumah Supplies", market: "Accra Central Market", price: 290, distance: "1.5km", rating: 3.9, inStock: true },
    { id: 5, seller: "TwinStar Traders", market: "Kaneshie Market", price: 295, distance: "4.0km", rating: 4.5, inStock: false },
    { id: 6, seller: "Akosua Wholesalers", market: "Tema Market", price: 310, distance: "18km", rating: 4.2, inStock: true },
    { id: 7, seller: "BulkFoods GH", market: "Madina Market", price: 315, distance: "6.5km", rating: 4.0, inStock: true },
    { id: 8, seller: "Bright Commodities", market: "Agbogbloshie", price: 320, distance: "2.3km", rating: 3.7, inStock: true },
  ],
  2: [
    { id: 1, seller: "Healthy Oils Co.", market: "Kumasi Central Market", price: 34, distance: "5.3km", rating: 4.6, inStock: true },
    { id: 2, seller: "Palmy Essentials", market: "Takoradi Market", price: 36, distance: "12km", rating: 4.0, inStock: true },
    { id: 3, seller: "Oil & More", market: "Accra Central Market", price: 37, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 4, seller: "Frytex Supplies", market: "Kaneshie Market", price: 39, distance: "3.8km", rating: 3.8, inStock: true },
  ],
  3: [
    { id: 1, seller: "Fresh Farms GH", market: "Takoradi Market", price: 9, distance: "12km", rating: 4.2, inStock: true },
    { id: 2, seller: "Veggies Direct", market: "Kumasi Central Market", price: 10, distance: "5.3km", rating: 4.5, inStock: true },
    { id: 3, seller: "Garden Fresh", market: "Madina Market", price: 11, distance: "6.1km", rating: 3.9, inStock: true },
    { id: 4, seller: "Tomato Queen", market: "Accra Central Market", price: 12, distance: "1.2km", rating: 4.1, inStock: true },
  ],
  4: [
    { id: 1, seller: "Onion King", market: "Madina Market", price: 7, distance: "6.1km", rating: 4.3, inStock: true },
    { id: 2, seller: "Spice World", market: "Accra Central Market", price: 8, distance: "1.2km", rating: 4.0, inStock: true },
    { id: 3, seller: "Fresh Roots GH", market: "Kumasi Central Market", price: 9, distance: "5.3km", rating: 3.7, inStock: true },
  ],
  5: [
    { id: 1, seller: "Poultry Plus", market: "Accra Central Market", price: 28, distance: "1.2km", rating: 4.8, inStock: true },
    { id: 2, seller: "Chicken Depot", market: "Kaneshie Market", price: 30, distance: "3.8km", rating: 4.5, inStock: true },
    { id: 3, seller: "Farm Fresh Meats", market: "Madina Market", price: 33, distance: "6.1km", rating: 4.2, inStock: true },
  ],
  6: [
    { id: 1, seller: "Yam Farmers Coop", market: "Kumasi Central Market", price: 15, distance: "5.3km", rating: 4.4, inStock: true },
    { id: 2, seller: "Root Harvest", market: "Accra Central Market", price: 17, distance: "1.2km", rating: 4.0, inStock: true },
    { id: 3, seller: "Tuber Traders", market: "Madina Market", price: 19, distance: "6.1km", rating: 3.8, inStock: true },
  ],
  7: [
    { id: 1, seller: "EggMart GH", market: "Kaneshie Market", price: 50, distance: "3.8km", rating: 4.6, inStock: true },
    { id: 2, seller: "Poultry World", market: "Accra Central Market", price: 52, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "Fresh Eggs Co.", market: "Kumasi Central Market", price: 55, distance: "5.3km", rating: 4.1, inStock: true },
    { id: 4, seller: "Daily Farms", market: "Takoradi Market", price: 58, distance: "12km", rating: 3.9, inStock: false },
  ],
  // Smartphones
  8: [
    { id: 1, seller: "iGhana Store", market: "Accra Central Market", price: 8500, distance: "1.2km", rating: 4.8, inStock: true },
    { id: 2, seller: "Apple Resellers GH", market: "Kaneshie Market", price: 8900, distance: "3.8km", rating: 4.6, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 9200, distance: "6.1km", rating: 4.4, inStock: true },
    { id: 4, seller: "PhoneZone GH", market: "Kumasi Central Market", price: 9500, distance: "5.3km", rating: 4.2, inStock: false },
    { id: 5, seller: "Elite Gadgets", market: "Accra Central Market", price: 11500, distance: "1.8km", rating: 4.0, inStock: true },
  ],
  9: [
    { id: 1, seller: "Samsung Deals GH", market: "Kumasi Central Market", price: 7200, distance: "5.3km", rating: 4.7, inStock: true },
    { id: 2, seller: "MobileMart", market: "Accra Central Market", price: 7600, distance: "1.2km", rating: 4.5, inStock: true },
    { id: 3, seller: "GadgetPro", market: "Kaneshie Market", price: 8000, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 4, seller: "TechHub Accra", market: "Madina Market", price: 8400, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 5, seller: "PhoneZone GH", market: "Takoradi Market", price: 9000, distance: "12km", rating: 3.9, inStock: true },
    { id: 6, seller: "Digital World", market: "Accra Central Market", price: 9500, distance: "2.0km", rating: 3.8, inStock: false },
    { id: 7, seller: "Elite Gadgets", market: "Kaneshie Market", price: 10000, distance: "4.2km", rating: 4.0, inStock: true },
  ],
  10: [
    { id: 1, seller: "Samsung Deals GH", market: "Madina Market", price: 3200, distance: "6.1km", rating: 4.5, inStock: true },
    { id: 2, seller: "AfriTech Stores", market: "Accra Central Market", price: 3500, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "MobileMart", market: "Kumasi Central Market", price: 3800, distance: "5.3km", rating: 4.1, inStock: true },
    { id: 4, seller: "GadgetPro", market: "Kaneshie Market", price: 4100, distance: "3.8km", rating: 3.9, inStock: true },
    { id: 5, seller: "TechHub Accra", market: "Takoradi Market", price: 4600, distance: "12km", rating: 4.2, inStock: true },
  ],
  // Laptops
  11: [
    { id: 1, seller: "iGhana Store", market: "Accra Central Market", price: 13500, distance: "1.2km", rating: 4.9, inStock: true },
    { id: 2, seller: "Apple Resellers GH", market: "Kaneshie Market", price: 14200, distance: "3.8km", rating: 4.7, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 15500, distance: "6.1km", rating: 4.5, inStock: false },
    { id: 4, seller: "Digital World", market: "Kumasi Central Market", price: 18500, distance: "5.3km", rating: 4.2, inStock: true },
  ],
  12: [
    { id: 1, seller: "HP Authorized GH", market: "Kaneshie Market", price: 6800, distance: "3.8km", rating: 4.5, inStock: true },
    { id: 2, seller: "LaptopCity GH", market: "Accra Central Market", price: 7200, distance: "1.2km", rating: 4.3, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 8000, distance: "6.1km", rating: 4.1, inStock: true },
    { id: 4, seller: "CompuMart", market: "Kumasi Central Market", price: 9000, distance: "5.3km", rating: 3.9, inStock: true },
    { id: 5, seller: "Digital World", market: "Takoradi Market", price: 10500, distance: "12km", rating: 4.0, inStock: false },
  ],
  13: [
    { id: 1, seller: "Lenovo Point GH", market: "Kumasi Central Market", price: 5400, distance: "5.3km", rating: 4.4, inStock: true },
    { id: 2, seller: "LaptopCity GH", market: "Accra Central Market", price: 5800, distance: "1.2km", rating: 4.2, inStock: true },
    { id: 3, seller: "CompuMart", market: "Kaneshie Market", price: 6200, distance: "3.8km", rating: 4.0, inStock: true },
    { id: 4, seller: "TechHub Accra", market: "Madina Market", price: 6800, distance: "6.1km", rating: 3.8, inStock: true },
    { id: 5, seller: "GadgetPro", market: "Takoradi Market", price: 7200, distance: "12km", rating: 3.7, inStock: true },
  ],
  // Desktops
  14: [
    { id: 1, seller: "Dell Resellers GH", market: "Accra Central Market", price: 4200, distance: "1.2km", rating: 4.4, inStock: true },
    { id: 2, seller: "CompuMart", market: "Kaneshie Market", price: 4800, distance: "3.8km", rating: 4.2, inStock: true },
    { id: 3, seller: "TechHub Accra", market: "Madina Market", price: 5200, distance: "6.1km", rating: 4.0, inStock: true },
    { id: 4, seller: "Digital World", market: "Kumasi Central Market", price: 6000, distance: "5.3km", rating: 3.9, inStock: false },
    { id: 5, seller: "LaptopCity GH", market: "Kaneshie Market", price: 7000, distance: "4.0km", rating: 3.7, inStock: true },
  ],
  15: [
    { id: 1, seller: "HP Authorized GH", market: "Kaneshie Market", price: 3900, distance: "3.8km", rating: 4.3, inStock: true },
    { id: 2, seller: "CompuMart", market: "Accra Central Market", price: 4300, distance: "1.2km", rating: 4.1, inStock: true },
    { id: 3, seller: "Digital World", market: "Madina Market", price: 4900, distance: "6.1km", rating: 3.9, inStock: true },
    { id: 4, seller: "AfriTech Stores", market: "Kumasi Central Market", price: 5500, distance: "5.3km", rating: 3.7, inStock: true },
  ],
};

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
  price: string; comparePrice: string; market: string; location: string;
}
const emptyForm = (): ProductForm => ({ name:"", category:"", description:"", unit:"kg", stock:"", minStock:"", price:"", comparePrice:"", market:"", location:"" });

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
  const [products, setProducts] = useState(SELLER_PRODUCTS);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list"|"card">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<typeof SELLER_PRODUCTS[0] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sellerPage, setSellerPage] = useState(1);
  const [sellerPageSize, setSellerPageSize] = useState(15);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );
  const sellerPaged = filtered.slice((sellerPage - 1) * sellerPageSize, sellerPage * sellerPageSize);

  function handleCreate() {
    setSubmitting(true);
    setTimeout(() => {
      setProducts(prev => [{
        id: Date.now(), name: form.name || "New Product", category: form.category || "Grains",
        price: parseFloat(form.price) || 0, unit: form.unit, stock: parseInt(form.stock) || 0,
        market: form.market || MARKETS[0], status: "Active", change: "0%", up: true,
        description: form.description, image: "",
      }, ...prev]);
      setForm(emptyForm()); setCreateOpen(false); setSubmitting(false);
    }, 800);
  }
  function handleDelete(id: number) { setProducts(prev => prev.filter(p => p.id !== id)); setDeleteTarget(null); }
  const f = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

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
                      {["Product","Category","Price","Stock","Market","Change","Status","Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sellerPaged.map(p => (
                      <tr key={p.id} onClick={() => setViewProduct(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.category}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-gray-200">GH₵{p.price.toFixed(2)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`font-medium ${p.stock < 15 ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>{p.stock} {p.unit}</span>
                          {p.stock < 15 && <span className="ml-2 text-xs text-red-500">Low</span>}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{p.market}</td>
                        <td className="px-5 py-3.5">
                          <span className={`flex items-center gap-1 font-medium text-xs ${p.up ? "text-emerald-600" : "text-red-500"}`}>
                            {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === "Alert" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button aria-label="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                            <button aria-label="Delete" onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sellerPaged.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No products found. Click <strong>New Product</strong> to add one.</td></tr>
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
              {sellerPaged.map(p => (
                <div key={p.id} onClick={() => setViewProduct(p)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                  {/* Image / placeholder */}
                  <div className="h-36 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 flex items-center justify-center relative">
                    <Package className="h-14 w-14 text-emerald-300 dark:text-emerald-700" />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "Alert" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"}`}>{p.status}</span>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${p.up ? "text-emerald-600" : "text-red-500"}`}>
                        {p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}
                      </span>
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
                      <span className={p.stock < 15 ? "text-red-500 font-medium" : ""}>{p.stock} {p.unit} left{p.stock < 15 ? " ⚠️" : ""}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.market.split(" ")[0]}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                      <button className="flex-1 py-1.5 text-xs font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600 transition-colors border border-gray-200 dark:border-gray-700"><Edit2 className="h-3.5 w-3.5 inline mr-1" />Edit</button>
                      <button onClick={() => setDeleteTarget(p.id)} className="flex-1 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors border border-gray-200 dark:border-gray-700"><Trash2 className="h-3.5 w-3.5 inline mr-1" />Delete</button>
                    </div>
                  </div>
                </div>
              ))}
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
              <FormField label="Description" hint="Optional"><textarea className={inputCls + " resize-none"} rows={3} placeholder="Describe quality, variety…" value={form.description} onChange={f("description")} /></FormField>
              <FormField label="Unit of Sale" required><select aria-label="Unit" className={selectCls} value={form.unit} onChange={f("unit")}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></FormField>
            </div>
          )},
          { key: "stock", label: "Stock Info", content: (
            <div>
              <FormField label="Current Stock Quantity" required><input className={inputCls} type="number" min="0" placeholder="e.g. 50" value={form.stock} onChange={f("stock")} /></FormField>
              <FormField label="Low Stock Alert Threshold" hint="Get notified when stock falls below this"><input className={inputCls} type="number" min="0" placeholder="e.g. 10" value={form.minStock} onChange={f("minStock")} /></FormField>
              <FormField label="Market" required><select aria-label="Market" className={selectCls} value={form.market} onChange={f("market")}><option value="">Select market</option>{MARKETS.map(m => <option key={m} value={m}>{m}</option>)}</select></FormField>
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
                ["Stock", `${viewProduct.stock} ${viewProduct.unit}${viewProduct.stock < 15 ? " ⚠️ Low" : ""}`],
                ["Market", viewProduct.market],
                ["Price Change", viewProduct.change],
                ["Status", viewProduct.status],
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
  const [products] = useState(BUYER_PRODUCTS);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list"|"card">("list");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [saved, setSaved] = useState<number[]>([1, 3]);
  const [viewProduct, setViewProduct] = useState<typeof BUYER_PRODUCTS[0] | null>(null);
  const [buyerPage, setBuyerPage] = useState(1);
  const [buyerPageSize, setBuyerPageSize] = useState(15);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerPage, setSellerPage] = useState(1);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase()))
  );
  const buyerPaged = filtered.slice((buyerPage - 1) * buyerPageSize, buyerPage * buyerPageSize);

  function toggleSave(id: number) { setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

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
                    {buyerPaged.map(p => (
                      <tr key={p.id} onClick={() => setViewProduct(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</p>
                          <div className="flex mt-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />)}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{p.category}</td>
                        <td className="px-5 py-3.5"><span className="font-bold text-emerald-600 dark:text-emerald-400">GH₵{p.lowestPrice.toFixed(2)}</span></td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">GH₵{p.avgPrice.toFixed(2)}</td>
                        <td className="px-5 py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{p.sellers} sellers</span></td>
                        <td className="px-5 py-3.5"><span className={`flex items-center gap-1 text-xs font-medium ${p.up ? "text-emerald-600" : "text-red-500"}`}>{p.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{p.change}</span></td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{p.market}</td>
                        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSave(p.id)} className={`p-1.5 rounded-lg transition-colors ${saved.includes(p.id) ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500"}`} title={saved.includes(p.id) ? "Unsave" : "Save"}>
                            {saved.includes(p.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
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
              {buyerPaged.map(p => (
                <div key={p.id} onClick={() => setViewProduct(p)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                  <div className="h-36 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center relative">
                    <Package className="h-14 w-14 text-blue-200 dark:text-blue-800" />
                    <div className="absolute top-2 right-2">
                      <button onClick={e => { e.stopPropagation(); toggleSave(p.id); }} className={`p-1.5 rounded-full transition-colors ${saved.includes(p.id) ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400" : "bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-blue-600"}`}>
                        {saved.includes(p.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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
                    <div className="flex mb-2">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-3 w-3 ${i < Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />)}</div>
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
              ))}
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
        const allSellers = (BUYER_SELLERS[viewProduct.id] ?? []).slice().sort((a, b) => a.price - b.price);
        const filteredSellers = sellerSearch
          ? allSellers.filter(s =>
              s.seller.toLowerCase().includes(sellerSearch.toLowerCase()) ||
              s.market.toLowerCase().includes(sellerSearch.toLowerCase())
            )
          : allSellers;
        const MODAL_PAGE_SIZE = 5;
        const pagedSellers = filteredSellers.slice((sellerPage - 1) * MODAL_PAGE_SIZE, sellerPage * MODAL_PAGE_SIZE);
        const bestPrice = allSellers.length > 0 ? allSellers[0].price : viewProduct.lowestPrice;
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
                  <button onClick={() => toggleSave(viewProduct.id)} className={`p-2 rounded-xl transition-colors ${saved.includes(viewProduct.id) ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600"}`}>
                    {saved.includes(viewProduct.id) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
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

                {/* ── Seller breakdown ── */}
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
                                <MapPin className="h-3 w-3 flex-shrink-0" />{s.market} · {s.distance}
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