"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** If set, user must type this exact word before confirming */
  requireTyping?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  requireTyping,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  // Trap ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm = !requireTyping || typed === requireTyping;

  const variantStyles = {
    danger: {
      icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      btn: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
    },
    default: {
      icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          aria-label="Close"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${variantStyles.icon}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {requireTyping && (
          <div className="mb-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Type <span className="font-semibold text-gray-700 dark:text-gray-300">"{requireTyping}"</span> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyping}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { if (canConfirm) { onConfirm(); setTyped(""); } }}
            disabled={!canConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
