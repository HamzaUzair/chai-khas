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

interface UserCardListProps {
  users: AppUser[];
  loading: boolean;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
}

const UserCardList: React.FC<UserCardListProps> = ({ users, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
        >
          {/* Top: name + ID badge */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-bold shrink-0">
                {user.userId}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{user.fullName}</p>
                <p className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                  <UserCog size={11} />
                  {user.username}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                user.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {user.status}
            </span>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield size={12} className="text-gray-400" />
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_BADGE[user.role as UserRole] ?? "bg-gray-50 text-gray-700"}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 size={12} className="text-gray-400" />
              <span className="truncate">
                {user.restaurantName || "Platform"}
                {user.branchName && user.branchName !== "No Branch"
                  ? ` · ${user.branchName}`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Monitor size={12} className="text-gray-400" />
              Terminal: {user.terminal}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} className="text-gray-400" />
              {fmtDate(user.createdAt)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-gray-50">
            <button
              onClick={() => onEdit(user)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
            >
              <Pencil size={13} />
              Edit
            </button>
            <button
              onClick={() => onDelete(user)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCardList;
