"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/types/category";
import type { Branch } from "@/types/branch";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    itemCount: number;
    isActive: boolean;
    branchId: number;
  }) => void;
  editCategory: Category | null;
  editBranchId: number | null;
  activeBranches: Branch[];
  showBranchSelect: boolean; // true when filter is "all"
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCategory,
  editBranchId,
  activeBranches,
  showBranchSelect,
}) => {
  const [name, setName] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [branchId, setBranchId] = useState<number | "">(
    editBranchId ?? ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setName(editCategory.name);
        setItemCount(editCategory.itemCount);
        setIsActive(editCategory.isActive);
        setBranchId(editBranchId ?? "");
      } else {
        setName("");
        setItemCount(0);
        setIsActive(true);
        setBranchId(editBranchId ?? (activeBranches[0]?.branch_id ?? ""));
      }
      setError("");
    }
  }, [isOpen, editCategory, editBranchId, activeBranches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (showBranchSelect && !branchId) {
      setError("Please select a branch");
      return;
    }
    const resolvedBranchId =
      typeof branchId === "number" ? branchId : editBranchId ?? 0;
    onSave({
      name: name.trim(),
      itemCount: Math.max(0, itemCount),
      isActive,
      branchId: resolvedBranchId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editCategory ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Branch select (only when all branches filter) */}
          {showBranchSelect && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
                value={branchId}
                onChange={(e) => setBranchId(Number(e.target.value))}
                disabled={!!editCategory}
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

          {/* Category name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BBQ, Karahi"
            />
          </div>

          {/* Item count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Count
            </label>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              {editCategory ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
