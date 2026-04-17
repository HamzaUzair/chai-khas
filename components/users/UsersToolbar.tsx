"use client";

import React from "react";
import { Search, Shield, Building2, CircleDot } from "lucide-react";
import type { UserRole } from "@/types/user";
import { USER_ROLE_LABELS } from "@/types/user";

interface BranchOption {
  branch_id: number;
  branch_name: string;
}

interface UsersToolbarProps {
  branches: BranchOption[];
  search: string;
  onSearchChange: (v: string) => void;
  filterRole: UserRole | "all";
  onRoleChange: (v: UserRole | "all") => void;
  filterBranchId: number | "all";
  onBranchChange: (v: number | "all") => void;
  filterStatus: "Active" | "Inactive" | "all";
  onStatusChange: (v: "Active" | "Inactive" | "all") => void;
  roleOptions?: UserRole[];
  branchLocked?: boolean;
  hideBranchFilter?: boolean;
}

const UsersToolbar: React.FC<UsersToolbarProps> = ({
  branches,
  search,
  onSearchChange,
  filterRole,
  onRoleChange,
  filterBranchId,
  onBranchChange,
  filterStatus,
  onStatusChange,
  roleOptions = [],
  branchLocked = false,
  hideBranchFilter = false,
}) => {
  const selectBase =
    "border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <Search size={13} />
            Search Users
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              placeholder="Search by username or full name…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Role */}
        <div className="min-w-[160px]">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <Shield size={13} />
            Role
          </label>
          <select
            className={selectBase + " w-full"}
            value={filterRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole | "all")}
          >
            <option value="all">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {USER_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {/* Branch */}
        {!hideBranchFilter && (
          <div className={`min-w-[160px] ${branchLocked ? "opacity-80" : ""}`}>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Building2 size={13} />
              Branch
            </label>
            <select
              className={selectBase + " w-full"}
              value={filterBranchId}
              onChange={(e) =>
                onBranchChange(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              disabled={branchLocked}
            >
              {!branchLocked && <option value="all">All Branches</option>}
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status */}
        <div className="min-w-[130px]">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <CircleDot size={13} />
            Status
          </label>
          <select
            className={selectBase + " w-full"}
            value={filterStatus}
            onChange={(e) =>
              onStatusChange(e.target.value as "Active" | "Inactive" | "all")
            }
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UsersToolbar;
