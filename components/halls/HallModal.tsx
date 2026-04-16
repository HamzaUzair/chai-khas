"use client";

import React, { useState, useEffect } from "react";
import { X, DoorOpen, Plus, Trash2 } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { Hall, HallFormData } from "@/types/hall";

const emptyForm: HallFormData = {
  name: "",
  terminal: "1",
  status: "active",
  branchId: "",
  tables: [],
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
  branchLocked?: boolean;
  forcedBranchId?: number | null;
}

const HallModal: React.FC<HallModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editHall,
  activeBranches,
  branchesLoading,
  preSelectedBranchId,
  branchLocked = false,
  forcedBranchId = null,
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
        terminal: String(editHall.terminal),
        branchId: editHall.branchId,
        status: editHall.status,
        tables: editHall.tables.map((t) => ({
          id: t.id,
          name: t.name,
          capacity: String(t.capacity),
          status:
            t.status === "Occupied" || t.status === "Reserved"
              ? t.status
              : "Available",
        })),
      });
    } else {
      const branchDefault =
        forcedBranchId
          ? forcedBranchId
          :
        preSelectedBranchId && preSelectedBranchId !== "all"
          ? preSelectedBranchId
          : activeBranches.length === 1
            ? activeBranches[0].branch_id
            : "";
      setForm({
        ...emptyForm,
        branchId: branchDefault,
        tables: [{ name: "", capacity: "0", status: "Available" }],
      });
    }
    setErrors({});
  }, [isOpen, editHall, preSelectedBranchId, activeBranches, forcedBranchId]);

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: Partial<Record<keyof HallFormData, string>> = {};
    if (!form.name.trim()) errs.name = "Hall name is required.";
    if (form.branchId === "") errs.branchId = "Please select a branch.";
    const term = Number(form.terminal);
    if (isNaN(term) || term < 1) errs.terminal = "Terminal must be at least 1.";
    const validRows = form.tables.filter((t) => t.name.trim().length > 0);
    if (validRows.length === 0) errs.tables = "At least one table is required.";
    for (const row of validRows) {
      const cap = Number(row.capacity);
      if (Number.isNaN(cap) || cap < 1) {
        errs.tables = "Each table capacity must be at least 1.";
        break;
      }
    }
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

  const addTableRow = () => {
    setForm((p) => ({
      ...p,
      tables: [...p.tables, { name: "", capacity: "0", status: "Available" }],
    }));
  };

  const removeTableRow = (idx: number) => {
    setForm((p) => ({
      ...p,
      tables: p.tables.filter((_, i) => i !== idx),
    }));
  };

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
              disabled={branchesLoading || branchLocked}
            >
              {!branchLocked && <option value="">Select a branch</option>}
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

          {/* Terminal + Status row */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className={labelBase}>Status</label>
              <select
                className={`${inputBase} border-gray-200 appearance-none`}
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value === "inactive" ? "inactive" : "active",
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tables section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelBase}>
                Tables <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addTableRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff5a1f] hover:text-[#e04e18]"
              >
                <Plus size={13} />
                Add Table
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto rounded-lg border border-gray-100 p-3 bg-gray-50/60">
              {form.tables.map((table, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    className={`col-span-6 ${inputBase} border-gray-200`}
                    placeholder="Table 1"
                    value={table.name}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        tables: p.tables.map((row, i) =>
                          i === idx ? { ...row, name: e.target.value } : row
                        ),
                      }))
                    }
                  />
                  <input
                    type="number"
                    min={1}
                    className={`col-span-3 ${inputBase} border-gray-200`}
                    placeholder="Capacity"
                    value={table.capacity}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        tables: p.tables.map((row, i) =>
                          i === idx ? { ...row, capacity: e.target.value } : row
                        ),
                      }))
                    }
                  />
                  <select
                    className={`col-span-2 ${inputBase} border-gray-200 appearance-none`}
                    value={table.status}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        tables: p.tables.map((row, i) =>
                          i === idx
                            ? {
                                ...row,
                                status:
                                  e.target.value === "Occupied" || e.target.value === "Reserved"
                                    ? e.target.value
                                    : "Available",
                              }
                            : row
                        ),
                      }))
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTableRow(idx)}
                    className="col-span-1 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove table"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {errors.tables && (
              <p className="text-xs text-red-500 mt-1">{errors.tables}</p>
            )}
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
