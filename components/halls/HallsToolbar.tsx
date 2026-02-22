"use client";

import React from "react";
import { Search, Building2, Lightbulb } from "lucide-react";
import type { Branch } from "@/types/branch";

interface HallsToolbarProps {
  branches: Branch[];
  branchesLoading: boolean;
  filterBranchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const HallsToolbar: React.FC<HallsToolbarProps> = ({
  branches,
  branchesLoading,
  filterBranchId,
  onBranchChange,
  search,
  onSearchChange,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
      {/* Branch filter */}
      <div className="min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Building2 size={13} />
          Filter by Branch
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
          value={filterBranchId}
          onChange={(e) => {
            const v = e.target.value;
            onBranchChange(v === "all" ? "all" : Number(v));
          }}
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

      {/* Search */}
      <div className="flex-1 max-w-md">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Search size={13} />
          Search Halls
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
            placeholder='Search by name, ID, or capacity…'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
          <Lightbulb size={10} />
          Tip: try &quot;Outdoor&quot; or &quot;50&quot;
        </p>
      </div>
    </div>
  </div>
);

export default HallsToolbar;
