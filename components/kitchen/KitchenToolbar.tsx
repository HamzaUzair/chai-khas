"use client";

import React from "react";
import { Search, Building2, Filter, ChefHat, LayoutGrid } from "lucide-react";
import type { Branch } from "@/types/branch";

export type StatusFilter = "active" | "inactive" | "all";
export type KitchenView = "stations" | "staff";

interface KitchenToolbarProps {
  branches: Branch[];
  branchesLoading: boolean;
  filterBranchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  search: string;
  onSearchChange: (v: string) => void;
  view: KitchenView;
  onViewChange: (v: KitchenView) => void;
}

const pillBase =
  "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border";

const KitchenToolbar: React.FC<KitchenToolbarProps> = ({
  branches,
  branchesLoading,
  filterBranchId,
  onBranchChange,
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
  view,
  onViewChange,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
    {/* Row 1: Branch + Search */}
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
      {/* Branch filter */}
      <div className="flex-1 min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Building2 size={13} />
          Branch
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
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
            placeholder="Search by station name, code, staff…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Row 2: Status pills + View toggle */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Status pills */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400 shrink-0" />
        {(["active", "inactive", "all"] as StatusFilter[]).map((s) => {
          const isSelected = statusFilter === s;
          let colors: string;
          if (isSelected) {
            colors =
              s === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : s === "inactive"
                ? "bg-gray-100 text-gray-600 border-gray-200"
                : "bg-[#ff5a1f]/10 text-[#ff5a1f] border-[#ff5a1f]/20";
          } else {
            colors = "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
          }
          return (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`${pillBase} ${colors}`}
            >
              {s === "active" && "● "}
              {s === "inactive" && "○ "}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* View toggle */}
      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
        <button
          onClick={() => onViewChange("stations")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            view === "stations"
              ? "bg-white text-[#ff5a1f] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutGrid size={14} />
          Stations
        </button>
        <button
          onClick={() => onViewChange("staff")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            view === "staff"
              ? "bg-white text-[#ff5a1f] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ChefHat size={14} />
          Staff
        </button>
      </div>
    </div>
  </div>
);

export default KitchenToolbar;
