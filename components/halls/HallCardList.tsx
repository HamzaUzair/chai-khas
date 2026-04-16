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

interface HallCardListProps {
  halls: Hall[];
  loading: boolean;
  onEdit: (hall: Hall) => void;
  onDelete: (hall: Hall) => void;
  onManageTables?: (hall: Hall) => void;
}

const HallCardList: React.FC<HallCardListProps> = ({
  halls,
  loading,
  onEdit,
  onDelete,
  onManageTables,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
      </div>
    );
  }

  if (halls.length === 0) return null; // empty handled by parent

  return (
    <div className="space-y-3">
      {halls.map((hall) => (
        <div
          key={hall.id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
        >
          {/* Top: name + ID badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-2 font-bold text-gray-800 text-sm">
              <DoorOpen size={16} className="text-[#ff5a1f]" />
              {hall.name}
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-bold">
              {hall.hallId}
            </span>
          </div>

          {/* Info rows */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} className="text-gray-400" />
              Tables: <span className="font-semibold text-gray-700">{hall.tableCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 size={12} className="text-gray-400" />
              {hall.branchName}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Armchair size={12} className="text-gray-400" />
              Capacity: <span className="font-semibold text-gray-700">{hall.totalCapacity}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} className="text-gray-400" />
              {fmtDate(hall.createdAt)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-gray-50">
            <button
              onClick={() => onEdit(hall)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
            >
              <Pencil size={13} />
              Edit
            </button>
            {onManageTables && (
              <button
                onClick={() => onManageTables(hall)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <ListTree size={13} />
                Tables
              </button>
            )}
            <button
              onClick={() => onDelete(hall)}
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

export default HallCardList;
