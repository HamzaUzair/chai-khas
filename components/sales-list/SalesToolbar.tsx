"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  CircleDot,
  CreditCard,
  CalendarDays,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { SaleStatus, PaymentMethod, SaleBranch } from "@/types/salesList";

/* ── Quick-filter chip ids ── */
export type QuickFilter =
  | "today"
  | "yesterday"
  | "this_week"
  | "cash_only"
  | "completed_only";

interface SalesToolbarProps {
  branches: SaleBranch[];
  branchesLoading?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  branchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  lockBranchId?: number | null;
  status: SaleStatus | "all";
  onStatusChange: (v: SaleStatus | "all") => void;
  payment: PaymentMethod | "all";
  onPaymentChange: (v: PaymentMethod | "all") => void;
  dateFrom: string; // yyyy-mm-dd
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  quickFilter: QuickFilter | null;
  onQuickFilter: (v: QuickFilter | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statuses: SaleStatus[] = [
  "Pending",
  "Running",
  "Served",
  "Paid",
  "Cancelled",
  "Credit",
];
const payments: PaymentMethod[] = ["Cash", "Card", "Online", "Credit"];

const QUICK_CHIPS: { id: QuickFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This Week" },
  { id: "cash_only", label: "Cash Only" },
  { id: "completed_only", label: "Completed Only" },
];

const selectBase =
  "border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all w-full";

const SalesToolbar: React.FC<SalesToolbarProps> = ({
  branches,
  branchesLoading = false,
  search,
  onSearchChange,
  branchId,
  onBranchChange,
  lockBranchId = null,
  status,
  onStatusChange,
  payment,
  onPaymentChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  quickFilter,
  onQuickFilter,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4 space-y-4">
      {/* Row 1 — search + dropdowns
          Uses a 6-col grid on lg so the Date Range cell (2 date inputs) can
          claim 2 columns and the second date input never overflows the card
          edge. Smaller viewports collapse to 1 or 2 columns as before. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Search size={12} />
            Search Order
          </label>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              placeholder='Search e.g., ORD-4914'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Branch */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Building2 size={12} />
            Branch
          </label>
          {branchesLoading ? (
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
              <Loader2 size={14} className="animate-spin" />
              Loading branches…
            </div>
          ) : branches.length === 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-600 bg-amber-50">
                <AlertTriangle size={14} />
                No branches found.
              </div>
              <Link
                href="/branches"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff5a1f] hover:underline"
              >
                Create a branch first →
              </Link>
            </div>
          ) : (
            <select
              className={selectBase}
              value={branchId}
              onChange={(e) =>
                onBranchChange(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              disabled={Boolean(lockBranchId) || (branches.length === 1 && branchId !== "all")}
            >
              {!lockBranchId && !(branches.length === 1 && branchId !== "all") && (
                <option value="all">All Branches</option>
              )}
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <CircleDot size={12} />
            Status
          </label>
          <select
            className={selectBase}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as SaleStatus | "all")}
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Payment */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <CreditCard size={12} />
            Payment
          </label>
          <select
            className={selectBase}
            value={payment}
            onChange={(e) => onPaymentChange(e.target.value as PaymentMethod | "all")}
          >
            <option value="all">All Methods</option>
            {payments.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Date range — spans 2 grid columns on lg so both native date
            inputs have enough room. `min-w-0 w-full` lets each flex child
            shrink below its intrinsic width (native date inputs otherwise
            refuse to shrink and push past the card edge). */}
        <div className="lg:col-span-2 min-w-0">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <CalendarDays size={12} />
            Date Range
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="date"
              className="flex-1 min-w-0 w-full border border-gray-200 rounded-lg px-2.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
            <input
              type="date"
              className="flex-1 min-w-0 w-full border border-gray-200 rounded-lg px-2.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Row 2 — quick chips + clear */}
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_CHIPS.map((c) => {
          const active = quickFilter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onQuickFilter(active ? null : c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                active
                  ? "bg-[#ff5a1f] text-white border-[#ff5a1f]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#ff5a1f]/40 hover:text-[#ff5a1f]"
              }`}
            >
              {c.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <XCircle size={13} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesToolbar;
