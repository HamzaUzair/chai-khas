"use client";

import React from "react";
import { Search, Building2, Tag, Filter } from "lucide-react";
import type { Branch } from "@/types/branch";

export type RecipeStatusFilter = "all" | "has" | "missing";

interface RecipesToolbarProps {
  branches: Branch[];
  branchesLoading: boolean;
  filterBranchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  filterCategoryName: string | "all";
  onCategoryChange: (v: string | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: RecipeStatusFilter;
  onStatusFilterChange: (v: RecipeStatusFilter) => void;
}

const pillBase =
  "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border";

const RecipesToolbar: React.FC<RecipesToolbarProps> = ({
  branches,
  branchesLoading,
  filterBranchId,
  onBranchChange,
  filterCategoryName,
  onCategoryChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
    {/* Row 1: filters */}
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
      {/* Branch */}
      <div className="flex-1 min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Building2 size={13} />
          Branch
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
          value={filterBranchId}
          onChange={(e) =>
            onBranchChange(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          disabled={branchesLoading}
        >
          <option value="all">All Branches</option>
          {branches.map((b) => (
            <option key={b.branch_id} value={b.branch_id}>
              {b.branch_name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="flex-1 min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Tag size={13} />
          Category
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
          value={filterCategoryName}
          onChange={(e) =>
            onCategoryChange(e.target.value === "all" ? "all" : e.target.value)
          }
        >
          <option value="all">All Categories</option>
        </select>
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[220px] max-w-sm">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Search size={13} />
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
            placeholder="Search by menu item…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Row 2: status pills */}
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
        <Filter size={13} />
        Recipe Status:
      </span>
      {[
        { label: "All", value: "all" as RecipeStatusFilter },
        { label: "Has Recipe", value: "has" as RecipeStatusFilter },
        { label: "Missing Recipe", value: "missing" as RecipeStatusFilter },
      ].map((p) => (
        <button
          key={p.value}
          onClick={() => onStatusFilterChange(p.value)}
          className={`${pillBase} ${
            statusFilter === p.value
              ? "bg-[#ff5a1f] text-white border-[#ff5a1f]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

export default RecipesToolbar;

