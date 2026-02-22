"use client";

import React from "react";
import {
  Search,
  Building2,
  Loader2,
  AlertTriangle,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import type { InvBranch, InvCategory, QuickFilter } from "@/types/inventory";
import { INV_CATEGORIES } from "@/types/inventory";

interface Props {
  branches: InvBranch[];
  branchesLoading: boolean;
  branchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  category: InvCategory | "all";
  onCategoryChange: (v: InvCategory | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
  quickFilter: QuickFilter;
  onQuickFilterChange: (v: QuickFilter) => void;
}

const selBase =
  "border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all w-full";

const pills: { label: string; value: QuickFilter }[] = [
  { label: "All", value: "all" },
  { label: "Low Stock", value: "low" },
  { label: "Out of Stock", value: "out" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const InventoryFilters: React.FC<Props> = ({
  branches,
  branchesLoading,
  branchId,
  onBranchChange,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
    {/* Row 1: dropdowns + search */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Branch */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          <Building2 size={12} /> Branch
        </label>
        {branchesLoading ? (
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : branches.length === 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-600 bg-amber-50">
              <AlertTriangle size={14} /> No branches found
            </div>
            <Link href="/branches" className="text-[11px] font-semibold text-[#ff5a1f] hover:underline">
              Create a branch first →
            </Link>
          </div>
        ) : (
          <select className={selBase} value={branchId} onChange={(e) => onBranchChange(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          <Layers3 size={12} /> Category
        </label>
        <select className={selBase} value={category} onChange={(e) => onCategoryChange(e.target.value as InvCategory | "all")}>
          <option value="all">All Categories</option>
          {INV_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          <Search size={12} /> Search
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
            placeholder="Search by ingredient, SKU, supplier…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Row 2: quick filter pills */}
    <div className="flex flex-wrap gap-2">
      {pills.map((p) => (
        <button
          key={p.value}
          onClick={() => onQuickFilterChange(p.value)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            quickFilter === p.value
              ? "bg-[#ff5a1f] text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

export default InventoryFilters;
