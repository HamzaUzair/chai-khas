"use client";

import React from "react";
import { Building2, Calendar, Filter } from "lucide-react";
import type { Branch } from "@/types/branch";

export type DayEndStatusFilter = "open" | "closed" | "all";

interface DayEndToolbarProps {
  branches: Branch[];
  branchesLoading: boolean;
  filterBranchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  selectedDate: string;
  onDateChange: (v: string) => void;
  statusFilter: DayEndStatusFilter;
  onStatusChange: (v: DayEndStatusFilter) => void;
  /** When true, hide the "All Branches" option and lock the select. */
  branchLocked?: boolean;
  /** Show the status filter pills (for the history table). Defaults to true. */
  showStatusFilter?: boolean;
}

const pillBase =
  "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border";

const DayEndToolbar: React.FC<DayEndToolbarProps> = ({
  branches,
  branchesLoading,
  filterBranchId,
  onBranchChange,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusChange,
  branchLocked = false,
  showStatusFilter = true,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
      <div className="flex-1 min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Building2 size={13} />
          Branch
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
          value={filterBranchId}
          onChange={(e) => {
            const v = e.target.value;
            onBranchChange(v === "all" ? "all" : Number(v));
          }}
          disabled={branchLocked || branchesLoading || (branches.length === 1 && filterBranchId !== "all")}
        >
          {!branchLocked && !(branches.length === 1 && filterBranchId !== "all") && (
            <option value="all">All Branches</option>
          )}
          {branches.map((b) => (
            <option key={b.branch_id} value={b.branch_id}>
              {b.branch_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[180px] max-w-xs">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Calendar size={13} />
          Business Date
        </label>
        <input
          type="date"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

    </div>
    {showStatusFilter && (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400 shrink-0">History:</span>
      <Filter size={14} className="text-gray-400 shrink-0" />
      {(["open", "closed", "all"] as DayEndStatusFilter[]).map((s) => {
            const isSelected = statusFilter === s;
            const colors = isSelected
              ? s === "open"
                ? "bg-green-50 text-green-700 border-green-200"
                : s === "closed"
                ? "bg-gray-100 text-gray-600 border-gray-200"
                : "bg-[#ff5a1f]/10 text-[#ff5a1f] border-[#ff5a1f]/20"
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
        return (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`${pillBase} ${colors}`}
          >
            {s === "open" && "● "}
            {s === "closed" && "○ "}
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        );
      })}
    </div>
    )}
  </div>
);

export default DayEndToolbar;
