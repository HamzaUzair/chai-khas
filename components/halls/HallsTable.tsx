"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  ListTree,
  DoorOpen,
  Loader2,
  Building2,
  Calendar,
  Users,
  Armchair,
} from "lucide-react";
import type { Hall } from "@/types/hall";

function fmtDate(ts: number) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${year}, ${hh}:${mm}`;
}

interface HallsTableProps {
  halls: Hall[];
  loading: boolean;
  onEdit: (hall: Hall) => void;
  onDelete: (hall: Hall) => void;
  onManageTables?: (hall: Hall) => void;
}

const HallsTable: React.FC<HallsTableProps> = ({
  halls,
  loading,
  onEdit,
  onDelete,
  onManageTables,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading halls…</p>
        </div>
      </div>
    );
  }

  if (halls.length === 0) return null; // empty handled by parent

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[780px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {["ID", "Hall Name", "Tables", "Total Capacity", "Branch", "Created At", "Actions"].map(
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
            {halls.map((hall, idx) => (
              <tr
                key={hall.id}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${
                  idx % 2 === 1 ? "bg-gray-50/40" : ""
                }`}
              >
                {/* ID */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-bold">
                    {hall.hallId}
                  </span>
                </td>

                {/* Name */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
                    <DoorOpen size={15} className="text-gray-400" />
                    {hall.name}
                  </span>
                </td>

                {/* Capacity */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Users size={13} className="text-gray-400" />
                    {hall.tableCount}
                  </span>
                </td>

                {/* Total Capacity */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Armchair size={13} className="text-gray-400" />
                    {hall.totalCapacity}
                  </span>
                </td>

                {/* Branch */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 size={13} className="text-gray-400" />
                    {hall.branchName}
                  </span>
                </td>

                {/* Created */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} className="text-gray-400" />
                    {fmtDate(hall.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(hall)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    {onManageTables && (
                      <button
                        onClick={() => onManageTables(hall)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <ListTree size={13} />
                        Manage Tables
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(hall)}
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

export default HallsTable;
