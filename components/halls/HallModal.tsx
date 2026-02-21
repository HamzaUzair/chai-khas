"use client";

import React, { useState, useEffect } from "react";
import { X, DoorOpen } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { Hall, HallFormData } from "@/types/hall";

const emptyForm: HallFormData = {
  name: "",
  capacity: "0",
  terminal: "1",
  branchId: "",
};

interface HallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HallFormData) => void;
  editHall?: Hall | null;
  activeBranches: Branch[];
  branchesLoading: boolean;
  /** When a branch is pre-selected via the page filter */
  preSelectedBranchId?: number | "all";
}

const HallModal: React.FC<HallModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editHall,
  activeBranches,
  branchesLoading,
  preSelectedBranchId,
}) => {
  const [form, setForm] = useState<HallFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof HallFormData, string>>>({});
  const isEdit = !!editHall;

  /* ── Reset form when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;

    if (editHall) {
      setForm({
        name: editHall.name,
        capacity: String(editHall.capacity),
        terminal: String(editHall.terminal),
        branchId: editHall.branchId,
      });
    } else {
      const branchDefault =
        preSelectedBranchId && preSelectedBranchId !== "all"
          ? preSelectedBranchId
          : activeBranches.length === 1
            ? activeBranches[0].branch_id
            : "";
      setForm({ ...emptyForm, branchId: branchDefault });
    }
    setErrors({});
  }, [isOpen, editHall, preSelectedBranchId, activeBranches]);

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: Partial<Record<keyof HallFormData, string>> = {};
    if (!form.name.trim()) errs.name = "Hall name is required.";
    if (form.branchId === "") errs.branchId = "Please select a branch.";
    const cap = Number(form.capacity);
    if (isNaN(cap) || cap < 0) errs.capacity = "Capacity must be 0 or above.";
    const term = Number(form.terminal);
    if (isNaN(term) || term < 1) errs.terminal = "Terminal must be at least 1.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
  const labelBase = "block text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
              <DoorOpen size={18} className="text-[#ff5a1f]" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Hall" : "Create Hall"}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Branch */}
          <div>
            <label className={labelBase}>
              Branch <span className="text-red-400">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none cursor-pointer ${
                errors.branchId ? "border-red-400" : "border-gray-200"
              }`}
              value={form.branchId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  branchId: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              disabled={branchesLoading}
            >
              <option value="">Select a branch</option>
              {activeBranches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>
            )}
          </div>

          {/* Hall Name */}
          <div>
            <label className={labelBase}>
              Hall Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className={`${inputBase} ${errors.name ? "border-red-400" : "border-gray-200"}`}
              placeholder="e.g. Family Hall"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Capacity + Terminal row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Capacity</label>
              <input
                type="number"
                min={0}
                className={`${inputBase} ${errors.capacity ? "border-red-400" : "border-gray-200"}`}
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              />
              {errors.capacity && (
                <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
              )}
            </div>
            <div>
              <label className={labelBase}>Terminal</label>
              <input
                type="number"
                min={1}
                className={`${inputBase} ${errors.terminal ? "border-red-400" : "border-gray-200"}`}
                value={form.terminal}
                onChange={(e) => setForm((p) => ({ ...p, terminal: e.target.value }))}
              />
              {errors.terminal && (
                <p className="text-xs text-red-500 mt-1">{errors.terminal}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
          >
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HallModal;
