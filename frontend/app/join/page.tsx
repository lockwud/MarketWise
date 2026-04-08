import Link from "next/link";
import { ArrowRight, ShoppingCart, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JoinPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Market<span className="text-emerald-600">Wise</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">
              Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">
              Log in
            </Button>
          </Link>
        </div>
      </header>

      {/* Choice cards */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              How do you want to use{" "}
              <span className="text-emerald-600 dark:text-emerald-400">MarketWise</span>?
            </h1>
            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
              Choose the account type that fits you best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Buyer */}
            <Link href="/signup" className="group block">
              <div className="h-full rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-8 transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white mb-6">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  I&apos;m a Buyer
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                  Compare prices across markets, save favourite products, set price alerts,
                  and build smart shopping lists.
                </p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full group-hover:shadow-md">
                  Create Buyer Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>

            {/* Seller */}
            <Link href="/seller-apply" className="group block">
              <div className="h-full rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-8 transition-all hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-600 text-white mb-6">
                  <Store className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  I&apos;m a Seller
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                  List products, manage inventory, submit live prices, and track orders
                  across multiple markets.
                </p>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-full group-hover:shadow-md">
                  Apply as Seller
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
