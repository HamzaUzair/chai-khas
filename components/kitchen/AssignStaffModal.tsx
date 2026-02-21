"use client";

import React, { useEffect, useState } from "react";
import { X, ChefHat, Check } from "lucide-react";
import type { KitchenStation, KitchenStaff } from "@/types/kitchen";
import { STAFF_ROLE_LABELS } from "@/types/kitchen";

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffIds: string[]) => void;
  station: KitchenStation | null;
  /** Only staff from the same branch */
  branchStaff: KitchenStaff[];
}

const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  station,
  branchStaff,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && station) {
      setSelected(new Set(station.staffIds));
    }
  }, [isOpen, station]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
              <h2 className="text-lg font-bold text-gray-800">Manage Staff</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-3">
              {station.title} ({station.code}) — {station.branchName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {branchStaff.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No staff members available for this branch.
            </p>
          ) : (
            <div className="space-y-2">
              {branchStaff.map((s) => {
                const isChecked = selected.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#ff5a1f]/40 bg-[#ff5a1f]/5"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        isChecked
                          ? "bg-[#ff5a1f] border-[#ff5a1f]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check size={13} className="text-white" />}
                    </div>

                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => toggle(s.id)}
                    />

                    <div className="w-8 h-8 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                      <ChefHat size={14} className="text-[#ff5a1f]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {STAFF_ROLE_LABELS[s.role]}
                        {s.status === "inactive" && (
                          <span className="ml-1.5 text-red-400">(Inactive)</span>
                        )}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <span className="text-xs text-gray-400">
            {selected.size} staff selected
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStaffModal;
