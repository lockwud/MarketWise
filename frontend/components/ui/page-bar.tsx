"use client";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

/* ── PageBar: full-page paginator ───────────────────────────────
   Shows: "Showing X–Y of Z label" | per-page selector | numbered circles
   ──────────────────────────────────────────────────────────────── */
interface PageBarProps {
  page: number;
  total: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  pageSizeOptions?: number[];
  label?: string;
}

export function PageBar({
  page,
  total,
  pageSize,
  setPage,
  setPageSize,
  pageSizeOptions = [15, 30],
  label = "items",
}: PageBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function pageNums(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "...");
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push("...", totalPages);
    }
    return pages;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
      {/* Count + per-page selector */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{from}–{to}</span>
          {" "}of{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>{" "}
          {label}
        </span>
        <select
          title="Items per page"
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {pageSizeOptions.map(o => <option key={o} value={o}>{o} per page</option>)}
        </select>
      </div>

      {/* Page number circles */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNums().map((n, i) =>
            n === "..." ? (
              <span key={`ell-${i}`} className="h-8 w-8 flex items-center justify-center text-gray-400">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n as number)}
                aria-current={page === n ? "page" : undefined}
                className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  page === n
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── ModalPager: 5-per-page pager + search bar for modals ───────
   Used inside product detail modals where sellers/items are listed.
   ──────────────────────────────────────────────────────────────── */
interface ModalPagerProps {
  search: string;
  setSearch: (v: string) => void;
  page: number;
  total: number;
  pageSize?: number;
  setPage: (p: number) => void;
  placeholder?: string;
}

export function ModalPager({
  search,
  setSearch,
  page,
  total,
  pageSize = 5,
  setPage,
  placeholder = "Search…",
}: ModalPagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-2 mb-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-0 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
        />
      </div>

      {/* Count + page circles (only when multiple pages) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Previous"
              className="h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-current={page === n ? "page" : undefined}
                className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  page === n
                    ? "bg-emerald-600 text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Next"
              className="h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
