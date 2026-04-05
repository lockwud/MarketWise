"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { format, addDays, isBefore, parseISO } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Download,
  MapPin,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
  Check,
  ChartBar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileNav } from "@/components/mobile-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/footer";

// Sample data for demonstration
const initialItems = [
  {
    id: 1,
    name: "Rice (5kg bag)",
    category: "Grains",
    price: 45.00,
    vendor: "Market A",
    location: "Accra Central",
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
  },
  {
    id: 2,
    name: "Cooking Oil (2L)",
    category: "Cooking Essentials",
    price: 38.50,
    vendor: "Market B",
    location: "Kumasi Market",
    date: format(addDays(new Date(), -2), "yyyy-MM-dd"),
  },
  {
    id: 3,
    name: "Tomatoes (1kg)",
    category: "Vegetables",
    price: 12.00,
    vendor: "Market C",
    location: "Takoradi Mall",
    date: format(addDays(new Date(), 0), "yyyy-MM-dd"),
  },
  {
    id: 4,
    name: "Onions (1kg)",
    category: "Vegetables",
    price: 8.00,
    vendor: "Market A",
    location: "Accra Central",
    date: format(addDays(new Date(), -3), "yyyy-MM-dd"),
  },
  {
    id: 5,
    name: "Chicken (1kg)",
    category: "Proteins",
    price: 32.00,
    vendor: "Market B",
    location: "Kumasi Market",
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
  },
];

export default function UserDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">
            Please wait while we verify your access.
          </p>
        </div>
      </div>
    );
  }

   const filteredItems = items.filter(
     (item) =>
       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.location.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const priceAlerts = filteredItems.filter((item) => {
     // For demo, flag items with prices above average as alerts
     const avgPrice = filteredItems.reduce((sum, item) => sum + item.price, 0) / filteredItems.length || 0;
     return item.price > avgPrice * 1.2; // 20% above average
   });

   const removeItem = (id: number) => {
     setItems(items.filter((item) => item.id !== id));
     toast({
       title: "Price entry removed",
       description: "The price entry has been removed from your comparisons.",
     });
   };

   const getPriceDifference = (price: number) => {
     const avgPrice = filteredItems.reduce((sum, item) => sum + item.price, 0) / filteredItems.length || 0;
     return ((price - avgPrice) / avgPrice) * 100;
   };

const getExpiryStatusColor = (days: number) => {
    if (days < 0) return "text-destructive dark:text-destructive/40";
    if (days <= 2) return "text-muted-foreground/60 dark:text-muted-foreground/40";
    return "text-primary dark:text-primary-foreground";
  };
  
  const getProgressColor = (days: number) => {
    if (days < 0) return "bg-destructive dark:bg-destructive/20";
    if (days <= 2) return "bg-muted/60 dark:bg-muted/40";
    return "bg-primary dark:bg-primary/10";
  };

  // Calculate statistics
  const totalItems = items.length;
  const totalExpiringSoon = expiringSoon.length;
  const wastePercentage =
    Math.round((totalExpiringSoon / totalItems) * 100) || 0;
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Export inventory as CSV
  const exportInventory = () => {
    const headers = ["Name", "Category", "Quantity", "Unit", "Expiry Date"];
    const csvData = [
      headers.join(","),
      ...items.map((item) =>
        [
          item.name,
          item.category,
          item.quantity,
          item.unit,
          item.expiryDate,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `freshtrack-inventory-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Inventory exported",
      description: "Your inventory has been exported as a CSV file.",
    });
  };

return (
  <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
      <Link className="flex items-center justify-center space-x-3" href="/">
        <ShoppingBasket className="h-6 w-6 text-primary dark:text-primary-foreground" />
        <span className="ml-2 text-xl font-bold text-foreground dark:text-white tracking-tight">
          MarketWise
        </span>
      </Link>
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary-foreground hover:underline underline-offset-4"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary-foreground hover:underline underline-offset-4"
          href="/search"
        >
          Search
        </Link>
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary-foreground hover:underline underline-offset-4"
          href="/vendors"
        >
          Vendors
        </Link>
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary-foreground hover:underline underline-offset-4"
          href="/profile"
        >
          Profile
        </Link>
      </nav>
      <MobileNav />
    </header>
    <main className="flex-1 py-8 px-4 md:px-6">
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
                Price Comparison Dashboard
              </h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mt-2 max-w-xl">
                Compare real-time prices across vendors and locations to make informed purchasing decisions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={exportInventory}
                      className="hover:bg-muted/50 dark:hover:bg-muted/40"
                    >
                      <Download className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">Export comparison data</p>
                    <span className="x-[-3px] y-[1px] block h-[5px] w-[5px] rotate-45 bg-popover dark:bg-popover/80 pointer-events-none" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setViewMode(viewMode === "grid" ? "list" : "grid")
                      }
                      className="hover:bg-muted/50 dark:hover:bg-muted/40"
                    >
                      <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">Toggle view mode</p>
                    <span className="x-[-3px] y-[1px] block h-[5px] w-[5px] rotate-45 bg-popover dark:bg-popover/80 pointer-events-none" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link href="/dashboard/add">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Price Entry
                </Button>
              </Link>
            </div>
          </div>
             <div className="mb-6">
               <div className="relative">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                 <Input
                   type="search"
                   placeholder="Search products, vendors, or locations..."
                   className="pl-9 bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
             </div>
             <Tabs defaultValue="all" className="border-b border-muted/50">
               <TabsList className="grid w-full grid-cols-2 text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/40 rounded-box px-2 py-1.5">
                 <TabsTrigger
                   value="all"
                   className="flex flex-col items-center justify-center py-2 text-sm font-semibold gap-1 rounded-t-lg hover:bg-muted/50 dark:hover:bg-muted/40 [&:not([data-state=active])]:text-muted-foreground/60 [&:not([data-state=active])]:hover:text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                 >
                   <ChartBar className="h-4 w-4" />
                   <span>All Comparisons</span>
                 </TabsTrigger>
                 <TabsTrigger
                   value="expiring"
                   className="flex flex-col items-center justify-center py-2 text-sm font-semibold gap-1 rounded-t-lg hover:bg-muted/50 dark:hover:bg-muted/40 [&:not([data-state=active])]:text-muted-foreground/60 [&:not([data-state=active])]:hover:text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                 >
                   <AlertTriangle className="h-4 w-4" />
                   <span>Price Alerts</span>
                   {expiringSoon.length > 0 && (
                     <Badge variant="destructive" className="mt-1">
                       {expiringSoon.length}
                     </Badge>
                   )}
                 </TabsTrigger>
               </TabsList>
              <TabsContent value="all">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden"
                      >
                         {viewMode === "grid" ? (
                           <>
                             <CardHeader className="pb-4">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <h3 className="font-semibold text-foreground dark:text-white">
                                     {item.name}
                                   </h3>
                                   <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mt-1">
                                     {item.category}
                                   </p>
                                 </div>
                                 <Badge
                                   variant="outline"
                                   className="border border-muted/30 bg-muted/20 text-muted-foreground dark:border-muted/40 dark:bg-muted/50 dark:text-muted-foreground/60 hover:bg-primary/10 hover:text-primary-foreground"
                                 >
                                   {item.price} GH₵
                                 </Badge>
                               </div>
                             </CardHeader>
                             <CardContent className="pb-4">
                               <div className="flex items-center gap-3 mb-3">
                                 <MapPin className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                                 <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                   {item.vendor}
                                   {" • "}
                                   {item.location}
                                 </span>
                               </div>
                               <div className="flex items-center gap-3 mb-4">
                                 <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                                 <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                   {format(
                                     parseISO(item.date),
                                     "PPp"
                                   )}
                                 </span>
                               </div>
                               <div className="flex items-center gap-3 mb-4">
                                 {getPriceDifference(item.price) > 0 ? (
                                   <>
                                     <TrendingUp className="h-4 w-4 text-destructive" />
                                     <span className="text-sm font-medium text-destructive">
                                       +{getPriceDifference(item.price).toFixed(1)}% above avg
                                     </span>
                                   </>
                                 ) : (
                                   <>
                                     <TrendingDown className="h-4 w-4 text-primary" />
                                     <span className="text-sm font-medium text-primary">
                                       {getPriceDifference(item.price).toFixed(1)}% below avg
                                     </span>
                                   </>
                                 )}
                               </div>
                               <Progress
                                 className="h-3 w-full"
                                 value={Math.max(
                                   0,
                                   Math.min(
                                     100,
                                     Math.abs(getPriceDifference(item.price))
                                   )
                                 )}
                                 indicatorClassName={
                                   getPriceDifference(item.price) > 0
                                     ? "bg-destructive dark:bg-destructive/20"
                                     : "bg-primary dark:bg-primary/10"
                                 }
                                 className="bg-muted/50 dark:bg-muted/40"
                               />
                             </CardContent>
                             <CardFooter className="flex justify-between items-center pt-4 border-t border-muted/20">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                                 onClick={() => removeItem(item.id)}
                               >
                                 <Trash2 className="h-4 w-4 mr-2" />
                                 Remove
                               </Button>
                             </CardFooter>
                           </>
                         ) : (
                           <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <div
                                 className={`w-2 h-full rounded-full ${
                                   getPriceDifference(item.price) > 0
                                     ? "bg-destructive dark:bg-destructive/20"
                                     : "bg-primary dark:bg-primary/10"
                                 }`}
                               ></div>
                               <div>
                                 <h3 className="font-medium text-foreground dark:text-white">
                                   {item.name}
                                 </h3>
                                 <div className="flex items-center gap-4 mt-1">
                                   <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                     {item.category}
                                   </span>
                                   <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                     {item.vendor}
                                   </span>
                                 </div>
                               </div>
                             </div>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                               onClick={() => removeItem(item.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Remove</span>
                             </Button>
                           </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <ShoppingBasket className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        No items found
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                        {searchQuery
                          ? "Try a different search term"
                          : "Add some items to your inventory"}
                      </p>
                      {!searchQuery && (
                        <Link href="/dashboard/add">
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
               <TabsContent value="expiring">
                 <div
                   className={
                     viewMode === "grid"
                       ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                       : "space-y-4"
                   }
                 >
                   {priceAlerts.length > 0 ? (
                     priceAlerts.map((item) => (
                       <Card
                         key={item.id}
                         className="bg-background dark:bg-popover border border-input hover:border-primary/10"
                       >
                        {viewMode === "grid" ? (
                            <>
                              <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-foreground dark:text-white">
                                      {item.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mt-1">
                                      {item.category}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border border-muted/30 bg-muted/20 text-muted-foreground dark:border-muted/40 dark:bg-muted/50 dark:text-muted-foreground/60 hover:bg-primary/10 hover:text-primary-foreground"
                                  >
                                    {item.price} GH₵
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <MapPin className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                                  <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                    {item.vendor}
                                    {" • "}
                                    {item.location}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                  <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/40" />
                                  <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                    {format(
                                      parseISO(item.date),
                                      "PPp"
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                  {getPriceDifference(item.price) > 0 ? (
                                    <>
                                      <TrendingUp className="h-4 w-4 text-destructive" />
                                      <span className="text-sm font-medium text-destructive">
                                        +{getPriceDifference(item.price).toFixed(1)}% above avg
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <TrendingDown className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-medium text-primary">
                                        {getPriceDifference(item.price).toFixed(1)}% below avg
                                      </span>
                                    </>
                                  )}
                                </div>
                                <Progress
                                  className="h-3 w-full"
                                  value={Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      Math.abs(getPriceDifference(item.price))
                                    )
                                  )}
                                  indicatorClassName={
                                    getPriceDifference(item.price) > 0
                                      ? "bg-destructive dark:bg-destructive/20"
                                      : "bg-primary dark:bg-primary/10"
                                  }
                                  className="bg-muted/50 dark:bg-muted/40"
                                />
                              </CardContent>
                              <CardFooter className="flex justify-between items-center pt-4 border-t border-muted/20">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </CardFooter>
                            </>
                          ) : (
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-2 h-full rounded-full ${
                                    getPriceDifference(item.price) > 0
                                      ? "bg-destructive dark:bg-destructive/20"
                                      : "bg-primary dark:bg-primary/10"
                                  }`}
                                ></div>
                                <div>
                                  <h3 className="font-medium text-foreground dark:text-white">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                      {item.category}
                                    </span>
                                    <span className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                                      {item.vendor}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-background dark:bg-popover rounded-lg border border-input">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground dark:text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-medium text-foreground dark:text-white">
                          No price alerts
                        </h3>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mt-1">
                          All your price comparisons are within normal ranges
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
            </Tabs>
          </div>
           <div className="space-y-8">
             <Card className="bg-background dark:bg-popover border border-input hover:border-primary/10">
               <CardHeader className="pb-6">
                 <h2 className="text-xl font-semibold text-foreground dark:text-white">
                   Price Comparison Summary
                 </h2>
                 <p className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                   Overview of your price comparisons
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-4">
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/60">
                         Total Comparisons
                       </span>
                       <span className="text-sm font-semibold text-foreground dark:text-white">
                         {items.length}
                       </span>
                     </div>
                     <div className="w-full bg-muted/50 dark:bg-muted/40 rounded-full h-2.5">
                       <div className="bg-primary h-2.5 rounded-full" style={{ width: Math.min(items.length * 10, 100) + '%' }} />
                     </div>
                   </div>
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/60">
                         Price Alerts Active
                       </span>
                       <span className="text-sm font-semibold text-foreground dark:text-white">
                         {expiringSoon.length}
                       </span>
                     </div>
                     <div className="w-full bg-muted/50 dark:bg-muted/40 rounded-full h-2.5">
                       <div className="bg-destructive h-2.5 rounded-full" style={{ width: Math.min(expiringSoon.length * 20, 100) + '%' }} />
                     </div>
                   </div>
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/60">
                         Average Savings
                       </span>
                       <span className="text-sm font-semibold text-foreground dark:text-white">
                         {wastePercentage}%
                       </span>
                     </div>
                     <div className="w-full bg-muted/50 dark:bg-muted/40 rounded-full h-2.5">
                       <div className={getProgressColor(wastePercentage) + " h-2.5 rounded-full"} style={{ width: Math.min(wastePercentage, 100) + '%' }} />
                     </div>
                   </div>
                   <div className="pt-4 border-t border-muted/20">
                     <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground/40 mb-3">
                       Categories Tracked
                     </h3>
                     <div className="space-y-2">
                       {Object.entries(categoryCounts).map(
                         ([category, count]) => (
                           <div
                             key={category}
                             className="flex items-center justify-between text-sm"
                           >
                             <span className="text-muted-foreground dark:text-muted-foreground/60">
                               {category}
                             </span>
                             <Badge
                               variant="outline"
                               className="border border-muted/30 bg-muted/20 text-muted-foreground dark:border-muted/40 dark:bg-muted/50 dark:text-muted-foreground/60 hover:bg-primary/10 hover:text-primary-foreground"
                             >
                               {count}
                             </Badge>
                           </div>
                         )
                       )}
                     </div>
                   </div>
                 </div>
               </CardContent>
               <CardFooter className="pt-5 border-t border-muted/20">
                 <Link href="/dashboard/add" className="w-full inline-flex items-center justify-center">
                   <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                     <Plus className="mr-2 h-4 w-4" />
                     Add Price Comparison
                   </Button>
                 </Link>
               </CardFooter>
             </Card>

             {/* New card for market insights */}
             <Card className="bg-background dark:bg-popover border border-input hover:border-primary/10">
               <CardHeader className="pb-6">
                 <h2 className="text-xl font-semibold text-foreground dark:text-white">
                   Market Insights
                 </h2>
                 <p className="text-sm text-muted-foreground dark:text-muted-foreground/60">
                   Track price trends and make better purchasing decisions
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center justify-between mb-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl">
                   <div>
                     <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40">
                       Monthly Savings
                     </p>
                     <p className="text-2xl font-bold text-primary dark:text-primary-foreground">
                       GH₵24.50
                     </p>
                   </div>
                   <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                     <BarChart3 className="h-5 w-5 text-primary dark:text-primary-foreground" />
                   </div>
                 </div>

                 <div className="space-y-3">
                   <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-2">
                     Price Saving Tips
                   </p>
                   <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground/60">
                     <li className="flex items-start gap-3">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10">
                         <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
                       </div>
                       <span>Compare prices across multiple vendors before purchasing</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10">
                         <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
                       </div>
                       <span>Buy seasonal produce for better prices</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10">
                         <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
                       </div>
                       <span>Consider store brands for everyday items</span>
                     </li>
                   </ul>
                 </div>
               </CardContent>
               <CardFooter className="pt-5 border-t border-muted/20">
                 <Button
                   variant="outline"
                   className="w-full inline-flex items-center justify-center text-muted-foreground hover:text-muted-foreground/90 hover:bg-muted/5"
                 >
                   View Detailed Analytics
                 </Button>
               </CardFooter>
             </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
