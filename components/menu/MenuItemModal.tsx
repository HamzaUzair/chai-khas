"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { MenuItem, MenuItemFormData } from "@/types/menu";
import { DEFAULT_CATEGORIES } from "@/lib/menuStorage";

const emptyForm: MenuItemFormData = {
  name: "",
  description: "",
  branchId: "",
  category: "",
  price: "",
  status: "active",
};

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
  editItem?: MenuItem | null;
  activeBranches: Branch[];
  branchesLoading: boolean;
  /** Extra categories derived from items (merged with defaults) */
  extraCategories?: string[];
}

const inputBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  activeBranches,
  branchesLoading,
  extraCategories = [],
}) => {
  const [form, setForm] = useState<MenuItemFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editItem;

  // Combine default + extra categories (deduplicated)
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...extraCategories])
  ).sort();

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setForm({
          name: editItem.name,
          description: editItem.description ?? "",
          branchId: editItem.branchId,
          category: editItem.category,
          price: String(editItem.price),
          status: editItem.status,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [isOpen, editItem]);

  // ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    },
    [onClose, submitting]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const update = <K extends keyof MenuItemFormData>(
    field: K,
    value: MenuItemFormData[K]
  ) => setForm((p) => ({ ...p, [field]: value }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof MenuItemFormData, string>> = {};
    if (!form.name.trim()) e.name = "Item name is required";
    if (form.branchId === "") e.branchId = "Branch is required";
    if (!form.category) e.category = "Category is required";
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 0)
      e.price = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    onSave(form);
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
            <h2 className="text-lg font-bold text-gray-800">
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputBase} ${errors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="e.g., Chicken Tikka"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="Brief description of the item"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer ${
                errors.branchId ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={form.branchId}
              onChange={(e) => {
                const val = e.target.value;
                update("branchId", val === "" ? "" : Number(val));
              }}
              disabled={branchesLoading || activeBranches.length === 0}
            >
              {branchesLoading ? (
                <option value="">Loading branches…</option>
              ) : activeBranches.length === 0 ? (
                <option value="">No active branches</option>
              ) : (
                <>
                  <option value="">Select a branch</option>
                  {activeBranches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.branchId && (
              <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer ${
                errors.category ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">Select a category</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputBase} ${errors.price ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="0"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
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
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
