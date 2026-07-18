"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AppShellSkeleton({ panelLabel = "Panel" }: { panelLabel?: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600" />
          <div className="h-4 w-24 rounded bg-gray-700" />
        </div>
        <div className="px-3 pt-4 pb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{panelLabel}</span>
        </div>
        <nav className="flex-1 py-2 space-y-1 px-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="h-4 w-4 rounded bg-gray-700" />
              <div className="h-3 w-24 rounded bg-gray-700" />
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <Skeleton className="h-9 w-full max-w-sm bg-gray-100 dark:bg-gray-800" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <Skeleton className="h-8 w-24 bg-gray-100 dark:bg-gray-800" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <Skeleton className="h-6 w-48 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="mt-2 h-4 w-80 bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800" />)}
          </div>
          <Skeleton className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800" />
        </main>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return <AppShellSkeleton />;
}
