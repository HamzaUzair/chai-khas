"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { ExpenseBranch } from "@/types/expense";

interface ExpenseFiltersProps {
  branches: ExpenseBranch[];
  branchesLoading: boolean;
  branchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const selectBase =
  "border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all w-full";

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  branches,
  branchesLoading,
  branchId,
  onBranchChange,
  search,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Branch filter */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            <Building2 size={12} />
            Filter by Branch
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
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div>
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
              placeholder="Search by expense title, description, branch, or ID..."
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
