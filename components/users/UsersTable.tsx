"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  UserCog,
  Loader2,
  Building2,
  Calendar,
  Monitor,
  Shield,
} from "lucide-react";
import type { AppUser, UserRole } from "@/types/user";
import { getRoleLabel } from "@/types/user";

/* ── Role badge colours ── */
const ROLE_BADGE: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700",
  RESTAURANT_ADMIN: "bg-blue-50 text-blue-700",
  BRANCH_ADMIN: "bg-sky-50 text-sky-700",
  ORDER_TAKER: "bg-orange-50 text-orange-700",
  CASHIER: "bg-emerald-50 text-emerald-700",
  ACCOUNTANT: "bg-indigo-50 text-indigo-700",
  LIVE_KITCHEN: "bg-rose-50 text-rose-700",
};

function fmtDate(ts: number) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${year}, ${hh}:${mm}`;
}

interface UsersTableProps {
  users: AppUser[];
  loading: boolean;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  /**
   * When true the Branch column is omitted entirely. Used by the Super Admin
   * (Restenzo) panel where every row is a Restaurant Admin with no branch.
   */
  hideBranch?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  hideBranch = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading users…</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {(hideBranch
                ? ["ID", "Username", "Full Name", "Role", "Restaurant", "Status", "Terminal", "Created", "Actions"]
                : ["ID", "Username", "Full Name", "Role", "Restaurant", "Branch", "Status", "Terminal", "Created", "Actions"]
              ).map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                {/* ID */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-bold">
                    {user.userId}
                  </span>
                </td>

                {/* Username */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <UserCog size={14} className="text-gray-400" />
                    {user.username}
                  </span>
                </td>

                {/* Full Name */}
                <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-gray-800">
                  {user.fullName}
                </td>

                {/* Role */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${ROLE_BADGE[user.role as UserRole] ?? "bg-gray-50 text-gray-700"}`}
                  >
                    <Shield size={11} />
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                {/* Restaurant */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 size={13} className="text-gray-400" />
                    {user.restaurantName || "—"}
                  </span>
                </td>

                {/* Branch */}
                {!hideBranch && (
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <Building2 size={13} className="text-gray-400" />
                      {user.branchName}
                      {user.branchCode !== "—" && (
                        <span className="text-gray-400">({user.branchCode})</span>
                      )}
                    </span>
                  </td>
                )}

                {/* Status */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      user.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                {/* Terminal */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Monitor size={13} className="text-gray-400" />
                    {user.terminal}
                  </span>
                </td>

                {/* Created */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} className="text-gray-400" />
                    {fmtDate(user.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
