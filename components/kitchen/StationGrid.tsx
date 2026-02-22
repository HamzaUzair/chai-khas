"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  Users,
  Building2,
  Printer,
  Hash,
  ChefHat,
} from "lucide-react";
import type { KitchenStation, KitchenStaff } from "@/types/kitchen";

interface StationGridProps {
  stations: KitchenStation[];
  allStaff: KitchenStaff[];
  onEdit: (station: KitchenStation) => void;
  onDelete: (station: KitchenStation) => void;
  onManageStaff: (station: KitchenStation) => void;
}

const StationGrid: React.FC<StationGridProps> = ({
  stations,
  allStaff,
  onEdit,
  onDelete,
  onManageStaff,
}) => {
  if (stations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <ChefHat size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No kitchen stations found matching your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {stations.map((station) => {
        const assignedStaff = allStaff.filter((s) =>
          station.staffIds.includes(s.id)
        );
        return (
          <div
            key={station.id}
            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col"
          >
            {/* Top: title + code + actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                  <ChefHat size={20} className="text-[#ff5a1f]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 leading-snug">
                    {station.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <Hash size={10} />
                    {station.code}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(station)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                  title="Edit station"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(station)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete station"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Branch + Printer */}
            <div className="space-y-1.5 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Building2 size={12} className="text-gray-400" />
                {station.branchName}
              </span>
              {station.printerName && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Printer size={12} className="text-gray-400" />
                  {station.printerName}
                </span>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom: status + staff count + manage btn */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    station.status === "active"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {station.status === "active" ? "● Active" : "○ Inactive"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Users size={12} />
                  {assignedStaff.length} staff
                </span>
              </div>

              <button
                onClick={() => onManageStaff(station)}
                className="text-xs font-semibold text-[#ff5a1f] hover:text-[#e04e18] hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Manage Staff
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StationGrid;
