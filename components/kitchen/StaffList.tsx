"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  ChefHat,
  Building2,
  Phone,
  Users,
  Loader2,
} from "lucide-react";
import type { KitchenStaff, KitchenStation } from "@/types/kitchen";
import { STAFF_ROLE_LABELS } from "@/types/kitchen";

const roleBadgeColors: Record<string, string> = {
  chef: "bg-amber-50 text-amber-700",
  kitchen_staff: "bg-blue-50 text-blue-700",
  runner: "bg-purple-50 text-purple-700",
  manager: "bg-emerald-50 text-emerald-700",
};

interface StaffListProps {
  staff: KitchenStaff[];
  stations: KitchenStation[];
  loading: boolean;
  onEdit: (s: KitchenStaff) => void;
  onDelete: (s: KitchenStaff) => void;
}

const StaffList: React.FC<StaffListProps> = ({
  staff,
  stations,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading staff…</p>
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No kitchen staff found matching your filters.
          </p>
        </div>
      </div>
    );
  }

  const getAssignedStations = (staffId: string) =>
    stations.filter((st) => st.staffIds.includes(staffId));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {[
                "Name",
                "Role",
                "Branch",
                "Phone",
                "Status",
                "Assigned Stations",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff.map((s) => {
              const assigned = getAssignedStations(s.id);
              return (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                        <ChefHat size={14} className="text-[#ff5a1f]" />
                      </div>
                      <span className="font-semibold text-gray-800">
                        {s.name}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        roleBadgeColors[s.role] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STAFF_ROLE_LABELS[s.role]}
                    </span>
                  </td>

                  {/* Branch */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 size={12} className="text-gray-400" />
                      {s.branchName}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {s.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} className="text-gray-400" />
                        {s.phone}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        s.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.status === "active" ? "● Active" : "○ Inactive"}
                    </span>
                  </td>

                  {/* Assigned stations */}
                  <td className="px-5 py-3.5">
                    {assigned.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assigned.map((st) => (
                          <span
                            key={st.id}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[11px] font-medium text-gray-600"
                          >
                            {st.title} ({st.code})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">
                        Not assigned
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(s)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(s)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
