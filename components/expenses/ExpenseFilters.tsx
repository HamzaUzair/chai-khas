"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Loader2,
  AlertTriangle,
  Tag,
  CreditCard,
  Calendar,
} from "lucide-react";
import type { ExpenseBranch, ExpenseCategory, ExpensePaymentMethod } from "@/types/expense";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "@/types/expense";

interface ExpenseFiltersProps {
  branches: ExpenseBranch[];
  branchesLoading: boolean;
  branchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  branchLocked: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  category: ExpenseCategory | "all";
  onCategoryChange: (v: ExpenseCategory | "all") => void;
  paymentMethod: ExpensePaymentMethod | "all";
  onPaymentMethodChange: (v: ExpensePaymentMethod | "all") => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}

const selectBase =
  "border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all w-full";

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  branches,
  branchesLoading,
  branchId,
  onBranchChange,
  branchLocked,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  paymentMethod,
  onPaymentMethodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Branch filter */}
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
              disabled={branchLocked}
            >
              {!branchLocked && <option value="all">All branches</option>}
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Tag size={12} />
            Category
          </label>
          <select
            className={selectBase}
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ExpenseCategory | "all")}
          >
            <option value="all">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
            value={paymentMethod}
            onChange={(e) =>
              onPaymentMethodChange(e.target.value as ExpensePaymentMethod | "all")
            }
          >
            <option value="all">All methods</option>
            {EXPENSE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Date from / to */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Calendar size={12} />
            From date
          </label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Calendar size={12} />
            To date
          </label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>

        {/* Search — span 2 cols on large */}
        <div className="sm:col-span-2 xl:col-span-2">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Search size={12} />
            Search
          </label>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              placeholder="Title or description…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
