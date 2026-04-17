"use client";

import React from "react";
import type { Branch } from "@/types/branch";

interface BranchFilterProps {
  branches: Branch[];
  loading: boolean;
  value: number | "all";
  onChange: (v: number | "all") => void;
}

const BranchFilter: React.FC<BranchFilterProps> = ({
  branches,
  loading,
  value,
  onChange,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
    <div className="flex-1 max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Filter by Branch
      </label>
      <select
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "all" ? "all" : Number(v));
        }}
        disabled={loading || (branches.length === 1 && value !== "all")}
      >
        {!(branches.length === 1 && value !== "all") && <option value="all">All Branches</option>}
        {branches.map((b) => (
          <option key={b.branch_id} value={b.branch_id}>
            {b.branch_name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default BranchFilter;
