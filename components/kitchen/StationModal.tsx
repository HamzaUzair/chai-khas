"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { KitchenStation, StationFormData } from "@/types/kitchen";

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StationFormData) => void;
  editStation: KitchenStation | null;
  activeBranches: Branch[];
  showBranchSelect: boolean;
  /** current branch filter (used to preset branch) */
  currentBranchId: number | "all";
  /** For unique code validation — existing stations */
  existingStations: KitchenStation[];
}

const inputBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const StationModal: React.FC<StationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editStation,
  activeBranches,
  showBranchSelect,
  currentBranchId,
  existingStations,
}) => {
  const [form, setForm] = useState<StationFormData>({
    branchId: "",
    title: "",
    code: "",
    printerName: "",
    status: "active",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editStation) {
        setForm({
          branchId: editStation.branchId,
          title: editStation.title,
          code: editStation.code,
          printerName: editStation.printerName ?? "",
          status: editStation.status,
        });
      } else {
        setForm({
          branchId:
            currentBranchId !== "all"
              ? currentBranchId
              : activeBranches[0]?.branch_id ?? "",
          title: "",
          code: "",
          printerName: "",
          status: "active",
        });
      }
      setError("");
    }
  }, [isOpen, editStation, currentBranchId, activeBranches]);

  const update = <K extends keyof StationFormData>(
    field: K,
    value: StationFormData[K]
  ) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Station title is required");
      return;
    }
    if (!form.code.trim()) {
      setError("Station code is required");
      return;
    }
    if (showBranchSelect && !form.branchId) {
      setError("Please select a branch");
      return;
    }

    // Unique code check per branch
    const branchId =
      typeof form.branchId === "number" ? form.branchId : Number(form.branchId);
    const duplicate = existingStations.find(
      (s) =>
        s.branchId === branchId &&
        s.code.toLowerCase() === form.code.trim().toLowerCase() &&
        s.id !== (editStation?.id ?? "")
    );
    if (duplicate) {
      setError(
        `Code "${form.code.trim()}" already exists for this branch. Choose a different code.`
      );
      return;
    }

    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
            <h2 className="text-lg font-bold text-gray-800">
              {editStation ? "Edit Kitchen Station" : "Add Kitchen Station"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Branch */}
          {showBranchSelect && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                className={`${inputBase} appearance-none bg-white cursor-pointer`}
                value={form.branchId}
                onChange={(e) =>
                  update(
                    "branchId",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={!!editStation}
              >
                <option value="">Select branch</option>
                {activeBranches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Station Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="e.g., Main Kitchen, BBQ Station"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="e.g., K1, K2"
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Must be unique per branch
            </p>
          </div>

          {/* Printer name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Printer Name
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="e.g., Kitchen Printer 1 (optional)"
              value={form.printerName}
              onChange={(e) => update("printerName", e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as "active" | "inactive")
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
          >
            {editStation ? "Save Changes" : "Create Station"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationModal;
