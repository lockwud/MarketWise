"use client";

import { useState, useEffect, ReactNode } from "react";
import { X, Plus } from "lucide-react";

export interface TabDef {
  key: string;
  label: string;
  content: ReactNode;
}

interface CreateModalProps {
  open: boolean;
  title: string;
  tabs: TabDef[];
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
}

export function CreateModal({
  open,
  title,
  tabs,
  onClose,
  onSubmit,
  submitLabel = "Create",
  submitting = false,
}: CreateModalProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  useEffect(() => {
    if (open) setActiveTab(tabs[0]?.key ?? "");
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {tabs.find((t) => t.key === activeTab)?.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          {tabs.length > 1 && (
            <div className="flex gap-1">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-2 rounded-full transition-all ${
                    activeTab === tab.key
                      ? "w-6 bg-emerald-600"
                      : "w-2 bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          )}
          <div className={`flex gap-3 ${tabs.length <= 1 ? "ml-auto" : ""}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable form field for modals */
export function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors";

export const selectCls =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors";
